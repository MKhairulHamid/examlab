import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

function DashboardHeader() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  if (!user) return null

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const linkStyle = {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.875rem',
    fontWeight: '500',
    textDecoration: 'none',
    padding: '0.375rem 0.625rem',
    borderRadius: '0.375rem',
    transition: 'color 0.2s, background 0.2s',
    cursor: 'pointer',
    border: 'none',
    background: 'none'
  }

  return (
    <header style={{
      background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
      borderBottom: '1px solid rgba(255,255,255,0.08)'
    }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="text-xl">📚</span>
            <span className="text-white font-bold text-lg">Cloud Exam Lab</span>
          </Link>

          {/* Nav Links + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Link
              to="/dashboard"
              style={linkStyle}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'none' }}
            >
              Dashboard
            </Link>
            <Link
              to="/"
              style={linkStyle}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'none' }}
            >
              Browse Exams
            </Link>

            <div style={{ width: '1px', height: '1.25rem', background: 'rgba(255,255,255,0.15)', margin: '0 0.375rem' }} />

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.75rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.8)',
                fontWeight: '600',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.8125rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
              }}
            >
              <svg style={{ width: '1rem', height: '1rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
