'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIsMobile, useIsTouch } from '@/hooks/useMediaQuery'

// Extend Window interface for beforeinstallprompt
declare global {
  interface Window {
    deferredPrompt?: {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
    }
  }
}

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const isMobile = useIsMobile()
  const isTouch = useIsTouch()

  useEffect(() => {
    // Check if already installed
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches
        || (window.navigator as unknown as { standalone?: boolean }).standalone === true
      setIsStandalone(standalone)
    }

    checkStandalone()

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
    setIsIOS(isIOSDevice)

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      window.deferredPrompt = e as unknown as Window['deferredPrompt']

      // Check if we should show prompt (not dismissed before)
      const dismissedAt = localStorage.getItem('pwaPromptDismissed')
      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000

      if (!dismissedAt || parseInt(dismissedAt) < twoWeeksAgo) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsStandalone(true)
      setShowPrompt(false)
      window.deferredPrompt = undefined
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!window.deferredPrompt) return

    window.deferredPrompt.prompt()

    const { outcome } = await window.deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted install')
    }

    window.deferredPrompt = undefined
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwaPromptDismissed', Date.now().toString())
    setShowPrompt(false)
  }

  // Don't show on desktop without touch
  if (!isMobile && !isTouch) return null

  // Don't show if already installed
  if (isStandalone) return null

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 glass-card p-4 rounded-2xl shadow-2xl safe-area-bottom"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-maiki-400 to-maiki-600 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">
                {isIOS ? 'Add to Home Screen' : 'Install Maiki App'}
              </h3>

              <p className="text-sm text-maiki-400 mb-3">
                {isIOS
                  ? 'Install Maiki for the best mobile experience. Tap the share button below and select "Add to Home Screen".'
                  : 'Install Maiki on your device for quick access, offline support, and native app experience.'}
              </p>

              <div className="flex gap-2">
                {isIOS ? (
                  <div className="flex items-center gap-2 text-sm text-maiki-300 bg-maiki-950/50 px-3 py-2 rounded-lg">
                    <Share className="w-4 h-4" />
                    <span>Tap share → Add to Home Screen</span>
                  </div>
                ) : (
                  <>
                    <Button size="sm" onClick={handleInstall}>
                      Install
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDismiss}>
                      Later
                    </Button>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-maiki-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
