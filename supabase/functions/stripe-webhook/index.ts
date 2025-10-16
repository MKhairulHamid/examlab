// Supabase Edge Function: stripe-webhook
// Handles Stripe webhook events for payment processing

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!webhookSecret) {
      throw new Error('Webhook secret not configured')
    }

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )

    console.log(`Webhook event received: ${event.type}`)

    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Log webhook event
    await supabaseAdmin.from('stripe_webhook_logs').insert({
      event_id: event.id,
      event_type: event.type,
      payload: event,
    })

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const userId = session.metadata?.userId
        const itemType = session.metadata?.itemType
        const itemId = session.metadata?.itemId

        if (!userId || !itemType || !itemId) {
          console.error('Missing metadata in session:', session.id)
          break
        }

        // Create purchase record
        const purchaseData: any = {
          user_id: userId,
          stripe_payment_intent_id: session.payment_intent,
          stripe_customer_id: session.customer,
          amount_cents: session.amount_total,
          currency: session.currency,
          payment_status: 'succeeded',
          purchased_at: new Date().toISOString(),
        }

        // Set either question_set_id or package_id
        if (itemType === 'question_set') {
          purchaseData.question_set_id = itemId
        } else if (itemType === 'package') {
          purchaseData.package_id = itemId
        }

        const { error: insertError } = await supabaseAdmin
          .from('user_purchases')
          .insert(purchaseData)

        if (insertError) {
          console.error('Error creating purchase record:', insertError)
          throw insertError
        }

        console.log(`Purchase created for user ${userId}`)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Update purchase status
        const { error: updateError } = await supabaseAdmin
          .from('user_purchases')
          .update({ payment_status: 'succeeded' })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (updateError) {
          console.error('Error updating payment status:', updateError)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Update purchase status
        const { error: updateError } = await supabaseAdmin
          .from('user_purchases')
          .update({ payment_status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (updateError) {
          console.error('Error updating payment status:', updateError)
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge

        // Deactivate purchase on refund
        const { error: updateError } = await supabaseAdmin
          .from('user_purchases')
          .update({
            payment_status: 'refunded',
            is_active: false,
          })
          .eq('stripe_payment_intent_id', charge.payment_intent)

        if (updateError) {
          console.error('Error updating refund status:', updateError)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Mark webhook as processed
    await supabaseAdmin
      .from('stripe_webhook_logs')
      .update({ processed: true })
      .eq('event_id', event.id)

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

