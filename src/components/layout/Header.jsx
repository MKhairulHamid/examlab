import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '../../stores/authStore'
import useSyncStore from '../../stores/syncStore'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, logout } = useAuthStore()
  const { isOnline, isSyncing, pendingCount, getSyncStatusText } = useSyncStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) return null

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
  const userInitial = displayName.charAt(0).toUpperCase()

  const isActive = (path) => location.pathname === path

  return (
    <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">📚</span>
            <span className="text-white font-bold text-xl hidden sm:inline">Cloud Exam Lab</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              to="/dashboard" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/dashboard') 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/') 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              Browse Exams
            </Link>
          </nav>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Sync indicator */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
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
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white font-bold text-sm">
                  {userInitial}
                </div>
                <span className="text-white/90 text-sm hidden md:inline max-w-[120px] truncate">
                  {displayName}
                </span>
                <svg 
                  className={`w-4 h-4 text-white/70 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-lg shadow-xl border border-white/20 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {user?.email}
                      </p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="mr-3">📊</span>
                      Dashboard
                    </Link>
                    
                    <Link
                      to="/"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="mr-3">📚</span>
                      Browse Exams
                    </Link>

                    <div className="lg:hidden">
                      <div className="px-4 py-2.5 text-sm text-gray-700 flex items-center">
                        <span className="mr-3">
                          <div className={`w-2 h-2 rounded-full ${
                            !isOnline ? 'bg-gray-400' :
                            isSyncing ? 'bg-yellow-400' :
                            pendingCount > 0 ? 'bg-orange-400' :
                            'bg-green-400'
                          }`}></div>
                        </span>
                        {getSyncStatusText()}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          handleLogout()
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span className="mr-3">🚪</span>
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

