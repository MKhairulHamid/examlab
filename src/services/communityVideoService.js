/**
 * Community Video Service — "Teach It to Learn It"
 *
 * Learners record themselves teaching a session and submit a YouTube
 * (public/unlisted) or Loom link. Submissions are pre-moderated: a row stays
 * `pending` until an admin approves it, so the public only ever reads
 * `approved` rows (enforced by RLS). Each learner has one submission per
 * (course, session); resubmitting upserts and resets the row to `pending`.
 */

import supabase from './supabase'

// ── URL parsing ───────────────────────────────────────────────────────────────

/**
 * Parse a submitted video URL into { provider, video_ref, start_seconds }.
 * Supports YouTube (watch / youtu.be / shorts / embed — public & unlisted all
 * share these shapes) and Loom share/embed links. Throws on anything else.
 */
export function parseVideoUrl(rawUrl) {
  const url = (rawUrl || '').trim()
  if (!url) throw new Error('Please paste a video link.')

  let parsed
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('That does not look like a valid URL.')
  }

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase()

  // ── YouTube ──
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
    let videoId = ''
    if (host === 'youtu.be') {
      videoId = parsed.pathname.slice(1)
    } else if (parsed.pathname.startsWith('/watch')) {
      videoId = parsed.searchParams.get('v') || ''
    } else if (parsed.pathname.startsWith('/shorts/')) {
      videoId = parsed.pathname.split('/')[2] || ''
    } else if (parsed.pathname.startsWith('/embed/')) {
      videoId = parsed.pathname.split('/')[2] || ''
    }
    videoId = videoId.split('/')[0].split('?')[0]
    if (!/^[\w-]{11}$/.test(videoId)) {
      throw new Error('Could not find a YouTube video id in that link.')
    }
    const t = parsed.searchParams.get('start') || parsed.searchParams.get('t')
    const start = t ? parseYouTubeTime(t) : null
    return { provider: 'youtube', video_ref: videoId, start_seconds: start }
  }

  // ── Loom ──
  if (host === 'loom.com') {
    // /share/<id> or /embed/<id>
    const m = parsed.pathname.match(/\/(?:share|embed)\/([\w-]+)/)
    const loomId = m ? m[1] : ''
    if (!/^[a-f0-9]{20,}$/i.test(loomId)) {
      throw new Error('Could not find a Loom video id in that link.')
    }
    return { provider: 'loom', video_ref: loomId, start_seconds: null }
  }

  throw new Error('Only YouTube and Loom links are supported.')
}

// Accept "90", "90s", "1m30s", "1:30" → seconds
function parseYouTubeTime(t) {
  if (/^\d+$/.test(t)) return parseInt(t, 10)
  const colon = t.match(/^(\d+):(\d{1,2})$/)
  if (colon) return parseInt(colon[1], 10) * 60 + parseInt(colon[2], 10)
  let total = 0
  const h = t.match(/(\d+)h/); const m = t.match(/(\d+)m/); const s = t.match(/(\d+)s/)
  if (h) total += parseInt(h[1], 10) * 3600
  if (m) total += parseInt(m[1], 10) * 60
  if (s) total += parseInt(s[1], 10)
  return total || null
}

// ── Reads ─────────────────────────────────────────────────────────────────────

/** Approved community videos for a session, newest first. */
export async function getApprovedVideos(courseSlug, sessionId) {
  if (!courseSlug || !sessionId) return []
  const { data, error } = await supabase
    .from('community_videos')
    .select('id, provider, video_ref, start_seconds, title, note, submitter_name, created_at')
    .eq('course_slug', courseSlug)
    .eq('session_id', sessionId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading community videos:', error)
    return []
  }
  return data || []
}

/** The current learner's own submission for a session (any status), or null. */
export async function getMySubmission(userId, courseSlug, sessionId) {
  if (!userId || !courseSlug || !sessionId) return null
  const { data, error } = await supabase
    .from('community_videos')
    .select('id, provider, video_ref, status, title, note, rejection_reason, created_at, updated_at')
    .eq('user_id', userId)
    .eq('course_slug', courseSlug)
    .eq('session_id', sessionId)
    .maybeSingle()

  if (error) {
    console.error('Error loading own submission:', error)
    return null
  }
  return data
}

// ── Writes ────────────────────────────────────────────────────────────────────

/**
 * Submit (or resubmit) the learner's video for a session. Upserts on the
 * unique (user, course, session) key and forces status back to `pending`.
 */
export async function submitVideo({ userId, courseSlug, sessionId, url, title, note, submitterName }) {
  if (!userId) throw new Error('You must be signed in to submit a video.')
  const { provider, video_ref, start_seconds } = parseVideoUrl(url)

  const cleanTitle = (title || '').trim()
  if (!cleanTitle) throw new Error('Please give your video a title.')

  const row = {
    user_id: userId,
    course_slug: courseSlug,
    session_id: sessionId,
    provider,
    video_url: url.trim(),
    video_ref,
    start_seconds,
    title: cleanTitle.slice(0, 140),
    note: (note || '').trim().slice(0, 500) || null,
    submitter_name: (submitterName || 'Anonymous learner').slice(0, 80),
    status: 'pending',
    rejection_reason: null,
    reviewed_at: null,
    reviewed_by: null,
    report_count: 0,
  }

  const { data, error } = await supabase
    .from('community_videos')
    .upsert(row, { onConflict: 'user_id,course_slug,session_id' })
    .select('id, provider, video_ref, status, title, note, created_at')
    .single()

  if (error) {
    console.error('Error submitting video:', error)
    throw new Error(error.message || 'Could not submit your video. Please try again.')
  }
  return data
}

/** File a report against a community video. */
export async function reportVideo({ videoId, reporterId, reason, detail }) {
  if (!reporterId) throw new Error('You must be signed in to report a video.')
  const { error } = await supabase
    .from('community_video_reports')
    .insert({ video_id: videoId, reporter_id: reporterId, reason, detail: (detail || '').trim().slice(0, 500) || null })

  if (error) {
    // Friendly message for the "already reported" unique-violation case.
    if (error.code === '23505') {
      throw new Error('You have already reported this video. Thanks — our team will review it.')
    }
    console.error('Error reporting video:', error)
    throw new Error(error.message || 'Could not submit your report. Please try again.')
  }
  return true
}
