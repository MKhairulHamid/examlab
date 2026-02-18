import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useExamStore from '../stores/examStore'
import useAuthStore from '../stores/authStore'
import usePurchaseStore from '../stores/purchaseStore'
import EnrollmentModal from '../components/enrollment/EnrollmentModal'
import supabase from '../services/supabase'

function ExamDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getExamBySlug, fetchQuestionSets, questionSets } = useExamStore()
  const { user } = useAuthStore()
  const { isSubscribed, fetchSubscription } = usePurchaseStore()
  const [exam, setExam] = useState(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [examResults, setExamResults] = useState([])
  const [loadingQuestionSets, setLoadingQuestionSets] = useState(true)

  useEffect(() => {
    const loadExam = async () => {
      setLoadingQuestionSets(true)
      const examData = await getExamBySlug(slug)
      setExam(examData)

      if (examData) {
        await fetchQuestionSets(examData.id)

        if (user) {
          await fetchSubscription(user.id)
          await loadExamResults(examData.id)
        }
      }
      setLoadingQuestionSets(false)
    }

    loadExam()
  }, [slug, user])

  const loadExamResults = async (examTypeId) => {
    if (!user) return

    try {
      // Fetch exam results from Supabase for this specific exam type
      const { data, error } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          question_sets (
            name,
            exam_type_id
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .eq('question_sets.exam_type_id', examTypeId)
        .order('completed_at', { ascending: false })

      if (error) throw error

      // Transform data to expected format
      const transformedResults = (data || []).map(result => ({
        id: result.id,
        userId: result.user_id,
        questionSetId: result.question_set_id,
        startedAt: result.started_at,
        completedAt: result.completed_at,
        timeSpent: result.time_spent_seconds,
        answers: result.answers_json,
        rawScore: result.raw_score,
        percentageScore: result.percentage_score,
        scaledScore: result.scaled_score,
        passed: result.passed,
        questionSetName: result.question_sets?.name || 'Question Set',
        totalQuestions: result.answers_json ? Object.keys(result.answers_json).length : 0
      }))

      setExamResults(transformedResults)
    } catch (error) {
      console.error('Error loading exam results:', error)
      setExamResults([])
    }
  }

  if (!exam) {
    return (
      <div className="loading-container">
        <div className="loading-content">Loading...</div>
      </div>
    )
  }

  // Check if user has access (subscription grants full access)
  const hasAccess = isSubscribed
  const freeSet = questionSets.find(set => set.is_free_sample || set.price_cents === 0)
  const paidSets = questionSets.filter(set => !set.is_free_sample && set.price_cents > 0)

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:p-6">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="back-button mb-4 sm:mb-6"
        >
          ← Back to Dashboard
        </button>

        {/* Exam Header */}
        <div className="exam-header-card">
          <div className="exam-header-icon">{exam.icon || '📚'}</div>
          <div className="exam-header-provider">
            {exam.provider}
          </div>
          <h1 className="exam-header-title">{exam.name}</h1>
          <p className="exam-header-description">{exam.description}</p>
          <div className="exam-header-meta">
            <span>📝 {exam.total_questions || 'N/A'} Total Questions</span>
            <span>⏱️ {exam.duration_minutes || 'N/A'} minutes</span>
            {exam.passing_score && <span>🎯 Pass: {exam.passing_score}/{exam.max_score || 1000}</span>}
          </div>
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => navigate(`/exam/${slug}/study`)}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                borderRadius: '0.75rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              📚 View Study Material
            </button>
          </div>
        </div>


        {/* Question Sets */}
        <h2 className="section-title">📝 Question Sets</h2>
        <div className="question-sets-grid">
          {loadingQuestionSets ? (
            <div className="col-span-full empty-state">
              <div>Loading question sets...</div>
            </div>
          ) : questionSets.length === 0 && !isSubscribed ? (
            <div className="col-span-full" style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              borderRadius: '1rem',
              padding: '2.5rem 1.5rem',
              border: '1px solid rgba(255,255,255,0.15)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
                Subscribe to Access Question Sets
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                Get full access to all practice exams and question sets with an active subscription.
              </p>
              <button
                onClick={() => setShowPurchaseModal(true)}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,212,170,0.3)',
                  transition: 'all 0.2s'
                }}
              >
                View Plans
              </button>
            </div>
          ) : questionSets.length === 0 ? (
            <div className="col-span-full empty-state">
              <div>No question sets available yet.</div>
            </div>
          ) : (
            questionSets.map(set => {
              const isFree = set.is_free_sample || set.price_cents === 0
              const isLocked = !isFree && !hasAccess

              return (
                <div
                  key={set.id}
                  className="question-set-card"
                  style={{
                    opacity: isLocked ? 0.7 : 1
                  }}
                >
                  <div className="question-set-header">
                    <h3 className="question-set-title">{set.name}</h3>
                    {isFree ? (
                      <span className="badge-free">
                        ✓ Free
                      </span>
                    ) : hasAccess ? (
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(0,212,170,0.2)',
                        color: '#00D4AA',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        ✓ Subscribed
                      </span>
                    ) : (
                      <span className="badge-locked">
                        🔒 Subscribe
                      </span>
                    )}
                  </div>
                  <p className="question-set-description">{set.description}</p>
                  <div className="question-set-meta">
                    <span>📝 {set.question_count} Questions</span>
                    <span>📊 Set {set.set_number}</span>
                  </div>

                  {(isFree || hasAccess) ? (
                    <button
                      onClick={() => navigate(`/exam/${slug}/take?set=${set.id}`)}
                      className="start-exam-button"
                    >
                      Start Practice Exam →
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowPurchaseModal(true)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(0,212,170,0.1)',
                        color: '#00D4AA',
                        border: '2px solid rgba(0,212,170,0.3)',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      🔒 Subscribe to Unlock
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Enrollment CTA */}
        {paidSets.length > 0 && !hasAccess && (
          <div style={{
            marginTop: '3rem',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>
              🎓 Get Full Access
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: '1.5rem' }}>
              Subscribe to unlock all {paidSets.length} question sets and every exam on the platform. Plans start at $5/month.
            </p>
            <button
              onClick={() => setShowPurchaseModal(true)}
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: '700',
                fontSize: '1.125rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,212,170,0.3)'
              }}
            >
              View Plans
            </button>
          </div>
        )}

        {/* Exam Attempts History */}
        {examResults.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h2 className="section-title">📊 Your Exam Attempts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {examResults.map((result) => {
                const passColor = result.passed ? '#10b981' : '#ef4444'
                const passIcon = result.passed ? '✓' : '✗'

                return (
                  <div
                    key={result.id}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '1rem',
                      padding: 'clamp(1rem, 3vw, 1.5rem)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderLeft: `4px solid ${passColor}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onClick={() => navigate(`/exam/${slug}/results?resultId=${result.id}&set=${result.questionSetId}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      {/* Status Icon + Result Details */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 auto', minWidth: 0 }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '0.625rem',
                          background: passColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '1.25rem',
                          flexShrink: 0
                        }}>
                          {passIcon}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                              {result.questionSetName || 'Practice Exam'}
                            </h3>
                            <span style={{
                              padding: '0.125rem 0.5rem',
                              background: result.passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                              border: `1px solid ${passColor}`,
                              borderRadius: '0.375rem',
                              color: passColor,
                              fontSize: '0.6875rem',
                              fontWeight: '600',
                              flexShrink: 0
                            }}>
                              {result.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {new Date(result.completedAt).toLocaleDateString()} • {Math.floor(result.timeSpent / 60)} min
                          </div>
                        </div>
                      </div>

                      {/* Score Display + Arrow */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: passColor }}>
                            {result.percentageScore}%
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.7)' }}>
                            {result.rawScore}/{result.totalQuestions}
                          </div>
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.25rem' }}>
                          →
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />
    </div>
  )
}

export default ExamDetail
