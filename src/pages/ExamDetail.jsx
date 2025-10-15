import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useExamStore from '../stores/examStore'

function ExamDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getExamBySlug, fetchQuestionSets, questionSets } = useExamStore()
  const [exam, setExam] = useState(null)

  useEffect(() => {
    const loadExam = async () => {
      const examData = await getExamBySlug(slug)
      setExam(examData)
      
      if (examData) {
        fetchQuestionSets(examData.id)
      }
    }
    
    loadExam()
  }, [slug, getExamBySlug, fetchQuestionSets])

  if (!exam) {
    return (
      <div className="loading-container">
        <div className="loading-content">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:p-6">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="back-button mb-4 sm:mb-6"
        >
          ← Back to Dashboard
        </button>

        {/* Exam Header */}
        <div className="exam-header-card">
          <div className="exam-header-icon">{exam.icon || '📚'}</div>
          <div className="exam-header-provider">
            {exam.provider}
          </div>
          <h1 className="exam-header-title">{exam.name}</h1>
          <p className="exam-header-description">{exam.description}</p>
          <div className="exam-header-meta">
            <span>📝 {exam.total_questions || 'N/A'} Total Questions</span>
            <span>⏱️ {exam.duration_minutes || 'N/A'} minutes</span>
            {exam.passing_score && <span>🎯 Pass: {exam.passing_score}/{exam.max_score || 1000}</span>}
          </div>
        </div>

        {/* Question Sets */}
        <h2 className="section-title">📝 Question Sets</h2>
        <div className="question-sets-grid">
          {questionSets.length === 0 ? (
            <div className="col-span-full empty-state">
              <div>Loading question sets...</div>
            </div>
          ) : (
            questionSets.map(set => (
              <div
                key={set.id}
                className="question-set-card"
              >
                <div className="question-set-header">
                  <h3 className="question-set-title">{set.name}</h3>
                  {set.is_free_sample || set.price_cents === 0 ? (
                    <span className="badge-free">
                      ✓ Free
                    </span>
                  ) : (
                    <span className="badge-locked">
                      🔒 Locked
                    </span>
                  )}
                </div>
                <p className="question-set-description">{set.description}</p>
                <div className="question-set-meta">
                  <span>📝 {set.question_count} Questions</span>
                  <span>📊 Set {set.set_number}</span>
                </div>
                {(set.is_free_sample || set.price_cents === 0) && (
                  <button
                    onClick={() => navigate(`/exam/${slug}/take?set=${set.id}`)}
                    className="start-exam-button"
                  >
                    Start Practice Exam →
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ExamDetail
