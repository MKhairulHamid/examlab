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

  return (
    <header style={{
      background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="text-2xl">📚</span>
            <span className="text-white font-bold text-lg sm:text-xl">Cloud Exam Lab</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader

