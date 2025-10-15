import React, { useState } from 'react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login') // 'login' or 'signup'

  if (!isOpen) return null

  return (
    <div 
      className="modal-overlay"
      onClick={onClose}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="modal-close"
        >
          ×
        </button>

        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="modal-description">
            {mode === 'login' 
              ? 'Login to access exam practice tests' 
              : 'Sign up to start practicing for free'}
          </p>
        </div>

        {/* Form */}
        {mode === 'login' ? (
          <LoginForm onSuccess={onClose} />
        ) : (
          <SignupForm onSuccess={onClose} />
        )}

        {/* Toggle mode */}
        <div className="mt-6 text-center text-sm text-muted">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="link-button"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="link-button"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal
