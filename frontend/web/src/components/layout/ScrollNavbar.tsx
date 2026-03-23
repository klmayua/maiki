'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LogIn, UserPlus, ArrowRight, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import Logo from '@/components/ui/Logo'

const subtleLinkClass = "text-xs sm:text-sm flex items-center gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 border border-navy-500/60 bg-navy-800/60 text-text-secondary hover:text-text-primary hover:border-navy-400 hover:bg-navy-700/60 rounded transition-all"

const primaryLinkClass = "text-xs sm:text-sm flex items-center gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 bg-teal-500/15 text-teal-300 border border-teal-500/40 font-semibold rounded hover:bg-teal-500/25 hover:text-teal-200 hover:border-teal-500/50 transition-all"

export default function ScrollNavbar() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Skip on dashboard pages (has its own fixed header)
  if (pathname.startsWith('/dashboard')) return null

  const getRightContent = () => {
    switch (pathname) {
      case '/login':
        return (
          <Link href="/register" className={primaryLinkClass}>
            <UserPlus className="w-3.5 h-3.5" />
            Register
            <ArrowRight className="w-3.5 h-3.5 arrow-nudge" />
          </Link>
        )

      case '/register':
        return (
          <Link href="/login" className={subtleLinkClass}>
            <LogIn className="w-3.5 h-3.5" />
            Log In
          </Link>
        )

      case '/forgot-password':
        return (
          <Link href="/login" className={subtleLinkClass}>
            <LogIn className="w-3.5 h-3.5" />
            Log In
          </Link>
        )

      case '/post-job':
        return (
          <Link href="/dashboard" className={subtleLinkClass}>
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        )

      default:
        return (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className={cn(subtleLinkClass, 'hidden sm:flex')}>
              <LogIn className="w-3.5 h-3.5" />
              Log In
            </Link>
            <Link href="/register" className={primaryLinkClass}>
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight className="w-3.5 h-3.5 arrow-nudge" />
            </Link>
          </div>
        )
    }
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled
          ? 'bg-navy-900/85 backdrop-blur-xl'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between h-11 sm:h-[4.2rem]">
          <Logo size="sm" />
          {getRightContent()}
        </div>
      </div>
      {/* Gradient separator — thick center, tapering edges */}
      <div
        className={cn(
          'h-[1px] transition-opacity duration-300',
          isScrolled ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.3) 30%, rgba(255,255,255,0.15) 50%, rgba(45,212,191,0.3) 70%, transparent)',
        }}
      />
    </header>
  )
}
