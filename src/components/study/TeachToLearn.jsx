import React, { useState, useEffect, useMemo } from 'react'
import VideoPanel from './VideoPanel'
import CommunityVideoPanel from './CommunityVideoPanel'
import SlideDeck from './SlideDeck'
import { getApprovedVideos, getMySubmission, submitVideo } from '../../services/communityVideoService'

const TEAL = '#00D4AA'
const TEAL_DARK = '#00A884'
const NAVY = '#0A2540'

function SectionHeader({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
      <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
      <h4 style={{ fontSize: '0.6875rem', fontWeight: 700, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
        {children}
      </h4>
      <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
    </div>
  )
}

// Merged "learn by teaching" flow shown at the end of each study session:
//   1. Explain it first  — self-explanation prompt
//   2. Watch             — peer videos (if any approved) else curated "Related video"
//   3. Teach it          — present auto-generated slides, record, and submit a link
export default function TeachToLearn({ session, courseSlug, examCode, officialVideos, userId, submitterName }) {
  const sessionId = session.id
  const hasOfficial = officialVideos && officialVideos.length > 0

  const [communityVideos, setCommunityVideos] = useState([])
  const [mySubmission, setMySubmission] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [deckOpen, setDeckOpen] = useState(false)

  useEffect(() => {
    let alive = true
    setLoaded(false)
    Promise.all([
      getApprovedVideos(courseSlug, sessionId),
      userId ? getMySubmission(userId, courseSlug, sessionId) : Promise.resolve(null),
    ]).then(([vids, mine]) => {
      if (!alive) return
      setCommunityVideos(vids)
      setMySubmission(mine)
      setLoaded(true)
    })
    return () => { alive = false }
  }, [courseSlug, sessionId, userId])

  const hasCommunity = communityVideos.length > 0

  return (
    <div style={{ margin: '2.5rem 0 0' }}>
      <SectionHeader>Teach it to learn it</SectionHeader>
      <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.65, margin: '0 0 1.75rem', textAlign: 'center' }}>
        The fastest way to remember this session is to teach it. Explain it, watch how others explain it,
        then record your own.
      </p>

      {/* ── Step 1: Explain it first ─────────────────────────────────────────── */}
      {session.selfExplanationPrompt && (
        <div style={{ background: 'rgba(59,130,246,0.05)', border: '1.5px solid rgba(59,130,246,0.2)', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            1 · Explain it first
          </div>
          <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: 1.65, margin: 0 }}>
            {session.selfExplanationPrompt}
          </p>
        </div>
      )}

      {/* ── Step 2: Watch ────────────────────────────────────────────────────── */}
      {(hasCommunity || hasOfficial) && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: TEAL_DARK, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            2 · Watch
          </div>

          {/* Learner videos fully replace the curated one when any exist. */}
          {hasCommunity ? (
            <CommunityVideoPanel videos={communityVideos} currentUserId={userId} />
          ) : (
            hasOfficial && <VideoPanel videos={officialVideos} showHeader={false} />
          )}
        </div>
      )}

      {/* ── Step 3: Teach it ─────────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, rgba(0,212,170,0.08), rgba(0,168,132,0.04))`, border: `1.5px solid rgba(0,212,170,0.3)`, borderRadius: '1rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: TEAL_DARK, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          3 · Teach it &amp; share
        </div>
        <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: 1.6, margin: '0 0 0.85rem' }}>
          Present the slides below on full screen, screen-record yourself teaching them, upload to YouTube
          (public or unlisted) or Loom, and paste the link. Approved videos appear here for everyone learning
          this session.
        </p>

        {/* Encouragement — frames teaching as personal branding toward the learner's goal */}
        <div style={{ background: 'white', border: '1.5px solid rgba(0,212,170,0.35)', borderRadius: '0.75rem', padding: '0.85rem 1rem', margin: '0 0 1rem', display: 'flex', gap: '0.7rem', alignItems: 'flex-start' }}>
          <span aria-hidden="true" style={{ fontSize: '1.1rem', lineHeight: 1.2, flexShrink: 0 }}>🎯</span>
          <p style={{ fontSize: '0.8125rem', color: '#0f4c43', lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: NAVY }}>This is more than revision — it's your portfolio.</strong> Every explanation
            you publish is public proof that you understand this material. It builds your personal brand on
            YouTube and LinkedIn, shows recruiters you can teach what you know, and turns your certification
            journey into something employers can actually see. You don't need to be perfect — you just need to
            start. Future-you, sitting in that interview, will be glad you did.
          </p>
        </div>

        <button onClick={() => setDeckOpen(true)} style={primaryBtn}>
          ▶ Open slides to present
        </button>

        {/* Submission state / form */}
        {!loaded ? null : !userId ? (
          <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '1rem 0 0' }}>Sign in to submit your video.</p>
        ) : (
          <SubmissionArea
            key={mySubmission?.id || 'new'}
            session={session}
            courseSlug={courseSlug}
            examCode={examCode}
            userId={userId}
            submitterName={submitterName}
            existing={mySubmission}
            onSubmitted={(row) => setMySubmission(row)}
          />
        )}
      </div>

      {deckOpen && <SlideDeck session={session} onClose={() => setDeckOpen(false)} />}
    </div>
  )
}

