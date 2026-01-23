import React, { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import useExamStore from '../stores/examStore'
import useProgressStore from '../stores/progressStore'
import useAuthStore from '../stores/authStore'
import usePurchaseStore from '../stores/purchaseStore'
import streakService from '../services/streakService'

function ExamInterface() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setId = searchParams.get('set')
  
  // Helper function to check if question allows multiple selections
  const isMultipleResponseQuestion = (questionType) => {
    return questionType === 'Multiple Response' || 
           questionType === 'multiple' ||
           questionType === 'multiple_response'
  }
  
  const { user } = useAuthStore()
  const { loadQuestionSet, currentQuestionSet, getExamBySlug } = useExamStore()
  const { hasPurchased, fetchPurchases } = usePurchaseStore()
  const { 
    startExam,
    startOrResumeExam,
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
  const [showOfficialLinksModal, setShowOfficialLinksModal] = useState(false)
  const [shuffledOptions, setShuffledOptions] = useState({})
  const [navMinimized, setNavMinimized] = useState(true)
  const [showResumeNotification, setShowResumeNotification] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set())

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
          
          // SECURITY: Step 6 - Access granted
          
          // Start exam
          const fullExamDuration = questionSet.exam_types?.duration_minutes || 60
          let examDuration = fullExamDuration
          
          // Adjust duration for free samples based on actual question count
          if (isFree && questionSet.question_count) {
            const totalQuestions = questionSet.exam_types?.total_questions || 65
            const sampleQuestions = questionSet.question_count
            
            // Calculate proportional time: (sample_questions / total_questions) * full_duration
            examDuration = Math.ceil((sampleQuestions / totalQuestions) * fullExamDuration)
          }
          
          setDuration(examDuration * 60)
          
          // Check if there's an existing in-progress exam
          const progressService = await import('../services/progressService')
          const existingProgress = await progressService.default.findInProgressExam(user.id, setId)
          
          // Start or resume exam (checks for existing in-progress exam first)
          await startOrResumeExam(setId, user.id, questionSet.question_count || 0)
          
          // Show resume notification if exam was resumed
          if (existingProgress) {
            setShowResumeNotification(true)
            setTimeout(() => setShowResumeNotification(false), 5000) // Hide after 5 seconds
            
            // Initialize answeredQuestions set with already answered questions
            const existingAnswers = existingProgress.answers || existingProgress.current_answers_json || {}
            const answeredIndices = Object.keys(existingAnswers)
              .filter(key => existingAnswers[key] && existingAnswers[key].length > 0)
              .map(key => parseInt(key))
            setAnsweredQuestions(new Set(answeredIndices))
          }
          
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
  }, [setId, user, loadQuestionSet, startOrResumeExam, fetchPurchases, hasPurchased])

  // Timer interval - only runs when not paused
  const timerRef = useRef(null)
  const lastTickRef = useRef(Date.now())
  
  useEffect(() => {
    // Clear any existing interval
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Only start timer if not paused and exam is in progress
    if (!timerPaused && status === 'in_progress') {
      lastTickRef.current = Date.now()
      
      timerRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - lastTickRef.current) / 1000)
        
        if (elapsed >= 1) {
          lastTickRef.current = now
          const state = useProgressStore.getState()
          state.updateTimer(state.timeElapsed + elapsed)
        }
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [timerPaused, status])

  // Check time expired
  useEffect(() => {
    if (timeElapsed >= duration && status === 'in_progress' && duration > 0) {
      handleFinishExam()
    }
  }, [timeElapsed, duration, status])

  // Save current progress helper function
  const saveCurrentProgress = async () => {
    const state = useProgressStore.getState()
    if (state.attemptId && state.status === 'in_progress') {
      const progress = {
        attemptId: state.attemptId,
        questionSetId: state.questionSetId,
        userId: state.userId,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        timeElapsed: state.timeElapsed,
        timerPaused: state.timerPaused,
        status: state.status,
        startedAt: state.startedAt,
        updatedAt: new Date().toISOString()
      }
      
      await useProgressStore.getState().updateTimer(state.timeElapsed)
    }
  }

  // Visibility change - pause when tab is hidden or phone is locked
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.hidden) {
        // Save progress immediately
        await saveCurrentProgress()
        await setTimerPaused(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [setTimerPaused])

  // Before unload - save progress when user navigates away or closes tab
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      const state = useProgressStore.getState()
      if (state.status === 'in_progress') {
        // Force immediate sync to Supabase
        const progressService = await import('../services/progressService')
        const progress = {
          attemptId: state.attemptId,
          questionSetId: state.questionSetId,
          userId: state.userId,
          currentQuestionIndex: state.currentQuestionIndex,
          answers: state.answers,
          timeElapsed: state.timeElapsed,
          timerPaused: state.timerPaused,
          status: state.status,
          startedAt: state.startedAt,
          updatedAt: new Date().toISOString()
        }
        
        // Use navigator.sendBeacon for reliable sync on page unload
        try {
          await progressService.default.forceSync(progress)
        } catch (error) {
          console.error('Failed to sync progress on unload:', error)
        }
        
        // Show warning message (optional - commented out to avoid annoyance)
        // e.preventDefault()
        // e.returnValue = 'Your exam progress will be saved. Are you sure you want to leave?'
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Page Hide - more reliable than beforeunload for mobile
  useEffect(() => {
    const handlePageHide = async () => {
      const state = useProgressStore.getState()
      if (state.status === 'in_progress') {
        // Force immediate sync to Supabase
        const progressService = await import('../services/progressService')
        const progress = {
          attemptId: state.attemptId,
          questionSetId: state.questionSetId,
          userId: state.userId,
          currentQuestionIndex: state.currentQuestionIndex,
          answers: state.answers,
          timeElapsed: state.timeElapsed,
          timerPaused: state.timerPaused,
          status: state.status,
          startedAt: state.startedAt,
          updatedAt: new Date().toISOString()
        }
        
        try {
          await progressService.default.forceSync(progress)
        } catch (error) {
          console.error('Failed to sync progress on page hide:', error)
        }
      }
    }
    
    window.addEventListener('pagehide', handlePageHide)
    return () => window.removeEventListener('pagehide', handlePageHide)
  }, [])

  // Periodic auto-save every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (status === 'in_progress' && !timerPaused) {
        await saveCurrentProgress()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [status, timerPaused])

  // Navigation blocker - handle react-router navigation
  useEffect(() => {
    const handlePopState = async () => {
      await saveCurrentProgress()
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Inactivity detection - pause after 5 minutes of no activity
  const lastActivityRef = useRef(Date.now())
  const inactivityRef = useRef(null)

  const resetInactivity = () => {
    lastActivityRef.current = Date.now()
  }

  useEffect(() => {
    // Only check for inactivity if exam is running and not paused
    if (status === 'in_progress' && !timerPaused) {
      inactivityRef.current = setInterval(() => {
        const inactiveTime = Date.now() - lastActivityRef.current
        if (inactiveTime > 5 * 60 * 1000) { // 5 minutes
          setTimerPaused(true)
        }
      }, 1000)

      const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click']
      events.forEach(ev => document.addEventListener(ev, resetInactivity, { passive: true }))

      return () => {
        if (inactivityRef.current) {
          clearInterval(inactivityRef.current)
        }
        events.forEach(ev => document.removeEventListener(ev, resetInactivity))
      }
    }
  }, [setTimerPaused, status, timerPaused])

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

  const handleAnswerSelect = async (option) => {
    // Get the option text (in case option is an object with { text, correct })
    const optionText = typeof option === 'string' ? option : option.text
    
    let newAnswer
    
    // Check if it's a multiple response question (allows multiple selections)
    if (isMultipleResponseQuestion(currentQuestion.type)) {
      // Multiple Response - toggle selection (can select multiple)
      const current = answers[currentQuestionIndex] || []
      if (current.includes(optionText)) {
        newAnswer = current.filter(a => a !== optionText)
      } else {
        newAnswer = [...current, optionText]
      }
    } else {
      // Multiple Choice - only one selection allowed
      newAnswer = [optionText]
    }
    
    saveAnswer(currentQuestionIndex, newAnswer)
    
    // Record streak activity - count this as answering 1 question
    // Only record if this is the first time answering this question
    if (user?.id && !answeredQuestions.has(currentQuestionIndex)) {
      setAnsweredQuestions(prev => new Set(prev).add(currentQuestionIndex))
      await streakService.recordActivity(user.id, 1)
    }
  }

  const calculateResults = () => {
    let correctCount = 0
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index] || []
      const correctAnswers = question.correctAnswers || []
      
      // Normalize answers: trim whitespace and sort for comparison
      const normalizeAnswers = (answers) => {
        return answers
          .map(ans => String(ans).trim()) // Convert to string and trim
          .filter(ans => ans.length > 0)  // Remove empty strings
          .sort()
      }
      
      const sortedUserAnswer = normalizeAnswers(userAnswer)
      const sortedCorrectAnswers = normalizeAnswers(correctAnswers)
      
      // Check if arrays are equal
      if (JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswers)) {
        correctCount++
      }
    })
    
    const percentage = Math.round((correctCount / questions.length) * 100)
    
    // Get max score from exam type (default to 1000)
    const maxScore = currentQuestionSet.exam_types?.max_score || 1000
    
    // Check if this is a free sample
    const isFree = currentQuestionSet.is_free_sample || currentQuestionSet.price_cents === 0
    
    let scaledScore
    if (isFree && currentQuestionSet.question_count) {
      // For free samples, scale the score proportionally
      // Example: 10/65 questions means the score should be scaled accordingly
      const totalQuestions = currentQuestionSet.exam_types?.total_questions || 65
      const sampleQuestions = currentQuestionSet.question_count
      
      // Calculate score as if taking the full exam
      // (correct / sample_questions) * (sample_questions / total_questions) * max_score
      scaledScore = Math.round((correctCount / questions.length) * (sampleQuestions / totalQuestions) * maxScore)
      
    } else {
      // Regular scoring: scale to max_score (default 1000)
      scaledScore = Math.round((correctCount / questions.length) * maxScore)
    }
    
    // Determine if passed (typically 70% or higher)
    // Note: Pass/fail is based on percentage of questions answered correctly,
    // not the scaled score. This ensures fair evaluation for both free samples and full exams.
    // Example: 8/10 correct = 80% = PASSED (even though scaled score might be lower)
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

  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Get or create shuffled options for current question
  const getShuffledOptions = () => {
    if (!currentQuestion || !currentQuestion.options) return []
    
    // If we already have shuffled options for this question, use them
    if (shuffledOptions[currentQuestionIndex]) {
      return shuffledOptions[currentQuestionIndex]
    }
    
    // Otherwise, shuffle and store
    const shuffled = shuffleArray(currentQuestion.options)
    setShuffledOptions(prev => ({
      ...prev,
      [currentQuestionIndex]: shuffled
    }))
    return shuffled
  }

  const displayOptions = getShuffledOptions()

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
        <div className={`question-navigation ${navMinimized ? 'minimized' : ''}`}>
          <div className="question-nav-header">
            <span className="text-sm text-white/80">
              Questions: {answeredCount}/{questions.length}
            </span>
            <button
              onClick={() => setNavMinimized(!navMinimized)}
              className="nav-toggle-btn"
              title={navMinimized ? 'Expand navigation' : 'Minimize navigation'}
            >
              {navMinimized ? '▼' : '▲'}
            </button>
          </div>
          {!navMinimized && (
            <div className="question-nav-grid">
              {questions.map((_, index) => (
                <button
                  key={index}
                  className={`question-nav-item ${index === currentQuestionIndex ? 'current' : ''} ${isQuestionAnswered(index) ? 'answered' : 'unanswered'}`}
                  onClick={() => {
                    goToQuestion(index)
                    setNavMinimized(true)
                  }}
                  title={`Question ${index + 1}${isQuestionAnswered(index) ? ' (Answered)' : ' (Not Answered)'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
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

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowMaterialsModal(true)}
            className="materials-button"
          >
            📚 Study Materials
          </button>
          <button
            onClick={() => setShowOfficialLinksModal(true)}
            className="materials-button"
            style={{
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#3b82f6',
              borderColor: '#3b82f6'
            }}
          >
            🔗 Official AWS Docs
          </button>
        </div>

        {/* Question Card */}
        <div className="question-card">
          <div className="question-header">
            <span className="question-badge">
              Question {currentQuestionIndex + 1} • {
                currentQuestion.type === 'Multiple Response' 
                  ? '☑️ Multiple Response (select all that apply)' 
                  : '⭕ Multiple Choice (select one)'
              }
            </span>
            <p className="question-text">
              {currentQuestion.question}
            </p>
          </div>

          {/* Options */}
          <div className="options-container">
            {displayOptions.map((option, index) => {
              // Handle both string options and option objects
              const optionText = typeof option === 'string' ? option : option.text
              const isSelected = currentAnswer.includes(optionText)
              const isMultiple = isMultipleResponseQuestion(currentQuestion.type)
              
              return (
                <div
                  key={`${currentQuestionIndex}-${index}-${optionText}`}
                  onClick={() => handleAnswerSelect(option)}
                  className={`option ${
                    isSelected
                      ? 'option-selected'
                      : 'option-default'
                  }`}
                >
                  <div className="option-content">
                    <div className={`option-checkbox ${
                      isMultiple ? 'option-checkbox-square' : 'option-checkbox-circle'
                    } ${
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

        {/* Copy Question for LLM Button */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={(e) => {
              const btn = e.currentTarget
              if (!btn) return
              
              try {
                const question = currentQuestion.question
                const options = currentQuestion.options.map((opt, idx) => 
                  `${String.fromCharCode(65 + idx)}. ${opt.text}`
                ).join('\n')
                
                const textToCopy = `Give me lesson to answer this question, dont directly answer the question, explain all service mentioned, and all abbreviation, and make the lesson help me to answer future question similiar to this

Question:
${question}

Options:
${options}`

                navigator.clipboard.writeText(textToCopy).then(() => {
                  // Show success feedback
                  const originalText = btn.innerHTML
                  btn.innerHTML = '✓ Copied!'
                  btn.style.background = 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)'
                  setTimeout(() => {
                    btn.innerHTML = originalText
                    btn.style.background = 'rgba(255, 255, 255, 0.1)'
                  }, 2000)
                }).catch(err => {
                  console.error('Failed to copy:', err)
                  const originalText = btn.innerHTML
                  btn.innerHTML = '❌ Copy Failed'
                  setTimeout(() => {
                    btn.innerHTML = originalText
                  }, 2000)
                })
              } catch (err) {
                console.error('Error preparing copy:', err)
              }
            }}
            className="nav-button nav-button-prev"
            style={{
              width: '100%',
              marginBottom: '0.5rem'
            }}
          >
            📋 Copy Question for AI Learning
          </button>
        </div>

        {/* Navigation */}
        <div className="navigation-buttons">
          <button
            onClick={() => goToQuestion(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="nav-button nav-button-prev"
          >
            <span style={{ marginRight: '0.5rem' }}>←</span> Previous
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
            {currentQuestionIndex < questions.length - 1 ? (
              <>Next <span style={{ marginLeft: '0.5rem' }}>→</span></>
            ) : (
              'Finish'
            )}
          </button>
        </div>

        {/* Progress Text */}
        <div className="progress-text">
          {answeredCount} of {questions.length} questions answered
        </div>
      </div>

      {/* Resume Notification */}
      {showResumeNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 25px rgba(0, 212, 170, 0.3)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          animation: 'slideInRight 0.3s ease-out',
          maxWidth: '400px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🔄</span>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Exam Resumed</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Welcome back! Your progress has been restored.
            </div>
          </div>
        </div>
      )}

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

      {/* Official Links Modal */}
      {showOfficialLinksModal && (
        <div className="modal-overlay" onClick={() => setShowOfficialLinksModal(false)}>
          <div className="modal-content materials-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowOfficialLinksModal(false)}>
              ×
            </button>
            <div className="modal-header">
              <h2 className="modal-title">🔗 Official AWS Documentation</h2>
              <p className="modal-description">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="materials-content">
              {currentQuestion.official_links && currentQuestion.official_links.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {currentQuestion.official_links.map((link, index) => {
                    // Extract a readable name from the URL
                    const getReadableName = (url) => {
                      try {
                        const urlObj = new URL(url)
                        const pathname = urlObj.pathname
                        const parts = pathname.split('/').filter(p => p)
                        const lastPart = parts[parts.length - 1] || 'Documentation'
                        return lastPart
                          .replace(/-/g, ' ')
                          .replace(/\.html?$/, '')
                          .split(' ')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')
                      } catch {
                        return `AWS Documentation ${index + 1}`
                      }
                    }
                    
                    return (
                      <div 
                        key={index}
                        style={{
                          padding: '1rem',
                          background: 'rgba(59,130,246,0.1)',
                          borderRadius: '0.75rem',
                          border: '1px solid rgba(59,130,246,0.3)'
                        }}
                      >
                        <div style={{ 
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#3b82f6',
                          marginBottom: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span>📄</span>
                          <span>{getReadableName(link)}</span>
                        </div>
                        
                        {/* Iframe to display the documentation */}
                        <iframe
                          src={link}
                          style={{
                            width: '100%',
                            height: '400px',
                            border: '1px solid rgba(59,130,246,0.2)',
                            borderRadius: '0.5rem',
                            background: 'white'
                          }}
                          title={`AWS Documentation ${index + 1}`}
                        />
                        
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginTop: '0.75rem',
                            padding: '0.5rem 1rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                          <span>🔗</span>
                          <span>Open in New Tab</span>
                        </a>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                  <p>No official documentation links available for this question.</p>
                </div>
              )}
            </div>
            <button 
              className="form-button"
              onClick={() => setShowOfficialLinksModal(false)}
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
            <h2>⏸️ Exam Paused</h2>
            <p>The exam is paused. Your progress and timer have been saved.</p>
            <div style={{ 
              fontSize: '0.875rem', 
              color: 'rgba(10, 37, 64, 0.7)', 
              marginBottom: '1.5rem',
              padding: '0.75rem',
              background: 'rgba(0, 212, 170, 0.1)',
              borderRadius: '0.5rem'
            }}>
              <div>⏱️ Time Elapsed: {formatTime(timeElapsed)}</div>
              <div>📝 Questions Answered: {answeredCount} of {questions?.length || 0}</div>
            </div>
            <button 
              onClick={async () => {
                resetInactivity()
                await setTimerPaused(false)
              }}
              className="resume-button"
            >
              ▶️ Resume Exam
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamInterface
