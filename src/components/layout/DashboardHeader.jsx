import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import { LayoutDashboard, Wrench, LogOut, ChevronDown } from 'lucide-react'

function DashboardHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close the account menu on outside-click / Escape
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey) }
  }, [menuOpen])

  if (!user) return null

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const name = profile?.full_name || user?.email?.split('@')[0] || 'Student'
  const initial = name.charAt(0).toUpperCase()

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    ...(profile?.is_admin ? [{ to: '/admin', label: 'Admin', Icon: Wrench }] : []),
  ]

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <header className="sticky top-0 z-50 bg-[#0A2540] border-b border-white/[0.07]">
      <div className="max-w-[75rem] mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-2">

          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-white font-bold text-[0.9375rem] no-underline shrink-0 hover:opacity-90 transition-opacity"
          >
            <svg className="w-6 h-6 text-[#00D4AA] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="hidden sm:inline">Cloud Exam Lab</span>
          </Link>

          {/* Primary nav */}
          <nav className="flex items-center gap-1 flex-1 justify-center sm:justify-start sm:ml-4">
            {navItems.map(({ to, label, Icon }) => {
              const active = isActive(to)
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'text-white bg-white/[0.12]'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Account menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full text-white/85 hover:text-white bg-white/[0.07] hover:bg-white/[0.13] border border-white/10 hover:border-white/20 transition-all"
            >
              <span className="w-7 h-7 rounded-full bg-[#00D4AA] text-[#0A2540] text-sm font-bold flex items-center justify-center shrink-0">
                {initial}
              </span>
              <span className="hidden sm:block max-w-[8rem] truncate text-sm font-semibold">{name}</span>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-60 rounded-xl bg-white shadow-xl border border-gray-100 overflow-hidden py-1.5 z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-[#0A2540] truncate">{name}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                </div>

                {navItems.map(({ to, label, Icon }) => (
                  <button
                    key={to}
                    role="menuitem"
                    onClick={() => { setMenuOpen(false); navigate(to) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                    {label}
                  </button>
                ))}

                <div className="h-px bg-gray-100 my-1" />

                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Log out
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
