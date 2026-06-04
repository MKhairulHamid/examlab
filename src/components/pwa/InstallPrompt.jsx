import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Only show if user hasn't dismissed it before
      if (!localStorage.getItem('pwa-install-dismissed')) {
        setVisible(true)
      }
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem('pwa-install-dismissed', '1')
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-[#0A2540] border border-[#00D4AA]/30 rounded-xl shadow-2xl p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
        <img src="/icons/icon-192x192.png" alt="Cloud Exam Lab" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold">Install Cloud Exam Lab</p>
        <p className="text-white/60 text-xs mt-0.5">Study offline, anytime</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 bg-[#00D4AA] text-[#0A2540] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#00D4AA]/90 transition-colors"
          >
            <Download size={12} />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-white/50 text-xs px-2 py-1.5 rounded-lg hover:text-white/80 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
      <button onClick={handleDismiss} className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0">
        <X size={16} />
      </button>
    </div>
  )
}
