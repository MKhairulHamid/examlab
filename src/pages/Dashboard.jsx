import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import useExamStore from '../stores/examStore'
import usePurchaseStore from '../stores/purchaseStore'
import DashboardHeader from '../components/layout/DashboardHeader'
import EnrollmentModal from '../components/enrollment/EnrollmentModal'
import streakService from '../services/streakService'
import progressService from '../services/progressService'
import indexedDBService from '../services/indexedDBService'
import supabase from '../services/supabase'


function Dashboard() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { exams, fetchExams } = useExamStore()
  const { purchases, fetchPurchases, isSubscribed, fetchSubscription } = usePurchaseStore()
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const [streakStats, setStreakStats] = useState(null)
  const [userCertifications, setUserCertifications] = useState([])
  const [examResults, setExamResults] = useState([])
  const [examDates, setExamDates] = useState([])
  const [showExamDateModal, setShowExamDateModal] = useState(false)
  const [selectedExamForDate, setSelectedExamForDate] = useState(null)

  useEffect(() => {
    fetchExams()
    if (user) {
      fetchPurchases(user.id)
      fetchSubscription(user.id)
      initializeStreak()
      loadExamResults()
      loadExamDates()
    }
  }, [user])

  const loadExamResults = async () => {
    if (!user) return
    
    try {
      // Fetch exam results from Supabase
      const { data, error } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          question_sets (
            name,
            exam_type_id,
            exam_types (
              name,
              slug
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      
      // Transform data to match expected format
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
        examName: result.question_sets?.name || 'Exam',
        examSlug: result.question_sets?.exam_types?.slug || '',
        totalQuestions: result.answers_json ? Object.keys(result.answers_json).length : 0
      }))
      
      setExamResults(transformedResults)
    } catch (error) {
      console.error('Error loading exam results:', error)
      setExamResults([])
    }
  }

  const loadExamDates = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('exam_dates_json')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      
      if (data?.exam_dates_json) {
        setExamDates(data.exam_dates_json)
      }
    } catch (error) {
      console.error('Error loading exam dates:', error)
    }
  }

  const saveExamDate = async (examTypeId, examName, examDate) => {
    if (!user) return
    
    try {
      const newExamDate = {
        exam_type_id: examTypeId,
        exam_name: examName,
        exam_date: examDate,
        created_at: new Date().toISOString()
      }
      
      // Remove existing date for this exam if any
      const updatedDates = examDates.filter(d => d.exam_type_id !== examTypeId)
      updatedDates.push(newExamDate)
      
      const { error } = await supabase
        .from('profiles')
        .update({ exam_dates_json: updatedDates })
        .eq('id', user.id)
      
      if (error) throw error
      
      setExamDates(updatedDates)
    } catch (error) {
      console.error('Error saving exam date:', error)
    }
  }

  const removeExamDate = async (examTypeId) => {
    if (!user) return
    
    try {
      const updatedDates = examDates.filter(d => d.exam_type_id !== examTypeId)
      
      const { error } = await supabase
        .from('profiles')
        .update({ exam_dates_json: updatedDates })
        .eq('id', user.id)
      
      if (error) throw error
      
      setExamDates(updatedDates)
    } catch (error) {
      console.error('Error removing exam date:', error)
    }
  }

  const calculateDaysUntil = (dateString) => {
    const examDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    examDate.setHours(0, 0, 0, 0)
    
    const diffTime = examDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
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
          // If user has active subscription, they have access to all exams
          if (isSubscribed) return true
          
          // Check if user has purchased any sets for this exam (legacy)
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
  }, [exams, purchases, user, isSubscribed])

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

  // Refresh streak stats when page becomes visible (user returns from exam)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Page is visible again - refresh streak stats
        updateStreakStats()
        loadExamResults()
      }
    }

    const handleFocus = () => {
      if (user) {
        // Window gained focus - refresh streak stats
        updateStreakStats()
        loadExamResults()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user])


  const renderExamCountdown = () => {
    if (examDates.length === 0) return null

    // Sort by closest date first
    const sortedDates = [...examDates].sort((a, b) => 
      new Date(a.exam_date) - new Date(b.exam_date)
    )

    return (
      <section style={{ padding: '4rem 0', background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ color: '#00D4AA', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.75rem' }}>
            YOUR EXAM SCHEDULE
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem', lineHeight: '1.3' }}>
            📅 Exam Countdown
          </h2>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {sortedDates.map((examDate) => {
            const daysUntil = calculateDaysUntil(examDate.exam_date)
            const isToday = daysUntil === 0
            const isPast = daysUntil < 0
            const isUrgent = daysUntil > 0 && daysUntil <= 7

            let statusColor = '#00D4AA'
            let statusBg = 'rgba(0, 212, 170, 0.1)'
            let statusText = `${daysUntil} days`
            
            if (isPast) {
              statusColor = '#9ca3af'
              statusBg = 'rgba(156, 163, 175, 0.1)'
              statusText = 'Past'
            } else if (isToday) {
              statusColor = '#f59e0b'
              statusBg = 'rgba(245, 158, 11, 0.1)'
              statusText = 'Today!'
            } else if (isUrgent) {
              statusColor = '#ef4444'
              statusBg = 'rgba(239, 68, 68, 0.1)'
              statusText = `${daysUntil} days`
            }

            return (
              <div
                key={examDate.exam_type_id}
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  border: `2px solid ${statusColor}`,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  position: 'relative'
                }}
              >
                {/* Remove button */}
                <button
                  onClick={() => removeExamDate(examDate.exam_type_id)}
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    padding: '0.25rem',
                    lineHeight: 1
                  }}
                  title="Remove exam date"
                >
                  ×
                </button>

                {/* Countdown Badge */}
                <div style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  background: statusBg,
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: statusColor, lineHeight: 1 }}>
                    {isPast ? '✓' : isToday ? '🔥' : daysUntil}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: statusColor, marginTop: '0.25rem' }}>
                    {statusText}
                  </div>
                </div>

                {/* Exam Info */}
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.5rem' }}>
                  {examDate.exam_name}
                </h3>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                  📅 {new Date(examDate.exam_date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      const exam = exams.find(e => e.id === examDate.exam_type_id)
                      if (exam) navigate(`/exam/${exam.slug}`)
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
                    Practice Now
                  </button>
                  <button
                    onClick={() => {
                      const exam = exams.find(e => e.id === examDate.exam_type_id)
                      if (exam) {
                        setSelectedExamForDate(exam)
                        setShowExamDateModal(true)
                      }
                    }}
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'white',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    )
  }

  const renderMyCertifications = () => (
    <section style={{ padding: '4rem 0', background: '#f9fafb' }}>
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ color: '#00D4AA', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.75rem' }}>
            YOUR CERTIFICATIONS
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem', lineHeight: '1.3' }}>
            📚 My Certifications
          </h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.5rem' }}>
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
          background: 'white',
          padding: '3rem',
          borderRadius: '1rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.5rem' }}>
            No Certifications Yet
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
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
            const isPurchased = isSubscribed || purchases.some(p => 
              p.question_sets?.exam_type_id === exam.id || 
              p.packages?.exam_type_id === exam.id
            )
            
            // Check if exam is started (has progress) but not purchased/subscribed
            const isStartedOnly = !isPurchased
            
            return (
              <div 
                key={exam.id}
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '3rem' }}>{exam.icon || '📚'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: '#00D4AA', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                      {exam.provider}
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.5rem' }}>
                      {exam.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
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
                      background: '#d1fae5',
                      border: '1px solid #6ee7b7',
                      borderRadius: '0.5rem',
                      color: '#065f46',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      ✓ {isSubscribed ? 'Enrolled' : 'Purchased'}
                    </div>
                  ) : isStartedOnly ? (
                    <div style={{ 
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      background: '#dbeafe',
                      border: '1px solid #93c5fd',
                      borderRadius: '0.5rem',
                      color: '#1e40af',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      📝 In Progress
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      background: '#fef3c7',
                      border: '1px solid #fcd34d',
                      borderRadius: '0.5rem',
                      color: '#92400e',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      Free Questions Available
                    </div>
                  )}
        </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                          setShowEnrollmentModal(true)
                        }}
                        style={{
                          padding: '0.75rem 1rem',
                          background: 'white',
                          color: '#374151',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f9fafb'
                          e.currentTarget.style.borderColor = '#9ca3af'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white'
                          e.currentTarget.style.borderColor = '#d1d5db'
                        }}
                      >
                        Enroll
                      </button>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedExamForDate(exam)
                      setShowExamDateModal(true)
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: 'rgba(0, 212, 170, 0.1)',
                      color: '#00D4AA',
                      border: '1px solid rgba(0, 212, 170, 0.3)',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 212, 170, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 212, 170, 0.1)'
                    }}
                  >
                    📅 {examDates.find(d => d.exam_type_id === exam.id) ? 'Update' : 'Set'} Exam Date
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      </div>
    </section>
  )


  const renderRecentResults = () => {
    if (examResults.length === 0) return null

    return (
      <section style={{ padding: '4rem 0', background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ color: '#00D4AA', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.75rem' }}>
            YOUR PERFORMANCE
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem', lineHeight: '1.3' }}>
            📊 Recent Exam Results
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {examResults.slice(0, 5).map((result, index) => {
            const passColor = result.passed ? '#10b981' : '#ef4444'
            const passIcon = result.passed ? '✓' : '✗'
            
            return (
              <div
                key={result.id}
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  border: '1px solid #e5e7eb',
                  borderLeft: `4px solid ${result.passed ? '#10b981' : '#ef4444'}`,
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
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
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
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
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0A2540' }}>
                      {result.examName || 'Exam Result'}
                    </h3>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: result.passed ? '#d1fae5' : '#fee2e2',
                      border: `1px solid ${result.passed ? '#6ee7b7' : '#fca5a5'}`,
                      borderRadius: '0.5rem',
                      color: result.passed ? '#065f46' : '#991b1b',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {new Date(result.completedAt).toLocaleDateString()} • {new Date(result.completedAt).toLocaleTimeString()}
                  </div>
                </div>

                {/* Score Display */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: passColor }}>
                    {result.percentageScore}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {result.rawScore}/{result.totalQuestions} correct
                  </div>
                </div>

                {/* View Arrow */}
                <div style={{ color: '#9ca3af', fontSize: '1.5rem' }}>
                  →
                </div>
              </div>
            )
          })}
        </div>

        {examResults.length > 5 && (
          <div style={{ marginTop: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
            + {examResults.length - 5} more results
          </div>
        )}
      </section>
    )
  }

  const renderStudyStreak = () => {
    if (!streakStats) return null

    const { currentStreak, longestStreak, questionsToday, dailyGoal, studyDates } = streakStats
    const today = new Date().toISOString().split('T')[0]
    
    // Get the earliest study date or today
    const sortedStudyDates = [...studyDates].sort()
    const firstStudyDate = sortedStudyDates.length > 0 ? sortedStudyDates[0] : today
    
    // Calculate how many days since first study (or 0 if no studies yet)
    const firstDate = new Date(firstStudyDate)
    const todayDate = new Date(today)
    const daysSinceFirst = Math.floor((todayDate - firstDate) / (1000 * 60 * 60 * 24))
    
    // Calculate which cycle we're in (0-based)
    const cycleNumber = Math.floor(daysSinceFirst / 14)
    const cycleStart = cycleNumber * 14
    
    // Generate 14 boxes starting from the current cycle
    const displayDays = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(firstDate)
      date.setDate(date.getDate() + cycleStart + i)
      return date.toISOString().split('T')[0]
    })
    
    // Filter to only show boxes up to today
    const visibleDays = displayDays.filter(date => date <= today)
    
    return (
      <section style={{ padding: '4rem 0', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ color: '#00D4AA', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.75rem' }}>
            YOUR PROGRESS
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem', lineHeight: '1.3' }}>
            🔥 Study Streak
          </h2>
        </div>

        <div style={{ 
          background: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center'
        }}>

        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔥</div>
        
        <div style={{ fontSize: '3rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.5rem' }}>
          {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
        </div>
        
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          Longest Streak: {longestStreak} days
        </div>
        
        <div style={{ fontSize: '1rem', color: '#4b5563', marginBottom: '0.5rem' }}>
          {currentStreak > 0 
            ? "Keep it going! Don't break your streak." 
            : "Start your study streak today!"}
        </div>
        
        <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '2rem' }}>
          Answer at least 1 question per day to maintain your streak
        </div>

        {/* Mini Calendar - Progress Tracker (14-day cycles) */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
            {studyDates.length === 0 ? 'Start Your Journey' : `Cycle ${cycleNumber + 1} Progress`}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 2rem)', gap: '0.5rem', justifyContent: 'center' }}>
            {Array.from({ length: 14 }, (_, i) => {
              const date = displayDays[i]
              const isStudied = date && studyDates.includes(date)
              const isToday = date === today
              const isFuture = !date || date > today
              const dayNumber = i + 1
              
              return (
                <div 
                  key={i}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.25rem',
                    background: isFuture ? '#f9fafb' : (isStudied ? (isToday ? '#00D4AA' : '#10b981') : '#f3f4f6'),
                    border: isToday ? '2px solid #00D4AA' : (isFuture ? '1px solid #f3f4f6' : '1px solid #e5e7eb'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: isFuture ? '#e5e7eb' : (isStudied ? 'white' : '#9ca3af'),
                    fontWeight: isStudied ? '700' : '400',
                    transition: 'all 0.3s',
                    position: 'relative',
                    opacity: isFuture ? 0.3 : 1
                  }}
                  title={date ? `${date} - Day ${dayNumber}` : `Day ${dayNumber} (upcoming)`}
                >
                  {isStudied ? '✓' : (isFuture ? '' : dayNumber)}
                </div>
              )
            })}
          </div>
        </div>

        {/* Daily Goal Progress */}
        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem', fontWeight: '600' }}>
            Today's Progress
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00D4AA', marginBottom: '0.75rem' }}>
            {questionsToday} / {dailyGoal} Questions Answered
          </div>
          <div style={{ 
            background: '#e5e7eb', 
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
      </section>
    )
  }

  const renderExploreMore = () => (
    <section style={{ padding: '4rem 0', background: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ color: '#00D4AA', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.75rem' }}>
          DISCOVER MORE
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem', lineHeight: '1.3' }}>
          🔍 Explore More Certifications
        </h2>
      </div>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {exams.slice(0, 6).map(exam => (
          <div
            key={exam.id}
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{exam.icon || '📚'}</div>
            <div style={{ fontSize: '0.75rem', color: '#00D4AA', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    {exam.provider}
                  </div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.5rem' }}>
              {exam.name}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem', lineHeight: '1.4' }}>
              {exam.description?.slice(0, 80)}...
            </p>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>
              <span>📝 {exam.total_questions || 'N/A'} Qs</span>
              <span>⏱️ {exam.duration_minutes || 'N/A'} min</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => navigate(`/exam/${exam.slug}`)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white'
                }}
              >
                Try Free
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEnrollmentModal(true)
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
                Enroll
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
            background: 'white',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f9fafb'
            e.currentTarget.style.borderColor = '#9ca3af'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.borderColor = '#d1d5db'
          }}
        >
          View All 21 Certifications →
        </button>
      </div>
    </section>
  )

  const renderSubscriptionSummary = () => {
    const { subscription } = usePurchaseStore.getState()
    
    if (!isSubscribed && purchases.length === 0) return null

    return (
      <section style={{ padding: '2rem 0' }}>
        {/* Active Subscription */}
        {isSubscribed && subscription && (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '2px solid #00D4AA',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.25rem' }}>
                  ✅ Active Subscription
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {subscription.subscription_plans?.name || 'Plan'} — Full access to all exams
                </p>
                {subscription.current_period_end && (
                  <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div style={{
                padding: '0.5rem 1rem',
                background: '#d1fae5',
                border: '1px solid #6ee7b7',
                borderRadius: '0.5rem',
                color: '#065f46',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                Active
              </div>
            </div>
          </div>
        )}

        {/* Legacy Purchases */}
        {purchases.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem' }}>
              💳 Purchase History
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
                    background: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div>
                    <div style={{ color: '#0A2540', fontWeight: '600', fontSize: '0.875rem' }}>
                      {purchase.question_sets?.name || purchase.packages?.name || 'Purchase'}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
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
              <div style={{ marginTop: '0.75rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                + {purchases.length - 5} more purchases
              </div>
            )}
          </div>
        )}
      </section>
    )
  }

  const renderDashboardFooter = () => (
    <footer style={{
      background: '#f9fafb',
      padding: '4rem 0 2rem',
      borderTop: '1px solid #e5e7eb',
      width: '100%',
      marginLeft: 0,
      marginRight: 0
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Brand Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📚</span>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0A2540' }}>Cloud Exam Lab</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6', marginBottom: '1rem' }}>
            Master cloud certifications with professional exam practice. AWS, Azure, and GCP.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a 
              href="https://twitter.com/cloudexamlab" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: '#6b7280', 
                fontSize: '0.875rem',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0A2540'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              Twitter
            </a>
            <a 
              href="https://linkedin.com/company/cloudexamlab" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: '#6b7280', 
                fontSize: '0.875rem',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0A2540'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              LinkedIn
            </a>
            <a 
              href="https://github.com/cloudexamlab" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                color: '#6b7280', 
                fontSize: '0.875rem',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0A2540'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
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
                  color: '#6b7280',
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
                  color: '#6b7280',
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
          <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                  color: '#6b7280',
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
                  color: '#6b7280',
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
                  color: '#6b7280',
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
      </div>

      {/* Bottom Bar */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: '1.6', maxWidth: '800px' }}>
          <strong style={{ color: '#6b7280' }}>Disclaimer:</strong> Independent practice questions for certification preparation. 
          Not affiliated with or endorsed by Amazon Web Services (AWS), Microsoft Azure, Google Cloud Platform (GCP), 
          or any other certification provider. All trademarks are property of their respective owners.
        </p>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
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
        background: 'white',
        padding: '0'
      }}>
        {/* Hero Welcome Section */}
        <section style={{
          background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
          padding: '4rem 1rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            width: '24rem',
            height: '24rem',
            background: 'rgba(0, 212, 170, 0.1)',
            borderRadius: '9999px',
            filter: 'blur(80px)',
            top: 0,
            right: 0
          }}></div>
          <div style={{
            position: 'absolute',
            width: '20rem',
            height: '20rem',
            background: 'rgba(0, 212, 170, 0.08)',
            borderRadius: '9999px',
            filter: 'blur(80px)',
            bottom: 0,
            left: 0
          }}></div>
          
          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ 
              display: 'inline-block',
              padding: '0.5rem 1rem',
              background: 'rgba(0, 212, 170, 0.15)',
              borderRadius: '9999px',
              color: '#00D4AA',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              👋 YOUR DASHBOARD
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', marginBottom: '0.75rem', lineHeight: '1.2' }}>
              Welcome back, {userName}!
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto' }}>
              Ready to continue your certification journey? Let's make today count!
            </p>
          </div>
        </section>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Exam Countdown */}
        {renderExamCountdown()}

        {/* Study Streak */}
        {renderStudyStreak()}

        {/* My Certifications */}
        {renderMyCertifications()}

        {/* Recent Results */}
        {renderRecentResults()}

        {/* Explore More */}
        {renderExploreMore()}

        {/* Subscription & Purchase Summary */}
        {renderSubscriptionSummary()}
        </div>

        {/* Dashboard Footer - Outside container to span full width */}
        {renderDashboardFooter()}
      </div>

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => {
          setShowEnrollmentModal(false)
          setSelectedExam(null)
        }}
      />

      {/* Exam Date Modal */}
      {showExamDateModal && selectedExamForDate && (
        <div className="modal-overlay" onClick={() => setShowExamDateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowExamDateModal(false)}>
              ×
            </button>
            <div className="modal-header">
              <h2 className="modal-title">📅 Set Exam Date</h2>
              <p className="modal-description">
                When are you planning to take {selectedExamForDate.name}?
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const examDate = formData.get('examDate')
                if (examDate) {
                  saveExamDate(selectedExamForDate.id, selectedExamForDate.name, examDate)
                  setShowExamDateModal(false)
                  setSelectedExamForDate(null)
                }
              }}
              style={{ marginTop: '1.5rem' }}
            >
              <div className="form-group">
                <label className="form-label" htmlFor="examDate">
                  Exam Date
                </label>
                <input
                  type="date"
                  id="examDate"
                  name="examDate"
                  className="form-input"
                  defaultValue={
                    examDates.find(d => d.exam_type_id === selectedExamForDate.id)?.exam_date || ''
                  }
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowExamDateModal(false)
                    setSelectedExamForDate(null)
                  }}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="form-button"
                >
                  Save Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Dashboard
