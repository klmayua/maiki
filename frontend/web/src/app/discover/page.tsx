'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, ArrowLeft, Users, Sparkles, Filter, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header */}
      <header className="glass-nav border-b border-navy-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-navy-900" />
              </div>
              <span className="font-bold text-text-primary text-xl">maiki</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-text-secondary">Log in</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-teal-500 text-navy-900">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Back Link */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-text-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Button>
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <Badge className="mb-4 bg-teal-500/20 text-teal-400 border-teal-500/30">
            <Users className="w-3 h-3 mr-1" />
            Talent Marketplace
          </Badge>
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Discover Top <span className="text-gradient-teal">VA Talent</span>
          </h1>
          <p className="text-text-secondary mb-8">
            Browse our curated network of professional virtual assistants,
            filtered by skills, experience, and ratings.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <Input
              placeholder="Search by skill, role, or expertise..."
              className="w-full pl-12 pr-4 py-4 text-lg"
            />
            <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-500 text-navy-900">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </motion.div>

        {/* Coming Soon Notice */}
        <Card className="glass-card p-12 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-teal-400" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Full Directory Coming Soon</h2>
          <p className="text-text-secondary mb-6">
            We&apos;re curating the best virtual assistants for you.
            Check back soon for our full talent marketplace.
          </p>
          <Link href="/dashboard/jobs">
            <Button className="bg-teal-500 text-navy-900">
              Browse Available Jobs
            </Button>
          </Link>
        </Card>

        {/* Featured Preview */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-text-primary mb-6">Featured Talent Preview</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah Chen', role: 'Executive Assistant', rate: '$45/hr', rating: 4.9 },
              { name: 'James Okonkwo', role: 'Social Media Manager', rate: '$35/hr', rating: 4.8 },
              { name: 'Maria Garcia', role: 'Bookkeeping VA', rate: '$55/hr', rating: 5.0 },
            ].map((person) => (
              <Card key={person.name} className="glass-card p-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-navy-900 font-bold text-xl mb-4">
                  {person.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h4 className="font-semibold text-text-primary">{person.name}</h4>
                <p className="text-text-secondary text-sm">{person.role}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-navy-700/50">
                  <span className="font-bold text-text-primary">{person.rate}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                    <span className="text-text-secondary text-sm">{person.rating}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
