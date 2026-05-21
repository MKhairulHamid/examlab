import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import { validateEmail, validatePassword } from '../../utils/validators'

function LoginForm({ onSuccess }) {
  const navigate = useNavigate()
  const { login, resetPassword, sendMagicLink, signInWithGoogle } = useAuthStore()
  
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
          className="w-full mt-3 text-gray-500 text-sm bg-transparent border-none cursor-pointer"
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

      {/* Google Button */}
      <button
        type="button"
        onClick={signInWithGoogle}
        className="w-full px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 mb-3"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>Continue with Google</span>
      </button>

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
