"""Mobile viewport and safe area hooks."""
import { useState, useEffect } from 'react'

interface ViewportState {
  width: number
  height: number
  isKeyboardOpen: boolean
  safeAreaTop: number
  safeAreaBottom: number
  safeAreaLeft: number
  safeAreaRight: number
}

export function useViewport(): ViewportState {
  const [viewport, setViewport] = useState<ViewportState>({
    width: window.innerWidth,
    height: window.innerHeight,
    isKeyboardOpen: false,
    safeAreaTop: 0,
    safeAreaBottom: 0,
    safeAreaLeft: 0,
    safeAreaRight: 0
  })

  useEffect(() => {
    const updateViewport = () => {
      // Check if keyboard is likely open (window resized significantly)
      const isKeyboardOpen = window.innerHeight < viewport.height * 0.75

      // Get safe area insets (for notched phones)
      const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0')
      const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0')
      const safeAreaLeft = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal') || '0')
      const safeAreaRight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar') || '0')

      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        isKeyboardOpen,
        safeAreaTop,
        safeAreaBottom,
        safeAreaLeft,
        safeAreaRight
      })
    }

    // Set CSS custom properties for safe areas
    const setSafeArea = () => {
      const safeArea = (
        window as unknown as { safeAreaInsets?: { top: number; bottom: number; left: number; right: number } }
      ).safeAreaInsets

      if (safeArea) {
        document.documentElement.style.setProperty('--sat', `${safeArea.top}px`)
        document.documentElement.style.setProperty('--sab', `${safeArea.bottom}px`)
        document.documentElement.style.setProperty('--sal', `${safeArea.left}px`)
        document.documentElement.style.setProperty('--sar', `${safeArea.right}px`)
      }
    }

    window.addEventListener('resize', updateViewport)
    window.addEventListener('orientationchange', updateViewport)

    // Initial setup
    setSafeArea()
    updateViewport()

    return () => {
      window.removeEventListener('resize', updateViewport)
      window.removeEventListener('orientationchange', updateViewport)
    }
  }, [viewport.height])

  return viewport
}

// Prevent scroll when modal is open (mobile)
export function useLockBodyScroll(lock: boolean) {
  useEffect(() => {
    if (lock) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [lock])
}

// Detect if app is installed (PWA)
export function useIsInstalled(): boolean {
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if running in standalone mode
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        || (window.navigator as unknown as { standalone?: boolean }).standalone === true
      setIsInstalled(isInstalled || isStandalone)
    }

    checkStandalone()

    // Listen for app installed event
    window.addEventListener('appinstalled', () => setIsInstalled(true))

    return () => {
      window.removeEventListener('appinstalled', () => setIsInstalled(true))
    }
  }, [isInstalled])

  return isInstalled
}

// Handle pull-to-refresh on mobile
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    let startY = 0
    let isPulling = false

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at top of page
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY
        isPulling = true
      }
    }

    const handleTouchMove = async (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return

      const currentY = e.touches[0].clientY
      const diff = currentY - startY

      // If pulled down more than 100px
      if (diff > 100 && window.scrollY === 0) {
        isPulling = false
        setIsRefreshing(true)
        await onRefresh()
        setIsRefreshing(false)
      }
    }

    const handleTouchEnd = () => {
      isPulling = false
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isRefreshing, onRefresh])

  return { isRefreshing }
}
