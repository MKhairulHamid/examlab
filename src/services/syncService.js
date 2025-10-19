/**
 * Sync Service - Background synchronization with Supabase
 * Manages a queue of pending syncs and retries failed operations
 */

import supabase from './supabase'

class SyncQueue {
  constructor() {
    this.queue = []
    this.isProcessing = false
    this.listeners = []
    this.retryDelay = 5000 // 5 seconds
    this.maxRetries = 3
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.onOnline())
    window.addEventListener('offline', () => this.onOffline())
  }

  /**
   * Add item to sync queue
   */
  add(type, data, options = {}) {
    const item = {
      id: `${type}_${Date.now()}_${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: options.maxRetries || this.maxRetries,
      priority: options.priority || 0 // Higher priority = processed first
    }
    
    this.queue.push(item)
    this.queue.sort((a, b) => b.priority - a.priority)
    
    this.notifyListeners({ action: 'added', item })
    
    // Start processing if online
    if (navigator.onLine) {
      this.process()
    }
    
    return item.id
  }

  /**
   * Process sync queue
   */
  async process() {
    if (this.isProcessing || !navigator.onLine || this.queue.length === 0) {
      return
    }

    this.isProcessing = true
    this.notifyListeners({ action: 'processing' })

    while (this.queue.length > 0 && navigator.onLine) {
      const item = this.queue[0]
      
      try {
        await this.syncItem(item)
        
        // Success - remove from queue
        this.queue.shift()
        this.notifyListeners({ action: 'synced', item })
        
      } catch (error) {
        console.error(`❌ Sync failed: ${item.type}`, error)
        
        item.retries++
        item.lastError = error.message
        
        if (item.retries >= item.maxRetries) {
          // Max retries reached - remove from queue
          console.error(`❌ Max retries reached for: ${item.type}`)
          this.queue.shift()
          this.notifyListeners({ action: 'failed', item, error })
        } else {
          // Retry later - move to end of queue
          this.queue.push(this.queue.shift())
          this.notifyListeners({ action: 'retry', item })
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, this.retryDelay))
        }
      }
    }

    this.isProcessing = false
    this.notifyListeners({ action: 'idle' })
  }

  /**
   * Sync individual item based on type
   */
  async syncItem(item) {
    switch (item.type) {
      case 'progress':
        return this.syncProgress(item.data)
      case 'result':
        return this.syncResult(item.data)
      case 'profile':
        return this.syncProfile(item.data)
      default:
        throw new Error(`Unknown sync type: ${item.type}`)
    }
  }

  /**
   * Sync exam progress to Supabase
   */
  async syncProgress(data) {
    // Support both attemptId and examAttemptId naming conventions
    const attemptId = data.attemptId || data.examAttemptId
    
    if (!attemptId) {
      throw new Error('Missing attempt ID in progress data')
    }
    
    const { data: result, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: data.userId,
        exam_attempt_id: attemptId,
        current_question_number: data.currentQuestionIndex || data.currentQuestionNumber || 0,
        current_answers_json: data.answers || {},
        time_elapsed_seconds: data.timeElapsed || 0,
        timer_paused: data.timerPaused || false,
        last_synced_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,exam_attempt_id'
      })

    if (error) throw error
    return result
  }

  /**
   * Sync exam result to Supabase
   */
  async syncResult(data) {
    // Ensure we have a valid UUID for the result ID
    const resultId = data.id || crypto.randomUUID()
    
    const resultData = {
      id: resultId,
      user_id: data.userId,
      question_set_id: data.questionSetId,
      started_at: data.startedAt,
      completed_at: data.completedAt,
      time_spent_seconds: data.timeSpent || 0,
      answers_json: data.answers || {},
      raw_score: data.rawScore || 0,
      percentage_score: data.percentageScore || 0,
      scaled_score: data.scaledScore || 0,
      passed: data.passed || false,
      status: 'completed',
      updated_at: new Date().toISOString()
    }

    const { data: result, error } = await supabase
      .from('exam_attempts')
      .upsert(resultData)

    if (error) {
      console.error('❌ Failed to sync exam result:', error)
      throw error
    }

    return result
  }

  /**
   * Sync user profile to Supabase
   */
  async syncProfile(data) {
    const { data: result, error } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.userId)

    if (error) throw error
    return result
  }

  /**
   * Handle online event
   */
  onOnline() {
    this.notifyListeners({ action: 'online' })
    this.process()
  }

  /**
   * Handle offline event
   */
  onOffline() {
    this.notifyListeners({ action: 'offline' })
  }

  /**
   * Add listener for sync events
   */
  addListener(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Listener error:', error)
      }
    })
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      queueLength: this.queue.length,
      isOnline: navigator.onLine,
      items: this.queue.map(item => ({
        type: item.type,
        timestamp: item.timestamp,
        retries: item.retries
      }))
    }
  }

  /**
   * Clear queue
   */
  clear() {
    this.queue = []
    this.notifyListeners({ action: 'cleared' })
  }
}

// Export singleton instance
export const syncService = new SyncQueue()

export default syncService