function SubmissionArea({ session, courseSlug, examCode, userId, submitterName, existing, onSubmitted }) {
  const [editing, setEditing] = useState(!existing)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('idle') // idle | saving | error
  const [errMsg, setErrMsg] = useState('')

  // Show the current submission state if one exists and we're not editing.
  if (existing && !editing) {
    const map = {
      pending: { color: '#b45309', bg: 'rgba(245,158,11,0.12)', label: 'In review', text: "Thanks! Your video is in our review queue. It'll appear to other learners once approved." },
      approved: { color: '#059669', bg: 'rgba(16,185,129,0.12)', label: 'Live', text: 'Your video is approved and showing to other learners. Thank you for teaching!' },
      rejected: { color: '#b91c1c', bg: 'rgba(239,68,68,0.12)', label: 'Not approved', text: existing.rejection_reason || 'This submission was not approved. You can record a new one and resubmit.' },
      hidden: { color: '#b45309', bg: 'rgba(245,158,11,0.12)', label: 'Temporarily hidden', text: 'Your video was hidden pending re-review after reports. We will take another look.' },
    }
    const s = map[existing.status] || map.pending
    return (
      <div style={{ marginTop: '1rem', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '0.75rem', padding: '0.9rem 1.1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: s.color, background: s.bg, padding: '0.2rem 0.6rem', borderRadius: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {s.label}
          </span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: NAVY }}>{existing.title}</span>
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.55, margin: 0 }}>{s.text}</p>
        <button onClick={() => { setEditing(true); setUrl(''); setTitle(existing.title || ''); setNote(existing.note || '') }} style={{ ...linkBtn, marginTop: '0.6rem' }}>
          Replace my video →
        </button>
      </div>
    )
  }

  async function submit() {
    setStatus('saving')
    setErrMsg('')
    try {
      const row = await submitVideo({ userId, courseSlug, sessionId: session.id, url, title, note, submitterName })
      onSubmitted(row)
      setStatus('idle')
      setEditing(false)
    } catch (e) {
      setErrMsg(e.message)
      setStatus('error')
    }
  }

  return (
    <div style={{ marginTop: '1rem', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '0.75rem', padding: '1rem 1.1rem' }}>
      {/* Ready-made title / description / tags for the learner's YouTube upload */}
      <YouTubePostHelper session={session} examCode={examCode} onUseTitle={setTitle} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Paste your YouTube or Loom link"
          style={inputStyle}
        />
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title (e.g. My 3-min explanation of supervised learning)"
          style={inputStyle}
        />
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Optional: what you focus on (1–2 lines)"
          rows={2}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      {status === 'error' && (
        <p style={{ fontSize: '0.8125rem', color: '#dc2626', margin: '0.75rem 0 0' }}>{errMsg}</p>
      )}

      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.85rem' }}>
        <button onClick={submit} disabled={status === 'saving'} style={{ ...primaryBtn, opacity: status === 'saving' ? 0.6 : 1 }}>
          {status === 'saving' ? 'Submitting…' : 'Submit for review'}
        </button>
        {existing && (
          <button onClick={() => setEditing(false)} style={secondaryBtn}>Cancel</button>
        )}
      </div>
      <p style={{ fontSize: '0.6875rem', color: '#9ca3af', lineHeight: 1.5, margin: '0.75rem 0 0' }}>
        Tip: set your YouTube video to <strong>Unlisted</strong> if you'd rather it not appear on your public channel.
        Videos are reviewed before they go live.
      </p>
    </div>
  )
}

