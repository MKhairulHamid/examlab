import React, { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import useExamStore from '../stores/examStore'
import useProgressStore from '../stores/progressStore'
import useAuthStore from '../stores/authStore'
import usePurchaseStore from '../stores/purchaseStore'
import streakService from '../services/streakService'
import AIExplanationPanel from '../components/AIExplanationPanel'
import OrderingQuestion from '../components/OrderingQuestion'
import MatchingQuestion from '../components/MatchingQuestion'
import { Lock, AlertTriangle, Sparkles, Pause, Play, RefreshCw, Clock, FileText } from 'lucide-react'

function ExamInterface() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setId = searchParams.get('set')
  
  const isMultipleResponseQuestion = (t) =>
    t === 'Multiple Response' || t === 'multiple' || t === 'multiple_response'
  const isOrderingQuestion = (t) => t === 'Ordering' || t === 'ordering'
  const isMatchingQuestion = (t) => t === 'Matching' || t === 'matching'
  
  const { user } = useAuthStore()
  const { loadQuestionSet, currentQuestionSet, getExamBySlug } = useExamStore()
  const { isSubscribed, fetchSubscription } = usePurchaseStore()
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
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [shuffledOptions, setShuffledOptions] = useState({})
  const [navMinimized, setNavMinimized] = useState(true)
  const [showResumeNotification, setShowResumeNotification] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set())

  useEffect(() => {
    const initialize = async () => {
      if (setId && user) {
        try {
          // SECURITY: Step 1 - Fetch user's subscription
          await fetchSubscription(user.id)

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

          // SECURITY: Step 4 - Verify access (subscription OR free)
          const { isSubscribed: subscribed } = usePurchaseStore.getState()
          if (!isFree && !subscribed) {
            console.warn('🔒 Access denied: Subscription required', { setId, userId: user.id, isFree })
            setAccessDenied(true)
            setAccessMessage('This question set requires an active subscription to access.')
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
  }, [setId, user, loadQuestionSet, startOrResumeExam, fetchSubscription])

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
        <div className="loading-content text-center">
          <div className="mb-4 flex justify-center"><Lock className="w-12 h-12 text-white/60" /></div>
          <h2 className="text-2xl font-bold mb-4">
            Access Denied
          </h2>
          <p className="text-base opacity-80 max-w-[400px] mx-auto mb-8">
            {accessMessage || 'This question set requires a purchase.'}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate(`/exam/${slug}`)}
              className="px-6 py-3 bg-gradient-to-br from-[#00D4AA] to-[#00A884] text-white border-none rounded-lg font-semibold cursor-pointer text-base hover:opacity-90 transition-opacity"
            >
              View Purchase Options
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-white/10 text-inherit border border-white/30 rounded-lg font-semibold cursor-pointer text-base hover:bg-white/20 transition-colors"
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
          <p className="flex items-center justify-center gap-2"><AlertTriangle className="w-5 h-5" /> Question not found</p>
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

  const recordFirstAnswer = async () => {
    if (user?.id && !answeredQuestions.has(currentQuestionIndex)) {
      setAnsweredQuestions(prev => new Set(prev).add(currentQuestionIndex))
      await streakService.recordActivity(user.id, 1)
    }
  }

  const handleAnswerSelect = async (option) => {
    const optionText = typeof option === 'string' ? option : option.text
    let newAnswer
    if (isMultipleResponseQuestion(currentQuestion.type)) {
      const current = answers[currentQuestionIndex] || []
      newAnswer = current.includes(optionText)
        ? current.filter(a => a !== optionText)
        : [...current, optionText]
    } else {
      newAnswer = [optionText]
    }
    saveAnswer(currentQuestionIndex, newAnswer)
    await recordFirstAnswer()
  }

  const handleOrderingChange = async (newOrder) => {
    saveAnswer(currentQuestionIndex, newOrder)
    await recordFirstAnswer()
  }

  const handleMatchingChange = async (pairs) => {
    saveAnswer(currentQuestionIndex, pairs)
    await recordFirstAnswer()
  }

  const calculateResults = () => {
    let correctCount = 0

    questions.forEach((question, index) => {
      const userAnswer = answers[index] || []
      const correctAnswers = question.correctAnswers || []
      const norm = (arr) => arr.map(s => String(s).trim()).filter(s => s)

      if (isOrderingQuestion(question.type)) {
        // Sequence must match exactly — do NOT sort
        if (norm(userAnswer).length > 0 &&
            JSON.stringify(norm(userAnswer)) === JSON.stringify(norm(correctAnswers))) {
          correctCount++
        }
      } else {
        // MC, Multiple Response, Matching — sort both sides and compare
        if (JSON.stringify(norm(userAnswer).sort()) === JSON.stringify(norm(correctAnswers).sort())) {
          correctCount++
        }
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

  const handlePauseExam = async () => {
    await saveCurrentProgress()
    await setTimerPaused(true)
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
        <div className="progress-text mb-4">
          {answeredCount} of {questions.length} questions answered
        </div>

        <div className="flex justify-center gap-2 mb-3">
          <button
            onClick={() => setShowAIPanel(true)}
            className="materials-button flex items-center gap-1.5 bg-[rgba(0,212,170,0.15)] text-[#00D4AA] border-[#00D4AA]"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Learning Guide
          </button>
          <button
            onClick={handlePauseExam}
            className="materials-button flex items-center gap-1.5"
          >
            <Pause className="w-3.5 h-3.5" /> Pause Exam
          </button>
        </div>

        {/* Question Card */}
        <div className="question-card">
          <div className="question-header">
            <span className="question-badge">
              Question {currentQuestionIndex + 1} • {
                isOrderingQuestion(currentQuestion.type)
                  ? '🔢 Ordering — arrange in correct sequence'
                  : isMatchingQuestion(currentQuestion.type)
                  ? '🔗 Matching — pair each item correctly'
                  : isMultipleResponseQuestion(currentQuestion.type)
                  ? '☑️ Multiple Response — select all that apply'
                  : '⭕ Multiple Choice — select one'
              }
            </span>
            <p className="question-text">
              {currentQuestion.question}
            </p>
          </div>

          {/* Question input — rendered based on type */}
          {isOrderingQuestion(currentQuestion.type) ? (
            <OrderingQuestion
              options={displayOptions}
              currentOrder={currentAnswer}
              onChange={handleOrderingChange}
            />
          ) : isMatchingQuestion(currentQuestion.type) ? (
            <MatchingQuestion
              options={displayOptions}
              currentAnswer={currentAnswer}
              onChange={handleMatchingChange}
            />
          ) : (
            <div className="options-container">
              {displayOptions.map((option, index) => {
                const optionText = typeof option === 'string' ? option : option.text
                const isSelected = currentAnswer.includes(optionText)
                const isMultiple = isMultipleResponseQuestion(currentQuestion.type)
                return (
                  <div
                    key={`${currentQuestionIndex}-${index}-${optionText}`}
                    onClick={() => handleAnswerSelect(option)}
                    className={`option ${isSelected ? 'option-selected' : 'option-default'}`}
                  >
                    <div className="option-content">
                      <div className={`option-checkbox ${
                        isMultiple ? 'option-checkbox-square' : 'option-checkbox-circle'
                      } ${isSelected ? 'option-checkbox-selected' : 'option-checkbox-default'}`}>
                        {isSelected && <span>✓</span>}
                      </div>
                      <span className="option-text">{optionText}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="navigation-buttons">
          <button
            onClick={() => goToQuestion(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="nav-button nav-button-prev"
          >
            <span className="mr-2">←</span> Previous
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
              <>Next <span className="ml-2">→</span></>
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
        <div className="fixed top-3 left-3 right-3 max-w-[400px] mx-auto z-[10000] flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-br from-[#00D4AA] to-[#00A884] text-white rounded-xl shadow-[0_10px_25px_rgba(0,212,170,0.3)] animate-[slideDown_0.3s_ease-out]">
          <RefreshCw className="w-5 h-5 shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold text-sm">Exam Resumed</div>
            <div className="text-[0.8125rem] opacity-90">
              Your progress has been restored.
            </div>
          </div>
        </div>
      )}

      {/* AI Explanation Panel */}
      {showAIPanel && (
        <AIExplanationPanel
          question={currentQuestion}
          onClose={() => setShowAIPanel(false)}
        />
      )}

      {/* Paused Modal */}
      {timerPaused && (
        <div className="paused-overlay">
          <div className="paused-modal">
            <h2 className="flex items-center justify-center gap-2"><Pause className="w-5 h-5" /> Exam Paused</h2>
            <p>The exam is paused. Your progress and timer have been saved.</p>
            <div className="text-sm text-[rgba(10,37,64,0.7)] mb-6 p-3 bg-[rgba(0,212,170,0.1)] rounded-lg">
              <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time Elapsed: {formatTime(timeElapsed)}</div>
              <div className="flex items-center gap-1.5 mt-1"><FileText className="w-3.5 h-3.5" /> Questions Answered: {answeredCount} of {questions?.length || 0}</div>
            </div>
            <button
              onClick={async () => {
                resetInactivity()
                await setTimerPaused(false)
              }}
              className="resume-button inline-flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Resume Exam
            </button>
            <button
              onClick={async () => {
                await saveCurrentProgress()
                navigate(`/exam/${slug}`)
              }}
              className="w-full mt-3 py-2.5 px-4 bg-white/10 text-[rgba(10,37,64,0.6)] hover:bg-white/20 border border-white/30 rounded-lg font-semibold cursor-pointer text-sm transition-all"
            >
              Exit &amp; Save Progress
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamInterface
