/**
 * Payment Service - Handle Stripe payments and purchase processing
 */

import { loadStripe } from '@stripe/stripe-js'
import supabase from './supabase'

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
)

/**
 * Create a payment intent for a question set or package
 */
export const createPaymentIntent = async ({ itemType, itemId, userId }) => {
  try {
    // Call your backend API to create payment intent
    // For now, we'll use Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: { itemType, itemId, userId }
    })

    if (error) throw error
    return { success: true, clientSecret: data.clientSecret, amount: data.amount }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Confirm payment with Stripe
 */
export const confirmPayment = async (clientSecret, paymentMethod) => {
  try {
    const stripe = await stripePromise
    
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod
    })

    if (error) {
      throw error
    }

    return { success: true, paymentIntent }
  } catch (error) {
    console.error('Payment confirmation error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Process checkout with Stripe Checkout
 */
export const processCheckout = async ({ itemType, itemId, userId, email }) => {
  try {
    const stripe = await stripePromise
    
    // Create checkout session via backend
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        itemType,
        itemId,
        userId,
        email,
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/dashboard`
      }
    })

    if (error) throw error

    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({
      sessionId: data.sessionId
    })

    if (result.error) {
      throw result.error
    }

    return { success: true }
  } catch (error) {
    console.error('Checkout error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get user's purchases
 */
export const getUserPurchases = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_purchases')
      .select(`
        *,
        question_sets:question_set_id (*),
        packages:package_id (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .in('payment_status', ['succeeded', 'processing'])
      .order('purchased_at', { ascending: false })

    if (error) throw error
    return { success: true, purchases: data || [] }
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return { success: false, purchases: [], error: error.message }
  }
}

/**
 * Check if user has purchased a specific question set
 */
export const hasUserPurchased = async (userId, questionSetId) => {
  try {
    const { data, error } = await supabase
      .from('user_purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('question_set_id', questionSetId)
      .eq('payment_status', 'succeeded')
      .eq('is_active', true)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') throw error
    
    return { success: true, purchased: !!data }
  } catch (error) {
    console.error('Error checking purchase:', error)
    return { success: false, purchased: false }
  }
}

/**
 * Get purchased question set IDs for a user
 */
export const getPurchasedQuestionSetIds = async (userId) => {
  try {
    // Get direct purchases
    const { data: directPurchases, error: directError } = await supabase
      .from('user_purchases')
      .select('question_set_id')
      .eq('user_id', userId)
      .eq('payment_status', 'succeeded')
      .eq('is_active', true)
      .not('question_set_id', 'is', null)

    if (directError) throw directError

    // Get package purchases and their included question sets
    const { data: packagePurchases, error: packageError } = await supabase
      .from('user_purchases')
      .select('package_id, packages(question_set_ids)')
      .eq('user_id', userId)
      .eq('payment_status', 'succeeded')
      .eq('is_active', true)
      .not('package_id', 'is', null)

    if (packageError) throw packageError

    // Combine all question set IDs
    const questionSetIds = new Set()
    
    directPurchases?.forEach(p => {
      if (p.question_set_id) questionSetIds.add(p.question_set_id)
    })
    
    packagePurchases?.forEach(p => {
      if (p.packages?.question_set_ids) {
        p.packages.question_set_ids.forEach(id => questionSetIds.add(id))
      }
    })

    return { success: true, questionSetIds: Array.from(questionSetIds) }
  } catch (error) {
    console.error('Error getting purchased question sets:', error)
    return { success: false, questionSetIds: [] }
  }
}

/**
 * Mock purchase for development (remove in production)
 */
export const mockPurchase = async (userId, itemType, itemId) => {
  try {
    const { data, error } = await supabase
      .from('user_purchases')
      .insert({
        user_id: userId,
        [itemType === 'package' ? 'package_id' : 'question_set_id']: itemId,
        amount_cents: 0,
        currency: 'usd',
        payment_status: 'succeeded',
        stripe_payment_intent_id: `mock_${Date.now()}`
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, purchase: data }
  } catch (error) {
    console.error('Mock purchase error:', error)
    return { success: false, error: error.message }
  }
}

export default {
  createPaymentIntent,
  confirmPayment,
  processCheckout,
  getUserPurchases,
  hasUserPurchased,
  getPurchasedQuestionSetIds,
  mockPurchase
}

