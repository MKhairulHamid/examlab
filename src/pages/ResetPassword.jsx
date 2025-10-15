import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword } = useAuthStore()
  
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validToken, setValidToken] = useState(false)

  useEffect(() => {
    // Check for recovery token in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')
    
    if (type === 'recovery' && accessToken) {
      setValidToken(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    
    const result = await updatePassword(newPassword)
    
    setLoading(false)
    
    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } else {
      setError(result.error || 'Failed to reset password')
    }
  }

  if (!validToken) {
    return (
      <div className="loading-container">
        <div className="modal-content text-center">
          <div className="success-icon">⚠️</div>
          <h1 className="modal-title mb-4">Invalid Reset Link</h1>
          <p className="text-muted mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <button
            onClick={() => navigate('/')}
            className="form-button"
          >
            Go to Login Page
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="loading-container">
        <div className="modal-content text-center animate-slideUp">
          <div className="success-icon">✅</div>
          <h1 className="modal-title mb-4">Password Reset Successful!</h1>
          <p className="text-muted mb-6">
            Your password has been reset successfully. Redirecting to login page...
          </p>
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="loading-container">
      <div className="modal-content animate-slideUp">
        <div className="text-center mb-8">
          <div className="success-icon">🔐</div>
          <h1 className="modal-title mb-2">Reset Your Password</h1>
          <p className="text-muted">Enter your new password below</p>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={6}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={6}
              className="form-input"
            />
          </div>

          <div className="form-hint">
            <ul>
              <li>• At least 6 characters long</li>
              <li>• Use a mix of letters, numbers, and symbols</li>
              <li>• Avoid common words or patterns</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="form-button"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="link-button"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
