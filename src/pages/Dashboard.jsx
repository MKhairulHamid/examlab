import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import useExamStore from '../stores/examStore'
import usePurchaseStore from '../stores/purchaseStore'
import PageLayout from '../components/layout/PageLayout'
import PurchaseModal from '../components/purchase/PurchaseModal'

// Mock user data for demonstration
const MOCK_USER_DATA = {
  totalQuestions: 245,
  questionsToday: 15,
  currentStreak: 7,
  freeQuestionsUsed: 10,
  freeQuestionsTotal: 10,
  activeCertifications: [
    {
      id: 1,
      code: 'SAA-C03',
      name: 'AWS Solutions Architect Associate',
      provider: 'AWS',
      icon: '🔶',
      progress: 85,
      totalQuestions: 195,
      completedQuestions: 85,
      sets: [
        { number: 1, owned: true, questions: 65, completed: 65 },
        { number: 2, owned: true, questions: 65, completed: 20 },
        { number: 3, owned: false, questions: 65, completed: 0, price: 5 }
      ],
      lastActivity: '2 days ago',
      performanceByDomain: [
        { domain: 'Compute', score: 85, status: 'strong' },
        { domain: 'Storage', score: 72, status: 'review' },
        { domain: 'Security', score: 68, status: 'needs-work' },
        { domain: 'Networking', score: 78, status: 'review' }
      ]
    },
    {
      id: 2,
      code: 'AZ-104',
      name: 'Azure Administrator',
      provider: 'Azure',
      icon: '☁️',
      progress: 40,
      totalQuestions: 150,
      completedQuestions: 60,
      sets: [
        { number: 1, owned: true, questions: 50, completed: 50 },
        { number: 2, owned: true, questions: 50, completed: 10 },
        { number: 3, owned: false, questions: 50, completed: 0, price: 5 }
      ],
      lastActivity: 'Yesterday',
      performanceByDomain: [
        { domain: 'Identity', score: 80, status: 'strong' },
        { domain: 'Storage', score: 65, status: 'needs-work' },
        { domain: 'Compute', score: 75, status: 'review' }
      ]
    }
  ],
  recentActivity: [
    { date: 'Today', certification: 'AWS SAA-C03', questionsAttempted: 15, score: 87, duration: '25 min' },
    { date: 'Yesterday', certification: 'Azure AZ-104', questionsAttempted: 20, score: 75, duration: '32 min' },
    { date: '2 days ago', certification: 'AWS SAA-C03', questionsAttempted: 10, score: 90, duration: '18 min' }
  ],
  achievements: [
    { icon: '🔥', title: '7-day streak', date: 'Active' },
    { icon: '🎯', title: 'Completed Set 1', date: '2 days ago' },
    { icon: '💯', title: 'Perfect score (20 Qs)', date: '1 week ago' }
  ]
}

