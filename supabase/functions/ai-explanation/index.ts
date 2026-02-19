// Supabase Edge Function: ai-explanation
// Handles AI explanation requests for exam questions using Gemini API.
// Predefined prompt types (concept_guide, explanations, official_links) are
// cached in question_items.ai_cache to avoid redundant API calls.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || ''
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { question_id, prompt_type, custom_query } = await req.json()

    if (!question_id || !prompt_type) {
      return new Response(
        JSON.stringify({ error: 'question_id and prompt_type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service is not configured.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Service role client bypasses RLS so we can update ai_cache
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch question row
    const { data: question, error: fetchError } = await supabase
      .from('question_items')
      .select('id, question_text, options, ai_cache')
      .eq('id', question_id)
      .single()

    if (fetchError || !question) {
      return new Response(
        JSON.stringify({ error: 'Question not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const isPredefined = ['concept_guide', 'explanations', 'official_links'].includes(prompt_type)

    // Return cached response immediately for predefined types
    if (isPredefined && question.ai_cache?.[prompt_type]) {
      return new Response(
        JSON.stringify({ response: question.ai_cache[prompt_type], cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build prompt and call Gemini
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
      return new Response(
        JSON.stringify({ error: 'AI service unavailable. Please try again later.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiData = await geminiResponse.json()
    const responseText: string =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!responseText) {
      return new Response(
        JSON.stringify({ error: 'No response received from AI service.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Write response to ai_cache for predefined types (shared across all users)
    if (isPredefined) {
      const updatedCache = { ...(question.ai_cache || {}), [prompt_type]: responseText }
      await supabase
        .from('question_items')
        .update({ ai_cache: updatedCache })
        .eq('id', question_id)
    }

    return new Response(
      JSON.stringify({ response: responseText, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
