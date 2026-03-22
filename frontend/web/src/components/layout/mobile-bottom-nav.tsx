'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Wallet,
  Users,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  Sparkles
} from 'lucide-react'
import { useState } from 'react'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

const vaNavItems = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Learn', href: '/dashboard/learn', icon: GraduationCap },
  { name: 'Growth', href: '/dashboard/growth', icon: TrendingUp },
  { name: 'More', href: '/dashboard/menu', icon: Menu, isMore: true },
]

const moreMenuItems = [
  { name: 'Earnings', href: '/dashboard/earnings', icon: Wallet },
  { name: 'Teams', href: '/dashboard/teams', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-maiki-950/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {vaNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const isMore = item.isMore

            return (
              <button
                key={item.name}
                onClick={() => {
                  if (isMore) {
                    setIsMoreOpen(true)
                  }
                }}
                className={cn(
                  'flex flex-col items-center justify-center min-w-[64px] py-2 px-3 rounded-xl transition-colors',
                  isActive && !isMore ? 'text-maiki-400' : 'text-maiki-400',
                  isMore && 'text-maiki-400'
                )}
              >
                <div className={cn(
                  'relative p-2 rounded-xl transition-all',
                  isActive && !isMore && 'bg-maiki-500/20'
                )}>
                  <Icon className={cn(
                    'w-5 h-5',
                    isActive && !isMore && 'text-maiki-400'
                  )} />
                  {isActive && !isMore && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-maiki-400"
                    />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] mt-1 font-medium',
                  isActive && !isMore && 'text-white'
                )}>
                  {item.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Safe area padding for iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      {/* More Menu Sheet */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-maiki-900 rounded-t-3xl safe-area-bottom"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Title */}
              <div className="px-4 py-3 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Menu</h3>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-2">
                {moreMenuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-maiki-500/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-maiki-400" />
                      </div>
                      <span className="text-white font-medium">{item.name}</span>
                    </Link>
                  )
                })}

                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="w-full py-3 text-maiki-400 text-sm"
                >
                  Cancel
                </button>
              </div>

              {/* Safe area */}
              <div className="h-[env(safe-area-inset-bottom)]" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
