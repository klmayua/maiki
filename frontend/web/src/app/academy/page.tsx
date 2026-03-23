'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Search,
  GraduationCap,
  Clock,
  Users,
  Star,
  Play,
  Lock,
  CheckCircle,
  Award,
  BadgeCheck,
  ChevronRight,
  BookOpen,
  Zap,
  Shield,
  TrendingUp,
  Filter,
  BarChart3,
  Palette,
  Calculator,
  Code,
  Headphones,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// ─── Course Categories ───
const categories = [
  { id: 'all', name: 'All Courses', icon: BookOpen, count: 48 },
  { id: 'admin', name: 'Admin & Executive', icon: FileText, count: 12 },
  { id: 'tech', name: 'Technical', icon: Code, count: 10 },
  { id: 'creative', name: 'Creative & Design', icon: Palette, count: 8 },
  { id: 'finance', name: 'Finance & Bookkeeping', icon: Calculator, count: 6 },
  { id: 'support', name: 'Customer Support', icon: Headphones, count: 7 },
  { id: 'analytics', name: 'Data & Analytics', icon: BarChart3, count: 5 },
]

// ─── Learning Paths ───
const learningPaths = [
  {
    title: 'Executive Assistant Mastery',
    description: 'From scheduling to C-suite support. 6 courses, 40+ hours.',
    courses: 6,
    hours: 42,
    level: 'Beginner to Expert',
    color: 'border-teal-500/30',
    accent: 'text-teal-400',
    bg: 'bg-teal-500/8',
    certPrice: 49,
  },
  {
    title: 'Technical VA Specialist',
    description: 'Automation, integrations, and no-code tools. 5 courses, 35+ hours.',
    courses: 5,
    hours: 36,
    level: 'Intermediate',
    color: 'border-teal-400/30',
    accent: 'text-teal-400',
    bg: 'bg-teal-400/8',
    certPrice: 59,
  },
  {
    title: 'Creative Operations Lead',
    description: 'Design, content, and brand management. 4 courses, 28+ hours.',
    courses: 4,
    hours: 28,
    level: 'All Levels',
    color: 'border-gold-400/30',
    accent: 'text-gold-400',
    bg: 'bg-gold-400/8',
    certPrice: 49,
  },
  {
    title: 'Bookkeeping & Finance Pro',
    description: 'QuickBooks, tax prep, and financial reporting. 5 courses, 32+ hours.',
    courses: 5,
    hours: 32,
    level: 'Beginner to Advanced',
    color: 'border-gold-400/30',
    accent: 'text-gold-400',
    bg: 'bg-gold-400/8',
    certPrice: 69,
  },
]

// ─── Courses ───
const courses = [
  {
    id: 'ea-fundamentals',
    title: 'Executive Assistant Fundamentals',
    instructor: 'Sarah Chen',
    category: 'admin',
    level: 'Beginner',
    rating: 4.9,
    students: 2340,
    duration: '8h 30m',
    lessons: 24,
    price: 0,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop',
    tags: ['Calendar', 'Email', 'Scheduling'],
    featured: true,
    hasCert: true,
    certPrice: 29,
  },
  {
    id: 'zapier-automation',
    title: 'Zapier & Automation Mastery',
    instructor: 'David Kim',
    category: 'tech',
    level: 'Intermediate',
    rating: 4.8,
    students: 1890,
    duration: '12h 15m',
    lessons: 36,
    price: 0,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=225&fit=crop',
    tags: ['Zapier', 'Make', 'Automation'],
    featured: true,
    hasCert: true,
    certPrice: 39,
  },
  {
    id: 'social-media-management',
    title: 'Social Media Management Pro',
    instructor: 'James Okonkwo',
    category: 'creative',
    level: 'All Levels',
    rating: 4.7,
    students: 3120,
    duration: '10h 45m',
    lessons: 28,
    price: 0,
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop',
    tags: ['Instagram', 'TikTok', 'Analytics'],
    featured: true,
    hasCert: true,
    certPrice: 29,
  },
  {
    id: 'quickbooks-essentials',
    title: 'QuickBooks for Virtual Assistants',
    instructor: 'Maria Garcia',
    category: 'finance',
    level: 'Beginner',
    rating: 5.0,
    students: 1560,
    duration: '9h 20m',
    lessons: 22,
    price: 0,
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=225&fit=crop',
    tags: ['QuickBooks', 'Invoicing', 'Reports'],
    featured: false,
    hasCert: true,
    certPrice: 39,
  },
  {
    id: 'customer-support-excellence',
    title: 'Customer Support Excellence',
    instructor: 'Amina Hassan',
    category: 'support',
    level: 'Beginner',
    rating: 4.8,
    students: 2010,
    duration: '7h 10m',
    lessons: 20,
    price: 0,
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=225&fit=crop',
    tags: ['Zendesk', 'Intercom', 'Ticketing'],
    featured: false,
    hasCert: true,
    certPrice: 29,
  },
  {
    id: 'ai-prompt-engineering',
    title: 'AI & Prompt Engineering for VAs',
    instructor: 'David Kim',
    category: 'tech',
    level: 'Intermediate',
    rating: 4.9,
    students: 4200,
    duration: '6h 45m',
    lessons: 18,
    price: 0,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop',
    tags: ['ChatGPT', 'Claude', 'Prompting'],
    featured: true,
    hasCert: true,
    certPrice: 49,
  },
  {
    id: 'data-entry-analytics',
    title: 'Data Entry & Spreadsheet Analytics',
    instructor: 'Lucas Fernandez',
    category: 'analytics',
    level: 'Beginner',
    rating: 4.6,
    students: 980,
    duration: '8h',
    lessons: 21,
    price: 0,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
    tags: ['Excel', 'Sheets', 'Airtable'],
    featured: false,
    hasCert: true,
    certPrice: 29,
  },
  {
    id: 'project-management',
    title: 'Project Management for VAs',
    instructor: 'Sarah Chen',
    category: 'admin',
    level: 'Intermediate',
    rating: 4.8,
    students: 1740,
    duration: '11h',
    lessons: 30,
    price: 0,
    image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=400&h=225&fit=crop',
    tags: ['Asana', 'Notion', 'Trello'],
    featured: false,
    hasCert: true,
    certPrice: 39,
  },
  {
    id: 'canva-design',
    title: 'Canva & Visual Design for VAs',
    instructor: 'James Okonkwo',
    category: 'creative',
    level: 'Beginner',
    rating: 4.7,
    students: 2650,
    duration: '5h 30m',
    lessons: 16,
    price: 0,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop',
    tags: ['Canva', 'Branding', 'Templates'],
    featured: false,
    hasCert: true,
    certPrice: 29,
  },
]

// ─── Certificate Tiers ───
const certTiers = [
  {
    name: 'Single Certificate',
    price: 29,
    priceLabel: 'from $29',
    description: 'Verify one completed course',
    features: [
      'Blockchain-verified badge',
      'Shareable credential link',
      'Add to Maiki profile',
      'LinkedIn-ready certificate',
    ],
    accent: 'border-navy-600/60',
    cta: 'Get Certified',
  },
  {
    name: 'Path Certificate',
    price: 99,
    priceLabel: '$99',
    description: 'Complete a full learning path',
    features: [
      'Everything in Single',
      'Path completion badge',
      'Tier progression credit',
      'Priority job matching',
      'Instructor endorsement',
    ],
    accent: 'border-teal-500/40',
    cta: 'Get Path Certificate',
    popular: true,
  },
  {
    name: 'Pro Bundle',
    price: 199,
    priceLabel: '$199/yr',
    description: 'Unlimited certificates for a year',
    features: [
      'Everything in Path',
      'Unlimited certifications',
      'Proctored exam access',
      'Verified "Pro" profile badge',
      'Early access to new courses',
      'Direct mentor sessions',
    ],
    accent: 'border-gold-400/40',
    cta: 'Go Pro',
  },
]

const levelColor: Record<string, string> = {
  'Beginner': 'text-teal-400 bg-teal-500/10',
  'Intermediate': 'text-gold-400 bg-gold-400/10',
  'Advanced': 'text-red-400 bg-red-500/10',
  'All Levels': 'text-text-secondary bg-navy-700/50',
}

