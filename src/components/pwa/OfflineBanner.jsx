import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    const handleOffline = () => setIsOnline(false)
    const handleOnline = () => {
      setIsOnline(true)
      setShowRestored(true)
      setTimeout(() => setShowRestored(false), 3000)
    }
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (isOnline && !showRestored) return null

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium transition-all ${
        isOnline
          ? 'bg-[#00D4AA] text-[#0A2540]'
          : 'bg-yellow-500/90 text-yellow-950'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi size={14} />
          Connection restored
        </>
      ) : (
        <>
          <WifiOff size={14} />
          You are offline — progress is saved locally
        </>
      )}
    </div>
  )
}
