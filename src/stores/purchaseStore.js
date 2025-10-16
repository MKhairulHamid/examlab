/**
 * Purchase Store - Manage purchases and payment state
 */

import { create } from 'zustand'
import paymentService from '../services/paymentService'
import cacheService from '../services/cacheService'

const usePurchaseStore = create((set, get) => ({
  // State
  purchases: [],
  purchasedQuestionSetIds: [],
  loading: false,
  error: null,
  checkoutLoading: false,
  
  // Actions
  
  /**
   * Fetch user's purchases
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
   * Check if user has purchased a question set
   */
  hasPurchased: (questionSetId) => {
    const { purchasedQuestionSetIds } = get()
    return purchasedQuestionSetIds.includes(questionSetId)
  },
  
  /**
   * Process checkout
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
   * Mock purchase for development
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
   * Clear purchases cache
   */
  clearCache: (userId) => {
    cacheService.remove(`purchases_${userId}`)
    set({ purchases: [], purchasedQuestionSetIds: [] })
  }
}))

export default usePurchaseStore

