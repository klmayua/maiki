'use client'

import Hero2030 from '@/components/landing/Hero2030'
import TalentBentoGrid from '@/components/landing/TalentBentoGrid'
import FloatingDock from '@/components/layout/FloatingDock'
import { motion } from 'framer-motion'
import { CheckCircle, Shield, Zap, Globe, ArrowRight, Sparkles, Layers, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Process steps data
const processSteps = [
  {
    number: '01',
    title: 'Tell Us What You Need',
    description: 'Describe your requirements in plain English. Our AI understands context, not just keywords.',
    icon: Target,
    features: ['Natural language processing', 'Context-aware matching', 'Skill gap analysis'],
  },
  {
    number: '02',
    title: 'AI Matching Engine',
    description: 'Our neural network analyzes thousands of profiles in milliseconds to find your perfect match.',
    icon: Zap,
    features: ['Neural scoring algorithm', 'Personality compatibility', 'Portfolio analysis'],
  },
  {
    number: '03',
    title: 'Interview & Hire',
    description: 'Schedule video interviews, review verified work history, and hire with blockchain-verified contracts.',
    icon: Shield,
    features: ['Video interviews', 'Blockchain contracts', 'Secure payments'],
  },
]

// Trust badges
const trustBadges = [
  { icon: Shield, text: 'SOC 2 Compliant' },
  { icon: CheckCircle, text: '98% Client Satisfaction' },
  { icon: Globe, text: 'Global Talent Pool' },
  { icon: Zap, text: '2-Hour Match Time' },
]

export default function LandingPage2030() {
  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero Section */}
      <Hero2030 />

      {/* Trust Bar */}
      <section className="py-8 border-y border-navy-700/50 bg-navy-800/30"
      >
        <div className="container mx-auto px-6"
        >
          <div className="flex flex-wrap justify-center gap-8 md:gap-12"
          >
            {trustBadges.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-text-secondary"
              >
                <Icon className="w-4 h-4 text-teal-400" />
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Talent Bento Grid Section */}
      <TalentBentoGrid />

      {/* AI Matching Visualization */}
      <section className="py-24 px-6 bg-navy-900 relative overflow-hidden"
      >
        <div className="absolute inset-0"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[200px]" />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-2030 mb-6"
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-sm text-text-secondary">AI-Powered</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4"
            >
              Neural{' '}
              <span className="text-gradient-teal">Matching Engine</span>
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto"
            >
              See how our AI analyzes thousands of data points to find your perfect VA match in seconds, not days.
            </p>
          </motion.div>

          {/* AI Demo Visualization */}
          <div className="grid md:grid-cols-2 gap-8 items-center"
          >
            {/* Left: Job Requirements */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card-2030 p-8"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-6">Job Requirements</h3>
              <div className="space-y-4"
              >
                {[
                  'Executive assistant experience',
                  'Calendar & email management',
                  'Travel coordination',
                  'Project management skills',
                ].map((req, i) => (
                  <div key={req} className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 text-teal-400" />
                    </div>
                    <span className="text-text-secondary">{req}</span>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ delay: i * 0.2 + 0.5 }}
                      viewport={{ once: true }}
                      className="ml-auto h-0.5 w-16 bg-gradient-to-r from-teal-500 to-transparent origin-left"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Match Results */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card-2030 p-8 border-teal-500/30"
            >
              <div className="flex items-center justify-between mb-6"
              >
                <h3 className="text-lg font-semibold text-text-primary">AI Match Results</h3>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20"
                >
                  <div className="w-2 h-2 rounded-full bg-teal-400 live-pulse" />
                  <span className="text-xs text-teal-400">Live</span>
                </div>
              </div>

              {/* Circular Progress */}
              <div className="flex items-center justify-center mb-6"
              >
                <div className="relative w-40 h-40"
                >
                  <svg className="w-full h-full -rotate-90"
                  >
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="rgba(37, 42, 51, 1)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 0.94 }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      viewport={{ once: true }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00d4aa" />
                        <stop offset="100%" stopColor="#33e0bf" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 }}
                      viewport={{ once: true }}
                      className="text-4xl font-bold text-text-primary"
                    >
                      94%
                    </motion.span>
                    <span className="text-xs text-text-secondary">Match Score</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3"
              >
                {[
                  { label: 'Skills Match', value: '98%' },
                  { label: 'Experience Fit', value: '92%' },
                  { label: 'Communication Style', value: '95%' },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center justify-between"
                  >
                    <span className="text-text-secondary">{item.label}</span>
                    <div className="flex items-center gap-2"
                    >
                      <div className="w-24 h-1.5 bg-navy-700 rounded-full overflow-hidden"
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: item.value }}
                          transition={{ delay: i * 0.2 + 0.5 }}
                          viewport={{ once: true }}
                          className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                        />
                      </div>
                      <span className="text-sm font-medium text-teal-400 w-10">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Steps - Cinematic Scroll Journey */}
      <section className="py-24 px-6 bg-navy-800/30 relative overflow-hidden"
      >
        <div className="container mx-auto max-w-6xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4"
            >
              Hire in{' '}
              <span className="text-gradient-teal">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto"
            >
              Our AI does the heavy lifting. You get matched with qualified candidates without the hassle.
            </p>
          </motion.div>

          <div className="relative"
          >
            {/* Vertical Timeline */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-teal-500 via-teal-500/50 to-transparent" />

            <div className="space-y-24"
            >
              {processSteps.map((step, index) => {
                const isEven = index % 2 === 0
                const Icon = step.icon

                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className={`relative flex flex-col md:flex-row gap-8 items-center ${
                      isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Step Number - Large Background */}
                    <div className="absolute left-0 right-0 text-center pointer-events-none"
                    >
                      <span className="step-number-bg text-navy-600/20">{step.number}</span>
                    </div>

                    {/* Content Card */}
                    <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'}`}
                    >
                      <div className="glass-card-2030 p-8 relative z-10"
                      >
                        <div className={`flex items-center gap-4 mb-4 ${isEven ? 'md:flex-row-reverse' : ''}`}
                        >
                          <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center"
                          >
                            <Icon className="w-6 h-6 text-teal-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-text-primary">{step.title}</h3>
                        </div>

                        <p className="text-text-secondary mb-6">{step.description}</p>

                        <div className={`flex flex-wrap gap-2 ${isEven ? 'md:justify-end' : ''}`}
                        >
                          {step.features.map((feature) => (
                            <span
                              key={feature}
                              className="px-3 py-1 rounded-full text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Node */}
                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-teal-500 border-4 border-navy-900 z-10" />

                    {/* Spacer for alternating layout */}
                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6"
      >
        <div className="container mx-auto max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card-2030 p-12 text-center relative overflow-hidden border-gold-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-gold-500/10" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]" />

            <div className="relative z-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4"
              >
                Ready to Transform Your Operations?
              </h2>
              <p className="text-text-secondary mb-8 max-w-2xl mx-auto"
              >
                Join thousands of companies already working with elite virtual assistants on Maiki.
                No commitment required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/discover"
                >
                  <Button size="lg" className="magnetic-btn bg-teal-500 text-navy-900"
                  >
                    Hire Elite Talent
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard/jobs"
                >
                  <Button size="lg" variant="outline" className="border-teal-500/50 text-teal-400"
                  >
                    <Layers className="w-5 h-5 mr-2" />
                    Find VA Jobs
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating Navigation Dock */}
      <FloatingDock />
    </div>
  )
}
