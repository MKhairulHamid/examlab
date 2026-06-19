import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

// Consistent left-aligned back affordance for pushed screens (exam detail,
// results, study material). Recognition over recall: same control, same place.
// Pass either `to` (a route) or `onBack` (a handler); label defaults to "Back".
// `tone="dark"` for placement on the navy/gradient backgrounds.
function BackLink({ to, onBack, label = 'Back', tone = 'light', className = '' }) {
  const navigate = useNavigate()
  const handle = () => {
    if (onBack) onBack()
    else if (to) navigate(to)
    else navigate(-1)
  }
  const toneCls =
    tone === 'dark'
      ? 'text-white/70 hover:text-white hover:bg-white/10'
      : 'text-gray-500 hover:text-[#0A2540] hover:bg-gray-100'
  return (
    <button
      type="button"
      onClick={handle}
      className={`inline-flex items-center gap-1 -ml-1 pl-1 pr-3 py-1.5 rounded-full font-display text-sm font-bold transition-colors ${toneCls} ${className}`}
    >
      <ChevronLeft className="w-4 h-4 shrink-0" strokeWidth={2.4} />
      {label}
    </button>
  )
}

export default BackLink
