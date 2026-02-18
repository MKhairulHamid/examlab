/**
 * Enrollment Modal - Subscribe to access all exams
 * Shows 3 subscription plans: Monthly $5, Quarterly $10, Annual $30
 */

import React, { useState, useEffect } from 'react'
import useAuthStore from '../../stores/authStore'
import usePurchaseStore from '../../stores/purchaseStore'

const PLAN_DETAILS = {
  monthly: {
    icon: '📅',
    label: 'Monthly',
    description: 'Per month \u2022 Billed monthly',
    features: ['All practice questions', 'Unlimited practice', 'Cancel anytime'],
  },
  quarterly: {
    icon: '📆',
    label: 'Quarterly',
    description: '3 months \u2022 Save $5',
    features: ['All practice questions', 'Unlimited practice', 'Cancel anytime'],
  },
  annual: {
    icon: '🎓',
    label: 'Annual',
    description: '12 months \u2022 Save $30',
    badge: 'BEST VALUE',
    features: ['All practice questions', 'Unlimited practice', 'Cancel anytime'],
  },
}

const EnrollmentModal = ({ isOpen, onClose }) => {
  const { user } = useAuthStore()
  const { subscriptionPlans, fetchSubscriptionPlans, createSubscription, checkoutLoading, isSubscribed } = usePurchaseStore()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadPlans()
    }
  }, [isOpen])

  const loadPlans = async () => {
    setLoading(true)
    await fetchSubscriptionPlans()
    setLoading(false)
  }

  const handleSubscribe = async () => {
    if (!selectedPlan || !user) return

    const result = await createSubscription(selectedPlan.slug, user.id, user.email)

    if (result?.mock) {
      alert('Mock subscription activated! You now have full access.')
      onClose()
    }
  }

  if (!isOpen) return null

  if (isSubscribed) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
            borderRadius: '1rem',
            maxWidth: '500px',
            width: '100%',
            padding: '3rem 2rem',
            textAlign: 'center',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
              fontSize: '1.5rem', width: '2.5rem', height: '2.5rem',
              borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
            You're Already Enrolled!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: '2rem' }}>
            You have an active subscription with full access to all exams.
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
              color: 'white', border: 'none', borderRadius: '0.75rem',
              fontWeight: '700', fontSize: '1.125rem', cursor: 'pointer',
            }}
          >
            Continue Learning
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
          borderRadius: '1rem',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: 'clamp(1.25rem, 4vw, 2rem)', paddingRight: '3.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '0.75rem', right: '0.75rem',
              background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
              fontSize: '1.25rem', width: '2.25rem', height: '2.25rem',
              borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>
          <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
            Subscribe to Cloud Exam Lab
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(0.8125rem, 2.5vw, 1rem)' }}>
            Unlimited access to all practice questions \u2022 Study at your own pace \u2022 Cancel anytime
          </p>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <div>Loading plans...</div>
          </div>
        ) : (
          <div style={{ padding: 'clamp(1rem, 4vw, 2rem)' }}>
            {/* Plan Cards */}
            <div style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              marginBottom: '2rem',
            }}>
              {(subscriptionPlans.length > 0 ? subscriptionPlans : [
                { slug: 'monthly', price_cents: 500 },
                { slug: 'quarterly', price_cents: 1000 },
                { slug: 'annual', price_cents: 3000 },
              ]).map((plan) => {
                const details = PLAN_DETAILS[plan.slug] || {}
                const isSelected = selectedPlan?.slug === plan.slug
                const price = (plan.price_cents / 100).toFixed(0)

                return (
                  <div
                    key={plan.slug}
                    onClick={() => setSelectedPlan(plan)}
                    style={{
                      background: isSelected
                        ? 'rgba(0,212,170,0.2)'
                        : 'rgba(255,255,255,0.1)',
                      border: isSelected
                        ? '2px solid #00D4AA'
                        : plan.slug === 'annual'
                          ? '2px solid rgba(0,212,170,0.5)'
                          : '2px solid rgba(255,255,255,0.2)',
                      borderRadius: '1rem',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      position: 'relative',
                    }}
                  >
                    {details.badge && (
                      <div style={{
                        position: 'absolute', top: '-12px', left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#00D4AA', color: 'white',
                        padding: '0.25rem 1rem', borderRadius: '1rem',
                        fontSize: '0.75rem', fontWeight: '600',
                      }}>
                        {details.badge}
                      </div>
                    )}

                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>
                      {details.icon || '📦'}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem', textAlign: 'center' }}>
                      {details.label || plan.slug}
                    </h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#00D4AA', marginBottom: '0.5rem', textAlign: 'center' }}>
                      ${price}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
                      {details.description || ''}
                    </p>

                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1rem' }}>
                      {(details.features || []).map((feature, i) => (
                        <li key={i} style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                          <span style={{ marginRight: '0.5rem' }}>✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            {/* What you get */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem',
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                ✨ What's Included
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '0.75rem' }}>
                {[
                  'All certification exams',
                  'Full question explanations',
                  'Progress tracking',
                  'Study streaks',
                  'New exams as they launch',
                  'Cancel anytime',
                ].map((item, i) => (
                  <div key={i} style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem', color: '#00D4AA' }}>✓</span> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '0.875rem 1.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  flex: '1 1 auto',
                  minWidth: '120px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubscribe}
                disabled={!selectedPlan || checkoutLoading}
                style={{
                  padding: '0.875rem 1.5rem',
                  background: selectedPlan && !checkoutLoading
                    ? 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)'
                    : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  cursor: selectedPlan && !checkoutLoading ? 'pointer' : 'not-allowed',
                  fontSize: '0.9375rem',
                  opacity: selectedPlan && !checkoutLoading ? 1 : 0.5,
                  flex: '1 1 auto',
                  minWidth: '160px'
                }}
              >
                {checkoutLoading
                  ? 'Redirecting to PayPal...'
                  : selectedPlan
                    ? `Subscribe - $${(selectedPlan.price_cents / 100).toFixed(0)}/${selectedPlan.slug === 'monthly' ? 'mo' : selectedPlan.slug === 'quarterly' ? 'quarter' : 'year'}`
                    : 'Select a Plan'}
              </button>
            </div>

            {/* Development Notice */}
            {import.meta.env.DEV && (
              <div style={{
                marginTop: '1.5rem', padding: '1rem',
                background: 'rgba(251,191,36,0.15)',
                border: '1px solid rgba(251,191,36,0.3)',
                borderRadius: '0.5rem',
                color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem',
              }}>
                <strong>Development Mode:</strong> Subscriptions are simulated. No real payment will be processed.
              </div>
            )}

            {/* Security Badges */}
            <div style={{
              display: 'flex', gap: '1.5rem', justifyContent: 'center',
              marginTop: '2rem', paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🔒</span> Secure PayPal Checkout
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚡</span> Instant Access
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🔄</span> Cancel Anytime
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnrollmentModal
