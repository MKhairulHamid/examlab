// Supabase Edge Function: create-checkout-session
// Creates a Stripe Checkout session for purchasing question sets or packages

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from auth token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { itemType, itemId, email, successUrl, cancelUrl } = await req.json()

    if (!itemType || !itemId || !email) {
      throw new Error('Missing required parameters')
    }

    // Fetch item details from database
    let itemData: any
    let lineItems: any[] = []

    if (itemType === 'question_set') {
      const { data, error } = await supabaseClient
        .from('question_sets')
        .select('*, exam_types(name)')
        .eq('id', itemId)
        .single()

      if (error || !data) {
        throw new Error('Question set not found')
      }

      itemData = data
      lineItems = [
        {
          price_data: {
            currency: data.currency || 'usd',
            product_data: {
              name: `${data.exam_types.name} - ${data.name}`,
              description: `${data.question_count} practice questions`,
              images: [],
            },
            unit_amount: data.price_cents,
          },
          quantity: 1,
        },
      ]
    } else if (itemType === 'package') {
      const { data, error } = await supabaseClient
        .from('packages')
        .select('*, exam_types(name)')
        .eq('id', itemId)
        .single()

      if (error || !data) {
        throw new Error('Package not found')
      }

      itemData = data
      lineItems = [
        {
          price_data: {
            currency: data.currency || 'usd',
            product_data: {
              name: `${data.exam_types.name} - ${data.name}`,
              description: data.description || 'Complete package',
              images: [],
            },
            unit_amount: data.price_cents,
          },
          quantity: 1,
        },
      ]
    } else {
      throw new Error('Invalid item type')
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        itemType,
        itemId,
      },
      payment_intent_data: {
        metadata: {
          userId: user.id,
          itemType,
          itemId,
        },
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

