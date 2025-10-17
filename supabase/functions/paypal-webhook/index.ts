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

/**
 * Get order details from PayPal
 */
async function getOrderDetails(orderId: string, accessToken: string): Promise<any> {
  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get order details')
  }

  return await response.json()
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
      case 'CHECKOUT.ORDER.APPROVED':
      case 'PAYMENT.CAPTURE.COMPLETED': {
        // Get order details
        const orderId = event.resource?.id || event.resource?.supplementary_data?.related_ids?.order_id
        
        if (!orderId) {
          console.error('❌ No order ID found in webhook event')
          break
        }

        const orderDetails = await getOrderDetails(orderId, accessToken)

        // Extract custom metadata from purchase units
        const purchaseUnit = orderDetails.purchase_units?.[0]
        const referenceId = purchaseUnit?.reference_id || ''
        
        // Parse reference_id to get itemType and itemId
        // Format: "question_set_<uuid>" or "package_<uuid>"
        const [itemType, itemId] = referenceId.split('_', 2)
        
        if (!itemType || !itemId) {
          console.error('❌ Invalid reference_id format:', referenceId)
          break
        }

        // Get payer info
        const payerEmail = orderDetails.payer?.email_address
        const payerId = orderDetails.payer?.payer_id

        // Get payment amount
        const amountValue = purchaseUnit?.amount?.value
        const currency = purchaseUnit?.amount?.currency_code

        // Find user by email (since we can't pass custom metadata directly in PayPal Orders API v2)
        const { data: userData, error: userError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', payerEmail)
          .maybeSingle()

        if (userError || !userData) {
          console.error('❌ User not found for email:', payerEmail)
          // Try to find by looking at recent auth users
          const { data: authUser } = await supabaseAdmin.auth.admin.listUsers()
          const matchedUser = authUser?.users?.find(u => u.email === payerEmail)
          
          if (!matchedUser) {
            console.error('❌ Could not find user for purchase')
            break
          }
          
          userData.id = matchedUser.id
        }

        const userId = userData.id

        // Create purchase record
        const purchaseData: any = {
          user_id: userId,
          payment_provider_id: orderId,
          payment_customer_id: payerId,
          amount_cents: Math.round(parseFloat(amountValue) * 100),
          currency: currency?.toLowerCase() || 'usd',
          payment_status: 'succeeded',
          payment_provider: 'paypal',
          purchased_at: new Date().toISOString(),
        }

        // Set either question_set_id or package_id
        if (itemType === 'question' && referenceId.startsWith('question_set_')) {
          purchaseData.question_set_id = itemId
        } else if (itemType === 'package') {
          purchaseData.package_id = itemId
        } else {
          console.error('❌ Unknown item type:', itemType)
          break
        }

        // Check if purchase already exists (prevent duplicates)
        const { data: existingPurchase } = await supabaseAdmin
          .from('user_purchases')
          .select('id')
          .eq('payment_provider_id', orderId)
          .maybeSingle()

        if (existingPurchase) {
          console.log('ℹ️ Purchase already recorded for order:', orderId)
          break
        }

        const { error: insertError } = await supabaseAdmin
          .from('user_purchases')
          .insert(purchaseData)

        if (insertError) {
          console.error('❌ Error creating purchase record:', insertError)
          throw insertError
        }

        console.log(`✅ Purchase created for user ${userId}, order ${orderId}`)
        break
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        const orderId = event.resource?.supplementary_data?.related_ids?.order_id
        
        if (!orderId) {
          console.error('❌ No order ID found in refund event')
          break
        }

        // Deactivate purchase on refund
        const { error: updateError } = await supabaseAdmin
          .from('user_purchases')
          .update({
            payment_status: 'refunded',
            is_active: false,
          })
          .eq('payment_provider_id', orderId)

        if (updateError) {
          console.error('❌ Error updating refund status:', updateError)
        } else {
          console.log(`✅ Refund processed for order ${orderId}`)
        }
        break
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'CHECKOUT.ORDER.VOIDED': {
        const orderId = event.resource?.id
        
        if (orderId) {
          await supabaseAdmin
            .from('user_purchases')
            .update({ payment_status: 'failed' })
            .eq('payment_provider_id', orderId)
          
          console.log(`⚠️ Payment failed/voided for order ${orderId}`)
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

