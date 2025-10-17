// Supabase Edge Function: create-paypal-order
// Creates a PayPal order for purchasing question sets or packages

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID') || ''
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET') || ''
const PAYPAL_MODE = Deno.env.get('PAYPAL_MODE') || 'sandbox' // 'sandbox' or 'live'

const PAYPAL_API_BASE = PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

/**
 * Create PayPal order
 */
async function createPayPalOrder(accessToken: string, orderData: any): Promise<any> {
  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to create PayPal order: ${errorText}`)
  }

  return await response.json()
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
    const { itemType, itemId, email, returnUrl, cancelUrl } = await req.json()

    if (!itemType || !itemId || !email) {
      throw new Error('Missing required parameters')
    }

    // Fetch item details from database
    let itemData: any
    let purchaseUnits: any[] = []

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
      
      // Convert cents to USD (PayPal requires decimal format)
      const amount = (data.price_cents / 100).toFixed(2)
      
      purchaseUnits = [
        {
          reference_id: `question_set_${itemId}`,
          description: `${data.exam_types.name} - ${data.name}`,
          amount: {
            currency_code: (data.currency || 'USD').toUpperCase(),
            value: amount,
            breakdown: {
              item_total: {
                currency_code: (data.currency || 'USD').toUpperCase(),
                value: amount,
              },
            },
          },
          items: [
            {
              name: `${data.exam_types.name} - ${data.name}`,
              description: `${data.question_count} practice questions`,
              unit_amount: {
                currency_code: (data.currency || 'USD').toUpperCase(),
                value: amount,
              },
              quantity: '1',
            },
          ],
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
      
      // Convert cents to USD
      const amount = (data.price_cents / 100).toFixed(2)
      
      purchaseUnits = [
        {
          reference_id: `package_${itemId}`,
          description: `${data.exam_types.name} - ${data.name}`,
          amount: {
            currency_code: (data.currency || 'USD').toUpperCase(),
            value: amount,
            breakdown: {
              item_total: {
                currency_code: (data.currency || 'USD').toUpperCase(),
                value: amount,
              },
            },
          },
          items: [
            {
              name: `${data.exam_types.name} - ${data.name}`,
              description: data.description || 'Complete package',
              unit_amount: {
                currency_code: (data.currency || 'USD').toUpperCase(),
                value: amount,
              },
              quantity: '1',
            },
          ],
        },
      ]
    } else {
      throw new Error('Invalid item type')
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Create PayPal order
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: purchaseUnits,
      application_context: {
        brand_name: 'Cloud Exam Lab',
        landing_page: 'NO_PREFERENCE',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: returnUrl || `${req.headers.get('origin')}/payment-success`,
        cancel_url: cancelUrl || `${req.headers.get('origin')}/dashboard`,
      },
      payer: {
        email_address: email,
      },
      metadata: {
        userId: user.id,
        itemType,
        itemId,
      },
    }

    const order = await createPayPalOrder(accessToken, orderPayload)

    // Find approval URL
    const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href

    if (!approvalUrl) {
      throw new Error('No approval URL in PayPal response')
    }

    console.log(`✅ PayPal order created: ${order.id} for user ${user.id}`)

    return new Response(
      JSON.stringify({ 
        orderId: order.id,
        approvalUrl,
        status: order.status 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating PayPal order:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

