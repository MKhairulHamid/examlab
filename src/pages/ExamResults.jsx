import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import useExamStore from '../stores/examStore'
import useProgressStore from '../stores/progressStore'
import useAuthStore from '../stores/authStore'
import supabase from '../services/supabase'
import DashboardHeader from '../components/layout/DashboardHeader'
import AnswerReview from '../components/AnswerReview'
import { isOrderingQuestion, getTypeLabel } from '../utils/questionTypes'

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

  useEffect(() => {
    const loadResultData = async () => {
      if (resultId && user) {
        try {
          // Load result from Supabase
          const { data: examAttempt, error } = await supabase
            .from('exam_attempts')
            .select('*')
            .eq('id', resultId)
            .eq('user_id', user.id)
            .single()
          
          if (error || !examAttempt) {
            console.error('Result not found:', error)
            navigate('/dashboard')
            return
          }
          
          // Load question set first so we can report the true total question
          // count (not just how many the user answered).
          const questionSet = await loadQuestionSet(examAttempt.question_set_id)

          let questionsList = []
          if (questionSet) {
            const questionsData = questionSet.questions_json
            questionsList = questionsData?.questions || questionsData || []
            setQuestions(questionsList)
          }

          // Transform to expected format
          const examResult = {
            id: examAttempt.id,
            userId: examAttempt.user_id,
            questionSetId: examAttempt.question_set_id,
            startedAt: examAttempt.started_at,
            completedAt: examAttempt.completed_at,
            timeSpent: examAttempt.time_spent_seconds,
            answers: examAttempt.answers_json,
            rawScore: examAttempt.raw_score,
            percentageScore: examAttempt.percentage_score,
            scaledScore: examAttempt.scaled_score,
            passed: examAttempt.passed,
            totalQuestions: questionsList.length || (examAttempt.answers_json ? Object.keys(examAttempt.answers_json).length : 0)
          }

          setResult(examResult)

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
      <>
        <DashboardHeader />
        <div style={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner"></div>
            <p style={{ color: 'white', marginTop: '1rem' }}>Loading results...</p>
          </div>
        </div>
      </>
    )
  }

  if (!result) {
    return (
      <>
        <DashboardHeader />
        <div style={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>❌ Results not found</p>
            <button
              onClick={() => navigate('/dashboard')}
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
              Back to Dashboard
            </button>
          </div>
        </div>
      </>
    )
  }

  const getAnswerStatus = (questionIndex, question) => {
    const userAnswer = result.answers[questionIndex] || []
    const correctAnswers = question.correctAnswers || []

    const norm = (arr) => arr.map(a => String(a).trim()).filter(a => a.length > 0)

    // All-or-nothing scoring per AIF-C01 (no partial credit for any type).
    let isCorrect
    if (isOrderingQuestion(question.type)) {
      // Sequence must match exactly — do NOT sort
      const u = norm(userAnswer)
      isCorrect = u.length > 0 && JSON.stringify(u) === JSON.stringify(norm(correctAnswers))
    } else {
      // MC, Multiple Response, Matching — order-independent set equality
      isCorrect = JSON.stringify(norm(userAnswer).sort()) === JSON.stringify(norm(correctAnswers).sort())
    }

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

  // Calculate domain-based performance
  const getDomainPerformance = () => {
    const domainStats = {}
    
    questions.forEach((question, index) => {
      const domain = question.domain || 'Uncategorized'
      const { isCorrect } = getAnswerStatus(index, question)
      
      if (!domainStats[domain]) {
        domainStats[domain] = {
          total: 0,
          correct: 0,
          percentage: 0
        }
      }
      
      domainStats[domain].total += 1
      if (isCorrect) {
        domainStats[domain].correct += 1
      }
    })
    
    // Calculate percentages
    Object.keys(domainStats).forEach(domain => {
      const stats = domainStats[domain]
      stats.percentage = Math.round((stats.correct / stats.total) * 100)
    })
    
    // Sort by percentage (lowest first to highlight weak areas)
    return Object.entries(domainStats)
      .sort((a, b) => a[1].percentage - b[1].percentage)
      .map(([domain, stats]) => ({ domain, ...stats }))
  }

  const domainPerformance = getDomainPerformance()

  const passColor = result.passed ? '#10b981' : '#ef4444'
  const passEmoji = result.passed ? '🎉' : '💪'
  const passMessage = result.passed 
    ? 'Congratulations! You passed!' 
    : 'Keep practicing! You\'ll get it next time!'

  return (
    <>
      <DashboardHeader />
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
        padding: 'clamp(1rem, 3vw, 2rem) 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(0.75rem, 3vw, 1.5rem)' }}>
        {/* Results Header */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          padding: 'clamp(1.25rem, 4vw, 2rem)',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{passEmoji}</div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
            Exam Results
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', color: passColor, fontWeight: '600', marginBottom: '1.5rem' }}>
            {passMessage}
          </p>
          
          {/* Score Display */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
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
              <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '700', color: passColor }}>
                {result.percentageScore}%
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
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
              <div style={{ fontSize: 'clamp(1.25rem, 4vw, 2rem)', fontWeight: '700', color: '#00D4AA' }}>
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
              <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '700', color: passColor }}>
                {result.passed ? 'PASSED' : 'FAILED'}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
                {result.scaledScore ? `Scaled: ${result.scaledScore}` : ''}
              </div>
            </div>
          </div>

          {/* Domain Performance Breakdown */}
          {domainPerformance.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: 'white', 
                marginBottom: '1rem',
                textAlign: 'left'
              }}>
                📊 Performance by Domain
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {domainPerformance.map((domain, idx) => {
                  const performanceColor = 
                    domain.percentage >= 70 ? '#10b981' : 
                    domain.percentage >= 50 ? '#f59e0b' : 
                    '#ef4444'
                  
                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ 
                          color: 'white', 
                          fontWeight: '500',
                          fontSize: '0.95rem'
                        }}>
                          {domain.domain}
                        </span>
                        <span style={{ 
                          color: performanceColor, 
                          fontWeight: '600',
                          fontSize: '0.95rem'
                        }}>
                          {domain.correct}/{domain.total} ({domain.percentage}%)
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${domain.percentage}%`,
                          height: '100%',
                          background: performanceColor,
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(0,212,170,0.1)',
                border: '1px solid rgba(0,212,170,0.2)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.8)',
                textAlign: 'left'
              }}>
                💡 <strong>Tip:</strong> Focus on domains with lower scores to improve your overall performance.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/exam/${slug}/study`)}
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
              Study Weak Areas
            </button>
            <button
              onClick={() => navigate(`/exam/${slug}`)}
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
          padding: 'clamp(1rem, 3vw, 2rem)',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>
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
                    padding: 'clamp(1rem, 3vw, 1.5rem)',
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
                        Question {index + 1} • {getTypeLabel(question.type)}
                      </div>
                      <p style={{ fontSize: '1rem', color: 'white', fontWeight: '500', lineHeight: '1.6' }}>
                        {questionText}
                      </p>
                    </div>
                  </div>

                  {/* Answer review — rendered per question type */}
                  <AnswerReview question={question} userAnswer={userAnswer} correctAnswers={correctAnswers} />

                  {/* Inline explanations */}
                  {question.ai_cache?.explanations && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        Explanations
                      </div>
                      {question.ai_cache.explanations.overview && (
                        <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.625rem', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '0.5rem' }}>
                          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', lineHeight: '1.6', margin: 0 }}>
                            {question.ai_cache.explanations.overview}
                          </p>
                        </div>
                      )}
                      {Array.isArray(question.ai_cache.explanations.per_option) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                          {question.ai_cache.explanations.per_option.map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '0.625rem 0.875rem',
                                background: item.correct ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.05)',
                                border: `1px solid ${item.correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'}`,
                                borderRadius: '0.625rem'
                              }}
                            >
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                <span style={{ flexShrink: 0, width: '1.125rem', height: '1.125rem', borderRadius: '50%', background: item.correct ? '#10b981' : '#ef4444', color: 'white', fontSize: '0.6rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.15rem' }}>
                                  {item.correct ? '✓' : '✗'}
                                </span>
                                <span style={{ color: item.correct ? '#6ee7b7' : '#fca5a5', fontSize: '0.8rem', fontWeight: '600', lineHeight: '1.4' }}>
                                  {item.option}
                                </span>
                              </div>
                              <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.7875rem', lineHeight: '1.6', margin: '0 0 0 1.625rem' }}>
                                {item.explanation}
                              </p>
                            </div>
                          ))}
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
      </div>

    </>
  )
}

export default ExamResults

