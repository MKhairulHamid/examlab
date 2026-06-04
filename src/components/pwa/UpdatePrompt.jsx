import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

export default function UpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.ready.then((registration) => {
      // New SW waiting — a deploy happened
      if (registration.waiting) {
        setWaitingWorker(registration.waiting)
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker)
          }
        })
      })
    })

    // When SW activates after SKIP_WAITING, reload
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })
  }, [])

  const handleUpdate = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' })
    setWaitingWorker(null)
  }

  if (!waitingWorker) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#0A2540] border border-white/10 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3 whitespace-nowrap">
      <span className="text-white text-sm">A new version is available</span>
      <button
        onClick={handleUpdate}
        className="flex items-center gap-1.5 bg-[#00D4AA] text-[#0A2540] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#00D4AA]/90 transition-colors"
      >
        <RefreshCw size={12} />
        Update
      </button>
    </div>
  )
}
