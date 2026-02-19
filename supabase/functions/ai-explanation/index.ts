// Supabase Edge Function: ai-explanation
// Handles AI explanation requests for exam questions using Gemini API.
//
// Access rules:
//   Free users  – predefined prompts only (concept_guide, explanations,
//                 official_links). Cached responses are returned for free.
//                 Custom prompts → 403 upgrade_required.
//   Paid users  – all prompt types; max 200 non-cached Gemini calls per day.
//                 Cached predefined responses do NOT count toward the limit.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || ''
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const DAILY_LIMIT = 200

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type PromptType = 'concept_guide' | 'explanations' | 'official_links' | 'custom'

interface Option {
  text: string
  correct: boolean
}

function buildPrompt(
  promptType: PromptType,
  questionText: string,
  options: Option[],
  customQuery?: string
): string {
  const formattedOptions = options
    .map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt.text}`)
    .join('\n')

  const questionBlock = `Question:\n${questionText}\n\nOptions:\n${formattedOptions}`

  switch (promptType) {
    case 'concept_guide':
      return (
        `Give me lesson to answer this question, dont directly answer the question, ` +
        `explain all service mentioned, and all abbreviation, and make the lesson ` +
        `help me to answer future question similiar to this\n\n${questionBlock}`
      )

    case 'explanations':
      return (
        `For this cloud certification exam question, explain why each answer option is ` +
        `correct or incorrect. Be specific and educational.\n\n${questionBlock}\n\n` +
        `Provide a clear explanation for each option (A, B, C, D...), stating whether ` +
        `it is correct or incorrect and the detailed reason why.`
      )

    case 'official_links':
      return (
        `For this cloud certification exam question, provide a list of the most relevant ` +
        `official documentation links that would help understand the concepts being tested.\n\n` +
        `${questionBlock}\n\n` +
        `Format your response as a markdown list. Include descriptive titles and full URLs. ` +
        `Focus on official documentation from AWS, Azure, GCP, or other relevant cloud providers. ` +
        `Only include real, verifiable documentation URLs.`
      )

    case 'custom':
      return `Context - Exam Question:\n${questionBlock}\n\nUser Question: ${customQuery || ''}`

    default:
      return `${questionBlock}\n\n${customQuery || ''}`
  }
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
    const { question_id, prompt_type, custom_query } = await req.json()

    if (!question_id || !prompt_type) {
      return jsonResponse({ error: 'question_id and prompt_type are required' }, 400)
    }

    if (!GEMINI_API_KEY) {
      return jsonResponse({ error: 'AI service is not configured.' }, 503)
    }

    // ── Authentication ──────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Authentication required.', code: 'unauthenticated' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''

    // Service-role client for all DB writes / admin reads
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // User-context client to verify the caller's JWT
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return jsonResponse({ error: 'Invalid or expired session.', code: 'unauthenticated' }, 401)
    }

    // ── Fetch question row ──────────────────────────────────────────────────
    const { data: question, error: fetchError } = await supabase
      .from('question_items')
      .select('id, question_text, options, ai_cache')
      .eq('id', question_id)
      .single()

    if (fetchError || !question) {
      return jsonResponse({ error: 'Question not found.' }, 404)
    }

    const isPredefined = ['concept_guide', 'explanations', 'official_links'].includes(prompt_type)

    // ── Cache hit — return immediately, no limits apply ─────────────────────
    if (isPredefined && question.ai_cache?.[prompt_type]) {
      return jsonResponse({ response: question.ai_cache[prompt_type], cached: true })
    }

    // ── Subscription check ──────────────────────────────────────────────────
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('current_period_end', new Date().toISOString())
      .maybeSingle()

    const isPaidUser = !!subscription

    // Free users cannot send custom prompts
    if (!isPaidUser && prompt_type === 'custom') {
      return jsonResponse(
        {
          error: 'Custom questions are a premium feature. Upgrade your plan to ask anything.',
          code: 'upgrade_required',
        },
        403
      )
    }

    // ── Daily rate-limit check (paid users only) ────────────────────────────
    if (isPaidUser) {
      const today = new Date().toISOString().split('T')[0]
      const { data: usage } = await supabase
        .from('ai_usage')
        .select('call_count')
        .eq('user_id', user.id)
        .eq('usage_date', today)
        .maybeSingle()

      const usedToday = usage?.call_count ?? 0
      if (usedToday >= DAILY_LIMIT) {
        return jsonResponse(
          {
            error: `You have used all ${DAILY_LIMIT} AI calls for today. Your limit resets at midnight UTC.`,
            code: 'rate_limit_exceeded',
            limit: DAILY_LIMIT,
            used: usedToday,
          },
          429
        )
      }
    }

    // ── Build prompt and call Gemini ────────────────────────────────────────
    const prompt = buildPrompt(
      prompt_type as PromptType,
      question.question_text,
      question.options as Option[],
      custom_query
    )

    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text()
      console.error('Gemini API error:', geminiResponse.status, errBody)
      return jsonResponse({ error: 'AI service unavailable. Please try again later.' }, 502)
    }

    const geminiData = await geminiResponse.json()
    const responseText: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!responseText) {
      return jsonResponse({ error: 'No response received from AI service.' }, 502)
    }

    // ── Cache predefined responses (shared across all users) ────────────────
    if (isPredefined) {
      const updatedCache = { ...(question.ai_cache || {}), [prompt_type]: responseText }
      await supabase
        .from('question_items')
        .update({ ai_cache: updatedCache })
        .eq('id', question_id)
    }

    // ── Increment daily usage counter (paid users, non-cached calls only) ───
    if (isPaidUser) {
      await supabase.rpc('increment_ai_usage', { p_user_id: user.id })
    }

    return jsonResponse({ response: responseText, cached: false })
  } catch (err) {
    console.error('Edge function error:', err)
    return jsonResponse({ error: 'Internal server error.' }, 500)
  }
})
