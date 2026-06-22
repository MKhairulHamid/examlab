/**
 * Redeem Promo Page - Users enter a shared promo code to unlock an exam for a
 * limited time. The page is public, but redemption requires sign-in (enforced
 * both here and by the redeem_promo_code RPC). A typed code is preserved across
 * the sign-in step.
 */

import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardHeader from '../components/layout/DashboardHeader'
import AuthModal from '../components/auth/AuthModal'
import useAuthStore from '../stores/authStore'
import usePurchaseStore from '../stores/purchaseStore'
import { redeemCode } from '../services/promoService'

const PANEL = {
  background: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px)',
  padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)',
  borderRadius: '1rem',
  border: '1px solid rgba(255,255,255,0.2)',
}

function RedeemPromo() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { fetchPromoAccess } = usePurchaseStore()

  const [code, setCode] = useState(searchParams.get('code') || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null) // { exam_slug, exam_name, duration_days }
  const [showAuth, setShowAuth] = useState(false)

  // Close the auth modal automatically once the user is signed in.
  useEffect(() => {
    if (user) setShowAuth(false)
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!code.trim()) {
      setError('Please enter a code.')
      return
    }
    if (!user) {
      setShowAuth(true)
      return
    }

    setSubmitting(true)
    try {
      const res = await redeemCode(code)
      if (!res.success) {
        setError(res.error || 'That code could not be redeemed.')
        return
      }
      // Refresh the access gate so the unlocked exam is immediately usable.
      await fetchPromoAccess(user.id)
      setResult(res)
    } finally {
      setSubmitting(false)
    }
  }

  const durationLabel = (days) => {
    if (Number(days) === 1) return '1 day'
    if (Number(days) === 7) return '1 week'
    if (Number(days) === 30) return '1 month'
    return `${days} days`
  }

  return (
    <>
      <DashboardHeader />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)', padding: '3rem 0' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <div style={PANEL}>
            {result ? (
              <>
                <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
                  Code Redeemed
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.0625rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                  You've unlocked <strong style={{ color: '#00D4AA' }}>{result.exam_name}</strong>
                  {result.duration_days ? ` for ${durationLabel(result.duration_days)}.` : '.'}
                </p>
                {result.alreadyRedeemed && (
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    You had already redeemed this code — your existing access still applies.
                  </p>
                )}
                <button
                  onClick={() => navigate('/dashboard?tab=practice')}
                  style={primaryBtn}
                >
                  Start Practicing →
                </button>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>
                  Redeem a Promo Code
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                  Enter the code a friend shared with you to unlock full practice access to an exam.
                </p>

                <form onSubmit={handleSubmit}>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. UNIFRIENDS-7K2D"
                    autoCapitalize="characters"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      fontSize: '1.0625rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.25)',
                      background: 'rgba(255,255,255,0.08)',
                      color: 'white',
                      marginBottom: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />

                  {error && (
                    <p style={{ color: '#ff8c8c', fontSize: '0.9375rem', marginBottom: '1rem' }}>{error}</p>
                  )}

                  <button type="submit" disabled={submitting} style={{ ...primaryBtn, width: '100%', opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? 'Redeeming...' : user ? 'Redeem Code' : 'Sign In & Redeem'}
                  </button>
                </form>

                {!user && (
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginTop: '1.25rem' }}>
                    You'll need to sign in (or create a free account) to redeem.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialMode="login" />
    </>
  )
}

const primaryBtn = {
  padding: '0.9375rem 2.25rem',
  background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '0.75rem',
  fontWeight: 700,
  fontSize: '1.0625rem',
  cursor: 'pointer',
  boxShadow: '0 8px 20px rgba(0,212,170,0.3)',
}

export default RedeemPromo
