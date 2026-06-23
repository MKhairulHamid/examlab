// Supabase Edge Function: cancel-paypal-subscription
// Cancels the calling user's active PayPal subscription.
//
// Behaviour:
//  - Verifies the caller's JWT and looks up THEIR own active subscription
//    (service role is used only to read/write that one row — the user can
//    never target someone else's subscription).
//  - Comp / manually-granted accounts (paypal_subscription_id like
//    "manual_grant_*" or dev "mock_sub_*") have no real PayPal subscription to
//    cancel, so we leave the DB untouched and tell the client to point the user
//    at support. This avoids silently revoking a comp account's access.
//  - Real subscriptions are cancelled via PayPal's API. PayPal then fires
//    BILLING.SUBSCRIPTION.CANCELLED, which the paypal-webhook function also
//    handles; we additionally flip the row here so the UI reflects the change
//    immediately without waiting on the webhook (both writes are idempotent).
//  - current_period_end is left intact: access is retained until the already
//    paid-through date (enforced client-side in purchaseStore).

import { createClient } from 'npm:@supabase/supabase-js@2'

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

// Subscription IDs that are not backed by a real PayPal subscription.
const isManualGrant = (paypalSubId: string | null | undefined): boolean =>
  !paypalSubId || paypalSubId.startsWith('manual_grant_') || paypalSubId.startsWith('mock_sub_')

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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      throw new Error('No authorization token provided')
    }

    // Service role verifies the caller's JWT (auto-injected apikey header).
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      throw new Error(`Unauthorized: ${userError?.message || 'No user returned'}`)
    }

    // Optional cancellation reason from the client (defaulted for PayPal).
    let reason = 'Cancelled by customer'
    try {
      const body = await req.json()
      if (body?.reason && typeof body.reason === 'string') {
        reason = body.reason.slice(0, 120)
      }
    } catch (_) {
      // No body / invalid JSON — fine, use the default reason.
    }

    // Find the caller's current subscription (only their own row).
    const { data: sub, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id, status, paypal_subscription_id, current_period_end')
      .eq('user_id', user.id)
      .in('status', ['active', 'pending'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (subError) {
      throw new Error(`Could not load subscription: ${subError.message}`)
    }

    if (!sub) {
      return new Response(
        JSON.stringify({ error: 'No active subscription to cancel' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Comp / manually-granted access: nothing to cancel at PayPal. Tell the
    // client to route the user to support and leave the grant untouched.
    if (isManualGrant(sub.paypal_subscription_id)) {
      return new Response(
        JSON.stringify({ success: false, manualGrant: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Cancel the real PayPal subscription.
    const accessToken = await getPayPalAccessToken()
    const ppResponse = await fetch(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${sub.paypal_subscription_id}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      }
    )

    // PayPal returns 204 on success. 422 with ALREADY_CANCELLED means it's
    // already gone — treat that as success and reconcile our DB below.
    if (!ppResponse.ok && ppResponse.status !== 422) {
      const errorText = await ppResponse.text()
      console.error('PayPal cancel failed:', ppResponse.status, errorText)
      throw new Error(`Failed to cancel PayPal subscription (${ppResponse.status})`)
    }

    if (ppResponse.status === 422) {
      const errorText = await ppResponse.text()
      if (!errorText.includes('ALREADY_CANCELLED') && !errorText.includes('SUBSCRIPTION_STATUS_INVALID')) {
        console.error('PayPal cancel 422:', errorText)
        throw new Error('Failed to cancel PayPal subscription')
      }
    }

    // Reflect the cancellation immediately (webhook will also do this, idempotently).
    // current_period_end is preserved so access lasts until the paid-through date.
    const { error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id)

    if (updateError) {
      console.error('Error updating cancelled subscription:', updateError)
      // PayPal already cancelled; the webhook will reconcile the row.
    }

    console.log(`✅ Subscription cancelled: ${sub.paypal_subscription_id} for user ${user.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        cancelled_at: new Date().toISOString(),
        access_until: sub.current_period_end,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
