/**
 * Payment Service - Handle PayPal subscriptions and enrollment
 */

import supabase from './supabase'

// ===== SUBSCRIPTION FUNCTIONS =====

/**
 * A subscription grants access while it is active, OR while it has been
 * cancelled but the already-paid-through period has not yet elapsed. This is
 * the single source of truth for "does this subscription unlock content?".
 */
export const subscriptionGrantsAccess = (subscription) => {
  if (!subscription) return false
  if (subscription.status === 'active') return true
  if (subscription.status === 'cancelled' && subscription.current_period_end) {
    return new Date(subscription.current_period_end).getTime() > Date.now()
  }
  return false
}

/**
 * True for comp / manually-granted or dev-mock subscriptions that are not
 * backed by a real PayPal subscription (and therefore can't be self-cancelled).
 */
export const isManualGrantSubscription = (subscription) => {
  const id = subscription?.paypal_subscription_id
  return !id || id.startsWith('manual_grant_') || id.startsWith('mock_sub_')
}

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
 * Get the user's most recent subscription record (any status).
 *
 * We intentionally return the latest row regardless of status — a cancelled
 * subscription whose period hasn't elapsed still grants access (see
 * subscriptionGrantsAccess), and the Account page needs to render cancelled /
 * expired states too. Access is derived from the row, not from this filter.
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
 * Cancel the calling user's PayPal subscription via the edge function.
 * Returns { success, manualGrant, accessUntil, error }.
 *  - manualGrant=true means there was no real PayPal subscription to cancel
 *    (comp account) and the caller should be directed to support instead.
 */
export const cancelSubscription = async (reason) => {
  try {
    const { data, error } = await supabase.functions.invoke('cancel-paypal-subscription', {
      body: { reason: reason || 'Cancelled by customer' },
    })

    if (error) {
      console.error('Cancel edge function error:', error)
      throw error
    }

    if (data?.manualGrant) {
      return { success: false, manualGrant: true }
    }

    if (data?.error) {
      throw new Error(data.error)
    }

    return { success: true, accessUntil: data?.access_until || null }
  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return { success: false, error: error.message || 'Unknown error occurred' }
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

export default {
  // Subscription
  getSubscriptionPlans,
  createSubscription,
  getUserSubscription,
  hasActiveSubscription,
  mockSubscription,
  cancelSubscription,
  subscriptionGrantsAccess,
  isManualGrantSubscription,
  // Enrollment
  enrollInExam,
  getUserEnrollments,
  isEnrolledInExam
}

