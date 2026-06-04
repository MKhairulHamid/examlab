/**
 * Study Progress Service
 * Loads and saves per-user, per-course study progress to Supabase so it
 * follows the user across devices. Persists:
 *   - completedSessions  — which session IDs are marked complete
 *   - clearedCheckpoints — which speed-bump checkpoints have been passed
 *                          shape: { [sessionId]: number[] }
 */

import supabase from './supabase'

export const studyProgressService = {
  /**
   * Fetch a user's progress for a course.
   * Returns { completedSessions, clearedCheckpoints } or null on error.
   */
  async load(userId, courseSlug) {
    if (!userId || !courseSlug) return null
    try {
      const { data, error } = await supabase
        .from('study_course_progress')
        .select('completed_sessions, cleared_checkpoints')
        .eq('user_id', userId)
        .eq('course_slug', courseSlug)
        .maybeSingle()

      if (error) throw error
      if (!data) return { completedSessions: [], clearedCheckpoints: {} }

      return {
        completedSessions: Array.isArray(data.completed_sessions)
          ? data.completed_sessions
          : [],
        clearedCheckpoints:
          data.cleared_checkpoints && typeof data.cleared_checkpoints === 'object'
            ? data.cleared_checkpoints
            : {},
      }
    } catch (error) {
      console.error('Error loading study progress:', error)
      return null
    }
  },

  /**
   * Upsert the user's progress for a course (one row per user + course).
   */
  async save(userId, courseSlug, { completedSessions, clearedCheckpoints }) {
    if (!userId || !courseSlug) return
    try {
      const { error } = await supabase
        .from('study_course_progress')
        .upsert(
          {
            user_id: userId,
            course_slug: courseSlug,
            completed_sessions: completedSessions || [],
            cleared_checkpoints: clearedCheckpoints || {},
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
