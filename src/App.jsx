import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './stores/authStore'
import useSyncStore from './stores/syncStore'

// Pages (will be created)
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ExamDetail from './pages/ExamDetail'
import ExamInterface from './pages/ExamInterface'
import ExamResults from './pages/ExamResults'
import ResetPassword from './pages/ResetPassword'
import PaymentSuccess from './pages/PaymentSuccess'
import StudyMaterial from './pages/StudyMaterial'

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()

  // Check if URL contains auth tokens (from magic link or OAuth callback)
  const hasAuthTokens = window.location.hash.includes('access_token') ||
    window.location.hash.includes('refresh_token')

  // If we're still loading OR processing auth tokens, show loading state
  if (loading || hasAuthTokens) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>{hasAuthTokens ? 'Signing you in...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  const initializeAuth = useAuthStore(state => state.initialize)
  const initializeSync = useSyncStore(state => state.initialize)

  useEffect(() => {
    // Initialize auth state
    initializeAuth()

    // Initialize sync monitoring
    const unsubscribe = initializeSync()

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          // Service worker registered successfully
        })
        .catch(error => {
          // Service worker registration failed
        })
    }

    // Cleanup
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [initializeAuth, initializeSync])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam/:slug"
          element={
            <ProtectedRoute>
              <ExamDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam/:slug/take"
          element={
            <ProtectedRoute>
              <ExamInterface />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam/:slug/results"
          element={
            <ProtectedRoute>
              <ExamResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-success"
          element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam/:slug/study"
          element={
            <ProtectedRoute>
              <StudyMaterial />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

