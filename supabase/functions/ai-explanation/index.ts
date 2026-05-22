// Supabase Edge Function: ai-explanation
// Gemini API is currently paused.
// All responses are served from the pre-populated ai_cache column in question_items.
// Custom prompts are disabled. Only predefined prompt types are accepted:
//   concept_guide | explanations | official_links

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type PromptType = 'concept_guide' | 'explanations' | 'official_links'

const PREDEFINED_TYPES: PromptType[] = ['concept_guide', 'explanations', 'official_links']

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { question_id, prompt_type } = await req.json()

    if (!question_id || !prompt_type) {
      return jsonResponse({ error: 'question_id and prompt_type are required' }, 400)
    }

    // Custom prompts are disabled while Gemini is paused
    if (prompt_type === 'custom' || !PREDEFINED_TYPES.includes(prompt_type as PromptType)) {
      return jsonResponse(
        {
          error: 'Custom AI questions are not available at this time. Please use the prepared explanations.',
          code: 'feature_unavailable',
        },
        403
      )
    }

    // ── Authentication ──────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Authentication required.', code: 'unauthenticated' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return jsonResponse({ error: 'Invalid or expired session.', code: 'unauthenticated' }, 401)
    }

    // ── Fetch question and check cache ──────────────────────────────────────
    const { data: question, error: fetchError } = await supabase
      .from('question_items')
      .select('id, ai_cache')
      .eq('id', question_id)
      .single()

    if (fetchError || !question) {
      return jsonResponse({ error: 'Question not found.' }, 404)
    }

    const cached = question.ai_cache?.[prompt_type]

    if (cached) {
      return jsonResponse({ response: cached, cached: true })
    }

    // No cache entry yet — content is being prepared
    return jsonResponse(
      {
        error: 'This explanation is not available yet. Our team is preparing it — please check back soon.',
        code: 'content_not_ready',
      },
      404
    )

  } catch (err) {
    console.error('Edge function error:', err)
    return jsonResponse({ error: 'Internal server error.' }, 500)
  }
})
