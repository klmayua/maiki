'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search,
  Users,
  Zap,
  Shield,
  TrendingUp,
  Award,
  Briefcase,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Globe,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Building2,
  UserCircle,
  BarChart3,
  Target,
  Layers,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Mock data for top candidates
const topCandidates = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Executive Virtual Assistant",
    tier: "Expert",
    rating: 4.9,
    reviews: 127,
    hourlyRate: 45,
    skills: ["Calendar Management", "Travel Planning", "Email Management", "Project Coordination"],
    hoursWorked: 2340,
    avatar: "https://i.pravatar.cc/150?img=1",
    badges: ["Top Rated", "1000+ Hours", "Client Favorite"],
    available: true,
    matchScore: 94,
  },
  {
    id: 2,
    name: "James Okonkwo",
    title: "Social Media Manager & VA",
    tier: "Professional",
    rating: 4.8,
    reviews: 89,
    hourlyRate: 35,
    skills: ["Social Media", "Content Creation", "Canva", "Scheduling"],
    hoursWorked: 1560,
    avatar: "https://i.pravatar.cc/150?img=3",
    badges: ["Rising Talent", "500+ Hours"],
    available: true,
    matchScore: 91,
  },
  {
    id: 3,
    name: "Maria Garcia",
    title: "Bookkeeping & Admin VA",
    tier: "Master",
    rating: 5.0,
    reviews: 203,
    hourlyRate: 55,
    skills: ["QuickBooks", "Invoicing", "Data Entry", "Excel"],
    hoursWorked: 4120,
    avatar: "https://i.pravatar.cc/150?img=5",
    badges: ["Elite Rated", "2000+ Hours", "Top Rated Plus"],
    available: false,
    matchScore: 88,
  },
  {
    id: 4,
    name: "David Kim",
    title: "Technical VA & Web Support",
    tier: "Expert",
    rating: 4.9,
    reviews: 156,
    hourlyRate: 50,
    skills: ["WordPress", "Shopify", "HTML/CSS", "Customer Support"],
    hoursWorked: 2890,
    avatar: "https://i.pravatar.cc/150?img=8",
    badges: ["Top Rated", "Tech Specialist"],
    available: true,
    matchScore: 87,
  },
]

// Featured skills
const featuredSkills = [
  "Executive Assistance",
  "Social Media Management",
  "Bookkeeping",
  "Customer Support",
  "Data Entry",
  "Content Writing",
  "Project Management",
  "Email Marketing",
]

// Stats
const stats = [
  { label: "Verified VAs", value: "12,000+", icon: Users },
  { label: "Hours Worked", value: "2.4M+", icon: Clock },
  { label: "Client Satisfaction", value: "98%", icon: Star },
  { label: "Avg. Match Time", value: "2 hrs", icon: Zap },
]

// Communities
const communities = [
  { name: "virtual-assistants", displayName: "r/virtual-assistants", members: "8.2k", posts: "234 today", category: "General" },
  { name: "social-media-vas", displayName: "r/social-media-vas", members: "3.1k", posts: "89 today", category: "Niche" },
  { name: "va-gigs", displayName: "r/va-gigs", members: "12k", posts: "456 today", category: "Jobs" },
]

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-slate-950 animated-gradient noise-overlay relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-maiki-600/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-400/10 rounded-full blur-[128px]" />

      {/* Navigation - Role Aware */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-maiki-400 to-maiki-500 flex items-center justify-center shadow-lg shadow-maiki-600/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                mai<span className="text-slate-500">ki</span>
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center gap-6"
            >
              <Link href="/discover" className="text-sm text-slate-400 hover:text-white transition-colors">
                Find Talent
              </Link>
              <Link href="/community" className="text-sm text-slate-400 hover:text-white transition-colors">
                Community
              </Link>
              <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
                Pricing
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-slate-300">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Dual CTA Design */}
      <section className="relative pt-32 pb-20">
        <div className="container mx-auto px-6">
          {/* Main Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-5xl mx-auto mb-8"
          >
            <Badge className="mb-6 bg-accent-500/20 text-accent-400 border-accent-500/30">
              <Sparkles className="w-4 h-4 mr-1" />
              The Future of Work
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Virtual Assistants,
              <br />
              <span className="gradient-text">Reimagined for 2030</span>
            </h1>

            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              The first Virtual Assistant Operating System. AI-matched opportunities,
              blockchain-verified reputation, and career paths that compound.
            </p>

            {/* Dual CTA - Equal Prominence */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
              {/* Employer CTA */}
              <Card className="glass-card p-8 text-left hover:border-accent-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-accent-400" />
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">I&apos;m looking to</span>
                    <h3 className="text-xl font-semibold text-white">Hire Top Talent</h3>
                  </div>
                </div>
                <p className="text-slate-400 mb-6">
                  Access Africa&apos;s top 2% of pre-vetted VAs. AI-matched in 2 hours.
                </p>
                <Link href="/discover">
                  <Button className="w-full">
                    <Search className="w-5 h-5 mr-2" />
                    Find Talent
                  </Button>
                </Link>
              </Card>

              {/* Employee CTA */}
              <Card className="glass-card p-8 text-left hover:border-maiki-600/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-maiki-600/20 flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">I&apos;m ready to</span>
                    <h3 className="text-xl font-semibold text-white">Launch My VA Career</h3>
                  </div>
                </div>
                <p className="text-slate-400 mb-6">
                  Join 12,000+ VAs. Get AI-matched jobs and build portable reputation.
                </p>
                <Link href="/dashboard/jobs">
                  <Button variant="outline" className="w-full border-maiki-600/30 hover:bg-maiki-600/10">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Find VA Jobs
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent-400" />
                <span>No fees to join</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent-400" />
                <span>98% satisfaction rate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent-400" />
                <span>Blockchain-verified reputation</span>
              </div>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 max-w-4xl mx-auto"
          >
            {stats.map((stat) => (
              <Card key={stat.label} className="glass-card p-6 text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-accent-400" />
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Talent Section */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-950/90">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-12"
          >
            <div>
              <Badge className="mb-2 bg-maiki-600/20 text-slate-500">AI-Matched</Badge>
              <h2 className="text-3xl font-bold text-white mb-2">Available Talent Right Now</h2>
              <p className="text-slate-500">Pre-vetted VAs ready to start within 24 hours</p>
            </div>
            <Link href="/discover">
              <Button variant="outline" className="mt-4 md:mt-0 border-maiki-600/30">
                Browse All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {topCandidates.map((candidate) => (
              <Card key={candidate.id} className="glass-card-hover overflow-hidden group cursor-pointer">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-16 h-16 rounded-full border-2 border-maiki-600/30"
                    />
                    {candidate.available ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1 animate-pulse" />
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Busy</Badge>
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="font-semibold text-white mb-1">{candidate.name}</h3>
                  <p className="text-sm text-slate-500 mb-3">{candidate.title}</p>

                  {/* Match Score */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent-400 to-accent-400 rounded-full"
                        style={{ width: `${candidate.matchScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-accent-400">{candidate.matchScore}% match</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-accent-400 text-accent-400" />
                      <span className="font-medium text-white">{candidate.rating}</span>
                    </div>
                    <span className="text-slate-500">({candidate.reviews} reviews)</span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {candidate.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs bg-white/5 text-slate-400">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Rate & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <span className="text-2xl font-bold text-white">${candidate.hourlyRate}</span>
                      <span className="text-sm text-slate-500">/hr</span>
                    </div>
                    <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      View Profile
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Hire in <span className="gradient-text">3 Simple Steps</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Our AI does the heavy lifting. You get matched with qualified candidates without the hassle.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                step: "01",
                title: "Tell Us What You Need",
                description: "Describe your requirements in plain English. Our AI understands context, not just keywords.",
                icon: Target,
              },
              {
                step: "02",
                title: "Review AI-Matched Candidates",
                description: "Get 5 pre-vetted candidates ranked by compatibility score. See why each is a match.",
                icon: Users,
              },
              {
                step: "03",
                title: "Interview & Hire",
                description: "Schedule video interviews in-app. Hire with one click. We handle contracts & payments.",
                icon: CheckCircle,
              },
            ].map((item) => (
              <Card key={item.step} className="glass-card p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-6xl font-bold text-slate-600/10">
                  {item.step}
                </div>
                <item.icon className="w-12 h-12 text-slate-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-slate-500">{item.description}</p>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Employer Dashboard Preview */}
      <section className="py-20 bg-gradient-to-b from-slate-950/90 to-slate-950">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <Badge className="mb-4 bg-accent-500/20 text-accent-400 border-accent-500/30">
                <BarChart3 className="w-3 h-3 mr-1" />
                Employer Dashboard
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Manage Your Team in
                <span className="gradient-text"> One Place</span>
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Layers,
                    title: "Multi-VA Management",
                    description: "Hire and manage multiple VAs from a single dashboard. Perfect for growing teams.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Performance Analytics",
                    description: "Track hours, tasks completed, and ROI. See which VAs deliver the most value.",
                  },
                  {
                    icon: Shield,
                    title: "Enterprise Security",
                    description: "SSO, audit logs, compliance reports. Built for Fortune 500 security standards.",
                  },
                ].map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-maiki-600/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-sm text-slate-500">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Preview Card */}
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white">Active Projects</h3>
                <Badge variant="secondary" className="bg-white/5">3 Active</Badge>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Executive Support", va: "Sarah Chen", hours: "24/40", progress: 60 },
                  { name: "Social Media Mgmt", va: "James Okonkwo", hours: "12/20", progress: 60 },
                  { name: "Bookkeeping", va: "Maria Garcia", hours: "8/10", progress: 80 },
                ].map((project) => (
                  <div key={project.name} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{project.name}</span>
                      <span className="text-sm text-slate-500">{project.hours} hrs</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <img src={`https://i.pravatar.cc/150?u=${project.va}`} alt="" className="w-6 h-6 rounded-full" />
                      <span className="text-sm text-slate-500">{project.va}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-maiki-500 to-accent-400 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6">
                Open Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Trusted by <span className="gradient-text">500+ Companies</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                quote: "Found an amazing executive assistant in 3 hours. The AI matching actually works.",
                author: "Michael Chen",
                role: "CEO, TechStart Inc.",
                rating: 5,
              },
              {
                quote: "We scaled from 2 to 12 VAs through Maiki. Their tier system ensures quality.",
                author: "Sarah Johnson",
                role: "COO, GrowthLabs",
                rating: 5,
              },
              {
                quote: "Saved $40K/year vs hiring local. The VAs are professional and highly skilled.",
                author: "David Park",
                role: "Founder, StartupXYZ",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <Card key={i} className="glass-card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent-400 text-accent-400" />
                  ))}
                </div>
                <p className="text-white mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <div className="font-medium text-white">{testimonial.author}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-950/90">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Join Our <span className="gradient-text">Community</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Connect with other employers and top VAs. Share best practices, get advice, and grow together.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {communities.map((community) => (
              <Card key={community.name} className="glass-card-hover p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-maiki-500 to-maiki-700 flex items-center justify-center text-white font-bold">
                    r/
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{community.displayName}</h3>
                    <p className="text-sm text-slate-500">{community.members} members</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-white/5">{community.posts}</Badge>
                  <Button size="sm" variant="outline" className="border-maiki-600/30">
                    Join
                  </Button>
                </div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="glass-card p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-maiki-500/20 via-transparent to-accent-500/20" />
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to Hire Your Perfect VA?
                </h2>
                <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
                  Join thousands of businesses saving time and money with Africa&apos;s top virtual assistants.
                  No commitment required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/discover">
                    <Button size="lg" className="px-8">
                      Find Talent Now
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/post-job">
                    <Button size="lg" variant="outline" className="px-8 border-maiki-600/30">
                      Post a Job Free
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-slate-600 mt-6">
                  Free to post • No credit card required • Cancel anytime
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold text-white mb-4">For Employers</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/discover" className="hover:text-white transition-colors">Find Talent</Link></li>
                <li><Link href="/post-job" className="hover:text-white transition-colors">Post a Job</Link></li>
                <li><Link href="/enterprise" className="hover:text-white transition-colors">Enterprise</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For VAs</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/apply" className="hover:text-white transition-colors">Apply as VA</Link></li>
                <li><Link href="/skills" className="hover:text-white transition-colors">Skill Tests</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="/resources" className="hover:text-white transition-colors">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/guides" className="hover:text-white transition-colors">Hiring Guides</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/press" className="hover:text-white transition-colors">Press</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-maiki-400 to-maiki-500 rounded" />
              <span className="font-semibold text-white">Maiki</span>
            </div>
            <p className="text-sm text-slate-600">
              © 2026 Maiki. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
