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
    fontSize: '0.8125rem',
    fontWeight: '500',
    textDecoration: 'none',
    padding: '0.375rem 0.5rem',
    borderRadius: '0.375rem',
    transition: 'color 0.2s, background 0.2s',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    whiteSpace: 'nowrap'
  }

  return (
    <header style={{
      background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '3.25rem' }}>
          {/* Logo */}
          <Link 
            to="/dashboard" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', textDecoration: 'none', flexShrink: 0 }}
          >
            <span style={{ fontSize: '1.125rem' }}>📚</span>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '0.9375rem', whiteSpace: 'nowrap' }}>Cloud Exam Lab</span>
          </Link>

          {/* Nav Links + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
            <Link
              to="/dashboard"
              style={linkStyle}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'none' }}
            >
              <span className="dashboard-header-nav-text">Dashboard</span>
              <span className="dashboard-header-nav-icon" style={{ display: 'none' }}>🏠</span>
            </Link>
            <Link
              to="/"
              style={linkStyle}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'none' }}
            >
              <span className="dashboard-header-nav-text">Browse</span>
              <span className="dashboard-header-nav-icon" style={{ display: 'none' }}>🔍</span>
            </Link>

            <div style={{ width: '1px', height: '1.25rem', background: 'rgba(255,255,255,0.15)', margin: '0 0.25rem' }} />

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.375rem 0.625rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.8)',
                fontWeight: '600',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap'
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
              <svg style={{ width: '0.9375rem', height: '0.9375rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="dashboard-header-nav-text">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
