/**
 * Purchase Modal - Component for selecting and purchasing question sets or packages
 */

import React, { useState, useEffect } from 'react'
import useAuthStore from '../../stores/authStore'
import useExamStore from '../../stores/examStore'
import usePurchaseStore from '../../stores/purchaseStore'

const PurchaseModal = ({ isOpen, onClose, examTypeId, examName }) => {
  const { user } = useAuthStore()
  const { packages, fetchPackages } = useExamStore()
  const { processCheckout, checkoutLoading, mockPurchase } = usePurchaseStore()
  const [questionSets, setQuestionSets] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && examTypeId) {
      loadData()
    }
  }, [isOpen, examTypeId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Fetch packages and question sets
      const packagesData = await fetchPackages(examTypeId)
      
      // Fetch question sets for this exam
      const { fetchQuestionSets } = useExamStore.getState()
      const sets = await fetchQuestionSets(examTypeId)
      setQuestionSets(sets || [])
    } catch (error) {
      console.error('Error loading purchase data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!selectedOption || !user) return

    const isDevelopment = import.meta.env.DEV

    if (isDevelopment) {
      // Use mock purchase in development
      const result = await mockPurchase(
        user.id,
        selectedOption.type,
        selectedOption.id
      )
      
      if (result.success) {
        alert('✅ Mock purchase successful! You now have access to this content.')
        onClose()
      } else {
        alert('❌ Purchase failed: ' + result.error)
      }
    } else {
      // Use real Stripe checkout in production
      await processCheckout({
        itemType: selectedOption.type,
        itemId: selectedOption.id,
        userId: user.id,
        email: user.email
      })
    }
  }

  if (!isOpen) return null

  // Find bundle package (3 sets)
  const bundlePackage = packages?.find(p => p.question_set_ids?.length >= 3)
  
  // Calculate individual set pricing - use actual prices from question sets
  const singleSetPrice = questionSets.length > 0 && questionSets[0]?.price_cents 
    ? questionSets[0].price_cents / 100 
    : 5.00
  
  // Calculate total cost if buying all sets individually
  const totalIndividualPrice = questionSets.length > 0
    ? questionSets.reduce((sum, set) => sum + (set.price_cents || 500), 0) / 100
    : singleSetPrice * 3
  
  // Bundle/package price - use actual package price or calculate discount
  const threeSetsPrice = bundlePackage?.price_cents 
    ? bundlePackage.price_cents / 100 
    : Math.max(totalIndividualPrice * 0.8, singleSetPrice * 3 - 5) // 20% discount fallback
  
  // Calculate actual savings
  const bundleSavings = totalIndividualPrice - threeSetsPrice
  
  // For display - ensure we're showing meaningful savings
  const displayBundleSavings = bundleSavings > 0 ? bundleSavings : 5

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
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
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          padding: '2rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
          
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
            Purchase Question Sets
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>
            {examName}
          </p>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <div>Loading options...</div>
          </div>
        ) : (
          <div style={{ padding: '2rem' }}>
            {/* Pricing Options */}
            <div style={{ 
              display: 'grid', 
              gap: '1.5rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              marginBottom: '2rem'
            }}>
              {/* 3 Sets Bundle Option */}
              <div
                onClick={() => setSelectedOption({ 
                  type: 'package', 
                  id: bundlePackage?.id,
                  name: '3 Question Sets Bundle',
                  price: threeSetsPrice
                })}
                style={{
                  background: selectedOption?.type === 'package' 
                    ? 'rgba(0,212,170,0.2)' 
                    : 'rgba(255,255,255,0.1)',
                  border: selectedOption?.type === 'package'
                    ? '2px solid #00D4AA'
                    : '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#00D4AA',
                  color: 'white',
                  padding: '0.25rem 1rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  BEST VALUE
                </div>

                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>🎓</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem', textAlign: 'center' }}>
                  3 Question Sets
                </h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#00D4AA', marginBottom: '0.5rem', textAlign: 'center' }}>
                  ${threeSetsPrice.toFixed(2)}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
                  {bundleSavings > 0 ? (
                    <>Save ${displayBundleSavings.toFixed(2)} • Complete bundle</>
                  ) : (
                    <>Complete bundle • Best value</>
                  )}
                </p>
                
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1rem' }}>
                  <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem' }}>✓</span> 3 complete question sets
                  </li>
                  <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem' }}>✓</span> Full exam simulation
                  </li>
                  <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem' }}>✓</span> Lifetime access
                  </li>
                  <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem' }}>✓</span> Best value for money
                  </li>
                </ul>
              </div>

              {/* 1 Set Option */}
              <div
                onClick={() => setSelectedOption({ 
                  type: 'question_set', 
                  id: questionSets[0]?.id,
                  name: '1 Question Set',
                  price: singleSetPrice
                })}
                style={{
                  background: selectedOption?.type === 'question_set' 
                    ? 'rgba(0,212,170,0.2)' 
                    : 'rgba(255,255,255,0.1)',
                  border: selectedOption?.type === 'question_set'
                    ? '2px solid #00D4AA'
                    : '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>📝</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem', textAlign: 'center' }}>
                  1 Question Set
                </h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#00D4AA', marginBottom: '0.5rem', textAlign: 'center' }}>
                  ${singleSetPrice.toFixed(2)}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
                  Per question set
                </p>
                
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1rem' }}>
                  <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem' }}>✓</span> 1 complete set
                  </li>
                  <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem' }}>✓</span> {questionSets[0]?.question_count || 65} questions
                  </li>
                  <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem' }}>✓</span> Add more anytime
                  </li>
                  <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem' }}>✓</span> Lifetime access
                  </li>
                </ul>
              </div>
            </div>

            {/* Available Sets */}
            {questionSets.length > 0 && (
              <div style={{ 
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
                  📚 Available Question Sets
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {questionSets.map((set, index) => (
                    <div 
                      key={set.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '0.5rem'
                      }}
                    >
                      <div>
                        <div style={{ color: 'white', fontWeight: '600', marginBottom: '0.25rem' }}>
                          {set.name || `Set ${index + 1}`}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                          {set.question_count} questions
                        </div>
                      </div>
                      <div style={{ color: '#00D4AA', fontWeight: '600' }}>
                        ${(set.price_cents / 100).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
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
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={!selectedOption || checkoutLoading}
                style={{
                  padding: '1rem 2rem',
                  background: selectedOption && !checkoutLoading
                    ? 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)'
                    : 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  cursor: selectedOption && !checkoutLoading ? 'pointer' : 'not-allowed',
                  fontSize: '1rem',
                  opacity: selectedOption && !checkoutLoading ? 1 : 0.5
                }}
              >
                {checkoutLoading ? 'Processing...' : `Purchase ${selectedOption ? `- $${Number(selectedOption.price).toFixed(2)}` : ''}`}
              </button>
            </div>

            {/* Development Notice */}
            {import.meta.env.DEV && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(251,191,36,0.15)',
                border: '1px solid rgba(251,191,36,0.3)',
                borderRadius: '0.5rem',
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.875rem'
              }}>
                <strong>🔧 Development Mode:</strong> Purchases are simulated. No real payment will be processed.
              </div>
            )}

            {/* Security Badges */}
            <div style={{ 
              display: 'flex', 
              gap: '1.5rem', 
              justifyContent: 'center', 
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🔒</span> Secure Payment
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚡</span> Instant Access
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>💯</span> Money-Back Guarantee
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PurchaseModal

