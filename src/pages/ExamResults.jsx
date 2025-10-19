import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import useExamStore from '../stores/examStore'
import useProgressStore from '../stores/progressStore'
import useAuthStore from '../stores/authStore'
import indexedDBService from '../services/indexedDBService'
import PageLayout from '../components/layout/PageLayout'

function ExamResults() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const resultId = searchParams.get('resultId')
  const setId = searchParams.get('set')
  
  const { user } = useAuthStore()
  const { currentQuestionSet, loadQuestionSet } = useExamStore()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [showExplanations, setShowExplanations] = useState({})

  useEffect(() => {
    const loadResultData = async () => {
      if (resultId && user) {
        try {
          // Load result from IndexedDB
          const examResult = await indexedDBService.getExamResult(resultId)
          
          if (!examResult) {
            console.error('Result not found')
            navigate('/dashboard')
            return
          }
          
          setResult(examResult)
          
          // Load question set to display questions and correct answers
          const questionSet = await loadQuestionSet(examResult.questionSetId)
          
          if (questionSet) {
            const questionsData = questionSet.questions_json
            const questionsList = questionsData?.questions || questionsData || []
            setQuestions(questionsList)
          }
          
          setLoading(false)
        } catch (error) {
          console.error('Error loading result:', error)
          setLoading(false)
        }
      }
    }
    
    loadResultData()
  }, [resultId, user, loadQuestionSet, navigate])

  if (loading) {
    return (
      <PageLayout>
        <div className="loading-container">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Loading results...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!result) {
    return (
      <PageLayout>
        <div className="loading-container">
          <div className="loading-content text-center">
            <p>❌ Results not found</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary mt-4"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </PageLayout>
    )
  }

  const toggleExplanation = (index) => {
    setShowExplanations(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const getAnswerStatus = (questionIndex, question) => {
    const userAnswer = result.answers[questionIndex] || []
    const correctAnswers = question.correctAnswers || []
    
    // Sort arrays for comparison
    const sortedUserAnswer = [...userAnswer].sort()
    const sortedCorrectAnswers = [...correctAnswers].sort()
    
    // Check if arrays are equal
    const isCorrect = JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswers)
    
    return { isCorrect, userAnswer, correctAnswers }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const passColor = result.passed ? '#10b981' : '#ef4444'
  const passEmoji = result.passed ? '🎉' : '💪'
  const passMessage = result.passed 
    ? 'Congratulations! You passed!' 
    : 'Keep practicing! You\'ll get it next time!'

  return (
    <PageLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Results Header */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          padding: '2rem',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{passEmoji}</div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
            Exam Results
          </h1>
          <p style={{ fontSize: '1.25rem', color: passColor, fontWeight: '600', marginBottom: '1.5rem' }}>
            {passMessage}
          </p>
          
          {/* Score Display */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
                Score
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: passColor }}>
                {result.percentageScore}%
              </div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
                {result.rawScore} / {result.totalQuestions} correct
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
                Time Spent
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#00D4AA' }}>
                {formatTime(result.timeSpent)}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
                {new Date(result.completedAt).toLocaleDateString()}
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
                Status
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: passColor }}>
                {result.passed ? 'PASSED' : 'FAILED'}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
                {result.scaledScore ? `Scaled: ${result.scaledScore}` : ''}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/exam/${slug}`)}
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
              Take Another Practice
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
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

        {/* Question Review */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          padding: '2rem',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>
            📝 Question Review
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {questions.map((question, index) => {
              const { isCorrect, userAnswer, correctAnswers } = getAnswerStatus(index, question)
              const statusColor = isCorrect ? '#10b981' : '#ef4444'
              const statusIcon = isCorrect ? '✓' : '✗'
              const questionText = question.question

              return (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: `2px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                  }}
                >
                  {/* Question Header */}
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '0.5rem',
                      background: statusColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}>
                      {statusIcon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
                        Question {index + 1} • {question.type === 'Multiple Response' ? 'Multiple Response' : 'Multiple Choice'}
                      </div>
                      <p style={{ fontSize: '1rem', color: 'white', fontWeight: '500', lineHeight: '1.6' }}>
                        {questionText}
                      </p>
                    </div>
                  </div>

                  {/* Options Display */}
                  <div style={{ marginBottom: '1rem' }}>
                    {question.options?.map((option, optIndex) => {
                      const optionText = typeof option === 'string' ? option : option.text
                      const isUserAnswer = userAnswer.includes(optionText)
                      const isCorrectAnswer = correctAnswers.includes(optionText)
                      
                      let optionStyle = {
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.05)'
                      }
                      
                      if (isCorrectAnswer) {
                        optionStyle.background = 'rgba(16,185,129,0.2)'
                        optionStyle.border = '1px solid rgba(16,185,129,0.5)'
                      } else if (isUserAnswer && !isCorrectAnswer) {
                        optionStyle.background = 'rgba(239,68,68,0.2)'
                        optionStyle.border = '1px solid rgba(239,68,68,0.5)'
                      }
                      
                      return (
                        <div key={optIndex} style={optionStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span style={{ color: 'white', fontSize: '0.875rem' }}>
                              {optionText}
                            </span>
                            {isCorrectAnswer && (
                              <span style={{ marginLeft: 'auto', color: '#10b981', fontWeight: '600', fontSize: '0.875rem' }}>
                                ✓ Correct
                              </span>
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <span style={{ marginLeft: 'auto', color: '#ef4444', fontWeight: '600', fontSize: '0.875rem' }}>
                                Your Answer
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Explanation Toggle */}
                  {question.explanation && (
                    <div>
                      <button
                        onClick={() => toggleExplanation(index)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'rgba(0,212,170,0.2)',
                          color: '#00D4AA',
                          border: '1px solid rgba(0,212,170,0.3)',
                          borderRadius: '0.5rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          width: '100%',
                          textAlign: 'left',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>📚 View Explanation</span>
                        <span>{showExplanations[index] ? '▼' : '▶'}</span>
                      </button>
                      
                      {showExplanations[index] && (
                        <div style={{
                          marginTop: '1rem',
                          padding: '1rem',
                          background: 'rgba(0,212,170,0.1)',
                          borderRadius: '0.5rem',
                          border: '1px solid rgba(0,212,170,0.2)',
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: '0.875rem',
                          lineHeight: '1.6'
                        }}>
                          {question.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default ExamResults

