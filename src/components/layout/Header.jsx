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
    <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-2 hover:opacity-80 transition-all duration-200 group"
          >
            <div className="text-2xl transform group-hover:scale-110 transition-transform">📚</div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg sm:text-xl leading-none">Cloud Exam Lab</span>
              <span className="text-accent text-xs font-medium hidden sm:block">Certification Practice</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link 
              to="/dashboard" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/dashboard') 
                  ? 'bg-white/20 text-white shadow-sm' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="mr-1.5">📊</span>
              Dashboard
            </Link>
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'bg-white/20 text-white shadow-sm' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="mr-1.5">🔍</span>
              Browse Exams
            </Link>
          </nav>

          {/* Right section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Sync indicator - Desktop */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
              <div className={`w-2 h-2 rounded-full ${
                !isOnline ? 'bg-gray-400' :
                isSyncing ? 'bg-yellow-400 animate-pulse' :
                pendingCount > 0 ? 'bg-orange-400 animate-pulse' :
                'bg-green-400'
              }`}></div>
              <span className="text-white/80 text-xs font-medium">
                {getSyncStatusText()}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all border border-white/20"
              aria-label="Toggle menu"
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
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/30"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {userInitial}
                </div>
                <span className="text-white/90 text-sm hidden sm:inline max-w-[100px] lg:max-w-[140px] truncate font-medium">
                  {displayName}
                </span>
                <svg 
                  className={`w-4 h-4 text-white/70 transition-transform duration-200 hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Desktop Dropdown menu */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 py-2 z-20 animate-slideDown">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {user?.email}
                      </p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-accent/10 hover:to-transparent transition-all duration-200 font-medium"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="mr-3 text-lg">📊</span>
                      Dashboard
                    </Link>
                    
                    <Link
                      to="/"
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-accent/10 hover:to-transparent transition-all duration-200 font-medium"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="mr-3 text-lg">🔍</span>
                      Browse Exams
                    </Link>

                    {/* Mobile sync indicator */}
                    <div className="lg:hidden px-4 py-2.5">
                      <div className="flex items-center text-sm text-gray-700 font-medium">
                        <span className="mr-3 flex items-center justify-center w-5">
                          <div className={`w-2 h-2 rounded-full ${
                            !isOnline ? 'bg-gray-400' :
                            isSyncing ? 'bg-yellow-400 animate-pulse' :
                            pendingCount > 0 ? 'bg-orange-400 animate-pulse' :
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
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                      >
                        <span className="mr-3 text-lg">🚪</span>
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
          <div className="md:hidden border-t border-white/20 py-3 animate-slideDown">
            <nav className="flex flex-col space-y-1">
              <Link 
                to="/dashboard" 
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/dashboard') 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="mr-2">📊</span>
                Dashboard
              </Link>
              <Link 
                to="/" 
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/') 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="mr-2">🔍</span>
                Browse Exams
              </Link>
              
              {/* Mobile Sync Status */}
              <div className="px-4 py-2.5 text-sm text-white/80 flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${
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

