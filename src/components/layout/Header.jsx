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
  const [showMobileMenu, setShowMobileMenu] = useState(false)

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
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
          >
            <span className="text-2xl">📚</span>
            <span className="text-white font-bold text-lg sm:text-xl">Cloud Exam Lab</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              to="/dashboard" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              Browse Exams
            </Link>
          </nav>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Sync indicator - Desktop only */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
              <div className={`w-2 h-2 rounded-full ${
                !isOnline ? 'bg-gray-400' :
                isSyncing ? 'bg-yellow-400 animate-pulse' :
                pendingCount > 0 ? 'bg-orange-400 animate-pulse' :
                'bg-green-400'
              }`}></div>
              <span className="text-white/80 text-xs">
                {getSyncStatusText()}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
            >
              <svg 
                className="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* User menu */}
            <div className="relative z-50">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white font-bold text-sm">
                  {userInitial}
                </div>
                <span className="text-white text-sm hidden md:inline max-w-[120px] truncate">
                  {displayName}
                </span>
                <svg 
                  className={`w-4 h-4 text-white/70 transition-transform hidden md:block ${showUserMenu ? 'rotate-180' : ''}`}
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
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user?.email}
                      </p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="mr-2">📊</span>
                      Dashboard
                    </Link>
                    
                    <Link
                      to="/"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="mr-2">🔍</span>
                      Browse Exams
                    </Link>

                    {/* Mobile sync indicator */}
                    <div className="lg:hidden px-4 py-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          !isOnline ? 'bg-gray-400' :
                          isSyncing ? 'bg-yellow-400' :
                          pendingCount > 0 ? 'bg-orange-400' :
                          'bg-green-400'
                        }`}></div>
                        {getSyncStatusText()}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 mt-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          handleLogout()
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <span className="mr-2">🚪</span>
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-white/20 py-2">
            <nav className="flex flex-col">
              <Link 
                to="/dashboard" 
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                📊 Dashboard
              </Link>
              <Link 
                to="/" 
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                🔍 Browse Exams
              </Link>
              
              {/* Mobile Sync Status */}
              <div className="px-4 py-2.5 text-sm text-white/70 flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  !isOnline ? 'bg-gray-400' :
                  isSyncing ? 'bg-yellow-400 animate-pulse' :
                  pendingCount > 0 ? 'bg-orange-400 animate-pulse' :
                  'bg-green-400'
                }`}></div>
                {getSyncStatusText()}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

