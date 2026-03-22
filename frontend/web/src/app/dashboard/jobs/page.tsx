'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Briefcase,
  Bookmark,
  Share2,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Award,
  Users,
  Zap,
  Target,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle2,
  Wallet,
  BarChart3,
  Crown,
  Hexagon,
  Bot,
  Layers,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Types
interface ScrapedJob {
  id: number
  title: string
  description: string
  company: string
  location: string
  job_type: string
  rate: string
  budget_min?: number
  budget_max?: number
  currency: string
  skills_required: string[]
  experience_level: string
  source: string
  url: string
  posted_at: string
  remote_ok: boolean
  auto_apply_supported: boolean
  match_score?: number
  is_saved?: boolean
  featured: boolean
  tier: string
}

interface JobStats {
  total_active_jobs: number
  recent_jobs_7d: number
  by_source: Record<string, number>
}

// Growth paths
const growthPaths = [
  { id: 'admin', name: 'Administrative Excellence', icon: Briefcase, jobs: 1240, avgRate: '$22/hr', growth: '+23%' },
  { id: 'customer', name: 'Customer Success', icon: Users, jobs: 890, avgRate: '$18/hr', growth: '+31%' },
  { id: 'social', name: 'Social Media Management', icon: Globe, jobs: 1560, avgRate: '$28/hr', growth: '+45%' },
  { id: 'ecommerce', name: 'E-commerce Operations', icon: ShoppingIcon, jobs: 720, avgRate: '$25/hr', growth: '+38%' },
  { id: 'executive', name: 'Executive Support', icon: Crown, jobs: 340, avgRate: '$55/hr', growth: '+18%' },
  { id: 'ai', name: 'AI-Augmented VA', icon: Bot, jobs: 420, avgRate: '$45/hr', growth: '+67%' },
]

function ShoppingIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M5.5 7.5 9 3 12.5 7.5"/><path d="M12.5 7.5l-3 4h6l-3-4z"/><path d="M9 11v8"/><path d="M12 11v8"/></svg>
  )
}

// Tier system
const tiers = [
  { name: 'Apprentice', color: 'bg-slate-500', minHours: 0, hourlyRate: '$10-15' },
  { name: 'Associate', color: 'bg-maiki-600', minHours: 50, hourlyRate: '$15-25' },
  { name: 'Professional', color: 'bg-maiki-500', minHours: 200, hourlyRate: '$25-40' },
  { name: 'Expert', color: 'bg-accent-500', minHours: 500, hourlyRate: '$40-75' },
  { name: 'Master', color: 'bg-gradient-to-r from-accent-500 to-accent-400', minHours: 1000, hourlyRate: '$75-100' },
  { name: 'Legend', color: 'bg-gradient-to-r from-accent-400 via-maiki-400 to-accent-400', minHours: 5000, hourlyRate: '$100+' },
]

