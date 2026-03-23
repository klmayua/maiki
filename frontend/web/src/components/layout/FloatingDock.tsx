'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  Search,
  Briefcase,
  Users,
  Sparkles,
  GraduationCap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Talent', href: '/discover', icon: Search },
  { name: 'Post Job', href: '/post-job', icon: Sparkles },
  { name: 'Academy', href: '/academy', icon: GraduationCap },
  { name: 'Community', href: '/community', icon: Users },
]

// Mobile shows: Home, Jobs, Talent, Academy, Community (5 core nav items)
const mobileNavItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Talent', href: '/discover', icon: Search },
  { name: 'Academy', href: '/academy', icon: GraduationCap },
  { name: 'Community', href: '/community', icon: Users },
]

export default function FloatingDock() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setIsScrolled(currentScrollY > 50)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <>
      {/* Desktop Floating Dock */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{
          y: isVisible ? 0 : 100,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="fixed bottom-4 right-24 z-50 hidden md:block"
      >
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-2 rounded-full transition-all duration-500',
            isScrolled
              ? 'bg-navy-900/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/50'
              : 'bg-navy-900/70 backdrop-blur-md border border-white/15'
          )}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300',
                    isActive
                      ? 'bg-teal-500/15 text-teal-400'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/10 hover:shadow-sm'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </motion.nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-navy-900/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors',
                    isActive ? 'text-teal-400' : 'text-text-muted'
                  )}>
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-medium">{item.name}</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Safe area padding for iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  )
}
