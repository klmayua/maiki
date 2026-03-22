'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sparkles, Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Find Jobs', href: '/dashboard/jobs' },
  { name: 'Learning', href: '/dashboard/learn' },
  { name: 'Growth', href: '/dashboard/growth' },
  { name: 'Earnings', href: '/dashboard/earnings' },
  { name: 'Settings', href: '/dashboard/settings' },
]

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-maiki-400 to-maiki-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">maiki</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Search className="w-5 h-5 text-maiki-300" />
            </button>
            <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5 text-maiki-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-top)]" />
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] z-50 bg-maiki-950 border-r border-white/10"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 safe-area-top">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-maiki-400 to-maiki-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-white">maiki</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* User Profile */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-maiki-500 to-maiki-600 flex items-center justify-center text-white font-semibold">
                    JD
                  </div>
                  <div>
                    <div className="font-medium text-white">John Doe</div>
                    <div className="text-sm text-maiki-400">Professional Tier</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="p-4 space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 px-4 rounded-xl text-white hover:bg-white/10 transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Tier Progress */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 safe-area-bottom">
                <div className="glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-gold-400" />
                    <span className="text-sm font-medium text-white">Expert Progress</span>
                  </div>
                  <div className="w-full bg-maiki-800 rounded-full h-2 mb-2">
                    <div className="bg-gradient-to-r from-maiki-400 to-gold-400 h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                  <p className="text-xs text-maiki-400">150/200 hours</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
