import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket, GraduationCap, Video, Flag, Users } from 'lucide-react'
import useAuthStore from '../stores/authStore'
import { getExamTypes } from '../services/adminService'
import DashboardHeader from '../components/layout/DashboardHeader'
import ExamTypeForm from '../components/admin/ExamTypeForm'
import PromoCodeManager from '../components/admin/PromoCodeManager'
import CommunityVideoReview from '../components/admin/CommunityVideoReview'
import VideoReportsManager from '../components/admin/VideoReportsManager'
import UsersManager from '../components/admin/UsersManager'
import './AdminPage.css'

const TABS = [
  { id: 'users', label: 'Users', Icon: Users },
  { id: 'promo-codes', label: 'Promo Codes', Icon: Ticket },
  { id: 'exam-types', label: 'Exam Types', Icon: GraduationCap },
  { id: 'community-videos', label: 'Community Videos', Icon: Video },
  { id: 'video-reports', label: 'Video Reports', Icon: Flag },
]

export default function AdminPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [activeTab, setActiveTab] = useState('promo-codes')
  const [examTypes, setExamTypes] = useState([])
  const [loadingExamTypes, setLoadingExamTypes] = useState(true)
  const [accessError, setAccessError] = useState(null)

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

  if (loadingExamTypes) {
    return (
      <div className="admin-page">
        <DashboardHeader />
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
        <DashboardHeader />
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
      <DashboardHeader />

      <div className="admin-shell">
        <header className="admin-pagehead">
          <h1 className="admin-title">Admin</h1>
          <p className="admin-subtitle">Manage promo codes and exam types</p>
        </header>

        <nav className="admin-tabs" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'admin-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.Icon size={16} strokeWidth={2.2} />
              {tab.label}
            </button>
          ))}
        </nav>

        <main className="admin-main">
          {activeTab === 'users' && (
            <UsersManager />
          )}

          {activeTab === 'promo-codes' && (
            <PromoCodeManager examTypes={examTypes} />
          )}

          {activeTab === 'exam-types' && (
            <ExamTypeForm
              examTypes={examTypes}
              onCreated={handleExamTypeCreated}
            />
          )}

          {activeTab === 'community-videos' && (
            <CommunityVideoReview />
          )}

          {activeTab === 'video-reports' && (
            <VideoReportsManager />
          )}
        </main>
      </div>
    </div>
  )
}
