/**
 * Exam Store - Manage exams and question sets
 */

import { create } from 'zustand'
import supabase from '../services/supabase'

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
   * Fetch all exam types
   */
  fetchExams: async () => {
    try {
      set({ loading: true, error: null })

      const { data, error } = await supabase
        .from('exam_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error

      set({ exams: data, loading: false })
      return data
    } catch (error) {
      console.error('Error fetching exams:', error)
      set({ error: error.message, loading: false })
      return []
    }
  },

  /**
   * Get exam by slug
   */
  getExamBySlug: async (slug) => {
    try {
      // Check in already-loaded exams first
      const { exams } = get()
      const existing = exams.find(e => e.slug === slug)
      if (existing) {
        set({ currentExam: existing })
        return existing
      }

      const { data, error } = await supabase
        .from('exam_types')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) throw error

      set({ currentExam: data })
      return data
    } catch (error) {
      console.error('Error getting exam:', error)
      set({ error: error.message })
      return null
    }
  },

  /**
   * Fetch question sets for an exam (metadata only)
   */
  fetchQuestionSets: async (examTypeId) => {
    try {
      // Clear stale question sets immediately so the UI never shows data from
      // a previous exam while the new fetch is in flight.
      set({ questionSets: [], loading: true, error: null })

      const { data, error } = await supabase
        .from('question_sets')
        .select('id, exam_type_id, name, description, set_number, question_count, price_cents, is_free_sample, is_final_exam, is_active, created_at, updated_at, version_number')
        .eq('exam_type_id', examTypeId)
        .eq('is_active', true)
        .order('set_number', { ascending: true })

      if (error) throw error

      set({ questionSets: data, loading: false })
      return data
    } catch (error) {
      console.error('Error fetching question sets:', error)
      set({ error: error.message, loading: false })
      return []
    }
  },

  /**
   * Fetch question set metadata (no questions). Safe, non-sensitive fields.
   */
  fetchQuestionSetMeta: async (questionSetId) => {
    const { data, error } = await supabase
      .from('question_sets')
      .select('*, exam_types(name, provider, total_questions, duration_minutes, passing_score, max_score)')
      .eq('id', questionSetId)
      .eq('is_active', true)
      .single()
    if (error) throw error
    return data
  },

  /**
   * Assemble + normalize a question set from RPC rows.
   * Rows from get_exam_questions carry NO correct answers (so the in-exam
   * client genuinely cannot know them); rows from get_attempt_review do.
   */
  assembleQuestionSet: (questionSet, rows) => {
    const assembledData = {
      ...questionSet,
      questions_json: (rows || []).map(item => ({
        id: item.question_number,
        question_item_id: item.question_item_id,
        question: item.question_text,
        type: item.question_type,
        domain: item.domain || '',
        options: item.options,
        correct_answers: item.correct_answers || [],
        tags: item.tags || [],
        ai_cache: item.ai_cache || {}
      }))
    }
    return get().normalizeQuestionSet(assembledData)
  },

  /**
   * Load a question set for TAKING an exam. Questions come from the
   * get_exam_questions RPC, which strips correct answers and answer-revealing
   * explanations server-side — the payload sent to the browser never contains
   * the answer key.
   */
  loadExamQuestions: async (questionSetId) => {
    try {
      set({ loading: true, error: null })

      const questionSet = await get().fetchQuestionSetMeta(questionSetId)

      const { data: rows, error: rpcError } = await supabase
        .rpc('get_exam_questions', { p_set_id: questionSetId })

      if (rpcError) throw rpcError

      if (!rows || rows.length === 0) {
        console.error('❌ No questions returned for set', questionSetId)
        throw new Error('No questions available for this exam.')
      }

      const normalized = get().assembleQuestionSet(questionSet, rows)
      set({ currentQuestionSet: normalized, loading: false })
      return normalized
    } catch (error) {
      console.error('Error loading exam questions:', error)
      set({ error: error.message, loading: false })
      return null
    }
  },

  /**
   * Load a completed attempt for REVIEW. Questions + correct answers +
   * explanations come from get_attempt_review, which only returns data for the
   * caller's own completed attempt.
   */
  loadAttemptReview: async (attemptId, questionSetId) => {
    try {
      set({ loading: true, error: null })

      const questionSet = await get().fetchQuestionSetMeta(questionSetId)

      const { data: rows, error: rpcError } = await supabase
        .rpc('get_attempt_review', { p_attempt_id: attemptId })

      if (rpcError) throw rpcError

      if (!rows || rows.length === 0) {
        throw new Error('No review available for this attempt.')
      }

      const normalized = get().assembleQuestionSet(questionSet, rows)
      set({ currentQuestionSet: normalized, loading: false })
      return normalized
    } catch (error) {
      console.error('Error loading attempt review:', error)
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

      // For Ordering and Matching, options don't carry a `correct` flag —
      // the authoritative correct_answers come from the DB column directly.
      const derivedFromOptions = options
        .filter(opt => opt.correct === true)
        .map(opt => opt.text)

      if (derivedFromOptions.length > 0) {
        correctAnswers = derivedFromOptions
      }
      // else: keep the DB-provided correctAnswers (required for Ordering/Matching)

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
        correctAnswers: correctAnswers,
        ai_cache: q.ai_cache || {}
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