function Dashboard() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { exams, fetchExams } = useExamStore()
  const { purchases, fetchPurchases, purchasedQuestionSetIds } = usePurchaseStore()
  const [activeView, setActiveView] = useState('overview') // 'overview', 'analytics', 'review', 'explore'
  const [selectedCert, setSelectedCert] = useState(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)

  useEffect(() => {
    fetchExams()
    if (user) {
      fetchPurchases(user.id)
    }
  }, [user])

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Student'

  // Calculate overall accuracy
  const calculateOverallAccuracy = () => {
    const total = MOCK_USER_DATA.recentActivity.reduce((sum, act) => sum + act.score, 0)
    return Math.round(total / MOCK_USER_DATA.recentActivity.length)
  }

  const renderQuickStats = () => (
    <div style={{ 
      display: 'grid', 
      gap: '1rem', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      marginBottom: '2rem'
    }}>
      {[
        { icon: '📝', label: 'Total Questions', value: MOCK_USER_DATA.totalQuestions, color: '#00D4AA' },
        { icon: '✅', label: 'Completed Today', value: MOCK_USER_DATA.questionsToday, color: '#3b82f6' },
        { icon: '🔥', label: 'Current Streak', value: `${MOCK_USER_DATA.currentStreak} days`, color: '#f59e0b' },
        { icon: '📊', label: 'Average Accuracy', value: `${calculateOverallAccuracy()}%`, color: '#10b981' }
      ].map((stat, index) => (
        <div 
          key={index}
          style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div style={{ fontSize: '2.5rem' }}>{stat.icon}</div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: stat.color }}>
              {stat.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderMyCertifications = () => (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
          📚 My Certifications
          </h2>
        <button
          onClick={() => setActiveView('explore')}
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
          <span>+</span> Add Certification
        </button>
      </div>

      {MOCK_USER_DATA.freeQuestionsUsed >= MOCK_USER_DATA.freeQuestionsTotal && (
        <div style={{
          background: 'rgba(251,191,36,0.15)',
          border: '1px solid rgba(251,191,36,0.3)',
          padding: '1rem 1.5rem',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          color: 'rgba(255,255,255,0.9)',
          fontSize: '0.875rem'
        }}>
          🎁 Free questions used: {MOCK_USER_DATA.freeQuestionsUsed}/{MOCK_USER_DATA.freeQuestionsTotal}
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {MOCK_USER_DATA.activeCertifications.map((cert) => (
          <div 
            key={cert.id}
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedCert(cert)}
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
              <div style={{ fontSize: '3rem' }}>{cert.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>
                  {cert.code}
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
                  {cert.name}
                </h3>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
                  {cert.provider}
                </div>
              </div>
        </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Progress</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#00D4AA' }}>
                  {cert.completedQuestions}/{cert.totalQuestions} ({Math.round((cert.completedQuestions/cert.totalQuestions) * 100)}%)
                </span>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.2)', 
                borderRadius: '9999px', 
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${(cert.completedQuestions/cert.totalQuestions) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #00D4AA 0%, #00A884 100%)',
                  transition: 'width 0.3s'
                }}></div>
              </div>
            </div>

            {/* Sets Status */}
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {cert.sets.map((set) => (
                <div 
                  key={set.number}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Set {set.number}: {set.owned ? '✓' : '🔒'} {set.owned ? 'Owned' : 'Locked'} ({set.questions} questions)
                  </span>
                  {!set.owned && (
                    <span style={{ color: '#00D4AA', fontWeight: '600' }}>${set.price}</span>
                  )}
                  {set.owned && set.completed > 0 && (
                    <span style={{ color: '#00D4AA' }}>{set.completed}/{set.questions}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/exam/${cert.code.toLowerCase()}`)
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
                Continue Practice
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedCert(cert)
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
                Details
              </button>
            </div>

            <div style={{ 
              fontSize: '0.75rem', 
              color: 'rgba(255,255,255,0.6)', 
              marginTop: '0.75rem',
              textAlign: 'center'
            }}>
              Last practiced: {cert.lastActivity}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPracticeSessionLauncher = () => (
    <div style={{ 
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(20px)',
      padding: '2rem',
      borderRadius: '1rem',
      border: '1px solid rgba(255,255,255,0.2)',
      marginBottom: '3rem'
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>
        🎯 Quick Practice Options
      </h2>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        {[
          { icon: '▶️', title: 'Continue Last Session', desc: 'Pick up where you left off', color: '#00D4AA' },
          { icon: '🎲', title: 'Random 20 Questions', desc: 'Mix from owned sets', color: '#3b82f6' },
          { icon: '⭐', title: 'Daily Challenge', desc: '10 questions for your streak', color: '#f59e0b' },
          { icon: '🔄', title: 'Review Incorrect', desc: 'Practice weak areas', color: '#ef4444' }
        ].map((option, index) => (
          <button
            key={index}
            style={{
              padding: '1.25rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.borderColor = option.color
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{option.icon}</div>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '0.25rem' }}>
              {option.title}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
              {option.desc}
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1rem', fontWeight: '600' }}>
          Practice Modes:
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {['Study Mode', 'Timed Mode', 'Review Mode'].map((mode, index) => (
            <button
              key={index}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderProgressAnalytics = () => (
    <div style={{ marginBottom: '3rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>
        📊 Progress Analytics
      </h2>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {MOCK_USER_DATA.activeCertifications.map((cert) => (
          <div 
            key={cert.id}
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
              {cert.icon} {cert.code}
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.75rem', fontWeight: '600' }}>
                Performance by Domain:
              </div>
              {cert.performanceByDomain.map((domain, index) => (
                <div key={index} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>{domain.domain}</span>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600',
                      color: domain.status === 'strong' ? '#10b981' : domain.status === 'review' ? '#f59e0b' : '#ef4444'
                    }}>
                      {domain.score}%
                    </span>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    borderRadius: '9999px', 
                    height: '6px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${domain.score}%`,
                      height: '100%',
                      background: domain.status === 'strong' ? '#10b981' : domain.status === 'review' ? '#f59e0b' : '#ef4444',
                      transition: 'width 0.3s'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ 
              paddingTop: '1rem', 
              borderTop: '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.7)'
            }}>
              <div style={{ marginBottom: '0.25rem' }}>
                🟢 <strong>Strong:</strong> Keep it up!
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                🟡 <strong>Review:</strong> Consider more practice
              </div>
              <div>
                🔴 <strong>Needs work:</strong> Focus here
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderActivityFeed = () => (
    <div style={{ 
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(20px)',
      padding: '1.5rem',
      borderRadius: '1rem',
      border: '1px solid rgba(255,255,255,0.2)',
      marginBottom: '3rem'
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>
        📅 Recent Activity
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {MOCK_USER_DATA.recentActivity.map((activity, index) => (
          <div 
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white', marginBottom: '0.25rem' }}>
                {activity.certification}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                {activity.questionsAttempted} questions • {activity.duration}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontSize: '1.25rem', 
                fontWeight: '700',
                color: activity.score >= 80 ? '#10b981' : activity.score >= 70 ? '#f59e0b' : '#ef4444'
              }}>
                {activity.score}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                {activity.date}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
          🏆 Recent Achievements
        </h3>
        <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {MOCK_USER_DATA.achievements.map((achievement, index) => (
            <div 
              key={index}
              style={{
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <div style={{ fontSize: '2rem' }}>{achievement.icon}</div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white' }}>
                  {achievement.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                  {achievement.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStudyStreak = () => (
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
        {MOCK_USER_DATA.currentStreak} Days
      </div>
      
      <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
        Don't break your streak! Practice today to keep it going.
      </div>

      {/* Mini Calendar */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {Array.from({ length: 14 }, (_, i) => {
          const isActive = i >= 14 - MOCK_USER_DATA.currentStreak
          return (
            <div 
              key={i}
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '0.25rem',
                background: isActive ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: isActive ? 'white' : 'rgba(255,255,255,0.5)'
              }}
            >
              {isActive ? '✓' : ''}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem', fontWeight: '600' }}>
          Daily Goal
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00D4AA', marginBottom: '0.75rem' }}>
          {MOCK_USER_DATA.questionsToday} / 20 Questions Today
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
            width: `${(MOCK_USER_DATA.questionsToday / 20) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #00D4AA 0%, #00A884 100%)',
            transition: 'width 0.3s'
          }}></div>
        </div>
      </div>
    </div>
  )

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
          onClick={() => navigate('/')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.875rem'
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

  return (
    <PageLayout>
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

        {/* Quick Stats */}
        {renderQuickStats()}

        {/* Purchase Summary */}
        {renderPurchasesSummary()}

        {/* My Certifications */}
        {renderMyCertifications()}

        {/* Practice Session Launcher */}
        {renderPracticeSessionLauncher()}

        {/* Progress Analytics */}
        {renderProgressAnalytics()}

        {/* Activity Feed */}
        {renderActivityFeed()}

        {/* Study Streak */}
        {renderStudyStreak()}

        {/* Explore More */}
        {renderExploreMore()}
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
    </PageLayout>
  )
}

export default Dashboard
