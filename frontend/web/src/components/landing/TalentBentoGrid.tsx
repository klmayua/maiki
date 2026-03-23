'use client'

import { motion } from 'framer-motion'
import {
  Star,
  BadgeCheck,
  Clock,
  Users,
  Shield,
  Zap,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Bot,
  Lock,
  Target,
  ChevronRight,
  Sparkles,
  Search,
  Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const featuredVAs = [
  {
    name: 'Sarah Chen',
    role: 'Executive Assistant',
    tier: 'Expert',
    rating: 4.9,
    reviews: 127,
    rate: 45,
    hours: 2340,
    skills: ['Calendar Mgmt', 'Travel', 'Project Coord'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    verified: true,
    available: true,
  },
  {
    name: 'James Okonkwo',
    role: 'Social Media Manager',
    tier: 'Professional',
    rating: 4.8,
    reviews: 89,
    rate: 35,
    hours: 1560,
    skills: ['Content', 'Analytics', 'Paid Ads'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    verified: true,
    available: true,
  },
  {
    name: 'Maria Garcia',
    role: 'Bookkeeping Specialist',
    tier: 'Master',
    rating: 5.0,
    reviews: 203,
    rate: 55,
    hours: 4120,
    skills: ['QuickBooks', 'Tax Prep', 'Reporting'],
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    verified: true,
    available: false,
  },
  {
    name: 'David Kim',
    role: 'Technical VA',
    tier: 'Expert',
    rating: 4.9,
    reviews: 156,
    rate: 50,
    hours: 2890,
    skills: ['Shopify', 'Zapier', 'Automation'],
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    verified: true,
    available: true,
  },
]

const vaFeatures = [
  {
    icon: GraduationCap,
    title: '6-Tier Career System',
    desc: 'Apprentice to Legend. Certifications, mentorship, and structured earning growth.',
  },
  {
    icon: Shield,
    title: 'Portable Reputation',
    desc: 'Blockchain-verified work history you own. Take it anywhere.',
  },
  {
    icon: Bot,
    title: 'AI Tools Built In',
    desc: 'AI agents for task automation, prompt engineering, and smart workflows.',
  },
  {
    icon: Users,
    title: 'VA Guilds',
    desc: 'Collectives for bargaining, shared resources, and mutual insurance.',
  },
  {
    icon: BookOpen,
    title: 'Learning Paths',
    desc: 'Courses, workshops, peer mentorship, and proctored certifications.',
  },
  {
    icon: Lock,
    title: 'Escrow & Fair Pay',
    desc: 'Secure escrow, dispute resolution, and on-time payment guarantees.',
  },
]

const clientFeatures = [
  {
    icon: Zap,
    title: 'AI Matching',
    desc: 'Find your perfect VA in hours, not weeks. Neural matching across thousands of profiles.',
  },
  {
    icon: Target,
    title: 'VAaaS',
    desc: 'Buy outcomes, not hours. AI + human VAs deliver guaranteed results.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Talent',
    desc: 'Background-checked VAs with blockchain-verified skills and history.',
  },
]

const tierColor: Record<string, string> = {
  Apprentice: 'text-text-muted',
  Associate: 'text-teal-600',
  Professional: 'text-teal-500',
  Expert: 'text-teal-400',
  Master: 'text-gold-500',
  Legend: 'text-gold-400',
}

export default function TalentBentoGrid() {
  return (
    <>
      {/* ===== FOR VIRTUAL ASSISTANTS ===== */}
      <section className="py-8 sm:py-12 bg-navy-900 border-t border-navy-700/30">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 bg-teal-500 rounded-full" />
              <span className="text-[10px] sm:text-xs font-semibold text-teal-400 uppercase tracking-wider">For Virtual Assistants</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-heading">
              Built for Business Owners, Not Gig Workers
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1.5 max-w-xl">
              Career infrastructure: structured growth, portable reputation, and AI tools that multiply your output.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {vaFeatures.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="glass-card-2030 p-4 sm:p-5 hover:border-teal-500/15 transition-colors"
                  style={{ borderRadius: '0.5rem' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-text-primary mb-1">{f.title}</h3>
                      <p className="text-[10px] sm:text-xs text-text-muted leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-5 sm:mt-6 text-center">
            <Link href="/register?role=va">
              <Button className="font-semibold h-10 px-6 text-sm">
                <Sparkles className="w-4 h-4 mr-1" /> Start Your VA Career <ArrowRight className="w-4 h-4 ml-2 arrow-nudge" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TALENT SHOWCASE ===== */}
      <section className="py-8 sm:py-12 bg-navy-800/30 border-t border-navy-700/30">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-5 sm:mb-6"
          >
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-heading">Featured Talent</h2>
              <p className="text-[10px] sm:text-xs text-text-muted mt-1">Pre-vetted VAs with verified credentials</p>
            </div>
            <Link href="/discover">
              <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300 text-[10px] sm:text-xs gap-1">
                View All <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 arrow-nudge" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {featuredVAs.map((va, i) => (
              <motion.div
                key={va.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="glass-card-2030 glass-card-2030-hover p-3 sm:p-4"
                style={{ borderRadius: '0.5rem' }}
              >
                {/* Header */}
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden">
                      <img src={va.avatar} alt={va.name} className="w-full h-full object-cover" />
                    </div>
                    {va.verified && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-teal-500 flex items-center justify-center">
                        <BadgeCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-navy-900" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-text-primary truncate">{va.name}</h4>
                    <p className="text-[10px] sm:text-xs text-text-muted truncate">{va.role}</p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 text-[10px] sm:text-xs">
                  <span className="flex items-center gap-1 text-text-secondary">
                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-gold-400 text-gold-400" />{va.rating}
                  </span>
                  <span className={`font-medium ${tierColor[va.tier]}`}>{va.tier}</span>
                  <span className="text-text-muted ml-auto hidden sm:inline">{va.hours.toLocaleString()}hrs</span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                  {va.skills.map(s => (
                    <span key={s} className="px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[10px] bg-navy-700/50 text-text-muted border border-navy-600/30">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-navy-700/40">
                  <span className="text-xs sm:text-sm font-bold text-text-primary">${va.rate}<span className="text-[10px] text-text-muted font-normal">/hr</span></span>
                  <span className={`text-[8px] sm:text-[10px] flex items-center gap-1 ${va.available ? 'text-emerald-400' : 'text-text-muted'}`}>
                    {va.available ? (
                      <><span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-400 live-pulse" /> Available</>
                    ) : (
                      <><Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Booked</>
                    )}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOR CLIENTS ===== */}
      <section className="py-8 sm:py-12 bg-navy-900 border-t border-navy-700/30">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 bg-gold-500 rounded-full" />
              <span className="text-[10px] sm:text-xs font-semibold text-gold-400 uppercase tracking-wider">For Clients</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-heading">
              Stop Hiring VAs. Start Buying Outcomes.
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1.5 max-w-xl">
              AI-powered matching, verified talent, and managed VA services.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {clientFeatures.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="glass-card-2030 p-4 sm:p-5 hover:border-gold-500/15 transition-colors"
                  style={{ borderRadius: '0.5rem' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gold-400" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-text-primary mb-1">{f.title}</h3>
                      <p className="text-[10px] sm:text-xs text-text-muted leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-5 sm:mt-6 text-center">
            <Link href="/discover">
              <Button variant="outline" className="border-navy-600 text-text-secondary hover:text-text-primary hover:border-navy-500 h-10 px-6 text-sm font-medium">
                <Search className="w-4 h-4 mr-1" /> Find Talent <ChevronRight className="w-4 h-4 ml-1 arrow-nudge" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== DIFFERENTIATORS ===== */}
      <section className="py-6 sm:py-10 bg-navy-800/20 border-t border-navy-700/30">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-5 sm:mb-8"
          >
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-heading">Why Maiki, Not Upwork?</h2>
          </motion.div>

          <div className="grid grid-cols-3 lg:grid-cols-6 gap-px bg-navy-700/30 rounded-xl overflow-hidden border border-navy-700/50">
            {[
              { label: 'Reputation', old: 'Platform-locked', us: 'Portable, on-chain' },
              { label: 'AI', old: 'None', us: 'Native agents' },
              { label: 'Community', old: 'Forums', us: 'Economic guilds' },
              { label: 'Growth', old: 'Self-directed', us: 'Career paths' },
              { label: 'Payments', old: 'Fiat only', us: 'Fiat + crypto' },
              { label: 'Enterprise', old: 'Self-serve', us: 'VAaaS managed' },
            ].map((d, i) => (
              <motion.div
                key={d.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                viewport={{ once: true }}
                className="bg-navy-800/50 p-3 sm:p-4 text-center"
              >
                <div className="text-[10px] sm:text-xs font-semibold text-text-primary mb-1.5 sm:mb-2">{d.label}</div>
                <div className="text-[8px] sm:text-[10px] text-text-muted line-through mb-0.5 sm:mb-1">{d.old}</div>
                <div className="text-[10px] sm:text-xs text-teal-400 font-medium">{d.us}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-8 sm:py-12 bg-navy-900 border-t border-navy-700/30">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card-2030 p-6 sm:p-8 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/4 via-transparent to-gold-500/3" />
            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-heading mb-2 sm:mb-3">
                The Future of Work is Here
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mb-5 sm:mb-6 max-w-lg mx-auto">
                Join 12,000+ VAs and 500+ companies building the 2030 workforce.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <Link href="/register?role=va" className="w-full sm:w-auto">
                  <Button size="lg" className="magnetic-btn font-bold px-8 h-10 sm:h-11 w-full sm:w-auto text-sm">
                    <Sparkles className="w-4 h-4 mr-1" /> Join as VA <ArrowRight className="w-4 h-4 ml-2 arrow-nudge" />
                  </Button>
                </Link>
                <Link href="/register?role=client" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="border-navy-600 text-text-secondary hover:text-text-primary hover:border-navy-500 px-8 h-10 sm:h-11 w-full sm:w-auto text-sm font-medium">
                    <Briefcase className="w-4 h-4 mr-1" /> Hire Talent <ChevronRight className="w-4 h-4 ml-1 arrow-nudge" />
                  </Button>
                </Link>
              </div>
              <p className="text-[10px] text-text-muted mt-3 sm:mt-4">
                Free to start. No credit card required.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-700/30 mb-16 md:mb-0">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          {/* Top footer */}
          <div className="py-8 sm:py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-navy-800 border border-navy-600/60 rounded px-2 py-1">
                  <span className="font-bold text-sm tracking-[0.04em]">
                    <span className="text-teal-400">m</span>
                    <span className="text-text-primary">aiki</span>
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed mb-4">
                The career OS for elite virtual assistants. AI-matched, blockchain-verified.
              </p>
              {/* Socials */}
              <div className="flex items-center gap-3">
                <a href="https://twitter.com/maikiHQ" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded border border-navy-700/60 bg-navy-800/40 flex items-center justify-center text-text-muted hover:text-teal-400 hover:border-teal-500/40 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://linkedin.com/company/maiki" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded border border-navy-700/60 bg-navy-800/40 flex items-center justify-center text-text-muted hover:text-teal-400 hover:border-teal-500/40 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://instagram.com/maikiHQ" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded border border-navy-700/60 bg-navy-800/40 flex items-center justify-center text-text-muted hover:text-teal-400 hover:border-teal-500/40 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://tiktok.com/@maikiHQ" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded border border-navy-700/60 bg-navy-800/40 flex items-center justify-center text-text-muted hover:text-teal-400 hover:border-teal-500/40 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.18 8.18 0 004.77 1.52V6.82a4.84 4.84 0 01-1-.13z"/></svg>
                </a>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/discover" className="text-[11px] text-text-muted hover:text-teal-400 transition-colors">Find Talent</Link></li>
                <li><Link href="/post-job" className="text-[11px] text-text-muted hover:text-teal-400 transition-colors">Post a Job</Link></li>
                <li><Link href="/academy" className="text-[11px] text-text-muted hover:text-teal-400 transition-colors">Academy</Link></li>
                <li><Link href="/community" className="text-[11px] text-text-muted hover:text-teal-400 transition-colors">Community</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-[11px] text-text-muted hover:text-teal-400 transition-colors">Documentation</Link></li>
                <li><Link href="#" className="text-[11px] text-text-muted hover:text-teal-400 transition-colors">API</Link></li>
                <li><Link href="#" className="text-[11px] text-text-muted hover:text-teal-400 transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-[11px] text-text-muted hover:text-teal-400 transition-colors">Help Center</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-[11px] text-text-muted hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-[11px] text-text-muted hover:text-teal-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-[11px] text-text-muted hover:text-teal-400 transition-colors">Cookie Policy</Link></li>
                <li><Link href="#" className="text-[11px] text-text-muted hover:text-teal-400 transition-colors">GDPR</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="py-4 border-t border-navy-700/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-text-muted">
            <span>&copy; 2026 Maiki Inc. All rights reserved.</span>
            <span>Built for the 2030 workforce.</span>
          </div>
        </div>
      </footer>
    </>
  )
}
