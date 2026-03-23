'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, BadgeCheck, Clock, TrendingUp, Users, Sparkles, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

// Talent data with professional avatars
const featuredTalent = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Executive Assistant',
    company: 'Fortune 500 Experience',
    rating: 4.9,
    reviews: 127,
    hourlyRate: 45,
    hoursWorked: 2340,
    skills: ['Calendar Management', 'Travel Planning', 'Executive Support', 'Project Coordination'],
    skillLevels: [95, 90, 98, 88],
    tier: 'Expert',
    available: true,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    featured: true,
    recentWork: 'Supported 3 C-level executives',
  },
  {
    id: 2,
    name: 'James Okonkwo',
    role: 'Social Media Manager',
    company: 'Growth Marketing Pro',
    rating: 4.8,
    reviews: 89,
    hourlyRate: 35,
    hoursWorked: 1560,
    skills: ['Social Media', 'Content Creation', 'Analytics', 'Paid Ads'],
    skillLevels: [92, 88, 85, 90],
    tier: 'Professional',
    available: true,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    featured: false,
    recentWork: 'Grew follower base 300% in 6 months',
  },
  {
    id: 3,
    name: 'Maria Garcia',
    role: 'Bookkeeping Specialist',
    company: 'CPA Certified',
    rating: 5.0,
    reviews: 203,
    hourlyRate: 55,
    hoursWorked: 4120,
    skills: ['QuickBooks', 'Invoicing', 'Tax Prep', 'Financial Reports'],
    skillLevels: [98, 95, 92, 96],
    tier: 'Master',
    available: false,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    featured: true,
    recentWork: 'Managed $2M annual bookkeeping',
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Technical VA',
    company: 'Full-Stack Background',
    rating: 4.9,
    reviews: 156,
    hourlyRate: 50,
    hoursWorked: 2890,
    skills: ['WordPress', 'Shopify', 'Zapier', 'Automation'],
    skillLevels: [94, 91, 88, 92],
    tier: 'Expert',
    available: true,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    featured: false,
    recentWork: 'Built 15+ Shopify stores',
  },
]

// Skill bar component with animation
function SkillBar({ skill, level, index }: { skill: string; level: number; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="flex justify-between items-center mb-1"
      >
        <span className="text-xs text-text-secondary group-hover:text-teal-400 transition-colors">{skill}</span>
        <span className="text-xs font-medium text-text-muted">{level}%</span>
      </div>
      <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden"
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          viewport={{ once: true }}
          className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
        />
      </div>
    </motion.div>
  )
}

// Live availability indicator
function AvailabilityBadge({ available }: { available: boolean }) {
  if (!available) {
    return (
      <div className="flex items-center gap-1.5"
      >
        <Clock className="w-3 h-3 text-text-muted" />
        <span className="text-xs text-text-muted">Booked</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400 live-pulse" />
      <span className="text-xs text-emerald-400 font-medium">Available Now</span>
    </div>
  )
}

// Main talent card component
function TalentCard({ talent, featured = false }: { talent: typeof featuredTalent[0]; featured?: boolean }) {
  const [isHovered, setIsHovered] = useState(false)

  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bento-item-large glass-card-2030 glass-card-2030-hover p-6 relative overflow-hidden group"
      >
        {/* Featured badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/30"
        >
          <Sparkles className="w-3 h-3 text-gold-400" />
          <span className="text-xs font-medium text-gold-400">Featured</span>
        </div>

        <div className="flex flex-col h-full"
        >
          {/* Profile Header */}
          <div className="flex items-start gap-4 mb-6"
          >
            <div className="relative"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-teal-500/30"
              >
                <img
                  src={talent.avatar}
                  alt={talent.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {talent.verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center"
                >
                  <BadgeCheck className="w-4 h-4 text-navy-900" />
                </div>
              )}
            </div>
            <div className="flex-1"
            >
              <h3 className="text-xl font-bold text-text-primary">{talent.name}</h3>
              <p className="text-text-secondary">{talent.role}</p>
              <div className="flex items-center gap-2 mt-2"
              >
                <div className="flex items-center gap-1"
                >
                  <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                  <span className="font-medium text-text-primary">{talent.rating}</span>
                  <span className="text-text-muted">({talent.reviews})</span>
                </div>
                <span className="text-text-muted">•</span>
                <AvailabilityBadge available={talent.available} />
              </div>
            </div>
          </div>

          {/* Skills Visualization */}
          <div className="flex-1 space-y-3 mb-6"
          >
            <p className="text-sm text-text-secondary mb-3">Verified Skills</p>
            {talent.skills.map((skill, i) => (
              <SkillBar key={skill} skill={skill} level={talent.skillLevels[i]} index={i} />
            ))}
          </div>

          {/* Blockchain Verification Hover Card */}
          <AnimatePresence>
            {isHovered && talent.verified && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 left-4 right-4 glass-card-2030 p-4 border-l-4 border-l-teal-500"
              >
                <div className="flex items-center gap-2 mb-2"
                >
                  <Shield className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-medium text-text-primary">Blockchain Verified</span>
                </div>
                <p className="text-xs text-text-secondary">
                  Verified on Stellar • ID: 0x7a3f...9e2d
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-navy-700/50 mt-auto"
          >
            <div>
              <span className="text-2xl font-bold text-text-primary">${talent.hourlyRate}</span>
              <span className="text-text-secondary">/hr</span>
            </div>
            <Button size="sm" className="bg-teal-500 text-navy-900">
              View Profile
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Standard card
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="glass-card-2030 glass-card-2030-hover p-5"
    >
      <div className="flex items-start gap-3 mb-4"
      >
        <div className="relative"
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden"
          >
            <img
              src={talent.avatar}
              alt={talent.name}
              className="w-full h-full object-cover"
            />
          </div>
          {talent.verified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center"
            >
              <BadgeCheck className="w-3 h-3 text-navy-900" />
            </div>
          )}
        </div>
        <div className="flex-1"
        >
          <h4 className="font-semibold text-text-primary">{talent.name}</h4>
          <p className="text-sm text-text-secondary">{talent.role}</p>
          <div className="flex items-center gap-1 mt-1"
          >
            <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
            <span className="text-sm text-text-primary">{talent.rating}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4"
      >
        {talent.skills.slice(0, 3).map((skill, i) => (
          <div key={skill} className="flex items-center gap-2"
          >
            <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                style={{ width: `${talent.skillLevels[i]}%` }}
              />
            </div>
            <span className="text-xs text-text-secondary w-16">{skill}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-navy-700/50"
      >
        <span className="font-bold text-text-primary">${talent.hourlyRate}/hr</span>
        <AvailabilityBadge available={talent.available} />
      </div>
    </motion.div>
  )
}

// Stats card component
function StatsCard({ title, value, icon: Icon, trend }: { title: string; value: string; icon: any; trend: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="glass-card-2030 p-5 text-center"
    >
      <div className="flex justify-center mb-3"
      >
        <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center"
        >
          <Icon className="w-6 h-6 text-teal-400" />
        </div>
      </div>
      <div className="text-3xl font-bold text-text-primary mb-1">{value}</div>
      <div className="text-sm text-text-secondary">{title}</div>
      <div className="text-xs text-emerald-400 mt-1">{trend}</div>
    </motion.div>
  )
}

export default function TalentBentoGrid() {
  return (
    <section className="py-24 px-6 bg-navy-900 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0"
      >
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[200px]" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10"
      >
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-2030 mb-6"
          >
            <Users className="w-4 h-4 text-teal-400" />
            <span className="text-sm text-text-secondary">Talent Marketplace</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4"
          >
            Available{' '}
            <span className="text-gradient-teal">Elite Talent</span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Pre-vetted virtual assistants with blockchain-verified credentials,
            ready to transform your operations.
          </p>
        </motion.div>

        {/* Live Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <StatsCard title="VAs Online" value="24" icon={Users} trend="+3 today" />
          <StatsCard title="Hires This Week" value="47" icon={TrendingUp} trend="+12%" />
          <StatsCard title="Avg Response" value="2hrs" icon={Clock} trend="Under 3hrs" />
          <StatsCard title="Verified" value="100%" icon={Shield} trend="Blockchain" />
        </div>

        {/* Bento Grid */}
        <div className="bento-grid"
        >
          <TalentCard talent={featuredTalent[0]} featured />
          <TalentCard talent={featuredTalent[2]} featured />
          <TalentCard talent={featuredTalent[1]} />
          <TalentCard talent={featuredTalent[3]} />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" className="magnetic-btn bg-teal-500 text-navy-900"
          >
            <Zap className="w-5 h-5 mr-2" />
            Browse All Talent
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
