import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import { LayoutGrid, BookOpen, ClipboardList, BarChart2, Award } from 'lucide-react'

// Primary app destinations. Content lives on the dashboard (as tabs), so these
// deep-link there; from any other logged-in page they jump straight to the
// relevant area.
const ITEMS = [
  { id: 'overview',    label: 'Home',        Icon: LayoutGrid },
  { id: 'study',       label: 'Study',       Icon: BookOpen },
  { id: 'practice',    label: 'Practice',    Icon: ClipboardList },
  { id: 'progress',    label: 'Progress',    Icon: BarChart2 },
  { id: 'credentials', label: 'Credentials', Icon: Award },
]

// Where the logged-in bottom nav should appear. Hidden during an exam attempt
// and on every public / marketing route.
function showOnPath(pathname) {
  if (pathname.startsWith('/exam/') && pathname.endsWith('/take')) return false
  return (
    pathname === '/dashboard' ||
    pathname.startsWith('/exam/') ||
    pathname === '/admin' ||
    pathname === '/payment-success'
  )
}

function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  if (!user || !showOnPath(location.pathname)) return null

  const onDashboard = location.pathname === '/dashboard'
  const tab = new URLSearchParams(location.search).get('tab') || 'overview'

  const isActive = (id) => {
    if (onDashboard) return id === tab
    if (id === 'study' && location.pathname.includes('/study')) return true
    if (id === 'progress' && location.pathname.includes('/results')) return true
    if (id === 'practice' && location.pathname.startsWith('/exam/')) return true
    return false
  }

  const go = (id) => {
    navigate(id === 'overview' ? '/dashboard' : `/dashboard?tab=${id}`)
    if (onDashboard) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* Spacer so the fixed bar never covers page content / footers */}
      <div className="h-16 sm:hidden" aria-hidden="true" />

      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 flex justify-around"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        role="navigation"
        aria-label="Primary"
      >
        {ITEMS.map(({ id, label, Icon }) => {
          const active = isActive(id)
          return (
            <button
              key={id}
              onClick={() => go(id)}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                active ? 'text-[#0A2540]' : 'text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6 shrink-0" strokeWidth={active ? 2.6 : 2} />
              <span className="text-[0.625rem] font-semibold">{label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

export default BottomNav
