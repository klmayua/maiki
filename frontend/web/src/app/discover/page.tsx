'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, ArrowLeft, Users, Sparkles, Filter, Star, BadgeCheck, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const tierColor: Record<string, string> = {
  Apprentice: 'text-text-muted',
  Associate: 'text-teal-600',
  Professional: 'text-teal-500',
  Expert: 'text-teal-400',
  Master: 'text-gold-500',
  Legend: 'text-gold-400',
}

const allVAs = [
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
  {
    name: 'Amina Hassan',
    role: 'Customer Success VA',
    tier: 'Professional',
    rating: 4.7,
    reviews: 64,
    rate: 30,
    hours: 980,
    skills: ['Zendesk', 'CRM', 'Email Mgmt'],
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face',
    verified: true,
    available: true,
  },
  {
    name: 'Lucas Fernandez',
    role: 'Data Entry Specialist',
    tier: 'Associate',
    rating: 4.6,
    reviews: 42,
    rate: 20,
    hours: 720,
    skills: ['Excel', 'Airtable', 'Research'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    verified: true,
    available: true,
  },
]

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 pt-14 sm:pt-20 pb-4 sm:pb-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-6 sm:mb-8"
        >
          <Badge className="mb-3 bg-teal-500/15 text-teal-400 border-teal-500/20 text-[10px] sm:text-xs">
            <Users className="w-3 h-3 mr-1" />
            Talent Marketplace
          </Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-2 sm:mb-3">
            Discover Top <span className="text-gradient-teal">VA Talent</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mb-4 sm:mb-6">
            Browse verified virtual assistants filtered by skills, experience, and ratings.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-text-muted" />
            <Input
              placeholder="Search by skill, role, or expertise..."
              className="w-full pl-9 sm:pl-12 pr-20 sm:pr-24 py-2.5 sm:py-4 text-xs sm:text-base"
            />
            <Button className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 text-xs sm:text-sm h-7 sm:h-auto px-2 sm:px-3">
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Filter
            </Button>
          </div>
        </motion.div>

        {/* Talent Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          {allVAs.map((va, i) => (
            <motion.div
              key={va.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-2030 glass-card-2030-hover p-3 sm:p-4"
              style={{ borderRadius: '1rem' }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg overflow-hidden">
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
                <span className="text-text-muted ml-auto">{va.reviews} reviews</span>
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

              {/* View Profile CTA */}
              <Link href={`/va/${va.name.toLowerCase().replace(' ', '-')}`}>
                <Button variant="ghost" className="w-full mt-2 sm:mt-3 h-7 sm:h-8 text-[10px] sm:text-xs text-teal-400 hover:text-teal-300 hover:bg-teal-500/5">
                  View Profile
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-6 sm:mt-8 text-center mb-16 md:mb-0">
          <p className="text-xs text-text-muted mb-3">Showing 6 of 12,000+ verified VAs</p>
          <Button className="font-semibold text-xs sm:text-sm h-9 sm:h-10 px-6">
            Load More Talent
          </Button>
        </div>
      </div>
    </div>
  )
}
