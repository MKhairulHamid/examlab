import React, { useEffect, useState, useRef } from 'react'
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
  const { isSubscribed, fetchSubscription, enrolledExamIds, fetchEnrollments, enrollInExam, isEnrolled } = usePurchaseStore()
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const [enrollingExamId, setEnrollingExamId] = useState(null)
  const [streakStats, setStreakStats] = useState(null)
  const [userCertifications, setUserCertifications] = useState([])
  const [examResults, setExamResults] = useState([])
  const [examDates, setExamDates] = useState([])
  const [showExamDateModal, setShowExamDateModal] = useState(false)
  const [selectedExamForDate, setSelectedExamForDate] = useState(null)
  const exploreRef = useRef(null)

  useEffect(() => {
    fetchExams()
    if (user) {
      fetchSubscription(user.id)
      fetchEnrollments(user.id)
      initializeStreak()
      loadExamResults()
      loadExamDates()
    }
  }, [user])

  const loadExamResults = async () => {
    if (!user) return
    
    try {
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
    const loadUserCertifications = async () => {
      if (exams.length > 0 && user) {
        const userAttempts = await progressService.getAllProgress(user.id)
        
        const attemptedExamIds = new Set()
        for (const attempt of userAttempts) {
          const questionSet = await indexedDBService.getQuestionSet(attempt.questionSetId)
          if (questionSet?.exam_type_id) {
            attemptedExamIds.add(questionSet.exam_type_id)
          }
        }
        
        const userExams = exams.filter(exam => {
          if (enrolledExamIds.includes(exam.id)) return true
          const hasStarted = attemptedExamIds.has(exam.id)
          return isSubscribed || hasStarted
        })
        
        setUserCertifications(userExams)
      }
    }
    
    loadUserCertifications()
  }, [exams, user, isSubscribed, enrolledExamIds])

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Student'

  const initializeStreak = async () => {
    if (user) {
      await streakService.initializeStreak(user.id)
      streakService.startAutoSync(user.id)
      updateStreakStats()
    }
  }

  const updateStreakStats = () => {
    const stats = streakService.getStreakStats()
    setStreakStats(stats)
  }

  const recordStreakActivity = async (questionsCompleted = 1) => {
    if (user) {
      await streakService.recordActivity(user.id, questionsCompleted)
      updateStreakStats()
    }
  }

  useEffect(() => {
    return () => {
      streakService.stopAutoSync()
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        updateStreakStats()
        loadExamResults()
      }
    }

    const handleFocus = () => {
      if (user) {
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

  // ─── Shared styles ────────────────────────────────────────────
  const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }
  const sectionPad = { padding: '3rem 0' }
  const sectionHeadingStyle = { fontSize: '1.5rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.5rem', lineHeight: '1.3' }
  const sectionLabelStyle = { color: '#00D4AA', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }
  const cardStyle = {
    background: 'white',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s, transform 0.2s'
  }
  const primaryBtnStyle = {
    padding: '0.625rem 1.25rem',
    background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s'
  }
  const outlineBtnStyle = {
    padding: '0.625rem 1.25rem',
    background: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s'
  }

  const liftCard = (e) => {
    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)'
    e.currentTarget.style.transform = 'translateY(-3px)'
  }
  const resetCard = (e) => {
    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
    e.currentTarget.style.transform = 'translateY(0)'
  }

  // ─── Render: Quick Stats ──────────────────────────────────────
  const renderQuickStats = () => {
    const totalResults = examResults.length
    const passedResults = examResults.filter(r => r.passed).length
    const streak = streakStats?.currentStreak || 0
    const upcomingExams = examDates.filter(d => calculateDaysUntil(d.exam_date) >= 0).length

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        marginTop: '-2rem',
        position: 'relative',
        zIndex: 2
      }}>
        {[
          { label: 'Enrolled', value: userCertifications.length, icon: '📚' },
          { label: 'Day Streak', value: streak, icon: '🔥' },
          { label: 'Exams Taken', value: totalResults, icon: '📝' },
          { label: 'Passed', value: passedResults, icon: '✅' },
          ...(upcomingExams > 0 ? [{ label: 'Upcoming', value: upcomingExams, icon: '📅' }] : [])
        ].map((stat, i) => (
          <div key={i} style={{
            ...cardStyle,
            padding: '1.25rem',
            textAlign: 'center',
            background: 'white'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0A2540' }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    )
  }

  // ─── Render: Exam Countdown ───────────────────────────────────
  const renderExamCountdown = () => {
    const futureDates = examDates.filter(d => calculateDaysUntil(d.exam_date) >= 0)
    if (futureDates.length === 0) return null

    const sortedDates = [...futureDates].sort((a, b) => 
      new Date(a.exam_date) - new Date(b.exam_date)
    )

    return (
      <section style={{ ...sectionPad, background: 'white' }}>
        <div style={containerStyle}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={sectionLabelStyle}>YOUR EXAM SCHEDULE</div>
            <h2 style={sectionHeadingStyle}>Exam Countdown</h2>
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {sortedDates.map((examDate) => {
              const daysUntil = calculateDaysUntil(examDate.exam_date)
              const isToday = daysUntil === 0
              const isUrgent = daysUntil > 0 && daysUntil <= 7

              let accentColor = '#00D4AA'
              let accentBg = 'rgba(0, 212, 170, 0.08)'
              let statusText = `${daysUntil} day${daysUntil !== 1 ? 's' : ''} left`
              
              if (isToday) {
                accentColor = '#f59e0b'
                accentBg = 'rgba(245, 158, 11, 0.08)'
                statusText = 'Today!'
              } else if (isUrgent) {
                accentColor = '#ef4444'
                accentBg = 'rgba(239, 68, 68, 0.08)'
                statusText = `${daysUntil} day${daysUntil !== 1 ? 's' : ''} left`
              }

              return (
                <div
                  key={examDate.exam_type_id}
                  style={{
                    ...cardStyle,
                    padding: '1.25rem',
                    borderLeft: `4px solid ${accentColor}`,
                    position: 'relative'
                  }}
                >
                  <button
                    onClick={() => removeExamDate(examDate.exam_type_id)}
                    style={{
                      position: 'absolute', top: '0.75rem', right: '0.75rem',
                      background: 'transparent', border: 'none', color: '#9ca3af',
                      cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem', lineHeight: 1
                    }}
                    title="Remove exam date"
                  >
                    ×
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '3.5rem', height: '3.5rem', borderRadius: '0.75rem',
                      background: accentBg, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', color: accentColor, lineHeight: 1 }}>
                        {isToday ? '!' : daysUntil}
                      </div>
                      <div style={{ fontSize: '0.6rem', fontWeight: '600', color: accentColor }}>
                        {isToday ? 'TODAY' : 'DAYS'}
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {examDate.exam_name}
                      </h3>
                      <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                        {new Date(examDate.exam_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        const exam = exams.find(e => e.id === examDate.exam_type_id)
                        if (exam) navigate(`/exam/${exam.slug}`)
                      }}
                      style={{ ...primaryBtnStyle, flex: 1, padding: '0.5rem', fontSize: '0.8125rem' }}
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
                      style={{ ...outlineBtnStyle, padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // ─── Render: My Certifications ────────────────────────────────
  const renderMyCertifications = () => (
    <section style={{ ...sectionPad, background: '#f8f9fb' }}>
      <div style={containerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={sectionLabelStyle}>YOUR CERTIFICATIONS</div>
            <h2 style={sectionHeadingStyle}>My Certifications</h2>
          </div>
          <button
            onClick={() => {
              if (exploreRef.current) {
                exploreRef.current.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            style={{ ...primaryBtnStyle, display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <span style={{ fontSize: '1.125rem', lineHeight: 1 }}>+</span> Browse More
          </button>
        </div>

        {userCertifications.length === 0 ? (
          <div style={{
            ...cardStyle,
            padding: '3rem 2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📚</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.5rem' }}>
              No Certifications Yet
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
              Start your certification journey today!
            </p>
            <button
              onClick={() => {
                if (exploreRef.current) {
                  exploreRef.current.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              style={primaryBtnStyle}
            >
              Browse Exams
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {userCertifications.map((exam) => {
              const isExamEnrolled = enrolledExamIds.includes(exam.id)
              const isPurchased = isSubscribed || isExamEnrolled
              const isStartedOnly = !isPurchased
              const scheduled = examDates.find(d => d.exam_type_id === exam.id)
              
              return (
                <div 
                  key={exam.id}
                  style={{ ...cardStyle, padding: '1.25rem', cursor: 'pointer' }}
                  onMouseEnter={liftCard}
                  onMouseLeave={resetCard}
                  onClick={() => navigate(`/exam/${exam.slug}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: '0.875rem', marginBottom: '0.875rem' }}>
                    <div style={{
                      fontSize: '2.25rem', width: '3rem', height: '3rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {exam.icon || '📚'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.6875rem', color: '#00D4AA', fontWeight: '700', marginBottom: '0.125rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {exam.provider}
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.375rem', lineHeight: '1.3' }}>
                        {exam.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#6b7280' }}>
                        <span>{exam.total_questions || 'N/A'} Qs</span>
                        <span>{exam.duration_minutes || 'N/A'} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Status + Scheduled date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
                    {isPurchased ? (
                      <span style={{ 
                        display: 'inline-block', padding: '0.2rem 0.625rem',
                        background: '#d1fae5', border: '1px solid #a7f3d0',
                        borderRadius: '9999px', color: '#065f46',
                        fontSize: '0.6875rem', fontWeight: '600'
                      }}>
                        {isExamEnrolled ? 'Enrolled' : 'Subscribed'}
                      </span>
                    ) : isStartedOnly ? (
                      <span style={{ 
                        display: 'inline-block', padding: '0.2rem 0.625rem',
                        background: '#dbeafe', border: '1px solid #bfdbfe',
                        borderRadius: '9999px', color: '#1e40af',
                        fontSize: '0.6875rem', fontWeight: '600'
                      }}>
                        In Progress
                      </span>
                    ) : (
                      <span style={{ 
                        display: 'inline-block', padding: '0.2rem 0.625rem',
                        background: '#fef3c7', border: '1px solid #fde68a',
                        borderRadius: '9999px', color: '#92400e',
                        fontSize: '0.6875rem', fontWeight: '600'
                      }}>
                        Free Questions
                      </span>
                    )}
                    {scheduled && (
                      <span style={{ fontSize: '0.6875rem', color: '#6b7280' }}>
                        Exam: {new Date(scheduled.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/exam/${exam.slug}`)
                      }}
                      style={{ ...primaryBtnStyle, flex: 1, padding: '0.5rem', fontSize: '0.8125rem' }}
                    >
                      {isPurchased || isStartedOnly ? 'Continue Practice' : 'Try Free Questions'}
                    </button>
                    {!isPurchased && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowEnrollmentModal(true)
                        }}
                        style={{ ...outlineBtnStyle, padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}
                      >
                        Enroll
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedExamForDate(exam)
                        setShowExamDateModal(true)
                      }}
                      style={{
                        ...outlineBtnStyle,
                        padding: '0.5rem 0.625rem',
                        fontSize: '0.8125rem',
                        color: '#00D4AA',
                        borderColor: 'rgba(0,212,170,0.3)'
                      }}
                      title={`${scheduled ? 'Update' : 'Set'} exam date`}
                    >
                      📅
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

  // ─── Render: Study Streak ─────────────────────────────────────
  const renderStudyStreak = () => {
    if (!streakStats) return null

    const { currentStreak, longestStreak, questionsToday, dailyGoal, studyDates } = streakStats
    const today = new Date().toISOString().split('T')[0]
    
    const sortedStudyDates = [...studyDates].sort()
    const firstStudyDate = sortedStudyDates.length > 0 ? sortedStudyDates[0] : today
    
    const firstDate = new Date(firstStudyDate)
    const todayDate = new Date(today)
    const daysSinceFirst = Math.floor((todayDate - firstDate) / (1000 * 60 * 60 * 24))
    
    const cycleNumber = Math.floor(daysSinceFirst / 14)
    const cycleStart = cycleNumber * 14
    
    const displayDays = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(firstDate)
      date.setDate(date.getDate() + cycleStart + i)
      return date.toISOString().split('T')[0]
    })
    
    const progressPercent = Math.min((questionsToday / dailyGoal) * 100, 100)

    return (
      <div style={{ ...cardStyle, padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={sectionLabelStyle}>YOUR PROGRESS</div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0A2540', marginBottom: '1.25rem' }}>
          Study Streak
        </h3>

        {/* Streak number */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '2.75rem', fontWeight: '700', color: '#f59e0b', lineHeight: 1 }}>
            {currentStreak}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {currentStreak === 1 ? 'day' : 'days'} streak {currentStreak > 0 ? '— keep going!' : '— start today!'}
          </div>
          {longestStreak > 0 && (
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              Best: {longestStreak} days
            </div>
          )}
        </div>

        {/* Mini calendar */}
        <div style={{ marginBottom: '1.25rem', flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem', textAlign: 'center' }}>
            {studyDates.length === 0 ? 'Start Your Journey' : `Cycle ${cycleNumber + 1}`}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.375rem', justifyItems: 'center' }}>
            {Array.from({ length: 14 }, (_, i) => {
              const date = displayDays[i]
              const isStudied = date && studyDates.includes(date)
              const isDateToday = date === today
              const isFuture = !date || date > today
              const dayNumber = i + 1
              
              return (
                <div 
                  key={i}
                  style={{
                    width: '1.75rem', height: '1.75rem', borderRadius: '0.25rem',
                    background: isFuture ? '#f9fafb' : (isStudied ? (isDateToday ? '#00D4AA' : '#10b981') : '#f3f4f6'),
                    border: isDateToday ? '2px solid #00D4AA' : (isFuture ? '1px solid #f3f4f6' : '1px solid #e5e7eb'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6875rem',
                    color: isFuture ? '#e5e7eb' : (isStudied ? 'white' : '#9ca3af'),
                    fontWeight: isStudied ? '700' : '400',
                    opacity: isFuture ? 0.3 : 1
                  }}
                  title={date ? `${date} — Day ${dayNumber}` : `Day ${dayNumber}`}
                >
                  {isStudied ? '✓' : (isFuture ? '' : dayNumber)}
                </div>
              )
            })}
          </div>
        </div>

        {/* Daily progress bar */}
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#4b5563', fontWeight: '600' }}>Today</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#00D4AA' }}>
              {questionsToday}/{dailyGoal}
            </span>
          </div>
          <div style={{ background: '#e5e7eb', borderRadius: '9999px', height: '6px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${progressPercent}%`, height: '100%',
              background: questionsToday >= dailyGoal 
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : 'linear-gradient(90deg, #00D4AA, #00A884)',
              transition: 'width 0.3s', borderRadius: '9999px'
            }} />
          </div>
          {questionsToday >= dailyGoal && (
            <div style={{ marginTop: '0.5rem', color: '#10b981', fontSize: '0.75rem', fontWeight: '600', textAlign: 'center' }}>
              Goal completed!
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── Render: Recent Results ───────────────────────────────────
  const renderRecentResults = () => {
    if (examResults.length === 0) {
      return (
        <div style={{ ...cardStyle, padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={sectionLabelStyle}>YOUR PERFORMANCE</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0A2540', marginBottom: '1.25rem' }}>
            Recent Results
          </h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
            <p style={{ fontSize: '0.875rem' }}>No exam results yet</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Complete a practice exam to see your results here.</p>
          </div>
        </div>
      )
    }

    return (
      <div style={{ ...cardStyle, padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={sectionLabelStyle}>YOUR PERFORMANCE</div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0A2540', marginBottom: '1.25rem' }}>
          Recent Results
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', flex: 1 }}>
          {examResults.slice(0, 5).map((result) => {
            const passColor = result.passed ? '#10b981' : '#ef4444'
            
            return (
              <div
                key={result.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer',
                  border: '1px solid #f3f4f6', transition: 'background 0.15s'
                }}
                onClick={async () => {
                  if (result.examSlug) {
                    navigate(`/exam/${result.examSlug}/results?resultId=${result.id}&set=${result.questionSetId}`)
                  } else {
                    const questionSet = await indexedDBService.getQuestionSet(result.questionSetId)
                    if (questionSet?.exam_type_id) {
                      const exam = exams.find(e => e.id === questionSet.exam_type_id)
                      if (exam) {
                        navigate(`/exam/${exam.slug}/results?resultId=${result.id}&set=${result.questionSetId}`)
                      }
                    }
                  }
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{
                  width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem',
                  background: passColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '700', fontSize: '0.875rem', flexShrink: 0
                }}>
                  {result.passed ? '✓' : '✗'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#0A2540', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {result.examName || 'Exam Result'}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>
                    {new Date(result.completedAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: '700', color: passColor }}>{result.percentageScore}%</div>
                  <div style={{ fontSize: '0.625rem', color: '#9ca3af' }}>{result.rawScore}/{result.totalQuestions}</div>
                </div>
                <div style={{ color: '#d1d5db', fontSize: '0.875rem', flexShrink: 0 }}>›</div>
              </div>
            )
          })}
        </div>

        {examResults.length > 5 && (
          <div style={{ marginTop: '0.75rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.75rem' }}>
            + {examResults.length - 5} more results
          </div>
        )}
      </div>
    )
  }

  // ─── Render: Streak + Results row ─────────────────────────────
  const renderProgressRow = () => (
    <section style={{ ...sectionPad, background: 'white' }}>
      <div style={containerStyle}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}>
          {renderStudyStreak()}
          {renderRecentResults()}
        </div>
      </div>
    </section>
  )

  // ─── Render: Explore More ─────────────────────────────────────
  const renderExploreMore = () => {
    // Filter out exams user already has
    const enrolledIds = new Set(userCertifications.map(e => e.id))
    const availableExams = exams.filter(e => !enrolledIds.has(e.id))
    const displayExams = availableExams.length > 0 ? availableExams.slice(0, 6) : exams.slice(0, 6)

    return (
      <section ref={exploreRef} style={{ ...sectionPad, background: '#f8f9fb' }}>
        <div style={containerStyle}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={sectionLabelStyle}>DISCOVER MORE</div>
            <h2 style={sectionHeadingStyle}>Explore Certifications</h2>
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {displayExams.map(exam => {
              const alreadyEnrolled = enrolledExamIds.includes(exam.id)

              return (
                <div
                  key={exam.id}
                  style={{ ...cardStyle, padding: '1.25rem', cursor: 'pointer' }}
                  onMouseEnter={liftCard}
                  onMouseLeave={resetCard}
                  onClick={() => navigate(`/exam/${exam.slug}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '2rem', flexShrink: 0 }}>{exam.icon || '📚'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.6875rem', color: '#00D4AA', fontWeight: '700', marginBottom: '0.125rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {exam.provider}
                      </div>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#0A2540', lineHeight: '1.3' }}>
                        {exam.name}
                      </h3>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.875rem', lineHeight: '1.5' }}>
                    {exam.description?.slice(0, 80)}{exam.description?.length > 80 ? '...' : ''}
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.875rem' }}>
                    <span>{exam.total_questions || 'N/A'} Qs</span>
                    <span>{exam.duration_minutes || 'N/A'} min</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/exam/${exam.slug}`) }}
                      style={{ ...outlineBtnStyle, flex: 1, padding: '0.5rem', fontSize: '0.8125rem' }}
                    >
                      Try Free
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (isSubscribed) {
                          setEnrollingExamId(exam.id)
                          const result = await enrollInExam(exam.id, user.id)
                          setEnrollingExamId(null)
                          if (!result.success && result.needsSubscription) {
                            setShowEnrollmentModal(true)
                          }
                        } else {
                          setShowEnrollmentModal(true)
                        }
                      }}
                      disabled={enrollingExamId === exam.id || alreadyEnrolled}
                      style={{
                        ...primaryBtnStyle,
                        flex: 1,
                        padding: '0.5rem',
                        fontSize: '0.8125rem',
                        ...(alreadyEnrolled ? {
                          background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', cursor: 'default'
                        } : {}),
                        opacity: enrollingExamId === exam.id ? 0.7 : 1
                      }}
                    >
                      {alreadyEnrolled 
                        ? 'Enrolled' 
                        : enrollingExamId === exam.id 
                          ? 'Enrolling...' 
                          : isSubscribed 
                            ? 'Enroll' 
                            : 'Subscribe'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={() => {
                navigate('/')
                setTimeout(() => {
                  const element = document.getElementById('certifications')
                  if (element) element.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
              style={outlineBtnStyle}
            >
              View All Certifications →
            </button>
          </div>
        </div>
      </section>
    )
  }

  // ─── Render: Subscription Summary ─────────────────────────────
  const renderSubscriptionSummary = () => {
    const { subscription } = usePurchaseStore.getState()

    if (!isSubscribed) return null

    return (
      <section style={{ ...sectionPad, background: 'white' }}>
        <div style={containerStyle}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={sectionLabelStyle}>ACCOUNT</div>
            <h2 style={sectionHeadingStyle}>Subscription</h2>
          </div>

          {subscription && (
            <div style={{
              ...cardStyle,
              padding: '1.25rem',
              border: '2px solid #00D4AA'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.25rem' }}>
                    Active Subscription
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                    {subscription.subscription_plans?.name || 'Plan'} — Full access to all exams
                  </p>
                  {subscription.current_period_end && (
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.125rem' }}>
                      Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span style={{
                  padding: '0.375rem 0.875rem', background: '#d1fae5',
                  border: '1px solid #a7f3d0', borderRadius: '9999px',
                  color: '#065f46', fontSize: '0.75rem', fontWeight: '600'
                }}>
                  Active
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    )
  }

  // ─── Render: Footer ───────────────────────────────────────────
  const renderDashboardFooter = () => (
    <footer style={{ background: '#0A2540', padding: '3rem 0 1.5rem', width: '100%' }}>
      <div style={{
        ...containerStyle,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📚</span>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>Cloud Exam Lab</h3>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', marginBottom: '1rem' }}>
            Master cloud certifications with professional exam practice. AWS, Azure, and GCP.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[
              { label: 'Twitter', href: 'https://twitter.com/cloudexamlab' },
              { label: 'LinkedIn', href: 'https://linkedin.com/company/cloudexamlab' },
              { label: 'GitHub', href: 'https://github.com/cloudexamlab' }
            ].map(link => (
              <a 
                key={link.label}
                href={link.href} 
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Browse Exams', action: () => navigate('/') },
              { label: 'Dashboard', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
              { label: 'Support', href: 'mailto:support@cloudexamlab.com' }
            ].map((item, i) => (
              <li key={i}>
                {item.href ? (
                  <a
                    href={item.href}
                    style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    onClick={item.action}
                    style={{
                      background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.8125rem', cursor: 'pointer', padding: 0,
                      transition: 'color 0.2s', textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                  >
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Resources
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'All Certifications', section: 'certifications' },
              { label: 'Pricing', section: 'pricing' },
              { label: 'FAQ', section: 'faq' }
            ].map((item, i) => (
              <li key={i}>
                <button
                  onClick={() => {
                    navigate('/')
                    setTimeout(() => {
                      const el = document.getElementById(item.section)
                      if (el) el.scrollIntoView({ behavior: 'smooth' })
                    }, 100)
                  }}
                  style={{
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.8125rem', cursor: 'pointer', padding: 0,
                    transition: 'color 0.2s', textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        ...containerStyle,
        paddingTop: '1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto 0.75rem' }}>
          <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Disclaimer:</strong> Independent practice questions for certification preparation. 
          Not affiliated with or endorsed by Amazon Web Services (AWS), Microsoft Azure, Google Cloud Platform (GCP), 
          or any other certification provider. All trademarks are property of their respective owners.
        </p>
        <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.3)' }}>
          © {new Date().getFullYear()} Cloud Exam Lab. All rights reserved.
        </p>
      </div>
    </footer>
  )

  // ─── Main Return ──────────────────────────────────────────────
  return (
    <>
      <DashboardHeader />
      <div style={{ minHeight: '100vh', background: '#f8f9fb' }}>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section style={{
          background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
          padding: '3rem 1.5rem 4rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', width: '20rem', height: '20rem',
            background: 'rgba(0, 212, 170, 0.08)', borderRadius: '9999px',
            filter: 'blur(80px)', top: '-2rem', right: '-4rem'
          }} />
          <div style={{
            position: 'absolute', width: '16rem', height: '16rem',
            background: 'rgba(0, 212, 170, 0.06)', borderRadius: '9999px',
            filter: 'blur(80px)', bottom: '-2rem', left: '-2rem'
          }} />
          
          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ 
              display: 'inline-block', padding: '0.375rem 0.875rem',
              background: 'rgba(0, 212, 170, 0.12)', borderRadius: '9999px',
              color: '#00D4AA', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.75rem',
              letterSpacing: '0.04em'
            }}>
              DASHBOARD
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem', lineHeight: '1.2' }}>
              Welcome back, {userName}!
            </h1>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto' }}>
              Ready to continue your certification journey?
            </p>

            {!isSubscribed && (
              <button
                onClick={() => setShowEnrollmentModal(true)}
                style={{
                  marginTop: '1.25rem',
                  ...primaryBtnStyle,
                  padding: '0.75rem 1.75rem',
                  fontSize: '0.9375rem',
                  fontWeight: '700',
                  boxShadow: '0 4px 15px rgba(0, 212, 170, 0.3)',
                  borderRadius: '0.625rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 170, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 212, 170, 0.3)'
                }}
              >
                Subscribe for Full Access
              </button>
            )}
          </div>
        </section>

        {/* ── Quick Stats ──────────────────────────────────────── */}
        <div style={{ ...containerStyle, marginBottom: '-1rem' }}>
          {renderQuickStats()}
        </div>

        {/* ── Exam Countdown ───────────────────────────────────── */}
        {renderExamCountdown()}

        {/* ── My Certifications ────────────────────────────────── */}
        {renderMyCertifications()}

        {/* ── Study Streak + Recent Results ─────────────────────── */}
        {renderProgressRow()}

        {/* ── Explore More ─────────────────────────────────────── */}
        {renderExploreMore()}

        {/* ── Subscription Summary ─────────────────────────────── */}
        {renderSubscriptionSummary()}

        {/* ── Footer ───────────────────────────────────────────── */}
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
              <h2 className="modal-title">Set Exam Date</h2>
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
                    ...outlineBtnStyle,
                    flex: 1,
                    padding: '0.875rem',
                    borderRadius: '0.75rem',
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
