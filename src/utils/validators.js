/**
 * Form validation utilities
 */

/**
 * Validate email address
 */
export function validateEmail(email) {
  if (!email) {
    return { valid: false, message: 'Email is required' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' }
  }
  
  return { valid: true }
}

/**
 * Validate password
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, message: 'Password is required' }
  }
  
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' }
  }
  
  return { valid: true }
}

/**
 * Validate password match
 */
export function validatePasswordMatch(password, confirmPassword) {
  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match' }
  }
  
  return { valid: true }
}

export default {
  validateEmail,
  validatePassword,
  validatePasswordMatch
}

