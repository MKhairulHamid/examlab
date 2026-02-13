/**
 * Purchase Store - Manage subscriptions, purchases, and payment state
 */

import { create } from 'zustand'
import paymentService from '../services/paymentService'
import cacheService from '../services/cacheService'

const usePurchaseStore = create((set, get) => ({
  // State
  purchases: [],
  purchasedQuestionSetIds: [],
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
      // Try cache first
      const cached = cacheService.get(`subscription_${userId}`)
      if (cached) {
        set({ 
          subscription: cached.subscription,
          isSubscribed: cached.subscription?.status === 'active'
        })
        // Background refresh
        get().refreshSubscriptionInBackground(userId)
        return
      }

      const result = await paymentService.getUserSubscription(userId)
      if (result.success) {
        set({ 
          subscription: result.subscription,
          isSubscribed: result.subscription?.status === 'active'
        })
        cacheService.set(`subscription_${userId}`, {
          subscription: result.subscription
        }, 5 * 60 * 1000)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  },

  /**
   * Background refresh subscription
   */
  refreshSubscriptionInBackground: async (userId) => {
    try {
      const result = await paymentService.getUserSubscription(userId)
      if (result.success) {
        set({ 
          subscription: result.subscription,
          isSubscribed: result.subscription?.status === 'active'
        })
        cacheService.set(`subscription_${userId}`, {
          subscription: result.subscription
        }, 5 * 60 * 1000)
      }
    } catch (error) {
      console.error('Background subscription refresh error:', error)
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
        // Mock subscription in development
        const result = await paymentService.mockSubscription(userId, planSlug)
        if (result.success) {
          set({ 
            subscription: result.subscription,
            isSubscribed: true,
            checkoutLoading: false 
          })
          return { success: true, mock: true }
        } else {
          throw new Error(result.error)
        }
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
   * Check if user has access (active subscription OR legacy purchase)
   */
  hasAccess: (questionSetId) => {
    const { isSubscribed, purchasedQuestionSetIds } = get()
    return isSubscribed || purchasedQuestionSetIds.includes(questionSetId)
  },

  // ===== ENROLLMENT ACTIONS =====

  /**
   * Fetch user's enrolled exam IDs
   */
  fetchEnrollments: async (userId) => {
    try {
      const cached = cacheService.get(`enrollments_${userId}`)
      if (cached) {
        set({ enrolledExamIds: cached.examTypeIds })
        // Background refresh
        get().refreshEnrollmentsInBackground(userId)
        return
      }

      const result = await paymentService.getUserEnrollments(userId)
      if (result.success) {
        set({ enrolledExamIds: result.examTypeIds })
        cacheService.set(`enrollments_${userId}`, {
          examTypeIds: result.examTypeIds
        }, 5 * 60 * 1000)
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    }
  },

  /**
   * Background refresh enrollments
   */
  refreshEnrollmentsInBackground: async (userId) => {
    try {
      const result = await paymentService.getUserEnrollments(userId)
      if (result.success) {
        set({ enrolledExamIds: result.examTypeIds })
        cacheService.set(`enrollments_${userId}`, {
          examTypeIds: result.examTypeIds
        }, 5 * 60 * 1000)
      }
    } catch (error) {
      console.error('Background enrollment refresh error:', error)
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
        // Update local state immediately
        set(state => ({
          enrolledExamIds: state.enrolledExamIds.includes(examTypeId)
            ? state.enrolledExamIds
            : [...state.enrolledExamIds, examTypeId]
        }))
        // Invalidate cache
        cacheService.remove(`enrollments_${userId}`)
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

  // ===== LEGACY PURCHASE ACTIONS =====
  
  /**
   * Fetch user's purchases (legacy)
   */
  fetchPurchases: async (userId) => {
    try {
      set({ loading: true, error: null })
      
      // Try cache first
      const cached = cacheService.get(`purchases_${userId}`)
      if (cached) {
        set({ 
          purchases: cached.purchases, 
          purchasedQuestionSetIds: cached.questionSetIds,
          loading: false 
        })
        
        // Background refresh
        get().refreshPurchasesInBackground(userId)
        return
      }
      
      // Fetch purchases
      const purchasesResult = await paymentService.getUserPurchases(userId)
      const questionSetsResult = await paymentService.getPurchasedQuestionSetIds(userId)
      
      if (purchasesResult.success && questionSetsResult.success) {
        set({ 
          purchases: purchasesResult.purchases,
          purchasedQuestionSetIds: questionSetsResult.questionSetIds,
          loading: false 
        })
        
        // Cache for 5 minutes
        cacheService.set(`purchases_${userId}`, {
          purchases: purchasesResult.purchases,
          questionSetIds: questionSetsResult.questionSetIds
        }, 5 * 60 * 1000)
      } else {
        throw new Error(purchasesResult.error || questionSetsResult.error)
      }
    } catch (error) {
      console.error('Error fetching purchases:', error)
      set({ error: error.message, loading: false })
    }
  },
  
  /**
   * Background refresh
   */
  refreshPurchasesInBackground: async (userId) => {
    try {
      const purchasesResult = await paymentService.getUserPurchases(userId)
      const questionSetsResult = await paymentService.getPurchasedQuestionSetIds(userId)
      
      if (purchasesResult.success && questionSetsResult.success) {
        set({ 
          purchases: purchasesResult.purchases,
          purchasedQuestionSetIds: questionSetsResult.questionSetIds
        })
        
        cacheService.set(`purchases_${userId}`, {
          purchases: purchasesResult.purchases,
          questionSetIds: questionSetsResult.questionSetIds
        }, 5 * 60 * 1000)
      }
    } catch (error) {
      console.error('Background refresh error:', error)
    }
  },
  
  /**
   * Check if user has purchased a question set (legacy)
   */
  hasPurchased: (questionSetId) => {
    const { purchasedQuestionSetIds } = get()
    return purchasedQuestionSetIds.includes(questionSetId)
  },
  
  /**
   * Process checkout (legacy)
   */
  processCheckout: async ({ itemType, itemId, userId, email }) => {
    try {
      set({ checkoutLoading: true, error: null })
      
      const result = await paymentService.processCheckout({
        itemType,
        itemId,
        userId,
        email
      })
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      set({ checkoutLoading: false })
      return { success: true }
    } catch (error) {
      console.error('Checkout error:', error)
      set({ error: error.message, checkoutLoading: false })
      return { success: false, error: error.message }
    }
  },
  
  /**
   * Mock purchase for development (legacy)
   */
  mockPurchase: async (userId, itemType, itemId) => {
    try {
      set({ loading: true, error: null })
      
      const result = await paymentService.mockPurchase(userId, itemType, itemId)
      
      if (result.success) {
        // Refresh purchases
        await get().fetchPurchases(userId)
        set({ loading: false })
        return { success: true }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Mock purchase error:', error)
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },
  
  /**
   * Clear all caches
   */
  clearCache: (userId) => {
    cacheService.remove(`purchases_${userId}`)
    cacheService.remove(`subscription_${userId}`)
    cacheService.remove(`enrollments_${userId}`)
    set({ purchases: [], purchasedQuestionSetIds: [], subscription: null, isSubscribed: false, enrolledExamIds: [] })
  }
}))

export default usePurchaseStore

