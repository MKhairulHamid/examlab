/**
 * Study Streak Service
 *
 * Records the days a learner is active and derives their streak from that set
 * of days — the list of study dates is the single source of truth. Current and
 * longest streaks are always *computed* from those dates (never mutated
 * incrementally), so the numbers stay correct even after days off, across
 * devices, or if the page sits open past midnight.
 *
 * Persistence: localStorage for instant reads + Supabase (`study_streaks`) for
 * cross-device sync. The two are merged on init so offline activity is never
 * lost.
 */

import { supabase } from './supabase'

const STREAK_STORAGE_KEY = 'exam_prep_streak'
const SYNC_INTERVAL = 5 * 60 * 1000 // 5 minutes
const DAY_MS = 24 * 60 * 60 * 1000
const DEFAULT_DAILY_GOAL = 20

// ── Date helpers ────────────────────────────────────────────────────
// A "day" is a UTC calendar date string (YYYY-MM-DD) so a study day is stable
// regardless of the exact time of day it was recorded.
function dayKey(date = new Date()) {
  return new Date(date).toISOString().split('T')[0]
}

function dayNumber(key) {
  // Whole days since the epoch — lets us test "are these two dates adjacent?".
  return Math.floor(new Date(`${key}T00:00:00Z`).getTime() / DAY_MS)
}

/**
 * Derive current + longest streak from a set of study-day keys.
 *
 * - longestStreak: the longest run of consecutive calendar days, ever.
 * - currentStreak: the run ending today, or yesterday (a one-day grace so the
 *   streak doesn't read 0 first thing in the morning before today's activity).
 *   Any older gap means the current streak is 0.
 */
function computeStreaks(studyDates = []) {
  const days = [...new Set(studyDates)].map(dayNumber).sort((a, b) => a - b)
  if (days.length === 0) return { currentStreak: 0, longestStreak: 0 }

  let longest = 1
  let run = 1
  for (let i = 1; i < days.length; i++) {
    run = days[i] - days[i - 1] === 1 ? run + 1 : 1
    if (run > longest) longest = run
  }

  const today = dayNumber(dayKey())
  const last = days[days.length - 1]
  let current = 0
  if (last === today || last === today - 1) {
    current = 1
    for (let i = days.length - 1; i > 0; i--) {
      if (days[i] - days[i - 1] === 1) current += 1
      else break
    }
  }

  return { currentStreak: current, longestStreak: longest }
}

class StreakService {
  constructor() {
    this.syncTimer = null
  }

