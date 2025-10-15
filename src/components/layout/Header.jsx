import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import useSyncStore from '../../stores/syncStore'

function Header() {
  const navigate = useNavigate()
  const { user, profile, logout } = useAuthStore()
  const { isOnline, isSyncing, pendingCount, getSyncStatusText } = useSyncStore()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) return null

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl">📚</span>
            <span className="text-white font-bold text-xl hidden sm:inline">ExamPrep</span>
          </Link>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Sync indicator */}
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                !isOnline ? 'bg-gray-400' :
                isSyncing ? 'bg-yellow-400 animate-pulse' :
                pendingCount > 0 ? 'bg-orange-400' :
                'bg-green-400'
              }`}></div>
              <span className="text-white/80 text-xs">
                {getSyncStatusText()}
              </span>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <span className="text-white/90 text-sm hidden md:inline">
                {displayName}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors border border-white/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

