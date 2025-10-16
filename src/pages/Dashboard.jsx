import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import useExamStore from '../stores/examStore'
import usePurchaseStore from '../stores/purchaseStore'
import DashboardHeader from '../components/layout/DashboardHeader'
import PurchaseModal from '../components/purchase/PurchaseModal'
import streakService from '../services/streakService'
import progressService from '../services/progressService'
import indexedDBService from '../services/indexedDBService'


function Dashboard() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { exams, fetchExams } = useExamStore()
  const { purchases, fetchPurchases, purchasedQuestionSetIds } = usePurchaseStore()
  const [activeView, setActiveView] = useState('overview') // 'overview', 'analytics', 'review', 'explore'
  const [selectedCert, setSelectedCert] = useState(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const [streakStats, setStreakStats] = useState(null)
  const [userCertifications, setUserCertifications] = useState([])
  const [examResults, setExamResults] = useState([])

  useEffect(() => {
    fetchExams()
    if (user) {
      fetchPurchases(user.id)
      initializeStreak()
      loadExamResults()
    }
  }, [user])

  const loadExamResults = async () => {
    if (user) {
      const results = await indexedDBService.getExamResultsByUser(user.id)
      // Sort by completion date, newest first
      const sortedResults = results.sort((a, b) => 
        new Date(b.completedAt) - new Date(a.completedAt)
      )
      setExamResults(sortedResults)
    }
  }

  useEffect(() => {
    // Get user's certifications (purchased or started)
    const loadUserCertifications = async () => {
      if (exams.length > 0 && purchases.length >= 0 && user) {
        // Get all exam attempts from progress
        const userAttempts = await progressService.getAllProgress(user.id)
        
        // Get unique exam type IDs from attempts
        const attemptedExamIds = new Set()
        for (const attempt of userAttempts) {
          // Get the question set details to find exam_type_id
          const questionSet = await indexedDBService.getQuestionSet(attempt.questionSetId)
          if (questionSet?.exam_type_id) {
            attemptedExamIds.add(questionSet.exam_type_id)
          }
        }
        
        const userExams = exams.filter(exam => {
          // Check if user has purchased any sets for this exam
          const hasPurchased = purchases.some(purchase => {
            if (purchase.question_sets?.exam_type_id === exam.id) return true
            if (purchase.packages?.exam_type_id === exam.id) return true
            return false
          })
          
          // Check if user has started any practice for this exam
          const hasStarted = attemptedExamIds.has(exam.id)
          
          return hasPurchased || hasStarted
        })
        
        setUserCertifications(userExams)
      }
    }
    
    loadUserCertifications()
  }, [exams, purchases, user])

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Student'

  // Initialize streak
  const initializeStreak = async () => {
    if (user) {
      await streakService.initializeStreak(user.id)
      streakService.startAutoSync(user.id)
      updateStreakStats()
    }
  }

  // Update streak statistics
  const updateStreakStats = () => {
    const stats = streakService.getStreakStats()
    setStreakStats(stats)
  }

  // Record activity (call this when user completes questions)
  const recordStreakActivity = async (questionsCompleted = 1) => {
    if (user) {
      await streakService.recordActivity(user.id, questionsCompleted)
      updateStreakStats()
    }
  }

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      streakService.stopAutoSync()
    }
  }, [])


  const renderMyCertifications = () => (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
          📚 My Certifications
        </h2>
        <button
          onClick={() => {
            navigate('/')
            // Scroll to certifications section after navigation
            setTimeout(() => {
              const element = document.getElementById('certifications')
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
              }
            }, 100)
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>+</span> Browse More Exams
        </button>
        </div>

      {userCertifications.length === 0 ? (
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          padding: '3rem',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.2)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
            No Certifications Yet
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>
            Start your certification journey today!
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Browse Exams
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
          {userCertifications.map((exam) => {
            const isPurchased = purchases.some(p => 
              p.question_sets?.exam_type_id === exam.id || 
              p.packages?.exam_type_id === exam.id
            )
            
            // Check if exam is started (has progress) but not purchased
            const isStartedOnly = !isPurchased
            
            return (
              <div 
                key={exam.id}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '3rem' }}>{exam.icon || '📚'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: '#00D4AA', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                      {exam.provider}
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
                      {exam.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                      <span>📝 {exam.total_questions || 'N/A'} Qs</span>
                      <span>⏱️ {exam.duration_minutes || 'N/A'} min</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div style={{ marginBottom: '1rem' }}>
                  {isPurchased ? (
                    <div style={{ 
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      background: 'rgba(0,212,170,0.2)',
                      border: '1px solid #00D4AA',
                      borderRadius: '0.5rem',
                      color: '#00D4AA',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      ✓ Purchased
                    </div>
                  ) : isStartedOnly ? (
                    <div style={{ 
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      background: 'rgba(59,130,246,0.2)',
                      border: '1px solid rgba(59,130,246,0.5)',
                      borderRadius: '0.5rem',
                      color: 'rgba(147,197,253,1)',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      📝 In Progress
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      background: 'rgba(251,191,36,0.2)',
                      border: '1px solid rgba(251,191,36,0.5)',
                      borderRadius: '0.5rem',
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      Free Questions Available
                    </div>
                  )}
        </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/exam/${exam.slug}`)
                    }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    {isPurchased ? 'Continue Practice' : isStartedOnly ? 'Continue Practice' : 'Try Free Questions'}
                  </button>
                  {!isPurchased && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedExam(exam)
                        setShowPurchaseModal(true)
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      {isStartedOnly ? 'Unlock Full Access' : 'Purchase'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )


  const renderRecentResults = () => {
    if (examResults.length === 0) return null

    return (
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>
          📊 Recent Exam Results
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {examResults.slice(0, 5).map((result, index) => {
            const passColor = result.passed ? '#10b981' : '#ef4444'
            const passIcon = result.passed ? '✓' : '✗'
            
            return (
              <div
                key={result.id}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  border: `1px solid ${result.passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onClick={async () => {
                  // Navigate using stored exam slug or fallback to finding it
                  if (result.examSlug) {
                    navigate(`/exam/${result.examSlug}/results?resultId=${result.id}&set=${result.questionSetId}`)
                  } else {
                    // Fallback: Find the exam slug
                    const questionSet = await indexedDBService.getQuestionSet(result.questionSetId)
                    if (questionSet?.exam_type_id) {
                      const exam = exams.find(e => e.id === questionSet.exam_type_id)
                      if (exam) {
                        navigate(`/exam/${exam.slug}/results?resultId=${result.id}&set=${result.questionSetId}`)
                      }
                    }
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>
                      {result.examName || 'Exam Result'}
                    </h3>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: result.passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                      border: `1px solid ${result.passed ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`,
                      borderRadius: '0.5rem',
                      color: passColor,
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
                    {new Date(result.completedAt).toLocaleDateString()} • {new Date(result.completedAt).toLocaleTimeString()}
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
            )
          })}
        </div>

        {examResults.length > 5 && (
          <div style={{ marginTop: '1rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
            + {examResults.length - 5} more results
          </div>
        )}
      </div>
    )
  }

  const renderStudyStreak = () => {
    if (!streakStats) return null

    const { currentStreak, longestStreak, questionsToday, dailyGoal, studyDates } = streakStats
    const today = new Date().toISOString().split('T')[0]
    
    // Get last 14 days for visualization
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (13 - i))
      return date.toISOString().split('T')[0]
    })
    
    return (
      <div style={{ 
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        padding: '2rem',
        borderRadius: '1rem',
        border: '1px solid rgba(255,255,255,0.2)',
        marginBottom: '3rem',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>
          🔥 Study Streak
        </h2>

        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔥</div>
        
        <div style={{ fontSize: '3rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.5rem' }}>
          {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
        </div>
        
        <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
          Longest Streak: {longestStreak} days
        </div>
        
        <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
          {currentStreak > 0 
            ? "Keep it going! Don't break your streak." 
            : "Start your study streak today!"}
        </div>

        {/* Mini Calendar - Last 14 Days */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.75rem' }}>
            Last 14 Days
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {last14Days.map((date, i) => {
              const isStudied = studyDates.includes(date)
              const isToday = date === today
              return (
                <div 
                  key={i}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.25rem',
                    background: isStudied ? (isToday ? '#00D4AA' : '#f59e0b') : 'rgba(255,255,255,0.1)',
                    border: isToday ? '2px solid #00D4AA' : '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: isStudied ? 'white' : 'rgba(255,255,255,0.5)',
                    fontWeight: isStudied ? '700' : '400',
                    transition: 'all 0.3s'
                  }}
                  title={date}
                >
                  {isStudied ? '✓' : ''}
                </div>
              )
            })}
          </div>
        </div>

        {/* Daily Goal Progress */}
        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem', fontWeight: '600' }}>
            Daily Goal
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00D4AA', marginBottom: '0.75rem' }}>
            {questionsToday} / {dailyGoal} Questions Today
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: '9999px', 
            height: '8px',
            overflow: 'hidden',
            maxWidth: '300px',
            margin: '0 auto'
          }}>
            <div style={{ 
              width: `${Math.min((questionsToday / dailyGoal) * 100, 100)}%`,
              height: '100%',
              background: questionsToday >= dailyGoal 
                ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(90deg, #00D4AA 0%, #00A884 100%)',
              transition: 'width 0.3s'
            }}></div>
          </div>
          {questionsToday >= dailyGoal && (
            <div style={{ 
              marginTop: '0.75rem', 
              color: '#10b981', 
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              ✨ Goal completed! Great job!
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderExploreMore = () => (
    <div style={{ marginBottom: '3rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>
        🔍 Explore More Certifications
      </h2>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {exams.slice(0, 6).map(exam => (
          <div
            key={exam.id}
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{exam.icon || '📚'}</div>
            <div style={{ fontSize: '0.75rem', color: '#00D4AA', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    {exam.provider}
                  </div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
              {exam.name}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem', lineHeight: '1.4' }}>
              {exam.description?.slice(0, 80)}...
            </p>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
              <span>📝 {exam.total_questions || 'N/A'} Qs</span>
                    <span>⏱️ {exam.duration_minutes || 'N/A'} min</span>
                  </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => navigate(`/exam/${exam.slug}`)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                Try Free
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedExam(exam)
                  setShowPurchaseModal(true)
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                Purchase
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button
          onClick={() => {
            navigate('/')
            // Scroll to certifications section after navigation
            setTimeout(() => {
              const element = document.getElementById('certifications')
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
              }
            }, 100)
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
          }}
        >
          View All 21 Certifications →
        </button>
      </div>
    </div>
  )

  const renderPurchasesSummary = () => {
    if (purchases.length === 0) return null

    return (
      <div style={{
        background: 'rgba(0,212,170,0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid rgba(0,212,170,0.3)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>
          💳 Your Purchases
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {purchases.slice(0, 5).map((purchase, index) => (
            <div 
              key={index}
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
                <div style={{ color: 'white', fontWeight: '600', fontSize: '0.875rem' }}>
                  {purchase.question_sets?.name || purchase.packages?.name || 'Purchase'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
                  {new Date(purchase.purchased_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ color: '#00D4AA', fontWeight: '600', fontSize: '0.875rem' }}>
                ${(purchase.amount_cents / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        {purchases.length > 5 && (
          <div style={{ marginTop: '0.75rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
            + {purchases.length - 5} more purchases
          </div>
        )}
      </div>
    )
  }

  const renderDashboardFooter = () => (
    <footer style={{
      marginTop: '4rem',
      paddingTop: '2rem',
      borderTop: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Brand Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📚</span>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'white' }}>Cloud Exam Lab</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '1rem' }}>
            Master cloud certifications with professional exam practice. AWS, Azure, and GCP.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a 
              href="https://twitter.com/cloudexamlab" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: 'rgba(255,255,255,0.7)', 
                fontSize: '0.875rem',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            >
              Twitter
            </a>
            <a 
              href="https://linkedin.com/company/cloudexamlab" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: 'rgba(255,255,255,0.7)', 
                fontSize: '0.875rem',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            >
              LinkedIn
            </a>
            <a 
              href="https://github.com/cloudexamlab" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: 'rgba(255,255,255,0.7)', 
                fontSize: '0.875rem',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'white', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              >
                Browse Exams
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              >
                Dashboard
              </button>
            </li>
            <li>
              <a
                href="mailto:support@cloudexamlab.com"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              >
                Support
              </a>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'white', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Resources
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <button
                onClick={() => {
                  navigate('/')
                  setTimeout(() => {
                    const element = document.getElementById('certifications')
                    if (element) element.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              >
                All Certifications
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  navigate('/')
                  setTimeout(() => {
                    const element = document.getElementById('pricing')
                    if (element) element.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              >
                Pricing
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  navigate('/')
                  setTimeout(() => {
                    const element = document.getElementById('faq')
                    if (element) element.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              >
                FAQ
              </button>
            </li>
          </ul>
        </div>

        {/* Stats */}
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'white', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your Progress
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00D4AA' }}>
                {userCertifications.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                Active Certifications
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f59e0b' }}>
                {streakStats?.currentStreak || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                Day Streak 🔥
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        paddingTop: '1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', maxWidth: '800px' }}>
          <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Disclaimer:</strong> Independent practice questions for certification preparation. 
          Not affiliated with or endorsed by Amazon Web Services (AWS), Microsoft Azure, Google Cloud Platform (GCP), 
          or any other certification provider. All trademarks are property of their respective owners.
        </p>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
          © {new Date().getFullYear()} Cloud Exam Lab. All rights reserved.
        </p>
      </div>
    </footer>
  )

  return (
    <>
      <DashboardHeader />
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
        padding: '0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
        {/* Dashboard Header */}
        <div style={{ 
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          padding: '2rem',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '2rem'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
            👋 Welcome back, {userName}!
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>
            Ready to continue your certification journey? Let's make today count!
          </p>
        </div>

        {/* Purchase Summary */}
        {renderPurchasesSummary()}

        {/* My Certifications */}
        {renderMyCertifications()}

        {/* Recent Results */}
        {renderRecentResults()}

        {/* Study Streak */}
        {renderStudyStreak()}

        {/* Explore More */}
        {renderExploreMore()}

        {/* Dashboard Footer */}
        {renderDashboardFooter()}
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedExam && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false)
            setSelectedExam(null)
          }}
          examTypeId={selectedExam.id}
          examName={selectedExam.name}
        />
      )}
    </>
  )
}

export default Dashboard
