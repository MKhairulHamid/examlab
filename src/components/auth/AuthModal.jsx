import React, { useState } from 'react'
import { Modal, ModalHeader } from '../../design-system'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode)

  // Sync mode when initialMode changes (e.g. opened from different CTAs)
  React.useEffect(() => { if (isOpen) setMode(initialMode) }, [isOpen, initialMode])

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <ModalHeader
        title={mode === 'login' ? 'Welcome Back' : 'Create Account'}
        description={mode === 'login'
          ? 'Login to access exam practice tests'
          : 'Sign up to start practicing for free'}
        onClose={onClose}
      />

      <div className="px-6 py-5">
        {mode === 'login' ? (
          <LoginForm onSuccess={onClose} />
        ) : (
          <SignupForm onSuccess={onClose} />
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-[#00A884] font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-[#00A884] font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default AuthModal
