/**
 * Exam Store - Manage exams and question sets
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
   * Only fetches metadata, not the full questions_json
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
      
      // Fetch from Supabase - ONLY metadata columns (no questions_json)
      const { data, error } = await supabase
        .from('question_sets')
        .select('id, exam_type_id, name, description, set_number, question_count, price_cents, is_free_sample, is_active, created_at, updated_at, version_number')
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
   * Only fetches metadata, not the full questions_json
   */
  refreshQuestionSetsInBackground: async (examTypeId) => {
    try {
      const { data, error } = await supabase
        .from('question_sets')
        .select('id, exam_type_id, name, description, set_number, question_count, price_cents, is_free_sample, is_active, created_at, updated_at, version_number')
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
   * Questions are fetched from question_items table (normalized rows).
   */
  loadQuestionSet: async (questionSetId, forceRefresh = false) => {
    try {
      set({ loading: true, error: null })
      
      // Try IndexedDB first (skip when forcing a refresh)
      if (!forceRefresh) {
        const cached = await indexedDBService.getQuestionSet(questionSetId)
        if (cached && cached.questions_json) {
          const normalized = get().normalizeQuestionSet(cached)
          set({ currentQuestionSet: normalized, loading: false })
          
          // Background: check for version update
          get().checkQuestionSetVersion(questionSetId, cached.version_number)
          
          return normalized
        }
      }
      
      // Fetch question set metadata (no questions_json column after migration)
      const { data: questionSet, error: setError } = await supabase
        .from('question_sets')
        .select('*, exam_types(name, provider, duration_minutes, passing_score, max_score)')
        .eq('id', questionSetId)
        .eq('is_active', true)
        .single()
      
      if (setError) throw setError
      
      // Fetch individual question rows from question_items
      const { data: items, error: itemsError } = await supabase
        .from('question_items')
        .select('id, question_number, question_text, question_type, domain, options, correct_answers, tags')
        .eq('question_set_id', questionSetId)
        .order('question_number', { ascending: true })
      
      if (itemsError) throw itemsError
      
      if (!items || items.length === 0) {
        console.error('❌ No questions found in question_items for set', questionSetId)
        throw new Error('No questions available for this exam.')
      }
      
      // Assemble into the shape normalizeQuestionSet expects
      const assembledData = {
        ...questionSet,
        questions_json: items.map(item => ({
          id: item.question_number,
          question_item_id: item.id,
          question: item.question_text,
          type: item.question_type,
          domain: item.domain || '',
          options: item.options,
          correct_answers: item.correct_answers,
          tags: item.tags || []
        }))
      }
      
      const normalized = get().normalizeQuestionSet(assembledData)
      
      // Save to IndexedDB for offline use
      await indexedDBService.setQuestionSet(normalized)
      
      set({ currentQuestionSet: normalized, loading: false })
      
      return normalized
    } catch (error) {
      console.error('Error loading question set:', error)
      set({ error: error.message, loading: false })
      return null
    }
  },

  /**
   * Normalize question set to ensure consistent format.
   * Accepts data where questions_json is either:
   *   - An array of question objects (new question_items shape)
   *   - An object with a 'questions' array key (legacy shape)
   */
  normalizeQuestionSet: (data) => {
    if (!data || !data.questions_json) {
      return data
    }
    
    const questionsData = data.questions_json
    let questions = questionsData.questions || questionsData
    
    if (!Array.isArray(questions)) {
      console.warn('⚠️ questions_json is not an array, attempting to parse')
      questions = []
    }
    
    questions = questions.map((q, index) => {
      let correctAnswers = q.correctAnswers || q.correct_answers || []
      
      const options = (q.options || []).map(opt => {
        if (typeof opt === 'string') {
          const isCorrect = correctAnswers.length > 0 ? correctAnswers.includes(opt) : false
          return { text: opt, correct: isCorrect }
        } else if (opt.text !== undefined) {
          return opt
        }
        return { text: String(opt), correct: false }
      })
      
      // Primary: derive correct answers from options with correct: true
      correctAnswers = options
        .filter(opt => opt.correct === true)
        .map(opt => opt.text)
      
      if (correctAnswers.length === 0) {
        console.warn(`⚠️ Question ${index + 1} has no correct answers defined!`, {
          question: q.question?.substring(0, 100) + '...',
          optionsCount: options.length
        })
      }
      
      return {
        id: q.id || `q_${index}`,
        question_item_id: q.question_item_id || null,
        question: q.question,
        options: options,
        type: q.type || 'Multiple Choice',
        domain: q.domain || '',
        tags: q.tags || [],
        correctAnswers: correctAnswers
      }
    })
    
    return {
      ...data,
      questions_json: {
        questions: questions
      }
    }
  },

  /**
   * Check if question set has been updated (version check).
   * If a newer version exists, re-fetches from question_items.
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
        // Force refresh pulls fresh question_items rows and updates IndexedDB
        const normalized = await get().loadQuestionSet(questionSetId, true)
        if (normalized) {
          set({ currentQuestionSet: normalized })
        }
      }
    } catch (error) {
      console.error('Version check error:', error)
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

