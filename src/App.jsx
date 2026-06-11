import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './stores/authStore'
import useSyncStore from './stores/syncStore'
import InstallPrompt from './components/pwa/InstallPrompt'
import OfflineBanner from './components/pwa/OfflineBanner'
import UpdatePrompt from './components/pwa/UpdatePrompt'
import ErrorBoundary from './components/pwa/ErrorBoundary'

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
const RedeemPromo = lazy(() => import('./pages/RedeemPromo'))

// Protected Route wrapper — by the time this renders, auth loading is already done
function ProtectedRoute({ children }) {
  const { user } = useAuthStore()

  // Handle magic link / OAuth callback tokens still in the hash
  const hasAuthTokens = window.location.hash.includes('access_token') ||
    window.location.hash.includes('refresh_token')

  if (hasAuthTokens) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Signing you in...</p>
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
  const { loading: authLoading } = useAuthStore()
  const initializeAuth = useAuthStore(state => state.initialize)
  const initializeSync = useSyncStore(state => state.initialize)

  useEffect(() => {
    initializeAuth()
    const unsubscribe = initializeSync()

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [initializeAuth, initializeSync])

  // Wait for auth check before rendering routes — prevents the Landing page
  // flashing briefly for logged-in users before the redirect fires.
  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <OfflineBanner />
      <InstallPrompt />
      <UpdatePrompt />
      <ErrorBoundary>
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
        {/* Public so logged-out visitors land here; sign-in happens in-page. */}
        <Route path="/redeem" element={<RedeemPromo />} />

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
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App

