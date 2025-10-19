/**
 * Sync Store - Track synchronization status
 */

import { create } from 'zustand'
import syncService from '../services/syncService'

export const useSyncStore = create((set, get) => ({
  // State
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSyncTime: null,
  pendingCount: 0,
  syncStatus: 'idle', // 'idle', 'syncing', 'synced', 'error'
  syncError: null,

  // Actions

  /**
   * Initialize sync monitoring
   */
  initialize: () => {
    // Listen to sync service events
    const unsubscribe = syncService.addListener((event) => {
      get().handleSyncEvent(event)
    })

    // Listen to online/offline events
    window.addEventListener('online', () => {
      set({ isOnline: true })
    })

    window.addEventListener('offline', () => {
      set({ isOnline: false })
    })

    // Get initial status
    const status = syncService.getStatus()
    set({
      isOnline: status.isOnline,
      isSyncing: status.isProcessing,
      pendingCount: status.queueLength
    })

    // Return cleanup function
    return unsubscribe
  },

  /**
   * Handle sync service events
   */
  handleSyncEvent: (event) => {
    switch (event.action) {
      case 'added':
        set({
          pendingCount: get().pendingCount + 1
        })
        break

      case 'processing':
        set({
          isSyncing: true,
          syncStatus: 'syncing'
        })
        break

      case 'synced':
        set({
          pendingCount: Math.max(0, get().pendingCount - 1),
          lastSyncTime: new Date().toISOString(),
          syncStatus: 'synced',
          syncError: null
        })
        break

      case 'failed':
        set({
          pendingCount: Math.max(0, get().pendingCount - 1),
          syncStatus: 'error',
          syncError: event.error?.message || 'Sync failed'
        })
        break

      case 'idle':
        set({
          isSyncing: false,
          syncStatus: get().pendingCount > 0 ? 'pending' : 'synced'
        })
        break

      case 'online':
        set({
          isOnline: true
        })
        break

      case 'offline':
        set({
          isOnline: false,
          syncStatus: 'offline'
        })
        break

      case 'cleared':
        set({
          pendingCount: 0,
          syncStatus: 'idle'
        })
        break

      default:
        break
    }
  },

  /**
   * Get sync status details
   */
  getSyncDetails: () => {
    return syncService.getStatus()
  },

  /**
   * Clear sync error
   */
  clearSyncError: () => {
    set({ syncError: null })
  },

  /**
   * Get sync status text for display
   */
  getSyncStatusText: () => {
    const { isOnline, isSyncing, pendingCount, syncStatus } = get()

    if (!isOnline) {
      return 'Offline'
    }

    if (isSyncing) {
      return 'Syncing...'
    }

    if (pendingCount > 0) {
      return `${pendingCount} item${pendingCount > 1 ? 's' : ''} pending`
    }

    if (syncStatus === 'synced') {
      return 'All synced'
    }

    if (syncStatus === 'error') {
      return 'Sync error'
    }

    return 'Synced'
  },

  /**
   * Get sync status color for UI
   */
  getSyncStatusColor: () => {
    const { isOnline, syncStatus } = get()

    if (!isOnline) return 'gray'
    if (syncStatus === 'error') return 'red'
    if (syncStatus === 'syncing') return 'yellow'
    if (syncStatus === 'synced') return 'green'
    return 'gray'
  }
}))

export default useSyncStore

