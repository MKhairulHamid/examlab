/**
 * Purchase Store - Manage subscriptions and enrollment state
 */

import { create } from 'zustand'
import paymentService from '../services/paymentService'
import supabase from '../services/supabase'

const usePurchaseStore = create((set, get) => ({
  // State
  subscription: null,
  subscriptionPlans: [],
  isSubscribed: false,
  enrolledExamIds: [],
  // exam_type_ids the user has active (non-expired) promo access to
  promoAccessExamIds: [],
  // true if the user has an active all-programs promo redemption (unlocks every exam)
  promoFullAccess: false,
  loading: false,
  error: null,
  checkoutLoading: false,

  // ===== SUBSCRIPTION ACTIONS =====

  /**
   * Fetch subscription plans
   */
  fetchSubscriptionPlans: async () => {
    try {
      const result = await paymentService.getSubscriptionPlans()
      if (result.success) {
        set({ subscriptionPlans: result.plans })
      }
      return result
    } catch (error) {
      console.error('Error fetching plans:', error)
      return { success: false, plans: [] }
    }
  },

  /**
   * Fetch user's active subscription
   */
  fetchSubscription: async (userId) => {
    try {
      const result = await paymentService.getUserSubscription(userId)
      if (result.success) {
        set({
          subscription: result.subscription,
          // A cancelled subscription still grants access until its paid-through
          // period ends — see paymentService.subscriptionGrantsAccess.
          isSubscribed: paymentService.subscriptionGrantsAccess(result.subscription)
        })
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  },

  /**
   * Cancel the user's active subscription. Access is retained until the end of
   * the already-paid period, so isSubscribed stays true until then. Returns the
   * service result so the caller can handle the manual-grant (comp) case.
   */
  cancelSubscription: async (reason) => {
    set({ loading: true, error: null })
    const result = await paymentService.cancelSubscription(reason)
    if (result.success) {
      const { subscription } = get()
      const updated = subscription
        ? { ...subscription, status: 'cancelled', cancelled_at: new Date().toISOString() }
        : subscription
      set({
        subscription: updated,
        isSubscribed: paymentService.subscriptionGrantsAccess(updated),
        loading: false,
      })
    } else {
      set({ loading: false, error: result.manualGrant ? null : (result.error || null) })
    }
    return result
  },

  /**
   * Create subscription (redirect to PayPal)
   */
  createSubscription: async (planSlug, userId, email) => {
    try {
      set({ checkoutLoading: true, error: null })

      const isDevelopment = import.meta.env.DEV

      if (isDevelopment) {
        const result = await paymentService.mockSubscription(userId, planSlug)
        if (result.success) {
          set({
            subscription: result.subscription,
            isSubscribed: true,
            checkoutLoading: false
          })
          return { success: true, mock: true }
        }
        throw new Error(result.error)
      }

      const result = await paymentService.createSubscription(planSlug, userId, email)

      if (!result.success) {
        throw new Error(result.error)
      }

      set({ checkoutLoading: false })
      return { success: true }
    } catch (error) {
      console.error('Subscription error:', error)
      set({ error: error.message, checkoutLoading: false })
      return { success: false, error: error.message }
    }
  },

  /**
   * Fetch the exam_type_ids this user has active (non-expired) promo access to.
   * Backed by the promo_redemptions table (RLS: users read only their own rows).
   */
  fetchPromoAccess: async (userId) => {
    if (!userId) return
    try {
      const { data, error } = await supabase
        .from('promo_redemptions')
        .select('exam_type_id, all_programs')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())

      if (error) {
        console.error('Error fetching promo access:', error)
        return
      }
      const rows = data || []
      const ids = [...new Set(rows.filter((r) => r.exam_type_id).map((r) => r.exam_type_id))]
      const fullAccess = rows.some((r) => r.all_programs)
      set({ promoAccessExamIds: ids, promoFullAccess: fullAccess })
    } catch (error) {
      console.error('Error fetching promo access:', error)
    }
  },

  /**
   * Check if user has access (subscription grants full access)
   */
  hasAccess: (questionSetId) => {
    return get().isSubscribed
  },

  /**
   * Exam-aware access check: a paid subscription unlocks everything, while a
   * redeemed promo code unlocks only its specific exam for the duration.
   */
  hasExamAccess: (examTypeId) => {
    const { isSubscribed, promoFullAccess, promoAccessExamIds } = get()
    if (isSubscribed || promoFullAccess) return true
    return !!examTypeId && promoAccessExamIds.includes(examTypeId)
  },

  // ===== ENROLLMENT ACTIONS =====

  /**
   * Fetch user's enrolled exam IDs
   */
  fetchEnrollments: async (userId) => {
    try {
      const result = await paymentService.getUserEnrollments(userId)
      if (result.success) {
        set({ enrolledExamIds: result.examTypeIds })
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    }
  },

  /**
   * Enroll in an exam (requires active subscription)
   */
  enrollInExam: async (examTypeId, userId) => {
    const { isSubscribed } = get()
    if (!isSubscribed) {
      return { success: false, error: 'Subscription required', needsSubscription: true }
    }

    try {
      const result = await paymentService.enrollInExam(userId, examTypeId)
      if (result.success) {
        set(state => ({
          enrolledExamIds: state.enrolledExamIds.includes(examTypeId)
            ? state.enrolledExamIds
            : [...state.enrolledExamIds, examTypeId]
        }))
      }
      return result
    } catch (error) {
      console.error('Enrollment error:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Check if user is enrolled in a specific exam
   */
  isEnrolled: (examTypeId) => {
    const { enrolledExamIds } = get()
    return enrolledExamIds.includes(examTypeId)
  },

  /**
   * Clear subscription and enrollment state
   */
  clearCache: () => {
    set({ subscription: null, isSubscribed: false, enrolledExamIds: [], promoAccessExamIds: [] })
  }
}))

export default usePurchaseStore
