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

  useEffect(() => {
    const loadExam = async () => {
      const examData = await getExamBySlug(slug)
      setExam(examData)

      if (examData) {
        await fetchQuestionSets(examData.id)

        if (user) {
          await fetchSubscription(user.id)
          await loadExamResults(examData.id)
        }
      }
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
          <div className="mt-6 pt-6 border-t border-white/10 flex justify-end">
            <button
              onClick={() => navigate(`/exam/${slug}/study`)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all flex items-center gap-2 border border-white/20"
            >
              📚 View Study Material
            </button>
          </div>
        </div>


        {/* Question Sets */}
        <h2 className="section-title">📝 Question Sets</h2>
        <div className="question-sets-grid">
          {questionSets.length === 0 ? (
            <div className="col-span-full empty-state">
              <div>Loading question sets...</div>
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
                      padding: '1.5rem',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      {/* Status Icon */}
                      <div style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '0.75rem',
                        background: passColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '1.5rem',
                        flexShrink: 0
                      }}>
                        {passIcon}
                      </div>

                      {/* Result Details */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
                            {result.questionSetName || 'Practice Exam'}
                          </h3>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            background: result.passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                            border: `1px solid ${passColor}`,
                            borderRadius: '0.5rem',
                            color: passColor,
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {result.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
                          {new Date(result.completedAt).toLocaleDateString()} • {new Date(result.completedAt).toLocaleTimeString()} • {Math.floor(result.timeSpent / 60)} min
                        </div>
                      </div>

                      {/* Score Display */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: passColor }}>
                          {result.percentageScore}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                          {result.rawScore}/{result.totalQuestions} correct
                        </div>
                      </div>

                      {/* View Arrow */}
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.5rem' }}>
                        →
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
