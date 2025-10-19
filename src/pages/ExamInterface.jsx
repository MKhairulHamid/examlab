import React, { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import useExamStore from '../stores/examStore'
import useProgressStore from '../stores/progressStore'
import useAuthStore from '../stores/authStore'
import usePurchaseStore from '../stores/purchaseStore'

function ExamInterface() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setId = searchParams.get('set')
  
  const { user } = useAuthStore()
  const { loadQuestionSet, currentQuestionSet, getExamBySlug } = useExamStore()
  const { hasPurchased, fetchPurchases } = usePurchaseStore()
  const { 
    startExam, 
    currentQuestionIndex, 
    answers,
    goToQuestion,
    saveAnswer,
    getAnswerCount,
    timeElapsed,
    timerPaused,
    updateTimer,
    setTimerPaused,
    isQuestionAnswered,
    status
  } = useProgressStore()

  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [accessMessage, setAccessMessage] = useState('')
  const [duration, setDuration] = useState(0)
  const [showMaterialsModal, setShowMaterialsModal] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      if (setId && user) {
        try {
          // SECURITY: Step 1 - Fetch user's purchases
          await fetchPurchases(user.id)
          
          // SECURITY: Step 2 - Load question set metadata
          const questionSet = await loadQuestionSet(setId)
          
          if (!questionSet) {
            setAccessDenied(true)
            setAccessMessage('Question set not found.')
            setLoading(false)
            return
          }
          
          // SECURITY: Step 3 - Check if it's a free sample
          const isFree = questionSet.is_free_sample || questionSet.price_cents === 0
          
          // SECURITY: Step 4 - Check if user has purchased
          const purchased = hasPurchased(setId)
          
          // SECURITY: Step 5 - Verify access
          if (!isFree && !purchased) {
            console.warn('🔒 Access denied: Question set not purchased', {
              setId,
              userId: user.id,
              isFree,
              purchased
            })
            setAccessDenied(true)
            setAccessMessage('This question set requires a purchase to access.')
            setLoading(false)
            return
          }
          
          // SECURITY: Step 6 - Access granted, log for monitoring
          console.log('✅ Access granted:', {
            setId,
            setName: questionSet.name,
            userId: user.id,
            accessType: isFree ? 'free' : 'purchased'
          })
          
          // Start exam
          const examDuration = questionSet.exam_types?.duration_minutes || 60
          setDuration(examDuration * 60)
          await startExam(setId, user.id, questionSet.question_count || 0)
          setLoading(false)
        } catch (error) {
          console.error('Error initializing exam:', error)
          setAccessDenied(true)
          setAccessMessage('An error occurred while loading the exam.')
          setLoading(false)
        }
      }
    }
    
    initialize()
  }, [setId, user, loadQuestionSet, startExam, fetchPurchases, hasPurchased])

  // Timer interval
  const timerRef = useRef(null)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const state = useProgressStore.getState()
      if (!state.timerPaused && state.status === 'in_progress') {
        state.updateTimer(state.timeElapsed + 1)
      }
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [])

  // Check time expired
  useEffect(() => {
    if (timeElapsed >= duration && status === 'in_progress' && duration > 0) {
      handleFinishExam()
    }
  }, [timeElapsed, duration, status])

  // Visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTimerPaused(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [setTimerPaused])

  // Inactivity detection
  const lastActivityRef = useRef(Date.now())
  const inactivityRef = useRef(null)

  const resetInactivity = () => {
    lastActivityRef.current = Date.now()
  }

  useEffect(() => {
    inactivityRef.current = setInterval(() => {
      if (Date.now() - lastActivityRef.current > 5 * 60 * 1000) {
        setTimerPaused(true)
      }
    }, 1000)

    const events = ['mousemove', 'keydown', 'touchstart', 'scroll']
    events.forEach(ev => document.addEventListener(ev, resetInactivity, { passive: true }))

    return () => {
      clearInterval(inactivityRef.current)
      events.forEach(ev => document.removeEventListener(ev, resetInactivity))
    }
  }, [setTimerPaused])

  // Show access denied screen
  if (accessDenied) {
    return (
      <div className="loading-container">
        <div className="loading-content" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
            Access Denied
          </h2>
          <p style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            {accessMessage || 'This question set requires a purchase.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/exam/${slug}`)}
              className="btn-primary"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              View Purchase Options
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.1)',
                color: 'inherit',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading || !currentQuestionSet) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Loading exam...</p>
        </div>
      </div>
    )
  }

  // Extract questions from question set
  const questionsData = currentQuestionSet.questions_json
  const questions = questionsData?.questions || questionsData || []
  const currentQuestion = questions[currentQuestionIndex]
  const answeredCount = getAnswerCount()

  console.log('📊 Question Set Data:', {
    hasQuestionSet: !!currentQuestionSet,
    hasQuestionsJson: !!questionsData,
    questionsCount: questions.length,
    currentIndex: currentQuestionIndex
  })

  if (!Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-content text-center">
          <p>❌ No questions available</p>
          <p className="text-sm mt-2 opacity-80">
            The question set appears to be empty or not properly formatted.
          </p>
          <button
            onClick={() => navigate(`/exam/${slug}`)}
            className="btn-primary mt-4"
          >
            Back to Exam
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="loading-container">
        <div className="loading-content text-center">
          <p>⚠️ Question not found</p>
          <p className="text-sm mt-2 opacity-80">
            Question index {currentQuestionIndex + 1} is out of range.
          </p>
          <button
            onClick={() => navigate(`/exam/${slug}`)}
            className="btn-primary mt-4"
          >
            Back to Exam
          </button>
        </div>
      </div>
    )
  }

  const handleAnswerSelect = (option) => {
    // Get the option text (in case option is an object with { text, correct })
    const optionText = typeof option === 'string' ? option : option.text
    
    let newAnswer
    
    if (currentQuestion.type === 'multiple') {
      // Multiple choice - toggle selection
      const current = answers[currentQuestionIndex] || []
      if (current.includes(optionText)) {
        newAnswer = current.filter(a => a !== optionText)
      } else {
        newAnswer = [...current, optionText]
      }
    } else {
      // Single choice
      newAnswer = [optionText]
    }
    
    saveAnswer(currentQuestionIndex, newAnswer)
  }

  const calculateResults = () => {
    let correctCount = 0
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index] || []
      const correctAnswers = question.correctAnswers || []
      
      // Sort arrays for comparison
      const sortedUserAnswer = [...userAnswer].sort()
      const sortedCorrectAnswers = [...correctAnswers].sort()
      
      // Check if arrays are equal
      if (JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswers)) {
        correctCount++
      }
    })
    
    const percentage = Math.round((correctCount / questions.length) * 100)
    const scaledScore = Math.round((correctCount / questions.length) * 1000) // Scale to 1000
    
    // Determine if passed (typically 70% or higher)
    const passingScore = 70
    const passed = percentage >= passingScore
    
    return {
      correctCount,
      totalQuestions: questions.length,
      percentage,
      scaledScore,
      passed
    }
  }

  const handleFinishExam = async () => {
    // Calculate results
    const results = calculateResults()
    
    // Add exam metadata
    const resultsWithMetadata = {
      ...results,
      examName: currentQuestionSet.name,
      examSlug: slug
    }
    
    // Complete the exam and save results
    const result = await useProgressStore.getState().completeExam(resultsWithMetadata)
    
    // Navigate to results page
    navigate(`/exam/${slug}/results?resultId=${result.id}&set=${setId}`)
  }

  const currentAnswer = answers[currentQuestionIndex] || []

  const formatTime = (secs) => {
    if (secs < 0) return '00:00:00'
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const timeLeft = Math.max(0, duration - timeElapsed)

  return (
    <div className="exam-interface">
      <div className="exam-interface-container">
        {/* Header */}
        <div className="exam-header">
          <h1 className="exam-header-title">{currentQuestionSet.name}</h1>
          <div className="exam-timer-display">
            ⏱️ Time Remaining: {formatTime(timeLeft)}
          </div>
        </div>

        {/* Time Bar - decreasing */}
        <div className="time-bar-container">
          <div 
            className="time-bar"
            style={{ 
              width: `${(timeLeft / duration * 100)}%`,
              backgroundColor: timeLeft < duration * 0.1 ? '#ef4444' : timeLeft < duration * 0.25 ? '#f59e0b' : '#00D4AA',
              transition: 'width 1s linear, background-color 0.3s'
            }}
          ></div>
        </div>

        {/* Question Navigation */}
        <div className="question-navigation">
          <div className="question-nav-header">
            <span className="text-sm text-white/80">Questions:</span>
            <button
              onClick={() => setShowMaterialsModal(true)}
              className="materials-button"
            >
              📚 Study Materials
            </button>
          </div>
          <div className="question-nav-grid">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`question-nav-item ${index === currentQuestionIndex ? 'current' : ''} ${isQuestionAnswered(index) ? 'answered' : 'unanswered'}`}
                onClick={() => goToQuestion(index)}
                title={`Question ${index + 1}${isQuestionAnswered(index) ? ' (Answered)' : ' (Not Answered)'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div 
            className="progress-bar"
            style={{ width: `${((answeredCount) / questions.length) * 100}%` }}
          ></div>
        </div>
        <div className="progress-text" style={{ marginBottom: '1rem' }}>
          {answeredCount} of {questions.length} questions answered
        </div>

        {/* Question Card */}
        <div className="question-card">
          <div className="question-header">
            <span className="question-badge">
              Question {currentQuestionIndex + 1} • {currentQuestion.type === 'multiple' ? 'Multiple Choice (select all that apply)' : 'Single Choice'}
            </span>
            <p className="question-text">
              {currentQuestion.question}
            </p>
          </div>

          {/* Options */}
          <div className="options-container">
            {currentQuestion.options?.map((option, index) => {
              // Handle both string options and option objects
              const optionText = typeof option === 'string' ? option : option.text
              const isSelected = currentAnswer.includes(optionText)
              
              return (
                <div
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`option ${
                    isSelected
                      ? 'option-selected'
                      : 'option-default'
                  }`}
                >
                  <div className="option-content">
                    <div className={`option-checkbox ${
                      isSelected
                        ? 'option-checkbox-selected'
                        : 'option-checkbox-default'
                    }`}>
                      {isSelected && (
                        <span>✓</span>
                      )}
                    </div>
                    <span className="option-text">{optionText}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Question Navigation */}
        <div className="question-navigation">
          {questions.map((_, index) => (
            <button
              key={index}
              className={`nav-item ${index === currentQuestionIndex ? 'current' : ''} ${isQuestionAnswered(index) ? 'answered' : 'unanswered'}`}
              onClick={() => goToQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="navigation-buttons">
          <button
            onClick={() => goToQuestion(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="nav-button nav-button-prev"
          >
            ← Previous
          </button>
          <button
            onClick={() => {
              if (currentQuestionIndex < questions.length - 1) {
                goToQuestion(currentQuestionIndex + 1)
              } else {
                handleFinishExam()
              }
            }}
            className="nav-button nav-button-next"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next →' : 'Finish'}
          </button>
        </div>

        {/* Progress Text */}
        <div className="progress-text">
          {answeredCount} of {questions.length} questions answered
        </div>
      </div>

      {/* Study Materials Modal */}
      {showMaterialsModal && (
        <div className="modal-overlay" onClick={() => setShowMaterialsModal(false)}>
          <div className="modal-content materials-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowMaterialsModal(false)}>
              ×
            </button>
            <div className="modal-header">
              <h2 className="modal-title">📚 Study Materials</h2>
              <p className="modal-description">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="materials-content">
              <div className="material-item">
                <h3 className="material-title">📖 Reference Material</h3>
                <div className="material-text">
                  {currentQuestion.materials || 'No additional materials available for this question.'}
                </div>
              </div>
              {currentQuestion.explanations && Object.keys(currentQuestion.explanations).length > 0 && (
                <div className="material-item">
                  <h3 className="material-title">💡 Answer Explanations</h3>
                  {Object.entries(currentQuestion.explanations).map(([key, explanation], idx) => (
                    <div key={idx} className="explanation-item">
                      <strong>{key}:</strong> {explanation}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button 
              className="form-button"
              onClick={() => setShowMaterialsModal(false)}
              style={{ marginTop: '1rem' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Paused Modal */}
      {timerPaused && (
        <div className="paused-overlay">
          <div className="paused-modal">
            <h2>Exam Paused</h2>
            <p>The exam is paused. Resume when you're ready.</p>
            <button 
              onClick={() => {
                setTimerPaused(false)
                resetInactivity()
              }}
              className="resume-button"
            >
              Resume
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamInterface
