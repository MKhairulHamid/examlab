import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './stores/authStore'
import useSyncStore from './stores/syncStore'
import InstallPrompt from './components/pwa/InstallPrompt'
import OfflineBanner from './components/pwa/OfflineBanner'
import UpdatePrompt from './components/pwa/UpdatePrompt'

const Landing = lazy(() => import('./pages/Landing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ExamDetail = lazy(() => import('./pages/ExamDetail'))
const ExamInterface = lazy(() => import('./pages/ExamInterface'))
const ExamResults = lazy(() => import('./pages/ExamResults'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'))
const StudyMaterial = lazy(() => import('./pages/StudyMaterial'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const AwsAiPractitioner = lazy(() => import('./pages/AwsAiPractitioner'))

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
      <OfflineBanner />
      <InstallPrompt />
      <UpdatePrompt />
      <Suspense fallback={
        <div className="loading-container">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      }>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/aws-ai-practitioner" element={<AwsAiPractitioner />} />
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

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App

