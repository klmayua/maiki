'use client'

import { usePathname } from 'next/navigation'
import FloatingDock from './FloatingDock'

export default function FloatingDockWrapper() {
  const pathname = usePathname()

  // Hide on dashboard pages (they have their own navigation)
  if (pathname.startsWith('/dashboard')) return null

  return <FloatingDock />
}