export default function AcademyPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCourses = courses.filter(c => {
    const matchesCategory = activeCategory === 'all' || c.category === activeCategory
    const matchesSearch = !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-navy-900">
      {/* ─── Hero ─── */}
      <section className="border-b border-navy-700/30 pt-14 sm:pt-20 pb-6 sm:pb-8">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center mb-5 sm:mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-navy-700/60 bg-navy-800/40 text-[10px] sm:text-xs mb-4">
              <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-text-secondary">Maiki Academy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-heading leading-tight mb-2 sm:mb-3">
              Level Up Your VA Career
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto">
              Free courses. Paid certifications. Every certificate is blockchain-verified and counts toward your tier progression.
            </p>
          </motion.div>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search courses, skills, or topics..."
              className="w-full pl-9 sm:pl-12 pr-4 py-2.5 text-xs sm:text-sm bg-navy-800/50 border-navy-700/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                      : 'bg-navy-800/40 text-text-muted border border-navy-700/40 hover:text-text-secondary hover:border-navy-600/60'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {cat.name}
                  <span className="text-[10px] opacity-60">{cat.count}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Learning Paths ─── */}
      <section className="py-6 sm:py-8 border-b border-navy-700/30">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-text-heading">Learning Paths</h2>
              <p className="text-[10px] sm:text-xs text-text-muted mt-0.5">Structured progressions with certification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {learningPaths.map((path, i) => (
              <motion.div
                key={path.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className={`border ${path.color} bg-navy-800/30 rounded-lg p-4 hover:bg-navy-800/50 transition-colors group`}
              >
                <div className={`w-8 h-8 rounded ${path.bg} flex items-center justify-center mb-3`}>
                  <BookOpen className={`w-4 h-4 ${path.accent}`} />
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{path.title}</h3>
                <p className="text-[10px] sm:text-xs text-text-muted mb-3 leading-relaxed">{path.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-text-muted mb-3">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{path.courses} courses</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{path.hours}h</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-navy-700/40">
                  <span className={`text-[10px] px-2 py-0.5 rounded ${levelColor[path.level] || 'text-text-muted'}`}>
                    {path.level}
                  </span>
                  <span className="text-[10px] text-text-muted flex items-center gap-1">
                    <Award className="w-3 h-3 text-gold-400" /> Cert ${path.certPrice}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Course Catalog ─── */}
      <section className="py-6 sm:py-8 border-b border-navy-700/30">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-text-heading">
                {activeCategory === 'all' ? 'All Courses' : categories.find(c => c.id === activeCategory)?.name}
              </h2>
              <p className="text-[10px] sm:text-xs text-text-muted mt-0.5">{filteredCourses.length} courses available</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                viewport={{ once: true }}
                className="border border-navy-700/40 bg-navy-800/30 rounded-lg overflow-hidden hover:border-navy-600/60 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="relative h-32 sm:h-36 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${levelColor[course.level]}`}>
                      {course.level}
                    </span>
                    {course.featured && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gold-400/15 text-gold-400">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-navy-900/70 text-text-secondary backdrop-blur-sm">
                      {course.duration}
                    </span>
                  </div>
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-teal-500/90 flex items-center justify-center">
                      <Play className="w-4 h-4 text-navy-900 ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-text-primary mb-1 line-clamp-2 group-hover:text-teal-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-[10px] text-text-muted mb-2">by {course.instructor}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {course.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] bg-navy-700/50 text-text-muted border border-navy-600/30">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 text-[10px] text-text-muted mb-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-gold-400 text-gold-400" />{course.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />{course.students.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />{course.lessons} lessons
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-navy-700/40">
                    <div>
                      <span className="text-sm font-bold text-teal-400">Free</span>
                      {course.hasCert && (
                        <span className="text-[10px] text-text-muted ml-2">
                          Cert ${course.certPrice}
                        </span>
                      )}
                    </div>
                    <Link href={`/academy/${course.id}`}>
                      <span className="text-[10px] sm:text-xs text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-0.5 font-medium cursor-pointer">
                        Start <ChevronRight className="w-3 h-3 arrow-nudge" />
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Certificate Paywall Section ─── */}
      <section className="py-8 sm:py-12 border-b border-navy-700/30">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gold-400/30 bg-gold-400/5 text-[10px] sm:text-xs mb-3">
              <Award className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-gold-400">Blockchain-Verified Credentials</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-heading mb-2">
              Certifications That Count
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto">
              Courses are free. Certifications prove your skills. Every certificate is on-chain, portable, and counts toward tier progression.
            </p>
          </motion.div>

          {/* Certificate Preview */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto mb-8 sm:mb-10"
          >
            <div className="border border-navy-700/60 bg-navy-800/40 rounded-lg p-5 sm:p-6 text-center relative overflow-hidden">
              <div className="h-[2px] bg-gradient-to-r from-teal-500 via-teal-400 to-gold-400 absolute top-0 left-0 right-0" />
              <div className="w-14 h-14 rounded-full border-2 border-gold-400/40 bg-gold-400/10 flex items-center justify-center mx-auto mb-3">
                <Award className="w-7 h-7 text-gold-400" />
              </div>
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Maiki Academy Certificate</p>
              <h3 className="text-base sm:text-lg font-bold text-text-primary mb-1">Executive Assistant Fundamentals</h3>
              <p className="text-xs text-text-secondary mb-3">Awarded to <span className="text-text-primary font-medium">Jane Doe</span></p>
              <div className="flex items-center justify-center gap-3 text-[10px] text-text-muted">
                <span className="flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-teal-400" /> Verified</span>
                <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-teal-400" /> On-Chain</span>
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-teal-400" /> Tier Credit</span>
              </div>
            </div>
          </motion.div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {certTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className={`border ${tier.accent} bg-navy-800/30 rounded-lg p-4 sm:p-5 relative ${tier.popular ? 'ring-1 ring-teal-500/30' : ''}`}
              >
                {tier.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] px-2.5 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30 font-medium">
                    Most Popular
                  </span>
                )}
                <h3 className="text-sm sm:text-base font-bold text-text-primary mb-1">{tier.name}</h3>
                <div className="text-xl sm:text-2xl font-bold text-text-primary mb-1">
                  {tier.priceLabel}
                </div>
                <p className="text-[10px] sm:text-xs text-text-muted mb-4">{tier.description}</p>

                <ul className="space-y-2 mb-5">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-[10px] sm:text-xs text-text-secondary">
                      <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full text-xs sm:text-sm h-9 ${
                    tier.popular
                      ? 'font-bold'
                      : 'bg-navy-700/50 text-text-secondary border border-navy-600/50 hover:text-text-primary hover:border-navy-500'
                  }`}
                >
                  {tier.popular && <Lock className="w-3 h-3 mr-1.5" />}
                  {tier.cta}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-[10px] text-text-muted">
            <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-teal-500" /> Secure Payments</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-3 h-3 text-teal-500" /> Blockchain Verified</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-teal-500" /> Instant Issuance</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3 text-teal-500" /> Tier Progression</span>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="py-8 sm:py-10 mb-16 md:mb-0">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-navy-700/40 bg-navy-800/30 rounded-lg p-6 sm:p-8 text-center"
          >
            <h2 className="text-lg sm:text-2xl font-bold text-text-heading mb-2">
              Start Learning Today
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mb-5 max-w-md mx-auto">
              All courses are free. Earn certificates to prove your skills and accelerate your VA career.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <Link href="/register?role=va" className="w-full sm:w-auto">
                <Button className="font-bold h-10 px-6 text-sm w-full sm:w-auto">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Create Free Account
                </Button>
              </Link>
              <Link href="#courses" className="w-full sm:w-auto">
                <Button variant="outline" className="border-navy-600 text-text-secondary hover:text-text-primary h-10 px-6 text-sm w-full sm:w-auto font-medium">
                  Browse Courses <ChevronRight className="w-4 h-4 ml-1 arrow-nudge" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
