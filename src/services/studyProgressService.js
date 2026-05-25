/**
 * Study Progress Service
 * Loads and saves per-user, per-course study progress (completed sessions +
 * per-section confidence tags) to Supabase so it follows the user across
 * devices. Mirrors the Supabase-only approach used by progressService.
 */

import supabase from './supabase'

export const studyProgressService = {
  /**
   * Fetch a user's progress for a course. Returns
   * { completedSessions: string[], confidence: Record<string, string> }
   * or null on error. Returns empty defaults when there is no row yet.
   */
  async load(userId, courseSlug) {
    if (!userId || !courseSlug) return null
    try {
      const { data, error } = await supabase
        .from('study_course_progress')
        .select('completed_sessions, confidence')
        .eq('user_id', userId)
        .eq('course_slug', courseSlug)
        .maybeSingle()

      if (error) throw error
      if (!data) return { completedSessions: [], confidence: {} }

      return {
        completedSessions: Array.isArray(data.completed_sessions) ? data.completed_sessions : [],
        confidence: data.confidence && typeof data.confidence === 'object' ? data.confidence : {},
      }
    } catch (error) {
      console.error('Error loading study progress:', error)
      return null
    }
  },

  /**
   * Upsert the user's progress for a course (one row per user + course).
   */
  async save(userId, courseSlug, { completedSessions, confidence }) {
    if (!userId || !courseSlug) return
    try {
      const { error } = await supabase
        .from('study_course_progress')
        .upsert(
          {
            user_id: userId,
            course_slug: courseSlug,
            completed_sessions: completedSessions || [],
            confidence: confidence || {},
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,course_slug' }
        )
      if (error) throw error
    } catch (error) {
      console.error('Error saving study progress:', error)
    }
  },
}

export default studyProgressService
