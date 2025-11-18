/**
 * Progress Store - Manage current exam progress
 * Saves progress to Supabase on user actions (navigation, answers)
 */

import { create } from 'zustand'
import progressService from '../services/progressService'
import supabase from '../services/supabase'

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
   * Update timer (only updates state, doesn't save to DB)
   */
  updateTimer: (seconds) => {
    set({
      timeElapsed: seconds,
      updatedAt: new Date().toISOString()
    })
    // Note: Timer updates don't save to DB to avoid excessive writes
    // Progress is saved when user navigates or answers questions
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
    
    // Save final progress state to Supabase
    await progressService.saveProgress(completedState)
    
    // Save exam results to exam_attempts table
    const result = {
      id: crypto.randomUUID(),
      user_id: state.userId,
      question_set_id: state.questionSetId,
      exam_attempt_id: state.attemptId,
      started_at: state.startedAt,
      completed_at: completedState.completedAt,
      time_spent_seconds: state.timeElapsed,
      answers_json: state.answers,
      raw_score: results.correctCount,
      percentage_score: results.percentage,
      scaled_score: results.scaledScore,
      passed: results.passed,
      total_questions: results.totalQuestions,
      exam_name: results.examName || 'Exam',
      exam_slug: results.examSlug || ''
    }
    
    // Save result to Supabase exam_attempts table
    const { error } = await supabase
      .from('exam_attempts')
      .insert(result)
    
    if (error) {
      console.error('Error saving exam result:', error)
    }
    
    return {
      id: result.id,
      userId: result.user_id,
      questionSetId: result.question_set_id,
      attemptId: result.exam_attempt_id,
      startedAt: result.started_at,
      completedAt: result.completed_at,
      timeSpent: result.time_spent_seconds,
      answers: result.answers_json,
      rawScore: result.raw_score,
      percentageScore: result.percentage_score,
      scaledScore: result.scaled_score,
      passed: result.passed,
      totalQuestions: result.total_questions,
      examName: result.exam_name,
      examSlug: result.exam_slug
    }
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