// Build ready-to-paste YouTube post copy from the session data.
function buildYouTubeSuggestion(session, examCode) {
  const code = examCode || 'AWS'
  const title = `${session.title} — ${code} Exam Prep Explained`

  const description = [
    `In this video I explain "${session.title}" as part of my ${code} certification prep.`,
    session.summary ? `\n${session.summary}` : '',
    `\nI'm learning by teaching with Cloud Exam Lab — explaining each topic out loud to make it stick.`,
    `\n👉 Study the full ${code} course at Cloud Exam Lab.`,
  ].filter(Boolean).join('\n')

  const rawTags = [
    code, 'AWS', 'Cloud Certification', 'Exam Prep',
    session.domain, session.module,
    ...(session.keyTerms || []).slice(0, 4).map(t => t.term),
  ].filter(Boolean)
  // De-dupe, keep order.
  const tags = [...new Set(rawTags)].join(', ')

  const hashtags = [...new Set([code.replace(/[^A-Za-z0-9]/g, ''), 'AWS', 'CloudExamLab', 'CloudCertification']
    .filter(Boolean))].map(h => `#${h}`).join(' ')

  return { title, description: `${description}\n\n${hashtags}`, tags }
}

function CopyField({ label, value, multiline, onUse }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard blocked — select-on-focus fallback handles it.
    }
  }
  return (
    <div style={{ marginBottom: '0.7rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#6b7280' }}>{label}</span>
        <span style={{ display: 'flex', gap: '0.6rem' }}>
          {onUse && (
            <button type="button" onClick={onUse} style={miniLink}>Use as title</button>
          )}
          <button type="button" onClick={copy} style={miniLink}>{copied ? '✓ Copied' : 'Copy'}</button>
        </span>
      </div>
      {multiline ? (
        <textarea readOnly value={value} onFocus={e => e.target.select()} rows={5}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', background: '#f9fafb', fontSize: '0.8125rem', lineHeight: 1.5 }} />
      ) : (
        <input readOnly value={value} onFocus={e => e.target.select()}
          style={{ ...inputStyle, background: '#f9fafb' }} />
      )}
    </div>
  )
}

function YouTubePostHelper({ session, examCode, onUseTitle }) {
  const [open, setOpen] = useState(false)
  const sug = useMemo(() => buildYouTubeSuggestion(session, examCode), [session, examCode])

  return (
    <div style={{ marginBottom: '0.85rem', border: '1.5px dashed #d1d5db', borderRadius: '0.75rem', padding: open ? '0.85rem 1rem' : '0.6rem 1rem', background: '#fbfdff' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
      >
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: NAVY }}>
          📝 Need a title &amp; description for YouTube? <span style={{ color: '#6b7280', fontWeight: 500 }}>We wrote one for you</span>
        </span>
        <span style={{ fontSize: '0.8125rem', color: TEAL_DARK, fontWeight: 700 }}>{open ? 'Hide' : 'Show'}</span>
      </button>

      {open && (
        <div style={{ marginTop: '0.85rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
            Copy these into YouTube when you upload (set the video to <strong>Unlisted</strong> if you prefer). Tweak them to sound like you.
          </p>
          <CopyField label="Video title" value={sug.title} onUse={() => onUseTitle(sug.title)} />
          <CopyField label="Description" value={sug.description} multiline />
          <CopyField label="Tags" value={sug.tags} />
        </div>
      )}
    </div>
  )
}

const miniLink = {
  fontSize: '0.6875rem', fontWeight: 700, color: TEAL_DARK,
  background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline',
}
const inputStyle = {
  width: '100%', boxSizing: 'border-box', borderRadius: '0.5rem', border: '1.5px solid #e5e7eb',
  padding: '0.6rem 0.75rem', fontSize: '0.875rem', fontFamily: 'inherit',
}
const primaryBtn = {
  padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.875rem',
  cursor: 'pointer', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: 'white',
  border: 'none', boxShadow: '0 3px 12px rgba(0,212,170,0.3)',
}
const secondaryBtn = {
  padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.875rem',
  cursor: 'pointer', background: 'white', color: '#6b7280', border: '1.5px solid #e5e7eb',
}
const linkBtn = {
  display: 'inline-block', marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: 700,
  color: TEAL_DARK, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline',
}
