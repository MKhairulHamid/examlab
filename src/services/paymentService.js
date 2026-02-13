/**
 * Payment Service - Handle PayPal subscriptions, payments, and purchase processing
 */

import supabase from './supabase'

// PayPal configuration
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || ''

// ===== SUBSCRIPTION FUNCTIONS =====

/**
 * Get available subscription plans
 */
export const getSubscriptionPlans = async () => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return { success: true, plans: data || [] }
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return { success: false, plans: [], error: error.message }
  }
}

/**
 * Create a PayPal subscription for the user
 */
export const createSubscription = async (planSlug, userId, email) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-paypal-subscription', {
      body: {
        planSlug,
        returnUrl: `${window.location.origin}/payment-success?type=subscription`,
        cancelUrl: `${window.location.origin}/dashboard`,
      }
    })

    if (error) {
      console.error('Edge Function error:', error)
      throw error
    }

    if (data?.error) {
      throw new Error(data.error)
    }

    if (!data?.approvalUrl) {
      throw new Error('No approval URL received from PayPal')
    }

    // Redirect to PayPal for subscription approval
    window.location.href = data.approvalUrl

    return { success: true }
  } catch (error) {
    console.error('Subscription creation error:', error)
    return { success: false, error: error.message || 'Unknown error occurred' }
  }
}

/**
 * Get user's active subscription
 */
export const getUserSubscription = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans:plan_id (*)
      `)
      .eq('user_id', userId)
      .in('status', ['active', 'pending'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') throw error
    return { success: true, subscription: data || null }
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return { success: false, subscription: null, error: error.message }
  }
}

/**
 * Check if user has an active subscription
 */
export const hasActiveSubscription = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle()

    if (error && error.code !== 'PGRST116') throw error
    return { success: true, active: !!data }
  } catch (error) {
    console.error('Error checking subscription:', error)
    return { success: false, active: false }
  }
}

/**
 * Mock subscription for development
 */
export const mockSubscription = async (userId, planSlug) => {
  try {
    // Get the plan
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('slug', planSlug)
      .single()

    if (planError || !plan) throw new Error('Plan not found')

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: plan.id,
        paypal_subscription_id: `mock_sub_${Date.now()}`,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, subscription: data }
  } catch (error) {
    console.error('Mock subscription error:', error)
    return { success: false, error: error.message }
  }
}

// ===== ENROLLMENT FUNCTIONS =====

/**
 * Enroll user in an exam (free action, requires active subscription)
 */
export const enrollInExam = async (userId, examTypeId) => {
  try {
    const { data, error } = await supabase
      .from('user_enrollments')
      .insert({
        user_id: userId,
        exam_type_id: examTypeId,
      })
      .select()
      .single()

    if (error) {
      // Unique constraint violation means already enrolled
      if (error.code === '23505') {
        return { success: true, alreadyEnrolled: true }
      }
      throw error
    }
    return { success: true, enrollment: data }
  } catch (error) {
    console.error('Error enrolling in exam:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all exam type IDs the user is enrolled in
 */
export const getUserEnrollments = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_enrollments')
      .select('exam_type_id')
      .eq('user_id', userId)

    if (error) throw error
    const examTypeIds = (data || []).map(e => e.exam_type_id)
    return { success: true, examTypeIds }
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return { success: false, examTypeIds: [], error: error.message }
  }
}

/**
 * Check if user is enrolled in a specific exam
 */
export const isEnrolledInExam = async (userId, examTypeId) => {
  try {
    const { data, error } = await supabase
      .from('user_enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('exam_type_id', examTypeId)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') throw error
    return { success: true, enrolled: !!data }
  } catch (error) {
    console.error('Error checking enrollment:', error)
    return { success: false, enrolled: false }
  }
}

// ===== LEGACY PURCHASE FUNCTIONS (backward compatibility) =====

/**
 * Process checkout with PayPal (legacy - one-time purchases)
 */
export const processCheckout = async ({ itemType, itemId, userId, email }) => {
  try {
    // Create PayPal order via backend
    const { data, error } = await supabase.functions.invoke('create-paypal-order', {
      body: {
        itemType,
        itemId,
        userId,
        email,
        returnUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/dashboard`
      }
    })

    if (error) {
      console.error('Edge Function error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw error
    }

    if (data?.error) {
      throw new Error(data.error)
    }

    if (!data?.approvalUrl) {
      throw new Error('No approval URL received from PayPal')
    }

    // Redirect to PayPal for payment
    window.location.href = data.approvalUrl

    return { success: true }
  } catch (error) {
    console.error('Checkout error:', error)
    console.error('Full error object:', JSON.stringify(error, null, 2))
    return { success: false, error: error.message || 'Unknown error occurred' }
  }
}

/**
 * Get user's purchases (legacy)
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
 * Check if user has purchased a specific question set (legacy)
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
 * Get purchased question set IDs for a user (legacy)
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
        payment_provider_id: `mock_paypal_${Date.now()}`,
        payment_provider: 'paypal'
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
  // Subscription
  getSubscriptionPlans,
  createSubscription,
  getUserSubscription,
  hasActiveSubscription,
  mockSubscription,
  // Enrollment
  enrollInExam,
  getUserEnrollments,
  isEnrolledInExam,
  // Legacy purchases
  processCheckout,
  getUserPurchases,
  hasUserPurchased,
  getPurchasedQuestionSetIds,
  mockPurchase
}

