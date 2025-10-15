import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import useExamStore from '../stores/examStore'
import useProgressStore from '../stores/progressStore'
import useAuthStore from '../stores/authStore'

function ExamInterface() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setId = searchParams.get('set')
  
  const { user } = useAuthStore()
  const { loadQuestionSet, currentQuestionSet } = useExamStore()
  const { 
    startExam, 
    currentQuestionIndex, 
    answers,
    goToQuestion,
    saveAnswer,
    getAnswerCount
  } = useProgressStore()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      if (setId && user) {
        // Load question set
        const questionSet = await loadQuestionSet(setId)
        
        if (questionSet) {
          // Start exam
          await startExam(setId, user.id, questionSet.question_count || 0)
        }
        
        setLoading(false)
      }
    }
    
    initialize()
  }, [setId, user, loadQuestionSet, startExam])

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

  const questions = currentQuestionSet.questions_json?.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  const answeredCount = getAnswerCount()

  if (!currentQuestion) {
    return (
      <div className="loading-container">
        <div className="loading-content text-center">
          <p>No questions available</p>
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
    let newAnswer
    
    if (currentQuestion.type === 'multiple') {
      // Multiple choice - toggle selection
      const current = answers[currentQuestionIndex] || []
      if (current.includes(option)) {
        newAnswer = current.filter(a => a !== option)
      } else {
        newAnswer = [...current, option]
      }
    } else {
      // Single choice
      newAnswer = [option]
    }
    
    saveAnswer(currentQuestionIndex, newAnswer)
  }

  const currentAnswer = answers[currentQuestionIndex] || []

  return (
    <div className="exam-interface">
      <div className="exam-interface-container">
        {/* Header */}
        <div className="exam-header">
          <h1 className="exam-header-title">{currentQuestionSet.name}</h1>
          <p className="exam-header-progress">Question {currentQuestionIndex + 1} of {questions.length}</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div 
            className="progress-bar"
            style={{ width: `${((answeredCount) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className="question-card">
          <div className="question-header">
            <span className="question-badge">
              Question {currentQuestionIndex + 1} • {currentQuestion.type === 'multiple' ? 'Multiple Choice' : 'Single Choice'}
            </span>
            <p className="question-text">
              {currentQuestion.question}
            </p>
          </div>

          {/* Options */}
          <div className="options-container">
            {currentQuestion.options?.map((option, index) => (
              <div
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`option ${
                  currentAnswer.includes(option)
                    ? 'option-selected'
                    : 'option-default'
                }`}
              >
                <div className="option-content">
                  <div className={`option-checkbox ${
                    currentAnswer.includes(option)
                      ? 'option-checkbox-selected'
                      : 'option-checkbox-default'
                  }`}>
                    {currentAnswer.includes(option) && (
                      <span>✓</span>
                    )}
                  </div>
                  <span className="option-text">{option}</span>
                </div>
              </div>
            ))}
          </div>
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
                navigate(`/exam/${slug}`)
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
    </div>
  )
}

export default ExamInterface
