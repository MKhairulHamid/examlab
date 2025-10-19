/**
 * Progress Store - Manage current exam progress
 * Implements offline-first with immediate local saves and background sync
 */

import { create } from 'zustand'
import progressService from '../services/progressService'
import indexedDBService from '../services/indexedDBService'
import syncService from '../services/syncService'

export const useProgressStore = create((set, get) => ({
  // State
  attemptId: null,
  questionSetId: null,
  userId: null,
  currentQuestionIndex: 0,
  answers: {},
  timeElapsed: 0,
  timerPaused: false,
  status: 'not_started', // 'not_started', 'in_progress', 'completed'
  startedAt: null,
  completedAt: null,
  loading: false,
  saving: false,

  // Actions

  /**
   * Start new exam attempt
   */
  startExam: async (questionSetId, userId, questionCount) => {
    // Generate UUID v4 compatible ID for database
    const attemptId = crypto.randomUUID()
    
    const initialState = {
      attemptId,
      questionSetId,
      userId,
      currentQuestionIndex: 0,
      answers: {},
      timeElapsed: 0,
      timerPaused: false,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      completedAt: null,
      updatedAt: new Date().toISOString()
    }
    
    set(initialState)
    
    // Save immediately
    await progressService.saveProgress(initialState)
    
    return attemptId
  },

  /**
   * Start or resume exam
   * Checks for in-progress exam first, otherwise starts new one
   */
  startOrResumeExam: async (questionSetId, userId, questionCount) => {
    // Check for existing in-progress exam
    const existingProgress = await progressService.findInProgressExam(userId, questionSetId)
    
    if (existingProgress) {
      // Resume existing exam
      const resumedIndex = existingProgress.currentQuestionIndex || existingProgress.current_question_index || existingProgress.current_question_number || 0
      
      set({
        attemptId: existingProgress.id || existingProgress.attemptId || existingProgress.exam_attempt_id,
        questionSetId: existingProgress.questionSetId || existingProgress.question_set_id,
        userId: existingProgress.userId || existingProgress.user_id,
        currentQuestionIndex: resumedIndex,
        answers: existingProgress.answers || existingProgress.current_answers_json || {},
        timeElapsed: existingProgress.timeElapsed || existingProgress.time_elapsed || existingProgress.time_elapsed_seconds || 0,
        timerPaused: existingProgress.timerPaused || existingProgress.timer_paused || false,
        status: existingProgress.status || 'in_progress',
        startedAt: existingProgress.startedAt || existingProgress.started_at,
        completedAt: existingProgress.completedAt || existingProgress.completed_at || null,
        updatedAt: existingProgress.updatedAt || existingProgress.updated_at || existingProgress.last_synced_at || new Date().toISOString()
      })
      
      return existingProgress.id || existingProgress.attemptId || existingProgress.exam_attempt_id
    }
    
    // No existing exam found, start new one
    return get().startExam(questionSetId, userId, questionCount)
  },

  /**
   * Load existing progress
   */
  loadProgress: async (attemptId, userId) => {
    try {
      set({ loading: true })
      
      const progress = await progressService.loadProgress(attemptId, userId)
      
      if (progress) {
        set({
          ...progress,
          loading: false
        })
        return progress
      }
      
      set({ loading: false })
      return null
    } catch (error) {
      console.error('Error loading progress:', error)
      set({ loading: false })
      return null
    }
  },

  /**
   * Save answer for a question
   */
  saveAnswer: async (questionIndex, answer) => {
    const state = get()
    const newAnswers = {
      ...state.answers,
      [questionIndex]: answer
    }
    
    set({
      answers: newAnswers,
      updatedAt: new Date().toISOString()
    })
    
    // Save immediately to local storage
    const progress = {
      attemptId: state.attemptId,
      questionSetId: state.questionSetId,
      userId: state.userId,
      currentQuestionIndex: state.currentQuestionIndex,
      answers: newAnswers,
      timeElapsed: state.timeElapsed,
      timerPaused: state.timerPaused,
      status: state.status,
      startedAt: state.startedAt,
      updatedAt: new Date().toISOString()
    }
    
    await progressService.saveProgress(progress)
  },

  /**
   * Navigate to question
   */
  goToQuestion: async (questionIndex) => {
    const state = get()
    
    set({
      currentQuestionIndex: questionIndex,
      updatedAt: new Date().toISOString()
    })
    
    // Save progress
    const progress = {
      attemptId: state.attemptId,
      questionSetId: state.questionSetId,
      userId: state.userId,
      currentQuestionIndex: questionIndex,
      answers: state.answers,
      timeElapsed: state.timeElapsed,
      timerPaused: state.timerPaused,
      status: state.status,
      startedAt: state.startedAt,
      updatedAt: new Date().toISOString()
    }
    
    await progressService.saveProgress(progress)
  },

  /**
   * Update timer
   */
  updateTimer: async (seconds) => {
    const state = get()
    
    set({
      timeElapsed: seconds,
      updatedAt: new Date().toISOString()
    })
    
    // Save progress (debounced via progressService)
    const progress = {
      attemptId: state.attemptId,
      questionSetId: state.questionSetId,
      userId: state.userId,
      currentQuestionIndex: state.currentQuestionIndex,
      answers: state.answers,
      timeElapsed: seconds,
      timerPaused: state.timerPaused,
      status: state.status,
      startedAt: state.startedAt,
      updatedAt: new Date().toISOString()
    }
    
    await progressService.saveProgress(progress)
  },

  /**
   * Pause/resume timer
   */
  setTimerPaused: async (paused) => {
    const state = get()
    
    set({
      timerPaused: paused,
      updatedAt: new Date().toISOString()
    })
    
    const progress = {
      attemptId: state.attemptId,
      questionSetId: state.questionSetId,
      userId: state.userId,
      currentQuestionIndex: state.currentQuestionIndex,
      answers: state.answers,
      timeElapsed: state.timeElapsed,
      timerPaused: paused,
      status: state.status,
      startedAt: state.startedAt,
      updatedAt: new Date().toISOString()
    }
    
    await progressService.saveProgress(progress)
  },

  /**
   * Complete exam
   */
  completeExam: async (results) => {
    const state = get()
    
    const completedState = {
      ...state,
      status: 'completed',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    set(completedState)
    
    // Save final state
    await progressService.saveProgress(completedState)
    
    // Force immediate sync to Supabase
    await progressService.forceSync(completedState)
    
    // Save results
    const result = {
      id: crypto.randomUUID(),
      userId: state.userId,
      questionSetId: state.questionSetId,
      attemptId: state.attemptId,
      startedAt: state.startedAt,
      completedAt: completedState.completedAt,
      timeSpent: state.timeElapsed,
      answers: state.answers,
      rawScore: results.correctCount,
      percentageScore: results.percentage,
      scaledScore: results.scaledScore,
      passed: results.passed,
      totalQuestions: results.totalQuestions,
      examName: results.examName || 'Exam',
      examSlug: results.examSlug || ''
    }
    
    // Save result to IndexedDB
    await indexedDBService.setExamResult(result)
    
    // Queue result sync
    syncService.add('result', result, { priority: 10 })
    
    return result
  },

  /**
   * Reset progress
   */
  reset: () => {
    set({
      attemptId: null,
      questionSetId: null,
      userId: null,
      currentQuestionIndex: 0,
      answers: {},
      timeElapsed: 0,
      timerPaused: false,
      status: 'not_started',
      startedAt: null,
      completedAt: null,
      loading: false,
      saving: false
    })
  },

  /**
   * Get answer count
   */
  getAnswerCount: () => {
    const { answers } = get()
    return Object.keys(answers).filter(key => answers[key] && answers[key].length > 0).length
  },

  /**
   * Check if question is answered
   */
  isQuestionAnswered: (questionIndex) => {
    const { answers } = get()
    const answer = answers[questionIndex]
    return answer && answer.length > 0
  }
}))

export default useProgressStore

