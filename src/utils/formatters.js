/**
 * Utility functions for formatting data
 */

/**
 * Format date for display (relative or absolute)
 */
export function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) {
    return 'Just now'
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    })
  }
}

/**
 * Format duration in seconds to readable format (MM:SS or HH:MM:SS)
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '00:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format duration in seconds to human readable text
 */
export function formatDurationText(seconds) {
  if (!seconds) return 'N/A'
  
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  
  if (mins === 0) return `${secs}s`
  if (secs === 0) return `${mins}m`
  return `${mins}m ${secs}s`
}

/**
 * Format score percentage
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return 'N/A'
  return `${parseFloat(value).toFixed(decimals)}%`
}

/**
 * Format price in cents to dollars
 */
export function formatPrice(cents, currency = 'USD') {
  const dollars = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(dollars)
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Convert country code to flag emoji
 */
export function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode === 'XX') return '🌍'
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt())
  
  return String.fromCodePoint(...codePoints)
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Format exam score (scaled to 1000)
 */
export function formatExamScore(score, maxScore = 1000) {
  if (score === null || score === undefined) return 'N/A'
  return `${score}/${maxScore}`
}

/**
 * Get pass/fail status with emoji
 */
export function getPassStatus(passed) {
  return passed ? '✅ Passed' : '❌ Failed'
}

/**
 * Format question count
 */
export function formatQuestionCount(count, total) {
  return `${count} of ${total}`
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value, total) {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100 * 10) / 10
}

/**
 * Format timer display with color class
 */
export function getTimerColorClass(remainingSeconds, totalSeconds) {
  const percentage = remainingSeconds / totalSeconds
  
  if (percentage > 0.25) return 'text-green-500'
  if (percentage > 0.10) return 'text-yellow-500'
  return 'text-red-500'
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export default {
  formatDate,
  formatDuration,
  formatDurationText,
  formatPercentage,
  formatPrice,
  formatNumber,
  getFlagEmoji,
  truncate,
  formatExamScore,
  getPassStatus,
  formatQuestionCount,
  calculatePercentage,
  getTimerColorClass,
  formatFileSize
}

