// Supabase Edge Function: create-paypal-subscription
// Creates a PayPal subscription for a user based on a selected plan

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID') || ''
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET') || ''
const PAYPAL_MODE = Deno.env.get('PAYPAL_MODE') || 'sandbox'

const PAYPAL_API_BASE = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

/**
 * Get PayPal access token
 */
async function getPayPalAccessToken(): Promise<string> {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`Failed to get PayPal access token: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    })
  }

  try {
    // Debug: Log environment and auth header presence
    const authHeader = req.headers.get('Authorization')
    console.log('🔍 Auth header present:', !!authHeader)
    console.log('🔍 Auth header prefix:', authHeader?.substring(0, 20))
    console.log('🔍 SUPABASE_URL:', Deno.env.get('SUPABASE_URL')?.substring(0, 30))
    console.log('🔍 SUPABASE_ANON_KEY present:', !!Deno.env.get('SUPABASE_ANON_KEY'))

    // Initialize Supabase client with user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader ?? '' },
        },
      }
    )

    // Get user from auth token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    console.log('🔍 getUser result - user:', !!user, 'error:', userError?.message || 'none')

    if (userError || !user) {
      throw new Error(`Unauthorized: ${userError?.message || 'No user returned'}`)
    }

    // Parse request body
    const { planSlug, returnUrl, cancelUrl } = await req.json()

    if (!planSlug) {
      throw new Error('Missing required parameter: planSlug')
    }

    // Look up the subscription plan from the database
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('slug', planSlug)
      .eq('is_active', true)
      .single()

    if (planError || !plan) {
      throw new Error('Subscription plan not found')
    }

    // Initialize admin client for writing subscription records
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if user already has an active subscription
    const { data: existingSub } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id, status, paypal_subscription_id')
      .eq('user_id', user.id)
      .in('status', ['active', 'pending'])
      .maybeSingle()

    if (existingSub?.status === 'active') {
      throw new Error('You already have an active subscription')
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Create PayPal subscription
    const subscriptionPayload = {
      plan_id: plan.paypal_plan_id,
      subscriber: {
        name: {
          given_name: user.user_metadata?.full_name?.split(' ')[0] || 'Subscriber',
          surname: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        },
        email_address: user.email,
      },
      application_context: {
        brand_name: 'Cloud Exam Lab',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: returnUrl || `${req.headers.get('origin')}/payment-success?type=subscription`,
        cancel_url: cancelUrl || `${req.headers.get('origin')}/dashboard`,
      },
      custom_id: user.id, // Store user ID for webhook matching
    }

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(subscriptionPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('PayPal subscription creation failed:', errorText)
      throw new Error(`Failed to create PayPal subscription: ${response.statusText}`)
    }

    const subscription = await response.json()

    // Find approval URL
    const approvalUrl = subscription.links?.find((link: any) => link.rel === 'approve')?.href

    if (!approvalUrl) {
      throw new Error('No approval URL in PayPal response')
    }

    // If there's an existing pending subscription, update it; otherwise insert new
    if (existingSub?.status === 'pending') {
      await supabaseAdmin
        .from('user_subscriptions')
        .update({
          plan_id: plan.id,
          paypal_subscription_id: subscription.id,
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSub.id)
    } else {
      // Insert a pending subscription record
      const { error: insertError } = await supabaseAdmin
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          paypal_subscription_id: subscription.id,
          status: 'pending',
        })

      if (insertError) {
        console.error('Error inserting subscription record:', insertError)
        // Don't fail the request - the webhook will create the record if needed
      }
    }

    console.log(`✅ PayPal subscription created: ${subscription.id} for user ${user.id}, plan ${plan.slug}`)

    return new Response(
      JSON.stringify({
        subscriptionId: subscription.id,
        approvalUrl,
        status: subscription.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating PayPal subscription:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
