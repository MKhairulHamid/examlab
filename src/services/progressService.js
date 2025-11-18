/**
 * Progress Service - Manage exam progress with Supabase-only approach
 * Handles loading and saving directly to Supabase
 */

import supabase from './supabase'

export const progressService = {
  /**
   * Load progress for an exam attempt
   * Fetches directly from Supabase
   */
  async loadProgress(examAttemptId, userId) {
    try {
      const supabaseProgress = await this.fetchProgressFromSupabase(examAttemptId, userId)
      return supabaseProgress
    } catch (error) {
      console.error('Error loading progress:', error)
      return null
    }
  },

  /**
   * Fetch progress from Supabase
   */
  async fetchProgressFromSupabase(examAttemptId, userId) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('exam_attempt_id', examAttemptId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error
    }

    if (!data) {
      return null
    }

    // Map database fields to local format
    return {
      id: data.exam_attempt_id,
      attemptId: data.exam_attempt_id,
      examAttemptId: data.exam_attempt_id,
      questionSetId: data.question_set_id,
      userId: data.user_id,
      currentQuestionIndex: data.current_question_number || 0,
      answers: data.current_answers_json || {},
      timeElapsed: data.time_elapsed_seconds || 0,
      timerPaused: data.timer_paused || false,
      status: data.status || 'in_progress',
      startedAt: data.started_at,
      completedAt: data.completed_at || null,
      updatedAt: data.last_synced_at || data.updated_at || new Date().toISOString()
    }
  },

  /**
   * Save progress directly to Supabase
   */
  async saveProgress(progress) {
    const attemptId = progress.attemptId || progress.examAttemptId || progress.id
    
    if (!attemptId) {
      console.error('❌ Cannot save progress: missing attempt ID', progress)
      return
    }

    if (!progress.userId) {
      console.error('❌ Cannot save progress: missing user ID', progress)
      return
    }
    
    try {
      // Prepare data for Supabase
      const progressData = {
        exam_attempt_id: attemptId,
        question_set_id: progress.questionSetId,
        user_id: progress.userId,
        current_question_number: progress.currentQuestionIndex || 0,
        current_answers_json: progress.answers || {},
        time_elapsed_seconds: progress.timeElapsed || 0,
        timer_paused: progress.timerPaused || false,
        status: progress.status || 'in_progress',
        started_at: progress.startedAt,
        completed_at: progress.completedAt || null,
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Upsert to Supabase
      const { error } = await supabase
        .from('user_progress')
        .upsert(progressData, {
          onConflict: 'exam_attempt_id'
        })

      if (error) {
        console.error('Error saving progress to Supabase:', error)
        throw error
      }

      console.log('✅ Progress saved to Supabase:', attemptId)
    } catch (error) {
      console.error('Failed to save progress:', error)
      throw error
    }
  },

  /**
   * Force immediate sync (same as saveProgress now)
   */
  async forceSync(progress) {
    return this.saveProgress(progress)
  },

  /**
   * Delete progress from Supabase
   */
  async deleteProgress(examAttemptId) {
    try {
      const { error } = await supabase
        .from('user_progress')
        .delete()
        .eq('exam_attempt_id', examAttemptId)

      if (error) {
        console.error('Error deleting progress from Supabase:', error)
        throw error
      }

      console.log('✅ Progress deleted from Supabase:', examAttemptId)
    } catch (error) {
      console.error('Failed to delete progress:', error)
      throw error
    }
  },

  /**
   * Get all progress items for a user from Supabase
   */
  async getAllProgress(userId) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })

      if (error) {
        console.error('Error fetching all progress:', error)
        throw error
      }

      // Map database fields to local format
      return (data || []).map(item => ({
        id: item.exam_attempt_id,
        attemptId: item.exam_attempt_id,
        examAttemptId: item.exam_attempt_id,
        questionSetId: item.question_set_id,
        userId: item.user_id,
        currentQuestionIndex: item.current_question_number || 0,
        answers: item.current_answers_json || {},
        timeElapsed: item.time_elapsed_seconds || 0,
        timerPaused: item.timer_paused || false,
        status: item.status || 'in_progress',
        startedAt: item.started_at,
        completedAt: item.completed_at || null,
        updatedAt: item.last_synced_at || item.updated_at || new Date().toISOString()
      }))
    } catch (error) {
      console.error('Failed to get all progress:', error)
      return []
    }
  },

  /**
   * Find in-progress exam for a question set from Supabase
   * Returns the attempt if found, null otherwise
   */
  async findInProgressExam(userId, questionSetId) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('question_set_id', questionSetId)
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false })
        .limit(1)
      
      // Handle case where no rows found (PGRST116 error or empty array)
      if (error && error.code !== 'PGRST116') {
        console.error('Error finding in-progress exam:', error)
        return null
      }
      
      // Check if we got any results
      if (!data || data.length === 0) {
        return null
      }
      
      // Map the first result to local format
      const item = data[0]
      return {
        id: item.exam_attempt_id,
        attemptId: item.exam_attempt_id,
        examAttemptId: item.exam_attempt_id,
        questionSetId: item.question_set_id,
        userId: item.user_id,
        currentQuestionIndex: item.current_question_number || 0,
        answers: item.current_answers_json || {},
        timeElapsed: item.time_elapsed_seconds || 0,
        timerPaused: item.timer_paused || false,
        status: item.status || 'in_progress',
        startedAt: item.started_at,
        completedAt: item.completed_at || null,
        updatedAt: item.last_synced_at || item.updated_at || new Date().toISOString()
      }
    } catch (error) {
      console.error('Error finding in-progress exam:', error)
      return null
    }
  }
}

export default progressService

