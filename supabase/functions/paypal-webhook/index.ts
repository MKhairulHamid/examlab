// Supabase Edge Function: paypal-webhook
// Handles PayPal webhook events for payment processing

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID') || ''
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET') || ''
const PAYPAL_WEBHOOK_ID = Deno.env.get('PAYPAL_WEBHOOK_ID') || ''
const PAYPAL_MODE = Deno.env.get('PAYPAL_MODE') || 'sandbox'

const PAYPAL_API_BASE = PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

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
    throw new Error('Failed to get PayPal access token')
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Verify PayPal webhook signature (optional but recommended)
 */
async function verifyWebhookSignature(
  webhookId: string,
  headers: any,
  body: string,
  accessToken: string
): Promise<boolean> {
  if (!webhookId) {
    console.log('⚠️ Webhook ID not configured, skipping signature verification')
    return true // Skip verification if webhook ID not set
  }

  try {
    const verificationData = {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }

    const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verificationData),
    })

    if (!response.ok) {
      console.error('Webhook verification failed:', await response.text())
      return false
    }

    const result = await response.json()
    return result.verification_status === 'SUCCESS'
  } catch (error) {
    console.error('Error verifying webhook:', error)
    return false
  }
}

serve(async (req) => {
  try {
    const body = await req.text()
    const event = JSON.parse(body)

    console.log(`📨 PayPal Webhook received: ${event.event_type}`)

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Verify webhook signature (optional but recommended)
    const headers: any = {}
    req.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value
    })

    const isValid = await verifyWebhookSignature(PAYPAL_WEBHOOK_ID, headers, body, accessToken)
    
    if (!isValid && PAYPAL_WEBHOOK_ID) {
      console.error('❌ Invalid webhook signature')
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401 }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Log webhook event
    await supabaseAdmin.from('paypal_webhook_logs').insert({
      event_id: event.id,
      event_type: event.event_type,
      payload: event,
    })

    // Handle different event types
    switch (event.event_type) {
      // ===== SUBSCRIPTION EVENTS =====

      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const subscriptionId = event.resource?.id
        const customId = event.resource?.custom_id // user_id passed during creation

        if (!subscriptionId) {
          console.error('❌ No subscription ID in ACTIVATED event')
          break
        }

        console.log(`📬 Subscription activated: ${subscriptionId}, custom_id: ${customId}`)

        // Calculate period dates based on plan
        const startTime = event.resource?.start_time || new Date().toISOString()
        const billingInfo = event.resource?.billing_info
        const nextBillingTime = billingInfo?.next_billing_time

        // Try to find existing pending subscription record
        const { data: existingSub } = await supabaseAdmin
          .from('user_subscriptions')
          .select('id, user_id')
          .eq('paypal_subscription_id', subscriptionId)
          .maybeSingle()

        if (existingSub) {
          // Update existing record to active
          const { error: updateError } = await supabaseAdmin
            .from('user_subscriptions')
            .update({
              status: 'active',
              current_period_start: startTime,
              current_period_end: nextBillingTime || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSub.id)

          if (updateError) {
            console.error('❌ Error activating subscription:', updateError)
          } else {
            console.log(`✅ Subscription activated for user ${existingSub.user_id}`)
          }
        } else if (customId) {
          // No pending record found - create one (e.g., if insert failed during creation)
          // Look up plan from PayPal plan_id
          const paypalPlanId = event.resource?.plan_id
          const { data: plan } = await supabaseAdmin
            .from('subscription_plans')
            .select('id')
            .eq('paypal_plan_id', paypalPlanId)
            .maybeSingle()

          if (plan) {
            const { error: insertError } = await supabaseAdmin
              .from('user_subscriptions')
              .insert({
                user_id: customId,
                plan_id: plan.id,
                paypal_subscription_id: subscriptionId,
                status: 'active',
                current_period_start: startTime,
                current_period_end: nextBillingTime || null,
              })

            if (insertError) {
              console.error('❌ Error inserting active subscription:', insertError)
            } else {
              console.log(`✅ Subscription created and activated for user ${customId}`)
            }
          } else {
            console.error('❌ Could not find plan for PayPal plan_id:', paypalPlanId)
          }
        } else {
          console.error('❌ Cannot match subscription to user - no existing record or custom_id')
        }
        break
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        const subscriptionId = event.resource?.id

        if (!subscriptionId) {
          console.error('❌ No subscription ID in CANCELLED event')
          break
        }

        const { error: updateError } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('paypal_subscription_id', subscriptionId)

        if (updateError) {
          console.error('❌ Error cancelling subscription:', updateError)
        } else {
          console.log(`✅ Subscription cancelled: ${subscriptionId}`)
        }
        break
      }

      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        const subscriptionId = event.resource?.id

        if (!subscriptionId) {
          console.error('❌ No subscription ID in SUSPENDED event')
          break
        }

        const { error: updateError } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            status: 'suspended',
            updated_at: new Date().toISOString(),
          })
          .eq('paypal_subscription_id', subscriptionId)

        if (updateError) {
          console.error('❌ Error suspending subscription:', updateError)
        } else {
          console.log(`✅ Subscription suspended: ${subscriptionId}`)
        }
        break
      }

      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const subscriptionId = event.resource?.id

        if (!subscriptionId) {
          console.error('❌ No subscription ID in EXPIRED event')
          break
        }

        const { error: updateError } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString(),
          })
          .eq('paypal_subscription_id', subscriptionId)

        if (updateError) {
          console.error('❌ Error expiring subscription:', updateError)
        } else {
          console.log(`✅ Subscription expired: ${subscriptionId}`)
        }
        break
      }

      case 'PAYMENT.SALE.COMPLETED': {
        // Recurring payment completed - update the subscription period
        const billingAgreementId = event.resource?.billing_agreement_id

        if (!billingAgreementId) {
          console.log('ℹ️ PAYMENT.SALE.COMPLETED without billing_agreement_id - may be a one-time payment')
          break
        }

        // Get subscription details from PayPal to find next billing time
        try {
          const subResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${billingAgreementId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          })

          if (subResponse.ok) {
            const subDetails = await subResponse.json()
            const nextBillingTime = subDetails.billing_info?.next_billing_time

            const { error: updateError } = await supabaseAdmin
              .from('user_subscriptions')
              .update({
                status: 'active',
                current_period_end: nextBillingTime || null,
                updated_at: new Date().toISOString(),
              })
              .eq('paypal_subscription_id', billingAgreementId)

            if (updateError) {
              console.error('❌ Error updating subscription period:', updateError)
            } else {
              console.log(`✅ Subscription renewed: ${billingAgreementId}, next billing: ${nextBillingTime}`)
            }
          }
        } catch (subError) {
          console.error('❌ Error fetching subscription details for renewal:', subError)
        }
        break
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.event_type}`)
    }

    // Mark webhook as processed
    await supabaseAdmin
      .from('paypal_webhook_logs')
      .update({ processed: true })
      .eq('event_id', event.id)

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