  getDefaultStreak() {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalStudyDays: 0,
      lastActivityDate: null,
      studyDates: [],
      dailyGoalQuestions: DEFAULT_DAILY_GOAL,
      questionsToday: 0,
      lastSynced: null,
    }
  }

  getLocalStreak() {
    try {
      const stored = localStorage.getItem(STREAK_STORAGE_KEY)
      if (!stored) return this.getDefaultStreak()
      const parsed = JSON.parse(stored)
      // Defend against partially-shaped legacy payloads.
      return { ...this.getDefaultStreak(), ...parsed, studyDates: parsed.studyDates || [] }
    } catch (error) {
      console.error('Error reading local streak:', error)
      return this.getDefaultStreak()
    }
  }

  saveLocalStreak(streakData) {
    try {
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streakData))
    } catch (error) {
      console.error('Error saving local streak:', error)
    }
  }

  /**
   * Build a normalized streak record from a set of study dates. Recomputes the
   * derived streak numbers so callers never have to keep them in sync by hand.
   */
  buildStreak(studyDates, { dailyGoalQuestions, lastActivityDate, questionsToday } = {}) {
    const dates = [...new Set(studyDates)].sort()
    const { currentStreak, longestStreak } = computeStreaks(dates)
    const today = dayKey()
    return {
      currentStreak,
      longestStreak,
      totalStudyDays: dates.length,
      lastActivityDate: lastActivityDate || (dates.length ? dates[dates.length - 1] : null),
      studyDates: dates,
      dailyGoalQuestions: dailyGoalQuestions || DEFAULT_DAILY_GOAL,
      questionsToday: lastActivityDate === today ? (questionsToday || 0) : 0,
      lastSynced: new Date().toISOString(),
    }
  }

  // ── Database ──────────────────────────────────────────────────────
  async fetchStreakFromDB(userId) {
    try {
      const { data, error } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return this.getDefaultStreak() // no row yet
        // Table missing / not exposed — signal "DB unavailable" so we stay local-only.
        if (error.code === '42P01' || error.code === 'PGRST106' || error.message?.includes('406')) {
          console.warn('Study streaks table not available yet. Using local storage only.')
          return null
        }
        console.error('Error fetching streak from DB:', error)
        return null
      }

      if (!data) return this.getDefaultStreak()

      return {
        currentStreak: data.current_streak || 0,
        longestStreak: data.longest_streak || 0,
        totalStudyDays: data.total_study_days || 0,
        lastActivityDate: data.last_activity_date || null,
        studyDates: data.study_days_json?.dates || [],
        dailyGoalQuestions: data.daily_goal_questions || DEFAULT_DAILY_GOAL,
        questionsToday: 0,
        lastSynced: new Date().toISOString(),
      }
    } catch (error) {
      if (error.message?.includes('406') || error.message?.includes('Not Acceptable')) {
        console.warn('Study streaks feature not available. Using local storage only.')
        return null
      }
      console.error('Error in fetchStreakFromDB:', error)
      return null
    }
  }

  async updateStreakInDB(userId, streakData) {
    try {
      const { error } = await supabase
        .from('study_streaks')
        .upsert({
          user_id: userId,
          current_streak: streakData.currentStreak,
          longest_streak: streakData.longestStreak,
          total_study_days: streakData.totalStudyDays,
          last_activity_date: streakData.lastActivityDate,
          study_days_json: { dates: streakData.studyDates },
          daily_goal_questions: streakData.dailyGoalQuestions,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id', ignoreDuplicates: false })

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST106' || error.message?.includes('406')) return false
        console.error('Error updating streak in DB:', error)
        return false
      }
      return true
    } catch (error) {
      if (error.message?.includes('406') || error.message?.includes('Not Acceptable')) return false
      console.error('Error in updateStreakInDB:', error)
      return false
    }
  }

  // ── Public API ────────────────────────────────────────────────────
  /**
   * Record that the user was active today. Adds today to the study-day set,
   * tallies questions toward the daily goal, recomputes the streak, and syncs.
   */
  async recordActivity(userId, questionsCompleted = 1) {
    const today = dayKey()
    const prev = this.getLocalStreak()

    const questionsToday = prev.lastActivityDate === today
      ? (prev.questionsToday || 0) + questionsCompleted
      : questionsCompleted

    const streak = this.buildStreak([...prev.studyDates, today], {
      dailyGoalQuestions: prev.dailyGoalQuestions,
      lastActivityDate: today,
      questionsToday,
    })
    // Never let a recompute lower a previously-achieved best.
    streak.longestStreak = Math.max(streak.longestStreak, prev.longestStreak || 0)

    this.saveLocalStreak(streak)
    if (userId) await this.updateStreakInDB(userId, streak)
    return streak
  }

  /**
   * Merge local + DB records (union of study days) so neither source loses
   * activity, then persist the reconciled result both places.
   */
  async initializeStreak(userId) {
    const local = this.getLocalStreak()
    if (!userId) return local

    const remote = await this.fetchStreakFromDB(userId)
    if (!remote) {
      // DB unavailable — keep local, best-effort sync.
      await this.updateStreakInDB(userId, local)
      return local
    }

    const today = dayKey()
    const lastActivityDate = [local.lastActivityDate, remote.lastActivityDate]
      .filter(Boolean).sort().pop() || null
    const questionsToday = Math.max(
      local.lastActivityDate === today ? (local.questionsToday || 0) : 0,
      remote.lastActivityDate === today ? (remote.questionsToday || 0) : 0,
    )

    const merged = this.buildStreak([...local.studyDates, ...remote.studyDates], {
      dailyGoalQuestions: remote.dailyGoalQuestions || local.dailyGoalQuestions,
      lastActivityDate,
      questionsToday,
    })
    merged.longestStreak = Math.max(merged.longestStreak, local.longestStreak || 0, remote.longestStreak || 0)

    this.saveLocalStreak(merged)
    await this.updateStreakInDB(userId, merged)
    return merged
  }

  async syncToDatabase(userId) {
    if (!userId) return false
    const streak = this.getLocalStreak()
    const success = await this.updateStreakInDB(userId, streak)
    if (success) {
      streak.lastSynced = new Date().toISOString()
      this.saveLocalStreak(streak)
    }
    return success
  }

  /**
   * Read-only stats for the UI. Recomputes the streak from stored study days so
   * the value is correct on every read (e.g. it drops to 0 once the grace day
   * passes), and persists any correction so local + DB don't drift.
   */
  getStreakStats() {
    const stored = this.getLocalStreak()
    const today = dayKey()
    const { currentStreak, longestStreak } = computeStreaks(stored.studyDates)
    const bestStreak = Math.max(longestStreak, stored.longestStreak || 0)
    const questionsToday = stored.lastActivityDate === today ? (stored.questionsToday || 0) : 0

    if (stored.currentStreak !== currentStreak ||
        stored.longestStreak !== bestStreak ||
        stored.questionsToday !== questionsToday) {
      this.saveLocalStreak({ ...stored, currentStreak, longestStreak: bestStreak, questionsToday })
    }

    return {
      currentStreak,
      longestStreak: bestStreak,
      totalStudyDays: stored.studyDates.length,
      questionsToday,
      dailyGoal: stored.dailyGoalQuestions || DEFAULT_DAILY_GOAL,
      studyDates: stored.studyDates.slice(-30),
    }
  }

  getQuestionsToday() {
    const streak = this.getLocalStreak()
    return streak.lastActivityDate === dayKey() ? (streak.questionsToday || 0) : 0
  }

  async updateDailyGoal(userId, newGoal) {
    const streak = this.getLocalStreak()
    streak.dailyGoalQuestions = newGoal
    this.saveLocalStreak(streak)
    if (userId) await this.syncToDatabase(userId)
    return streak
  }

  // ── Auto-sync ─────────────────────────────────────────────────────
  startAutoSync(userId) {
    if (this.syncTimer) clearInterval(this.syncTimer)
    this.syncTimer = setInterval(() => this.syncToDatabase(userId), SYNC_INTERVAL)
  }

  stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }
}

export const streakService = new StreakService()
export default streakService
