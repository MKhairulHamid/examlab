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

/**
 * Validate required field
 */
export function validateRequired(value, fieldName = 'Field') {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `${fieldName} is required` }
  }
  
  return { valid: true }
}

/**
 * Validate name
 */
export function validateName(name) {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Name is required' }
  }
  
  if (name.trim().length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters long' }
  }
  
  if (name.length > 50) {
    return { valid: false, message: 'Name must be less than 50 characters' }
  }
  
  return { valid: true }
}

/**
 * Validate number range
 */
export function validateRange(value, min, max, fieldName = 'Value') {
  const num = Number(value)
  
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a number` }
  }
  
  if (num < min || num > max) {
    return { valid: false, message: `${fieldName} must be between ${min} and ${max}` }
  }
  
  return { valid: true }
}

/**
 * Validate form with multiple fields
 */
export function validateForm(fields) {
  const errors = {}
  let isValid = true
  
  for (const [fieldName, validator] of Object.entries(fields)) {
    const result = validator()
    if (!result.valid) {
      errors[fieldName] = result.message
      isValid = false
    }
  }
  
  return { isValid, errors }
}

export default {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
  validateName,
  validateRange,
  validateForm
}

