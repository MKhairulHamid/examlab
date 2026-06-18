// Supabase Edge Function: admin-api
// Handles all admin CRUD operations for exam types, question sets, and question items.
// Access is restricted to a single admin email defined in the ADMIN_EMAIL env variable.

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Build a promo code "based on the target": slugify the target group into an
// uppercase prefix, then append a short random suffix for uniqueness.
// e.g. "Uni Friends WA" -> "UNIFRIENDS-7K2D"
function generatePromoCode(targetGroup: string): string {
  const prefix = (targetGroup || 'PROMO')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 12) || 'PROMO'
  // Avoid ambiguous characters (0/O, 1/I) in the random part.
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `${prefix}-${suffix}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── Authentication ───────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Authentication required.', code: 'unauthenticated' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || ''

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return jsonResponse({ error: 'Invalid or expired session.', code: 'unauthenticated' }, 401)
    }

    // ── Admin email check ────────────────────────────────────────────────────
    if (!adminEmail || user.email !== adminEmail) {
      return jsonResponse({ error: 'Access denied. Admin only.', code: 'forbidden' }, 403)
    }

    // ── Route by action ──────────────────────────────────────────────────────
    const body = await req.json()
    const { action } = body

    switch (action) {

      // ── Exam Types ──────────────────────────────────────────────────────────
      case 'getExamTypes': {
        const { data, error } = await supabase
          .from('exam_types')
          .select('id, name, slug, provider, description, icon, total_questions, duration_minutes, passing_score, max_score, is_active, display_order, created_at')
          .order('display_order', { ascending: true })

        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      case 'createExamType': {
        const { name, slug, provider, description, icon, total_questions, duration_minutes, passing_score, max_score, is_active, display_order } = body

        if (!name || !slug || !provider) {
          return jsonResponse({ error: 'name, slug, and provider are required.' }, 400)
        }

        const { data, error } = await supabase
          .from('exam_types')
          .insert({
            name,
            slug,
            provider,
            description: description || null,
            icon: icon || null,
            total_questions: total_questions || null,
            duration_minutes: duration_minutes || null,
            passing_score: passing_score || null,
            max_score: max_score || 1000,
            is_active: is_active !== undefined ? is_active : true,
            display_order: display_order || 0,
          })
          .select()
          .single()

        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      case 'updateExamType': {
        const { id, ...updates } = body
        if (!id) return jsonResponse({ error: 'id is required.' }, 400)

        const allowed = ['name', 'slug', 'provider', 'description', 'icon', 'total_questions', 'duration_minutes', 'passing_score', 'max_score', 'is_active', 'display_order']
        const filtered = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)))

        const { data, error } = await supabase
          .from('exam_types')
          .update(filtered)
          .eq('id', id)
          .select()
          .single()

        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      // ── Question Sets ───────────────────────────────────────────────────────
      case 'getQuestionSets': {
        const { exam_type_id } = body
        if (!exam_type_id) return jsonResponse({ error: 'exam_type_id is required.' }, 400)

        const { data, error } = await supabase
          .from('question_sets')
          .select('id, exam_type_id, name, description, set_number, question_count, price_cents, currency, is_free_sample, sample_question_count, is_active, version_number, last_content_update')
          .eq('exam_type_id', exam_type_id)
          .order('set_number', { ascending: true })

        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      case 'createQuestionSet': {
        const { exam_type_id, name, description, set_number, price_cents, is_free_sample, sample_question_count, is_active } = body

        if (!exam_type_id || !name || set_number === undefined) {
          return jsonResponse({ error: 'exam_type_id, name, and set_number are required.' }, 400)
        }

        const { data, error } = await supabase
          .from('question_sets')
          .insert({
            exam_type_id,
            name,
            description: description || null,
            set_number,
            question_count: 0,
            questions_json: [],
            price_cents: price_cents || 0,
            is_free_sample: is_free_sample || false,
            sample_question_count: sample_question_count || 0,
            is_active: is_active !== undefined ? is_active : true,
          })
          .select()
          .single()

        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      case 'updateQuestionSet': {
        const { id, ...updates } = body
        if (!id) return jsonResponse({ error: 'id is required.' }, 400)

        const allowed = ['name', 'description', 'price_cents', 'is_free_sample', 'sample_question_count', 'is_active']
        const filtered = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)))

        const { data, error } = await supabase
          .from('question_sets')
          .update(filtered)
          .eq('id', id)
          .select()
          .single()

        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      // ── Question Items ──────────────────────────────────────────────────────
      case 'getQuestionItems': {
        const { question_set_id } = body
        if (!question_set_id) return jsonResponse({ error: 'question_set_id is required.' }, 400)

        const { data, error } = await supabase
          .from('question_items')
          .select('id, question_number, question_text, question_type, domain, options, correct_answers, tags')
          .eq('question_set_id', question_set_id)
          .order('question_number', { ascending: true })

        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      case 'upsertQuestionItems': {
        // Replaces all question items for a set with the provided JSON array.
        // Each item must have question_number, question_text, question_type, options, correct_answers.
        // Existing items not in the payload are deleted.
        const { question_set_id, items } = body

        if (!question_set_id) return jsonResponse({ error: 'question_set_id is required.' }, 400)
        if (!Array.isArray(items)) return jsonResponse({ error: 'items must be an array.' }, 400)
        if (items.length === 0) return jsonResponse({ error: 'items array cannot be empty.' }, 400)

        // Validate each item has required fields
        for (const item of items) {
          if (!item.question_number || !item.question_text || !item.question_type || !item.options || !item.correct_answers) {
            return jsonResponse({
              error: `Item at question_number ${item.question_number || '?'} is missing required fields (question_text, question_type, options, correct_answers).`
            }, 400)
          }
        }

        // Delete existing items then insert new ones (clean replace)
        const { error: deleteError } = await supabase
          .from('question_items')
          .delete()
          .eq('question_set_id', question_set_id)

        if (deleteError) return jsonResponse({ error: deleteError.message }, 500)

        const rows = items.map((item: {
          question_number: number
          question_text: string
          question_type: string
          domain?: string
          options: unknown
          correct_answers: unknown
          tags?: unknown
        }) => ({
          question_set_id,
          question_number: item.question_number,
          question_text: item.question_text,
          question_type: item.question_type,
          domain: item.domain || null,
          options: item.options,
          correct_answers: item.correct_answers,
          tags: item.tags || [],
        }))

        const { data, error: insertError } = await supabase
          .from('question_items')
          .insert(rows)
          .select('id, question_number, question_text, question_type, domain')

        if (insertError) return jsonResponse({ error: insertError.message }, 500)

        // Update question_count on the question set
        await supabase
          .from('question_sets')
          .update({ question_count: rows.length })
          .eq('id', question_set_id)

        return jsonResponse({ data, count: rows.length })
      }

      case 'deleteQuestionItems': {
        // Deletes specific question items by their IDs
        const { ids } = body
        if (!Array.isArray(ids) || ids.length === 0) {
          return jsonResponse({ error: 'ids must be a non-empty array.' }, 400)
        }

        const { error } = await supabase
          .from('question_items')
          .delete()
          .in('id', ids)

        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ success: true, deleted: ids.length })
      }

      // ── Promo Codes ─────────────────────────────────────────────────────────
      case 'getPromoCodes': {
        const { data, error } = await supabase
          .from('promo_codes')
          .select('id, code, exam_type_id, target_group, duration_days, redeem_by, all_programs, max_uses, used_count, is_active, created_at, exam_types ( name, slug )')
          .order('created_at', { ascending: false })

        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      case 'createPromoCode': {
        const { exam_type_id, target_group, duration_days, max_uses, all_programs, redeem_window_days } = body
        const allPrograms = all_programs === true

        if (!target_group) {
          return jsonResponse({ error: 'target_group is required.' }, 400)
        }
        // The code must target either a specific exam OR all programs, not both/neither.
        if (allPrograms && exam_type_id) {
          return jsonResponse({ error: 'Provide exam_type_id or all_programs, not both.' }, 400)
        }
        if (!allPrograms && !exam_type_id) {
          return jsonResponse({ error: 'exam_type_id is required unless all_programs is true.' }, 400)
        }
        if (![1, 3, 7, 30].includes(Number(duration_days))) {
          return jsonResponse({ error: 'duration_days must be one of 1, 3, 7, 30.' }, 400)
        }
        if (![1, 3, 7, 14, 30].includes(Number(redeem_window_days))) {
          return jsonResponse({ error: 'redeem_window_days must be one of 1, 3, 7, 14, 30.' }, 400)
        }
        if (!Number.isInteger(Number(max_uses)) || Number(max_uses) < 1) {
          return jsonResponse({ error: 'max_uses must be a positive integer.' }, 400)
        }

        // Deadline after which the code can no longer be redeemed.
        const redeemBy = new Date(Date.now() + Number(redeem_window_days) * 86400000).toISOString()

        // Generate a unique code, retrying on the rare collision.
        let inserted = null
        let lastError = null
        for (let attempt = 0; attempt < 5; attempt++) {
          const code = generatePromoCode(target_group)
          const { data, error } = await supabase
            .from('promo_codes')
            .insert({
              code,
              exam_type_id: allPrograms ? null : exam_type_id,
              all_programs: allPrograms,
              target_group,
              duration_days: Number(duration_days),
              redeem_by: redeemBy,
              max_uses: Number(max_uses),
            })
            .select('id, code, exam_type_id, target_group, duration_days, redeem_by, all_programs, max_uses, used_count, is_active, created_at, exam_types ( name, slug )')
            .single()

          if (!error) { inserted = data; break }
          // 23505 = unique_violation (code collision) — retry with a new code.
          if (error.code !== '23505') return jsonResponse({ error: error.message }, 500)
          lastError = error
        }

        if (!inserted) {
          return jsonResponse({ error: lastError?.message || 'Could not generate a unique code.' }, 500)
        }
        return jsonResponse({ data: inserted })
      }

      case 'updatePromoCode': {
        const { id, is_active } = body
        if (!id) return jsonResponse({ error: 'id is required.' }, 400)
        if (typeof is_active !== 'boolean') {
          return jsonResponse({ error: 'is_active (boolean) is required.' }, 400)
        }

        const { data, error } = await supabase
          .from('promo_codes')
          .update({ is_active })
          .eq('id', id)
          .select('id, code, exam_type_id, target_group, duration_days, redeem_by, all_programs, max_uses, used_count, is_active, created_at, exam_types ( name, slug )')
          .single()

        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      case 'getPromoRedemptions': {
        const { promo_code_id } = body
        if (!promo_code_id) return jsonResponse({ error: 'promo_code_id is required.' }, 400)

        const { data, error } = await supabase
          .from('promo_redemptions')
          .select('id, user_id, redeemed_at, expires_at')
          .eq('promo_code_id', promo_code_id)
          .order('redeemed_at', { ascending: false })

        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      // ── Community Videos (learner "Teach It" submissions) ────────────────────
      case 'getCommunityVideos': {
        // Default to the pending review queue; allow filtering by any status.
        const status = body.status || 'pending'

        let query = supabase
          .from('community_videos')
          .select('id, user_id, course_slug, session_id, provider, video_url, video_ref, start_seconds, title, note, submitter_name, status, report_count, rejection_reason, reviewed_at, created_at, updated_at')
          .order('created_at', { ascending: false })

        if (status !== 'all') query = query.eq('status', status)

        const { data, error } = await query
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      case 'reviewCommunityVideo': {
        const { id, status, rejection_reason } = body
        if (!id || !status) return jsonResponse({ error: 'id and status are required.' }, 400)
        if (!['approved', 'rejected', 'hidden', 'pending'].includes(status)) {
          return jsonResponse({ error: 'Invalid status.' }, 400)
        }

        const { data, error } = await supabase
          .from('community_videos')
          .update({
            status,
            rejection_reason: status === 'rejected' ? (rejection_reason || null) : null,
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id,
          })
          .eq('id', id)
          .select()
          .single()

        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      case 'getCommunityVideoReports': {
        // Default to open reports; join the reported video's key fields.
        const status = body.status || 'open'

        let query = supabase
          .from('community_video_reports')
          .select('id, video_id, reporter_id, reason, detail, status, created_at, video:community_videos(id, course_slug, session_id, provider, video_ref, title, submitter_name, status, report_count)')
          .order('created_at', { ascending: false })

        if (status !== 'all') query = query.eq('status', status)

        const { data, error } = await query
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      case 'resolveReport': {
        const { id, status, video_action, rejection_reason } = body
        if (!id || !status) return jsonResponse({ error: 'id and status are required.' }, 400)
        if (!['resolved', 'dismissed', 'open'].includes(status)) {
          return jsonResponse({ error: 'Invalid status.' }, 400)
        }

        // Optionally act on the underlying video (hide / reject / re-approve).
        if (video_action) {
          const { video_id } = body
          if (!video_id) return jsonResponse({ error: 'video_id is required for a video_action.' }, 400)
          if (!['approved', 'rejected', 'hidden'].includes(video_action)) {
            return jsonResponse({ error: 'Invalid video_action.' }, 400)
          }
          const { error: vErr } = await supabase
            .from('community_videos')
            .update({
              status: video_action,
              rejection_reason: video_action === 'rejected' ? (rejection_reason || null) : null,
              reviewed_at: new Date().toISOString(),
              reviewed_by: user.id,
            })
            .eq('id', video_id)
          if (vErr) return jsonResponse({ error: vErr.message }, 500)
        }

        const { data, error } = await supabase
          .from('community_video_reports')
          .update({ status })
          .eq('id', id)
          .select()
          .single()

        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      // ── Users (read-only directory + activity) ───────────────────────────────
      case 'getUsers': {
        // Pull every user-facing table once, then stitch together per user in
        // memory. The user base is small, so a handful of full scans is cheap
        // and avoids N+1 round trips.
        const [
          profilesRes,
          subsRes,
          plansRes,
          attemptsRes,
          streaksRes,
          courseRes,
          enrollRes,
          examTypesRes,
          aiRes,
        ] = await Promise.all([
          supabase.from('profiles').select('id, email, full_name, is_admin, exam_dates_json, created_at, updated_at'),
          supabase.from('user_subscriptions').select('user_id, plan_id, status, current_period_start, current_period_end, cancelled_at, created_at'),
          supabase.from('subscription_plans').select('id, name, slug, price_cents, currency, interval_unit'),
          supabase.from('exam_attempts').select('user_id, question_set_id, status, percentage_score, scaled_score, passed, completed_at, created_at'),
          supabase.from('study_streaks').select('user_id, current_streak, longest_streak, total_study_days, daily_goal_questions, last_activity_date'),
          supabase.from('study_course_progress').select('user_id, course_slug, completed_sessions, last_session_id, updated_at'),
          supabase.from('user_enrollments').select('user_id, exam_type_id, enrolled_at'),
          supabase.from('exam_types').select('id, name, slug'),
          supabase.from('ai_usage').select('user_id, usage_date, call_count'),
        ])

        const firstErr = [profilesRes, subsRes, plansRes, attemptsRes, streaksRes, courseRes, enrollRes, examTypesRes, aiRes]
          .find(r => r.error)
        if (firstErr?.error) return jsonResponse({ error: firstErr.error.message }, 500)

        const plansById = new Map((plansRes.data || []).map(p => [p.id, p]))
        const examTypesById = new Map((examTypesRes.data || []).map(t => [t.id, t]))

        const byUser = (rows: any[]) => {
          const m = new Map<string, any[]>()
          for (const row of rows || []) {
            if (!m.has(row.user_id)) m.set(row.user_id, [])
            m.get(row.user_id)!.push(row)
          }
          return m
        }

        const subsByUser = byUser(subsRes.data || [])
        const attemptsByUser = byUser(attemptsRes.data || [])
        const streaksByUser = byUser(streaksRes.data || [])
        const courseByUser = byUser(courseRes.data || [])
        const enrollByUser = byUser(enrollRes.data || [])
        const aiByUser = byUser(aiRes.data || [])

        const countSessions = (v: unknown) =>
          Array.isArray(v) ? v.length : (v && typeof v === 'object' ? Object.keys(v).length : 0)

        const users = (profilesRes.data || []).map(p => {
          const subs = (subsByUser.get(p.id) || [])
            .map(s => ({ ...s, plan: plansById.get(s.plan_id) || null }))
            .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
          const attempts = attemptsByUser.get(p.id) || []
          const completed = attempts.filter(a => a.status === 'completed')
          const scores = completed.map(a => Number(a.percentage_score)).filter(n => !isNaN(n))
          const lastAttempt = [...attempts].sort((a, b) =>
            (b.completed_at || b.created_at || '').localeCompare(a.completed_at || a.created_at || ''))[0] || null
          const streak = (streaksByUser.get(p.id) || [])[0] || null
          const courses = (courseByUser.get(p.id) || []).map(c => ({
            course_slug: c.course_slug,
            completed_sessions: countSessions(c.completed_sessions),
            last_session_id: c.last_session_id,
            updated_at: c.updated_at,
          }))
          const enrollments = (enrollByUser.get(p.id) || []).map(e => ({
            exam_type: examTypesById.get(e.exam_type_id)?.name || e.exam_type_id,
            enrolled_at: e.enrolled_at,
          }))
          const aiCalls = (aiByUser.get(p.id) || []).reduce((sum, r) => sum + (r.call_count || 0), 0)

          return {
            id: p.id,
            email: p.email,
            full_name: p.full_name,
            is_admin: p.is_admin,
            created_at: p.created_at,
            exam_dates: p.exam_dates_json || null,
            subscription: subs[0] || null,
            stats: {
              attempts_total: attempts.length,
              attempts_completed: completed.length,
              attempts_passed: completed.filter(a => a.passed).length,
              best_score: scores.length ? Math.max(...scores) : null,
              avg_score: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
              last_active: lastAttempt?.completed_at || lastAttempt?.created_at || null,
              ai_calls_total: aiCalls,
            },
            streak,
            courses,
            enrollments,
          }
        }).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))

        return jsonResponse({ data: users })
      }

      // ── Admin Notes ───────────────────────────────────────────────────────────
      case 'getNotes': {
        const { page_path } = body
        let query = supabase
          .from('admin_notes')
          .select('*')
          .order('created_at', { ascending: false })
        if (page_path) query = query.eq('page_path', page_path)
        const { data, error } = await query
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      case 'createNote': {
        const { page_path, page_title, note, type = 'bug', priority = 'medium' } = body
        if (!page_path || !note) return jsonResponse({ error: 'page_path and note are required.' }, 400)
        const { data, error } = await supabase
          .from('admin_notes')
          .insert({ page_path, page_title: page_title || '', note, type, priority })
          .select()
          .single()
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      case 'updateNote': {
        const { id, note, type, priority, status } = body
        if (!id) return jsonResponse({ error: 'id is required.' }, 400)
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
        if (note !== undefined) updates.note = note
        if (type !== undefined) updates.type = type
        if (priority !== undefined) updates.priority = priority
        if (status !== undefined) updates.status = status
        const { data, error } = await supabase
          .from('admin_notes')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ data })
      }

      case 'deleteNote': {
        const { id } = body
        if (!id) return jsonResponse({ error: 'id is required.' }, 400)
        const { error } = await supabase.from('admin_notes').delete().eq('id', id)
        if (error) return jsonResponse({ error: error.message }, 500)
        return jsonResponse({ success: true })
      }

      case 'pingAdmin': {
        return jsonResponse({ ok: true })
      }

      default:
        return jsonResponse({ error: `Unknown action: ${action}` }, 400)
    }
  } catch (err) {
    console.error('Admin API error:', err)
    return jsonResponse({ error: 'Internal server error.' }, 500)
  }
})
