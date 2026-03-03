/**
 * Purchase Store - Manage subscriptions and enrollment state
 */

import { create } from 'zustand'
import paymentService from '../services/paymentService'

const usePurchaseStore = create((set, get) => ({
  // State
  subscription: null,
  subscriptionPlans: [],
  isSubscribed: false,
  enrolledExamIds: [],
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
          isSubscribed: result.subscription?.status === 'active'
        })
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
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
   * Check if user has access (subscription grants full access)
   */
  hasAccess: (questionSetId) => {
    return get().isSubscribed
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
    set({ subscription: null, isSubscribed: false, enrolledExamIds: [] })
  }
}))

export default usePurchaseStore
