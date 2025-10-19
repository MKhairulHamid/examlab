/**
 * Payment Success Page - Confirmation page after successful payment
 */

import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardHeader from '../components/layout/DashboardHeader'
import useAuthStore from '../stores/authStore'
import usePurchaseStore from '../stores/purchaseStore'

function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { fetchPurchases } = usePurchaseStore()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      verifyPayment()
    }
  }, [user])

  const verifyPayment = async () => {
    try {
      // Get session ID from URL
      const sessionId = searchParams.get('session_id')
      
      if (sessionId) {
        // Refresh purchases to get the new purchase
        await fetchPurchases(user.id)
        setSuccess(true)
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    navigate('/dashboard')
  }

  return (
    <>
      <DashboardHeader />
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
        padding: '3rem 0'
      }}>
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          padding: '0 1rem',
          textAlign: 'center'
        }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          padding: '3rem 2rem',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {loading ? (
            <>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>
                Processing Payment...
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>
                Please wait while we confirm your purchase.
              </p>
            </>
          ) : success ? (
            <>
              <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>✅</div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>
                Payment Successful!
              </h1>
              <p style={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontSize: '1.125rem',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}>
                Thank you for your purchase! You now have instant access to your question sets.
              </p>

              <div style={{
                background: 'rgba(0,212,170,0.15)',
                border: '1px solid rgba(0,212,170,0.3)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                <h3 style={{ 
                  color: '#00D4AA', 
                  fontSize: '1rem', 
                  fontWeight: '600',
                  marginBottom: '1rem'
                }}>
                  ✨ What's Next?
                </h3>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0,
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.875rem'
                }}>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start' }}>
                    <span style={{ marginRight: '0.75rem' }}>📚</span>
                    <span>Your question sets are now available in your dashboard</span>
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start' }}>
                    <span style={{ marginRight: '0.75rem' }}>⚡</span>
                    <span>Start practicing immediately - no waiting required</span>
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start' }}>
                    <span style={{ marginRight: '0.75rem' }}>🔄</span>
                    <span>Access your purchases from any device, anytime</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'start' }}>
                    <span style={{ marginRight: '0.75rem' }}>📧</span>
                    <span>Receipt sent to your email</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleContinue}
                style={{
                  padding: '1rem 2.5rem',
                  background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: '700',
                  fontSize: '1.125rem',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(0,212,170,0.3)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,212,170,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,212,170,0.3)'
                }}
              >
                Go to Dashboard →
              </button>

              <div style={{
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}>
                <p style={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem'
                }}>
                  Need help?
                </p>
                <a 
                  href="mailto:support@cloudexamlab.com"
                  style={{
                    color: '#00D4AA',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Contact Support
                </a>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>
                Payment Verification Failed
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: '2rem' }}>
                We couldn't verify your payment. Please check your email for confirmation or contact support.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding: '1rem 2rem',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Back to Dashboard
              </button>
            </>
          )}
        </div>

        {/* Trust Indicators */}
        <div style={{ 
          display: 'flex', 
          gap: '2rem', 
          justifyContent: 'center', 
          marginTop: '2rem',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🔒</span> Secure Payment
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>💳</span> Powered by Stripe
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📧</span> Receipt Emailed
          </div>
        </div>
        </div>
      </div>
    </>
  )
}

export default PaymentSuccess

