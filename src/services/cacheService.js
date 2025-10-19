/**
 * Cache Service - LocalStorage wrapper with expiry and versioning
 * Used for quick access to small data (profiles, progress metadata, etc.)
 */

import { STORAGE_PREFIX } from '../utils/constants.js'

const CACHE_PREFIX = `${STORAGE_PREFIX}cache_`

export const cacheService = {
  /**
   * Set cache with expiry time
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} expiryMs - Expiry time in milliseconds (default: 24 hours)
   */
  set(key, data, expiryMs = 24 * 60 * 60 * 1000) {
    const item = {
      data,
      timestamp: Date.now(),
      expiry: expiryMs,
      version: 1
    }
    
    try {
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item))
      return true
    } catch (error) {
      console.warn('Cache storage failed:', error)
      return false
    }
  },

  /**
   * Get cache if not expired
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null if expired/not found
   */
  get(key) {
    try {
      const item = localStorage.getItem(`${CACHE_PREFIX}${key}`)
      if (!item) return null
      
      const cached = JSON.parse(item)
      const now = Date.now()
      const age = now - cached.timestamp
      
      // Check if expired
      if (age > cached.expiry) {
        this.remove(key)
        return null
      }
      
      return cached.data
    } catch (error) {
      console.warn('Cache retrieval failed:', error)
      return null
    }
  },

  /**
   * Remove specific cache
   * @param {string} key - Cache key
   */
  remove(key) {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`)
  },

  /**
   * Clear all caches
   */
  clearAll() {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  },

  /**
   * Get cache age in minutes
   * @param {string} key - Cache key
   * @returns {number|null} Age in minutes or null if not found
   */
  getAge(key) {
    try {
      const item = localStorage.getItem(`${CACHE_PREFIX}${key}`)
      if (!item) return null
      
      const cached = JSON.parse(item)
      const age = Date.now() - cached.timestamp
      return Math.floor(age / 1000 / 60)
    } catch (error) {
      return null
    }
  },

  /**
   * Check if cache exists and is valid
   * @param {string} key - Cache key
   * @returns {boolean} True if cache exists and is not expired
   */
  has(key) {
    return this.get(key) !== null
  },

  /**
   * Update cache timestamp without changing data
   * @param {string} key - Cache key
   */
  touch(key) {
    const data = this.get(key)
    if (data) {
      this.set(key, data)
    }
  }
}

export default cacheService

