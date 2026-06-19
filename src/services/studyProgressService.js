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
   * Fetch every course the user has any study progress in. Powers the adaptive
   * dashboard's "which certifications has this learner actually started" check —
   * server-side so it's correct on a fresh install / new device.
   * Returns [{ courseSlug, completedSessions, updatedAt }] ordered most-recent first.
   */
  async loadAll(userId) {
    if (!userId) return []
    try {
      const { data, error } = await supabase
        .from('study_course_progress')
        .select('course_slug, completed_sessions, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return (data || []).map(r => ({
        courseSlug: r.course_slug,
        completedSessions: Array.isArray(r.completed_sessions) ? r.completed_sessions : [],
        updatedAt: r.updated_at,
      }))
    } catch (error) {
      console.error('Error loading all study progress:', error)
      return []
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
