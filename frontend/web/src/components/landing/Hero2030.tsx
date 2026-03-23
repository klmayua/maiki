'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  Users,
  Zap,
  Shield,
  TrendingUp,
  GraduationCap,
  Globe,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const platformStats = [
  { value: '12,000+', label: 'Verified VAs', icon: Users },
  { value: '$45', label: 'Avg Hourly Rate', icon: TrendingUp },
  { value: '98%', label: 'Success Rate', icon: Shield },
  { value: '50+', label: 'Countries', icon: Globe },
]

const tierSystem = [
  { tier: 'Associate', rate: '$15-25/hr', color: 'bg-teal-600', barWidth: 'w-[25%]', barColor: 'bg-teal-600' },
  { tier: 'Professional', rate: '$25-40/hr', color: 'bg-teal-500', barWidth: 'w-[50%]', barColor: 'bg-teal-500', active: true },
  { tier: 'Expert', rate: '$40-75/hr', color: 'bg-teal-400', barWidth: 'w-[75%]', barColor: 'bg-teal-400' },
  { tier: 'Legend', rate: 'Invite Only', color: 'bg-gold-300', barWidth: 'w-full', barColor: 'bg-gradient-to-r from-gold-400 to-gold-300' },
]

export default function Hero2030() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 pt-14 sm:pt-20 pb-6">
        {/* Subtle single gradient — barely visible, not distracting */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-navy-800/40 via-navy-900 to-navy-900" />
        </div>

        <div className="container mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
          {/* Hero Content */}
          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8 items-start">
            {/* Left - Main messaging */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3 space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-navy-700/60 bg-navy-800/40 text-[10px] sm:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 live-pulse" />
                <span className="text-text-secondary">The Virtual Assistant Operating System</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold leading-[1.1] tracking-tight text-text-heading">
                Own Your Career.<br />
                <span className="text-gradient-teal">Build Your Business.</span>
              </h1>

              <p className="text-sm sm:text-base text-text-secondary max-w-xl leading-relaxed">
                The career OS for elite VAs. AI-matched jobs, blockchain-verified reputation,
                and structured growth paths. Not a gig platform.
              </p>

              {/* CTAs — clearly differentiated */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1">
                <Link href="/register?role=va" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="font-bold px-6 h-10 sm:h-11 w-full sm:w-auto text-sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Join as Virtual Assistant
                    <ArrowRight className="w-4 h-4 ml-2 arrow-nudge" />
                  </Button>
                </Link>
                <Link href="/register?role=client" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-navy-600 text-text-secondary hover:text-text-primary hover:border-navy-500 px-6 h-10 sm:h-11 w-full sm:w-auto text-sm font-medium"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Find Talent
                    <ChevronRight className="w-4 h-4 ml-1 arrow-nudge" />
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] sm:text-xs text-text-muted pt-1">
                <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-500" /> Blockchain Verified</span>
                <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-500" /> AI-Matched in 2hrs</span>
                <span className="flex items-center gap-1.5"><Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-500" /> 50+ Countries</span>
              </div>
            </motion.div>

            {/* Right - Tier Preview Card (elevated design) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="relative border border-navy-700/60 bg-navy-800/50 backdrop-blur-sm rounded-lg overflow-hidden">
                {/* Top accent line */}
                <div className="h-[2px] bg-gradient-to-r from-teal-500 via-teal-400 to-gold-400" />

                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-text-primary tracking-wide">Career Tiers</h3>
                      <p className="text-[10px] text-text-muted mt-0.5">Your path to Legend</p>
                    </div>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-navy-700/60 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-teal-400" />
                    </div>
                  </div>

                  <div className="space-y-2.5 sm:space-y-3">
                    {tierSystem.map((t) => (
                      <div
                        key={t.tier}
                        className={`flex items-center gap-3 group ${t.active ? 'bg-navy-700/40 -mx-2 px-2 py-1.5 rounded border-l-2 border-teal-500' : ''}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs sm:text-sm font-medium ${t.active ? 'text-teal-400' : 'text-text-secondary'} group-hover:text-text-primary transition-colors`}>
                              {t.tier}
                              {t.active && <span className="text-[8px] sm:text-[10px] text-teal-500 ml-1.5 font-normal uppercase tracking-wider">You are here</span>}
                            </span>
                            <span className="text-[10px] sm:text-xs text-text-muted font-mono">{t.rate}</span>
                          </div>
                          {/* Progress bar */}
                          <div className="h-1 bg-navy-700/60 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${t.barColor} ${t.barWidth}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-navy-700/40 flex items-center justify-between">
                    <p className="text-[10px] sm:text-xs text-text-muted">
                      Portable. Blockchain-verified.
                    </p>
                    <Link href="/register?role=va">
                      <span className="text-[10px] sm:text-xs text-teal-400 hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-0.5 font-medium">
                        Start <ChevronRight className="w-3 h-3 arrow-nudge" />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 sm:mt-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-navy-700/30 rounded overflow-hidden border border-navy-700/50">
              {platformStats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="bg-navy-800/50 px-3 sm:px-4 py-3 sm:py-4 text-center">
                  <div className="text-lg sm:text-xl font-bold text-text-primary">{value}</div>
                  <div className="text-[10px] sm:text-xs text-text-muted mt-0.5 flex items-center justify-center gap-1">
                    <Icon className="w-3 h-3" />{label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
