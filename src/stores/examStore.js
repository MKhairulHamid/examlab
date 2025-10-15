/**
 * Exam Store - Manage exams, question sets, and packages
 * Implements offline-first pattern with background sync
 */

import { create } from 'zustand'
import supabase from '../services/supabase'
import cacheService from '../services/cacheService'
import indexedDBService from '../services/indexedDBService'

export const useExamStore = create((set, get) => ({
  // State
  exams: [],
  currentExam: null,
  questionSets: [],
  currentQuestionSet: null,
  packages: [],
  loading: false,
  error: null,

  // Actions

  /**
   * Fetch all exam types (cache-first)
   */
  fetchExams: async (forceRefresh = false) => {
    try {
      set({ loading: true, error: null })
      
      // Try cache first
      if (!forceRefresh) {
        const cached = cacheService.get('exam_types')
        if (cached) {
          set({ exams: cached, loading: false })
          
          // Background refresh
          get().refreshExamsInBackground()
          return cached
        }
      }
      
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('exam_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      
      if (error) throw error
      
      set({ exams: data, loading: false })
      cacheService.set('exam_types', data, 24 * 60 * 60 * 1000) // 24 hours
      
      return data
    } catch (error) {
      console.error('Error fetching exams:', error)
      set({ error: error.message, loading: false })
      return []
    }
  },

  /**
   * Background refresh for exams
   */
  refreshExamsInBackground: async () => {
    try {
      const { data, error } = await supabase
        .from('exam_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      
      if (error) throw error
      
      set({ exams: data })
      cacheService.set('exam_types', data, 24 * 60 * 60 * 1000)
    } catch (error) {
      console.error('Background refresh error:', error)
    }
  },

  /**
   * Get exam by slug
   */
  getExamBySlug: async (slug) => {
    try {
      // Check in current exams first
      const { exams } = get()
      let exam = exams.find(e => e.slug === slug)
      
      if (exam) {
        set({ currentExam: exam })
        return exam
      }
      
      // Try cache
      const cached = cacheService.get(`exam_${slug}`)
      if (cached) {
        set({ currentExam: cached })
        return cached
      }
      
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('exam_types')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()
      
      if (error) throw error
      
      set({ currentExam: data })
      cacheService.set(`exam_${slug}`, data, 24 * 60 * 60 * 1000)
      
      return data
    } catch (error) {
      console.error('Error getting exam:', error)
      set({ error: error.message })
      return null
    }
  },

  /**
   * Fetch question sets for an exam (cache-first)
   */
  fetchQuestionSets: async (examTypeId, forceRefresh = false) => {
    try {
      set({ loading: true, error: null })
      
      // Try cache first
      if (!forceRefresh) {
        const cached = cacheService.get(`question_sets_${examTypeId}`)
        if (cached) {
          set({ questionSets: cached, loading: false })
          
          // Background refresh
          get().refreshQuestionSetsInBackground(examTypeId)
          return cached
        }
      }
      
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('question_sets')
        .select('*')
        .eq('exam_type_id', examTypeId)
        .eq('is_active', true)
        .order('set_number', { ascending: true })
      
      if (error) throw error
      
      set({ questionSets: data, loading: false })
      cacheService.set(`question_sets_${examTypeId}`, data, 24 * 60 * 60 * 1000)
      
      return data
    } catch (error) {
      console.error('Error fetching question sets:', error)
      set({ error: error.message, loading: false })
      return []
    }
  },

  /**
   * Background refresh for question sets
   */
  refreshQuestionSetsInBackground: async (examTypeId) => {
    try {
      const { data, error } = await supabase
        .from('question_sets')
        .select('*')
        .eq('exam_type_id', examTypeId)
        .eq('is_active', true)
        .order('set_number', { ascending: true })
      
      if (error) throw error
      
      set({ questionSets: data })
      cacheService.set(`question_sets_${examTypeId}`, data, 24 * 60 * 60 * 1000)
    } catch (error) {
      console.error('Background refresh error:', error)
    }
  },

  /**
   * Load question set with full questions (IndexedDB first, then Supabase)
   */
  loadQuestionSet: async (questionSetId) => {
    try {
      set({ loading: true, error: null })
      
      // Try IndexedDB first
      const cached = await indexedDBService.getQuestionSet(questionSetId)
      if (cached) {
        console.log('📦 Question set loaded from IndexedDB')
        set({ currentQuestionSet: cached, loading: false })
        
        // Background: check for version update
        get().checkQuestionSetVersion(questionSetId, cached.version_number)
        
        return cached
      }
      
      // Fetch from Supabase
      console.log('🔄 Fetching question set from Supabase...')
      const { data, error } = await supabase
        .from('question_sets')
        .select('*')
        .eq('id', questionSetId)
        .single()
      
      if (error) throw error
      
      // Save to IndexedDB for offline use
      await indexedDBService.setQuestionSet(data)
      
      set({ currentQuestionSet: data, loading: false })
      
      return data
    } catch (error) {
      console.error('Error loading question set:', error)
      set({ error: error.message, loading: false })
      return null
    }
  },

  /**
   * Check if question set has been updated (version check)
   */
  checkQuestionSetVersion: async (questionSetId, localVersion) => {
    try {
      const { data, error } = await supabase
        .from('question_sets')
        .select('version_number, last_content_update')
        .eq('id', questionSetId)
        .single()
      
      if (error) throw error
      
      if (data.version_number > localVersion) {
        console.log('🆕 New version available - updating...')
        
        // Fetch full question set
        const { data: fullData, error: fetchError } = await supabase
          .from('question_sets')
          .select('*')
          .eq('id', questionSetId)
          .single()
        
        if (fetchError) throw fetchError
        
        // Update IndexedDB
        await indexedDBService.setQuestionSet(fullData)
        set({ currentQuestionSet: fullData })
        
        console.log('✅ Question set updated to version', data.version_number)
      }
    } catch (error) {
      console.error('Version check error:', error)
    }
  },

  /**
   * Fetch packages for an exam
   */
  fetchPackages: async (examTypeId) => {
    try {
      const cached = cacheService.get(`packages_${examTypeId}`)
      if (cached) {
        set({ packages: cached })
        return cached
      }
      
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('exam_type_id', examTypeId)
        .eq('is_active', true)
      
      if (error) throw error
      
      set({ packages: data || [] })
      cacheService.set(`packages_${examTypeId}`, data || [], 24 * 60 * 60 * 1000)
      
      return data || []
    } catch (error) {
      console.error('Error fetching packages:', error)
      return []
    }
  },

  /**
   * Clear current exam/question set
   */
  clearCurrent: () => {
    set({
      currentExam: null,
      currentQuestionSet: null
    })
  }
}))

export default useExamStore

