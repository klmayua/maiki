'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Wallet,
  Users,
  Settings,
  Bell,
  Search,
  Sparkles,
  Menu,
  ChevronLeft,
  MoreHorizontal,
  MessageSquare,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/useMediaQuery'
import MobileHeader from '@/components/layout/mobile-header'
import MobileBottomNav from '@/components/layout/mobile-bottom-nav'
import { useViewport } from '@/hooks/useViewport'

const vaNavItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Find Work', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'My Projects', href: '/dashboard/my-projects', icon: Target },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Hire VA', href: '/dashboard/post-job', icon: Users },  // VAs can hire other VAs
  { name: 'Learn', href: '/dashboard/learn', icon: GraduationCap },
  { name: 'Growth', href: '/dashboard/growth', icon: TrendingUp },
  { name: 'Earnings', href: '/dashboard/earnings', icon: Wallet },
  { name: 'Teams', href: '/dashboard/teams', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const clientNavItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Post Job', href: '/dashboard/post-job', icon: Briefcase },
  { name: 'Find VAs', href: '/dashboard/va-search', icon: Search },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Projects', href: '/dashboard/projects', icon: TrendingUp },
  { name: 'Billing', href: '/dashboard/billing', icon: Wallet },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const viewport = useViewport()
  const userType = 'va' // This would come from auth context
  const navItems = userType === 'va' ? vaNavItems : clientNavItems

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-maiki-950 pb-[calc(80px+env(safe-area-inset-bottom))]">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Main Content */}
        <main className="pt-[calc(60px+env(safe-area-inset-top))]">
          <div className="p-4">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    )
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-maiki-950">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-nav border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-maiki-400 to-maiki-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">maiki</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-maiki-400" />
                <input
                  type="text"
                  placeholder="Search jobs, VAs, or skills..."
                  className="bg-maiki-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-maiki-400 focus:outline-none focus:border-maiki-500 w-80"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-maiki-300 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">John Doe</div>
                <div className="text-xs text-maiki-400">Professional Tier</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-maiki-500 to-maiki-600 flex items-center justify-center text-white font-semibold">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-[60px] bottom-0 w-64 glass-card border-r border-white/10 overflow-y-auto hidden lg:block">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-maiki-600 text-white'
                    : 'text-maiki-300 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="glass-card p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-gold-400" />
              <span className="text-sm font-medium text-white">Expert Tier Progress</span>
            </div>
            <div className="w-full bg-maiki-800 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-maiki-400 to-gold-400 h-2 rounded-full" style={{ width: '75%' }} />
            </div>
            <p className="text-xs text-maiki-400">150/200 hours to Expert</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-[60px] min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
