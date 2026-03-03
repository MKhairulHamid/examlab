import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import { getExamTypes } from '../services/adminService'
import ExamTypeForm from '../components/admin/ExamTypeForm'
import QuestionSetForm from '../components/admin/QuestionSetForm'
import QuestionSetManager from '../components/admin/QuestionSetManager'
import './AdminPage.css'

const TABS = [
  { id: 'exam-types', label: 'Exam Types' },
  { id: 'question-sets', label: 'Question Sets' },
  { id: 'manage-questions', label: 'Manage Questions' },
]

export default function AdminPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [activeTab, setActiveTab] = useState('exam-types')
  const [examTypes, setExamTypes] = useState([])
  const [loadingExamTypes, setLoadingExamTypes] = useState(true)
  const [accessError, setAccessError] = useState(null)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    checkAccessAndLoad()
  }, [user])

  async function checkAccessAndLoad() {
    if (!user) return
    setLoadingExamTypes(true)
    setAccessError(null)

    try {
      const result = await getExamTypes()
      setExamTypes(result.data || [])
      setAuthorized(true)
    } catch (err) {
      if (err.message.includes('forbidden') || err.message.includes('Access denied')) {
        setAccessError('Access denied. This page is only available to administrators.')
      } else {
        setAccessError(err.message)
      }
    } finally {
      setLoadingExamTypes(false)
    }
  }

  function handleExamTypeCreated(newType) {
    setExamTypes(prev => [...prev, newType].sort((a, b) => a.display_order - b.display_order))
  }

  function handleSetSelect(questionSet, examType) {
    setActiveTab('manage-questions')
  }

  if (loadingExamTypes) {
    return (
      <div className="admin-page">
        <div className="admin-loading-screen">
          <div className="spinner"></div>
          <p>Verifying access...</p>
        </div>
      </div>
    )
  }

  if (accessError) {
    return (
      <div className="admin-page">
        <div className="admin-access-denied">
          <h1>Access Denied</h1>
          <p>{accessError}</p>
          <button className="admin-btn admin-btn--secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div>
            <h1 className="admin-title">Admin Panel</h1>
            <p className="admin-subtitle">Manage exam content</p>
          </div>
          <button className="admin-btn admin-btn--ghost" onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </button>
        </div>

        <nav className="admin-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'admin-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="admin-main">
        {activeTab === 'exam-types' && (
          <ExamTypeForm
            examTypes={examTypes}
            onCreated={handleExamTypeCreated}
          />
        )}

        {activeTab === 'question-sets' && (
          <QuestionSetForm
            examTypes={examTypes}
            onSetCreated={() => {}}
            onSetSelect={handleSetSelect}
          />
        )}

        {activeTab === 'manage-questions' && (
          <QuestionSetManager
            examTypes={examTypes}
          />
        )}
      </main>
    </div>
  )
}
