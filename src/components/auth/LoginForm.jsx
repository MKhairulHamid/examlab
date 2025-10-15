import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import { validateEmail, validatePassword } from '../../utils/validators'

function LoginForm({ onSuccess }) {
  const navigate = useNavigate()
  const { login, resetPassword, sendMagicLink } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLinkLoading, setMagicLinkLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [userCountry, setUserCountry] = useState(null)

  // Detect user country on mount
  useEffect(() => {
    detectUserCountry()
  }, [])

  const detectUserCountry = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      setUserCountry({
        country: data.country_name || 'Unknown',
        country_code: data.country_code || 'XX',
        city: data.city || 'Unknown',
        timezone: data.timezone || 'Unknown'
      })
    } catch (error) {
      console.warn('Could not detect country:', error)
      setUserCountry({
        country: 'Unknown',
        country_code: 'XX',
        city: 'Unknown',
        timezone: 'Unknown'
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError(emailValidation.message)
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      setError(passwordValidation.message)
      return
    }

    setLoading(true)

    const result = await login(email, password)

    setLoading(false)

    if (result.success) {
      onSuccess()
      navigate('/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }
  }

  const handleMagicLink = async () => {
    setError('')

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError('Please enter your email address first')
      return
    }

    setMagicLinkLoading(true)

    const result = await sendMagicLink(email, userCountry)

    setMagicLinkLoading(false)

    if (result.success) {
      setMagicLinkSent(true)
      setTimeout(() => {
        onSuccess()
      }, 3000)
    } else {
      setError(result.error || 'Failed to send magic link')
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    const result = await resetPassword(email)

    setLoading(false)

    if (result.success) {
      setResetSent(true)
    } else {
      setError(result.error || 'Failed to send reset email')
    }
  }

  if (magicLinkSent) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-4">✨</div>
        <h3 className="text-lg font-semibold text-primary mb-2">Magic Link Sent!</h3>
        <p className="text-gray-600 text-sm mb-4">
          Check your email at <strong>{email}</strong> for a magic link to sign in. The link will expire in 1 hour.
        </p>
        <p className="text-gray-500 text-xs">
          Closing in 3 seconds...
        </p>
      </div>
    )
  }

  if (resetSent) {
    return (
      <div className="text-center py-6">
        <div className="success-icon">✉️</div>
        <h3 className="text-lg font-semibold text-primary mb-2">Check Your Email</h3>
        <p className="text-muted text-sm mb-4">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <button
          onClick={() => {
            setResetSent(false)
            setShowForgotPassword(false)
          }}
          className="link-button text-sm font-semibold"
        >
          ← Back to Login
        </button>
      </div>
    )
  }

  if (showForgotPassword) {
    return (
      <form onSubmit={handleForgotPassword}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-primary mb-2">Reset Password</h3>
          <p className="text-muted text-sm mb-4">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="form-input"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="form-button"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <button
          type="button"
          onClick={() => {
            setShowForgotPassword(false)
            setError('')
          }}
          className="w-full mt-3 text-muted text-sm"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ← Back to Login
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          className="form-input"
        />
      </div>

      <div className="text-right mb-4">
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="link-button text-sm font-semibold"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-gradient-accent text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-gray-500 text-sm">or</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* Magic Link Button */}
      <button
        type="button"
        onClick={handleMagicLink}
        disabled={magicLinkLoading}
        className="w-full px-6 py-3 bg-white text-primary border-2 border-gray-200 rounded-xl font-semibold hover:border-accent hover:bg-green-50 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span className="text-xl">✨</span>
        <span>{magicLinkLoading ? 'Sending...' : 'Send Magic Link to Email'}</span>
      </button>
    </form>
  )
}

export default LoginForm