export default function FindVAJobsPage() {
  // State
  const [jobs, setJobs] = useState<ScrapedJob[]>([])
  const [stats, setStats] = useState<JobStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [savedJobs, setSavedJobs] = useState<number[]>([])
  const [showCareerPaths, setShowCareerPaths] = useState(true)

  // Fetch jobs from API
  useEffect(() => {
    fetchJobs()
    fetchStats()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)

      // In production, this would use proper auth token
      const response = await fetch(`${API_BASE_URL}/jobs/scraped/?limit=50&days_since_posted=7`, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // Add when auth is ready
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setJobs(data)
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError('Failed to load jobs. Using fallback data.')
      // Use fallback data
      setJobs(getFallbackJobs())
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/scraped/stats/overview`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const toggleSaveJob = async (jobId: number) => {
    try {
      if (savedJobs.includes(jobId)) {
        // Unsave
        await fetch(`${API_BASE_URL}/jobs/scraped/${jobId}/save`, {
          method: 'DELETE',
        })
        setSavedJobs(prev => prev.filter(id => id !== jobId))
      } else {
        // Save
        await fetch(`${API_BASE_URL}/jobs/scraped/${jobId}/save`, {
          method: 'POST',
        })
        setSavedJobs(prev => [...prev, jobId])
      }
    } catch (err) {
      console.error('Error saving job:', err)
    }
  }

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    if (selectedPath) {
      const pathSkills: Record<string, string[]> = {
        'Administrative Excellence': ['administrative', 'calendar', 'email'],
        'Customer Success': ['customer_service', 'communication'],
        'Social Media Management': ['social_media', 'content'],
        'E-commerce Operations': ['shopify', 'ecommerce'],
        'Executive Support': ['executive', 'administrative'],
        'AI-Augmented VA': ['ai_tools', 'automation'],
      }
      const required = pathSkills[selectedPath] || []
      const hasMatch = required.some(skill =>
        job.skills_required.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      )
      if (!hasMatch) return false
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        job.title.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.skills_required.some(s => s.toLowerCase().includes(query))
      )
    }

    return true
  })

  // Helper to format rate
  const formatRate = (job: ScrapedJob) => {
    if (job.budget_min && job.budget_max) {
      return `$${job.budget_min}-${job.budget_max}/hr`
    } else if (job.budget_min) {
      return `$${job.budget_min}+/hr`
    }
    return 'Rate negotiable'
  }

  // Helper to get tier from experience level
  const getTierFromExperience = (level: string) => {
    const map: Record<string, string> = {
      'entry': 'Apprentice',
      'intermediate': 'Professional',
      'expert': 'Expert',
      'any': 'Associate',
    }
    return map[level] || 'Associate'
  }

  // Platform stats
  const platformStats = [
    { label: 'Active Jobs', value: stats?.total_active_jobs?.toString() || '2,847', icon: Briefcase },
    { label: 'New This Week', value: stats?.recent_jobs_7d?.toString() || '342', icon: TrendingUp },
    { label: 'Avg. Rate', value: '$32/hr', icon: DollarSign },
    { label: 'Success Rate', value: '94%', icon: CheckCircle2 },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading opportunities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Error Banner */}
      {error && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-3">
          <div className="container mx-auto flex items-center gap-2 text-amber-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
            <Button variant="ghost" size="sm" onClick={fetchJobs} className="ml-auto">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-16 px-6 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-maiki-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/5 rounded-full blur-[128px]" />

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <Badge className="mb-4 bg-accent-500/20 text-accent-400 border-accent-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Job Matching
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Find Your Next{' '}
              <span className="gradient-text">VA Opportunity</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Access exclusive jobs matched to your tier, skills, and career goals.
              Join the future of AI-human collaboration.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {platformStats.map((stat) => (
              <Card key={stat.label} className="glass-card p-6 text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-accent-400" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </Card>
            ))}
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                type="text"
                placeholder="Search jobs, skills, or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl text-lg"
              />
              <Button className="absolute right-2 top-1/2 -translate-y-1/2">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Match
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Career Growth Paths Section */}
      <AnimatePresence>
        {showCareerPaths && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="py-12 px-6 border-b border-white/5"
          >
            <div className="container mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Career Growth Paths</h2>
                  <p className="text-slate-400">Specialize in high-demand areas. The AI-Augmented path is growing 67% YoY.</p>
                </div>
                <Button variant="ghost" onClick={() => setShowCareerPaths(false)}>
                  Hide
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {growthPaths.map((path, index) => (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`glass-card-hover cursor-pointer p-5 ${selectedPath === path.name ? 'border-accent-500/50' : ''}`}
                      onClick={() => setSelectedPath(selectedPath === path.name ? null : path.name)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-maiki-500/10 flex items-center justify-center">
                          <path.icon className="w-6 h-6 text-maiki-400" />
                        </div>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-400">
                          {path.growth}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-white mb-2">{path.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {path.jobs} jobs
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {path.avgRate}
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Filters */}
            <div className="lg:w-64 space-y-6">
              {/* Stats by Source */}
              {stats && (
                <Card className="glass-card p-4">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-accent-400" />
                    Jobs by Source
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(stats.by_source).map(([source, count]) => (
                      <div key={source} className="flex items-center justify-between text-sm">
                        <span className="text-slate-400 capitalize">{source.replace('_', ' ')}</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Guild Membership Promo */}
              <Card className="glass-card p-4 border-l-2 border-l-maiki-500">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-maiki-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-maiki-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Guild Benefits</h3>
                    <p className="text-xs text-slate-400">Join a guild for exclusive jobs</p>
                  </div>
                </div>
                <ul className="text-sm text-slate-400 space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-400" />
                    Priority job access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-400" />
                    Collective rate negotiation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-400" />
                    Shared resources & training
                  </li>
                </ul>
                <Button variant="outline" size="sm" className="w-full border-maiki-500/30">
                  Browse Guilds
                </Button>
              </Card>
            </div>

            {/* Job Listings */}
            <div className="flex-1">
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-white">
                    {filteredJobs.length} Jobs Available
                  </h2>
                  {selectedPath && (
                    <Badge className="bg-accent-500/20 text-accent-400">
                      {selectedPath}
                      <button onClick={() => setSelectedPath(null)} className="ml-2">×</button>
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Saved ({savedJobs.length})
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>

              {/* Jobs List */}
              <div className="space-y-4">
                {filteredJobs.length === 0 ? (
                  <Card className="glass-card p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                      <Briefcase className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No jobs found</h3>
                    <p className="text-slate-400 mb-4">Try adjusting your filters or search query</p>
                    <Button onClick={() => { setSearchQuery(''); setSelectedPath(null); }}>
                      Clear Filters
                    </Button>
                  </Card>
                ) : (
                  filteredJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={`glass-card-hover overflow-hidden ${job.featured ? 'border-accent-500/30' : ''}`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col xl:flex-row gap-6">
                            {/* Left - Main Info */}
                            <div className="flex-1">
                              {/* Header Row */}
                              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                                    {job.auto_apply_supported && (
                                      <Badge className="bg-maiki-500/20 text-maiki-400">
                                        <Bot className="w-3 h-3 mr-1" />
                                        AI-Ready
                                      </Badge>
                                    )}
                                    {job.featured && (
                                      <Badge className="bg-amber-500/20 text-amber-400">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Featured
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-slate-400 flex items-center gap-2">
                                    {job.company || 'Unknown Company'}
                                    <span className="flex items-center text-accent-400 text-xs">
                                      <Shield className="w-3 h-3 mr-1" />
                                      {job.source}
                                    </span>
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-white">{formatRate(job)}</span>
                                  </div>
                                  <p className="text-sm text-slate-500">hourly</p>
                                </div>
                              </div>

                              {/* Description */}
                              <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                                {job.description}
                              </p>

                              {/* Job Meta */}
                              <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {job.job_type}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="w-4 h-4" />
                                  {new Date(job.posted_at).toLocaleDateString()}
                                </span>
                              </div>

                              {/* Skills */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="secondary" className={`${tiers.find(t => t.name === getTierFromExperience(job.experience_level))?.color || 'bg-slate-500'} text-white`}>
                                  {getTierFromExperience(job.experience_level)}
                                </Badge>
                                {job.skills_required.slice(0, 5).map((skill) => (
                                  <Badge key={skill} variant="secondary" className="bg-white/5 text-slate-300 capitalize">
                                    {skill.replace('_', ' ')}
                                  </Badge>
                                ))}
                                {job.skills_required.length > 5 && (
                                  <Badge variant="secondary" className="bg-white/5 text-slate-400">
                                    +{job.skills_required.length - 5}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Right - Match Score & Actions */}
                            <div className="xl:w-48 flex flex-row xl:flex-col items-center xl:items-end justify-between gap-4">
                              {/* Match Score */}
                              <div className="text-center xl:text-right">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm text-slate-400">Match</span>
                                  <span className="text-lg font-bold text-accent-400">{Math.round(job.match_score || 70)}%</span>
                                </div>
                                <div className="w-32 xl:w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-maiki-500 to-accent-500 rounded-full"
                                    style={{ width: `${job.match_score || 70}%` }}
                                  />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">AI-calculated</p>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleSaveJob(job.id)}
                                  className={savedJobs.includes(job.id) ? 'text-accent-400' : ''}
                                >
                                  <Bookmark className={`w-5 h-5 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Share2 className="w-5 h-5" />
                                </Button>
                                <a href={job.url} target="_blank" rel="noopener noreferrer">
                                  <Button>
                                    Apply Now
                                  </Button>
                                </a>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Load More */}
              {filteredJobs.length > 0 && (
                <div className="text-center pt-8">
                  <Button variant="outline" size="lg" onClick={fetchJobs}>
                    Load More Jobs
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <Card className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-maiki-500/10 via-transparent to-accent-500/10" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Level Up Your VA Career?
              </h2>
              <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                Join 12,000+ VAs building their reputation on Maiki.
                Access AI-matched jobs, verified skills, and career growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get AI-Matched Jobs
                </Button>
                <Button size="lg" variant="outline">
                  <Layers className="w-5 h-5 mr-2" />
                  Explore Career Paths
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}

// Fallback data when API fails
function getFallbackJobs(): ScrapedJob[] {
  return [
    {
      id: 1,
      title: 'Executive Assistant for Tech CEO',
      description: 'Looking for an expert-level EA to manage complex calendar coordination across multiple time zones, handle confidential email correspondence, and coordinate international travel arrangements.',
      company: 'StartupXYZ',
      location: 'Remote (US timezone)',
      job_type: 'Ongoing',
      rate: '$45-60/hr',
      budget_min: 45,
      budget_max: 60,
      currency: 'USD',
      skills_required: ['calendar', 'email', 'travel', 'administrative'],
      experience_level: 'expert',
      source: 'upwork',
      url: 'https://www.upwork.com',
      posted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      remote_ok: true,
      auto_apply_supported: true,
      match_score: 94,
      featured: true,
      tier: 'Expert',
    },
    {
      id: 2,
      title: 'AI-Augmented Social Media Manager',
      description: 'Seeking a social media professional who leverages AI tools for content creation and scheduling. You will manage content calendar, engage with community, and use analytics to optimize performance.',
      company: 'Luxe Fashion Co',
      location: 'Remote (Flexible)',
      job_type: 'Ongoing',
      rate: '$35-50/hr',
      budget_min: 35,
      budget_max: 50,
      currency: 'USD',
      skills_required: ['social_media', 'content', 'ai_tools', 'analytics'],
      experience_level: 'intermediate',
      source: 'linkedin',
      url: 'https://www.linkedin.com/jobs',
      posted_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      remote_ok: true,
      auto_apply_supported: true,
      match_score: 91,
      featured: true,
      tier: 'Professional',
    },
    {
      id: 3,
      title: 'Customer Success VA - E-commerce',
      description: 'Join our customer success team handling tier-1 and tier-2 support tickets. Quick response times and empathetic communication are essential.',
      company: 'ShopFast Inc',
      location: 'Remote (EU timezone)',
      job_type: 'Full-time',
      rate: '$22-30/hr',
      budget_min: 22,
      budget_max: 30,
      currency: 'USD',
      skills_required: ['customer_service', 'zendesk', 'ecommerce'],
      experience_level: 'intermediate',
      source: 'indeed',
      url: 'https://www.indeed.com',
      posted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      remote_ok: true,
      auto_apply_supported: false,
      match_score: 88,
      featured: false,
      tier: 'Associate',
    },
    {
      id: 4,
      title: 'Real Estate Transaction Coordinator',
      description: 'Experienced real estate transaction coordinator needed for busy brokerage. Manage contracts, deadlines, and client communication throughout the buying/selling process.',
      company: 'Prestige Realty',
      location: 'Remote (US)',
      job_type: 'Ongoing',
      rate: '$40-55/hr',
      budget_min: 40,
      budget_max: 55,
      currency: 'USD',
      skills_required: ['administrative', 'crm', 'customer_service'],
      experience_level: 'expert',
      source: 'weworkremotely',
      url: 'https://weworkremotely.com',
      posted_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      remote_ok: true,
      auto_apply_supported: false,
      match_score: 87,
      featured: true,
      tier: 'Expert',
    },
    {
      id: 5,
      title: 'AI Operations Specialist',
      description: 'Cutting-edge role for AI-savvy VAs. Help clients implement AI tools to transform their operations. Must be comfortable with multiple LLMs and workflow automation.',
      company: 'TechForward Labs',
      location: 'Remote (Any)',
      job_type: 'Project',
      rate: '$50-75/hr',
      budget_min: 50,
      budget_max: 75,
      currency: 'USD',
      skills_required: ['ai_tools', 'automation', 'project_management'],
      experience_level: 'expert',
      source: 'remotive',
      url: 'https://remotive.com',
      posted_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      remote_ok: true,
      auto_apply_supported: false,
      match_score: 95,
      featured: true,
      tier: 'Master',
    },
  ]
}
