// Supabase Edge Function: admin-api
// Handles all admin CRUD operations for exam types, question sets, and question items.
// Access is restricted to a single admin email defined in the ADMIN_EMAIL env variable.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

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

serve(async (req) => {
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

      default:
        return jsonResponse({ error: `Unknown action: ${action}` }, 400)
    }
  } catch (err) {
    console.error('Admin API error:', err)
    return jsonResponse({ error: 'Internal server error.' }, 500)
  }
})
