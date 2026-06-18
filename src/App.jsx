import React, { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAuthStore from './stores/authStore'
import useSyncStore from './stores/syncStore'
import InstallPrompt from './components/pwa/InstallPrompt'
import OfflineBanner from './components/pwa/OfflineBanner'
import UpdatePrompt from './components/pwa/UpdatePrompt'
import ErrorBoundary from './components/pwa/ErrorBoundary'
import AdminNotesWidget from './components/admin/AdminNotesWidget'

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
const ProgramLanding = lazy(() => import('./pages/ProgramLanding'))
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))

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

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
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
      <ScrollToTop />
      <OfflineBanner />
      <InstallPrompt />
      <UpdatePrompt />
      <AdminNotesWidget />
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
        {/* Public credential verification — /verify/<programSlug>?id=<code>. The
            program slug in the path lets crawlers fetch a program-correct
            prerendered OG card (see vite.config.js). Declared before /:code so the
            literal "verify" segment isn't swallowed by the program-code route. */}
        <Route path="/verify/:programSlug" element={<VerifyCertificate />} />
        {/* Articles / blog — public. Declared before /:code so the literal "blog"
            segment isn't swallowed by the program-code route. */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

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

        {/* Per-program marketing pages — e.g. /CLF-C02. Static routes above win;
            this only catches single-segment paths and validates against the catalog. */}
        <Route path="/:code" element={<ProgramLanding />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App

