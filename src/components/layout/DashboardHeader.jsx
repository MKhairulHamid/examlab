import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

function DashboardHeader() {
  const navigate = useNavigate()
  const { user, profile, logout } = useAuthStore()

  if (!user) return null

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0A2540] border-b border-white/[0.07]">
      <div className="max-w-[75rem] mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-white font-bold text-[0.9375rem] no-underline shrink-0 hover:opacity-90 transition-opacity"
          >
            <svg className="w-6 h-6 text-[#00D4AA] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Cloud Exam Lab</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-0.5">
            <Link
              to="/dashboard"
              className="text-white/70 hover:text-white hover:bg-white/[0.08] px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              <span className="dashboard-header-nav-text">Dashboard</span>
              <span className="dashboard-header-nav-icon hidden">🏠</span>
            </Link>

            {profile?.is_admin && (
              <Link
                to="/admin"
                className="text-white/70 hover:text-white hover:bg-white/[0.08] px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                <span className="dashboard-header-nav-text">Admin</span>
                <span className="dashboard-header-nav-icon hidden">🛠️</span>
              </Link>
            )}

            <div className="w-px h-5 bg-white/15 mx-1" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-white/75 hover:text-white bg-white/[0.07] hover:bg-white/[0.13] border border-white/10 hover:border-white/20 rounded-md text-xs font-semibold transition-all"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="dashboard-header-nav-text">Logout</span>
            </button>
          </nav>

        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
