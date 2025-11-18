/**
 * Study Streak Service
 * Manages user's study streak with local storage and database sync
 */

import { supabase } from './supabase'

const STREAK_STORAGE_KEY = 'exam_prep_streak'
const SYNC_INTERVAL = 5 * 60 * 1000 // 5 minutes

class StreakService {
  constructor() {
    this.syncTimer = null
  }

  /**
   * Get streak data from local storage
   */
  getLocalStreak() {
    try {
      const stored = localStorage.getItem(STREAK_STORAGE_KEY)
      if (!stored) {
        return this.getDefaultStreak()
      }
      return JSON.parse(stored)
    } catch (error) {
      console.error('Error reading local streak:', error)
      return this.getDefaultStreak()
    }
  }

  /**
   * Save streak data to local storage
   */
  saveLocalStreak(streakData) {
    try {
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streakData))
    } catch (error) {
      console.error('Error saving local streak:', error)
    }
  }

  /**
   * Get default streak object
   */
  getDefaultStreak() {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalStudyDays: 0,
      lastActivityDate: null,
      studyDates: [],
      dailyGoalQuestions: 20,
      questionsToday: 0,
      lastSynced: null
    }
  }

  /**
   * Fetch streak from database
   */
  async fetchStreakFromDB(userId) {
    try {
      const { data, error } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // PGRST116 = no rows returned (normal case for new users)
        if (error.code === 'PGRST116') {
          return this.getDefaultStreak()
        }
        
        // 42P01 = table doesn't exist, PGRST106 = table not found, 406 = Not Acceptable
        if (error.code === '42P01' || error.code === 'PGRST106' || error.message?.includes('406')) {
          console.warn('Study streaks table not available yet. Using local storage only.')
          return null
        }
        
        console.error('Error fetching streak from DB:', error)
        return null
      }

      if (!data) {
        return this.getDefaultStreak()
      }

      return {
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        totalStudyDays: data.total_study_days,
        lastActivityDate: data.last_activity_date,
        studyDates: data.study_days_json?.dates || [],
        dailyGoalQuestions: data.daily_goal_questions,
        questionsToday: this.getQuestionsToday(),
        lastSynced: new Date().toISOString()
      }
    } catch (error) {
      // Catch network or other errors
      if (error.message?.includes('406') || error.message?.includes('Not Acceptable')) {
        console.warn('Study streaks feature not available. Using local storage only.')
        return null
      }
      console.error('Error in fetchStreakFromDB:', error)
      return null
    }
  }

  /**
   * Update streak in database
   */
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
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })

      if (error) {
        // Silently fail if table doesn't exist
        if (error.code === '42P01' || error.code === 'PGRST106' || error.message?.includes('406')) {
          return false
        }
        console.error('Error updating streak in DB:', error)
        return false
      }

      return true
    } catch (error) {
      // Silently fail if table doesn't exist
      if (error.message?.includes('406') || error.message?.includes('Not Acceptable')) {
        return false
      }
      console.error('Error in updateStreakInDB:', error)
      return false
    }
  }

  /**
   * Record activity and update streak
   * Now tracks if user answered at least 1 question per day
   */
  async recordActivity(userId, questionsCompleted = 1) {
    const today = new Date().toISOString().split('T')[0]
    const streak = this.getLocalStreak()

    // Initialize questionsToday if undefined
    if (typeof streak.questionsToday !== 'number') {
      streak.questionsToday = 0
    }

    // Update questions today
    if (streak.lastActivityDate === today) {
      streak.questionsToday += questionsCompleted
      // Already counted today, no need to update streak
      this.saveLocalStreak(streak)
      return streak
    }

    // New day - update questions count
    streak.questionsToday = questionsCompleted

    // Calculate streak
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (streak.lastActivityDate === yesterdayStr) {
      // Continue streak - answered yesterday and now today
      streak.currentStreak += 1
      streak.lastActivityDate = today
      if (!streak.studyDates.includes(today)) {
        streak.studyDates.push(today)
      }
    } else if (!streak.lastActivityDate || streak.lastActivityDate < yesterdayStr) {
      // Streak broken or first time - start new streak
      streak.currentStreak = 1
      streak.lastActivityDate = today
      if (!streak.studyDates.includes(today)) {
        streak.studyDates.push(today)
      }
    }

    // Update longest streak
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak
    }

    // Update total study days
    streak.totalStudyDays = streak.studyDates.length

    // Save locally
    this.saveLocalStreak(streak)

    // Sync to database
    if (userId) {
      await this.syncToDatabase(userId)
    }

    return streak
  }

  /**
   * Sync local streak to database
   */
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
   * Initialize streak for user
   */
  async initializeStreak(userId) {
    if (!userId) return this.getLocalStreak()

    // Try to fetch from database
    const dbStreak = await this.fetchStreakFromDB(userId)
    
    if (dbStreak) {
      // Use database data
      this.saveLocalStreak(dbStreak)
      return dbStreak
    }

    // Use local or default
    const localStreak = this.getLocalStreak()
    
    // Sync to database
    await this.updateStreakInDB(userId, localStreak)
    
    return localStreak
  }

  /**
   * Get questions completed today from local storage
   */
  getQuestionsToday() {
    const today = new Date().toISOString().split('T')[0]
    const streak = this.getLocalStreak()
    
    if (streak.lastActivityDate === today) {
      return streak.questionsToday || 0
    }
    
    return 0
  }

  /**
   * Check if streak needs to be checked/updated
   */
  checkStreakExpiry() {
    const streak = this.getLocalStreak()
    const today = new Date().toISOString().split('T')[0]
    
    if (!streak.lastActivityDate) return streak

    const lastDate = new Date(streak.lastActivityDate)
    const currentDate = new Date(today)
    const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24))

    let needsSave = false

    // If it's a new day (not today), reset questionsToday
    if (streak.lastActivityDate !== today) {
      streak.questionsToday = 0
      needsSave = true
    }

    // If more than 1 day has passed, reset streak
    if (daysDiff > 1) {
      streak.currentStreak = 0
      needsSave = true
    }

    // Save if changes were made
    if (needsSave) {
      this.saveLocalStreak(streak)
    }

    return streak
  }

  /**
   * Start auto-sync
   */
  startAutoSync(userId) {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
    }

    this.syncTimer = setInterval(() => {
      this.syncToDatabase(userId)
    }, SYNC_INTERVAL)
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }

  /**
   * Get streak statistics
   */
  getStreakStats() {
    const streak = this.getLocalStreak()
    const today = new Date().toISOString().split('T')[0]
    
    // Check if streak needs updating
    const updatedStreak = this.checkStreakExpiry()
    
    return {
      currentStreak: updatedStreak.currentStreak,
      longestStreak: updatedStreak.longestStreak,
      totalStudyDays: updatedStreak.totalStudyDays,
      questionsToday: updatedStreak.lastActivityDate === today ? (updatedStreak.questionsToday || 0) : 0,
      dailyGoal: updatedStreak.dailyGoalQuestions,
      studyDates: updatedStreak.studyDates.slice(-14) // Last 14 days
    }
  }

  /**
   * Update daily goal
   */
  async updateDailyGoal(userId, newGoal) {
    const streak = this.getLocalStreak()
    streak.dailyGoalQuestions = newGoal
    this.saveLocalStreak(streak)

    if (userId) {
      await this.syncToDatabase(userId)
    }

    return streak
  }
}

// Export singleton instance
export const streakService = new StreakService()
export default streakService

