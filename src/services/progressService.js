/**
 * Progress Service - Manage exam progress with offline-first approach
 * Handles loading, saving, merging, and conflict resolution
 */

import supabase from './supabase'
import cacheService from './cacheService'
import indexedDBService from './indexedDBService'
import syncService from './syncService'

export const progressService = {
  /**
   * Load progress for an exam attempt
   * Priority: LocalStorage > Supabase (merge if conflict)
   */
  async loadProgress(examAttemptId, userId) {
    try {
      // 1. Load from localStorage first (instant)
      const localKey = `progress_${examAttemptId}`
      const localProgress = cacheService.get(localKey)
      
      if (localProgress) {
        console.log('📦 Progress loaded from cache')
        
        // 2. Background: fetch from Supabase and merge
        this.mergeProgressInBackground(examAttemptId, userId, localProgress)
        
        return localProgress
      }

      // 3. If no local cache, try IndexedDB
      const dbProgress = await indexedDBService.getExamAttempt(examAttemptId)
      if (dbProgress) {
        console.log('📦 Progress loaded from IndexedDB')
        // Cache it for faster access
        cacheService.set(localKey, dbProgress, 60 * 60 * 1000) // 1 hour
        return dbProgress
      }

      // 4. If nothing local, fetch from Supabase
      console.log('🔄 Loading progress from Supabase...')
      const supabaseProgress = await this.fetchProgressFromSupabase(examAttemptId, userId)
      
      if (supabaseProgress) {
        // Cache it locally
        cacheService.set(localKey, supabaseProgress, 60 * 60 * 1000)
        await indexedDBService.setExamAttempt(supabaseProgress)
        return supabaseProgress
      }

      // 5. No progress found anywhere - return null
      return null
      
    } catch (error) {
      console.error('Error loading progress:', error)
      // Return local progress if available, even if sync fails
      const localKey = `progress_${examAttemptId}`
      return cacheService.get(localKey)
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

    return data
  },

  /**
   * Merge progress in background (non-blocking)
   */
  async mergeProgressInBackground(examAttemptId, userId, localProgress) {
    try {
      const supabaseProgress = await this.fetchProgressFromSupabase(examAttemptId, userId)
      
      if (!supabaseProgress) {
        // No remote progress - sync local to Supabase
        syncService.add('progress', localProgress)
        return
      }

      // Compare timestamps and use latest
      const merged = this.resolveConflict(localProgress, supabaseProgress)
      
      if (merged.source === 'supabase') {
        // Supabase is newer - update local
        console.log('📥 Using newer progress from Supabase')
        const localKey = `progress_${examAttemptId}`
        cacheService.set(localKey, merged.data, 60 * 60 * 1000)
        await indexedDBService.setExamAttempt(merged.data)
      } else {
        // Local is newer - sync to Supabase
        console.log('📤 Syncing newer local progress to Supabase')
        syncService.add('progress', localProgress)
      }
      
    } catch (error) {
      console.error('Background merge error:', error)
    }
  },

  /**
   * Save progress (local immediate, queue Supabase sync)
   */
  async saveProgress(progress) {
    const attemptId = progress.attemptId || progress.examAttemptId
    
    if (!attemptId) {
      console.error('❌ Cannot save progress: missing attempt ID', progress)
      return
    }
    
    const localKey = `progress_${attemptId}`
    
    // 1. Save to localStorage immediately (instant, < 10ms)
    progress.updatedAt = new Date().toISOString()
    
    // Add 'id' property for IndexedDB (keyPath compatibility)
    const progressWithId = {
      ...progress,
      id: attemptId,
      // Ensure attemptId is always present for sync
      attemptId: attemptId,
      examAttemptId: attemptId
    }
    
    cacheService.set(localKey, progressWithId, 60 * 60 * 1000) // 1 hour cache
    
    // 2. Save to IndexedDB (for persistence)
    await indexedDBService.setExamAttempt(progressWithId)
    
    // 3. Queue background sync to Supabase (debounced)
    this.queueProgressSync(progressWithId)
    
    console.log('✅ Progress saved locally')
  },

  /**
   * Queue progress sync (debounced to avoid too many requests)
   */
  queueProgressSync: (() => {
    let timeout = null
    
    return function(progress) {
      // Clear previous timeout
      if (timeout) clearTimeout(timeout)
      
      // Queue sync after 10 seconds of inactivity
      timeout = setTimeout(() => {
        syncService.add('progress', progress)
      }, 10000)
    }
  })(),

  /**
   * Force immediate sync (e.g., when user completes exam)
   */
  async forceSync(progress) {
    return syncService.add('progress', progress, { priority: 10 })
  },

  /**
   * Resolve conflict between local and remote progress
   * Rule: Latest timestamp wins
   */
  resolveConflict(local, remote) {
    const localTime = new Date(local.updatedAt || local.updated_at || 0)
    const remoteTime = new Date(remote.updatedAt || remote.updated_at || remote.last_synced_at || 0)
    
    if (remoteTime > localTime) {
      // Remote is newer
      console.log('🔄 Conflict: Remote is newer', {
        local: localTime.toISOString(),
        remote: remoteTime.toISOString()
      })
      return { data: remote, source: 'supabase' }
    } else {
      // Local is newer or equal
      console.log('🔄 Conflict: Local is newer or equal', {
        local: localTime.toISOString(),
        remote: remoteTime.toISOString()
      })
      return { data: local, source: 'local' }
    }
  },

  /**
   * Delete progress (local and queue Supabase delete)
   */
  async deleteProgress(examAttemptId) {
    const localKey = `progress_${examAttemptId}`
    
    // Remove from cache
    cacheService.remove(localKey)
    
    // Remove from IndexedDB
    await indexedDBService.deleteExamAttempt(examAttemptId)
    
    console.log('🗑️ Progress deleted locally')
  },

  /**
   * Get all progress items for a user
   */
  async getAllProgress(userId) {
    return indexedDBService.getExamAttemptsByUser(userId)
  }
}

export default progressService

