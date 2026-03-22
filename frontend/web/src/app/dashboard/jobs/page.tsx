'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
  ChevronDown
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function JobsPage() {
  const [filterOpen, setFilterOpen] = useState(false)

  const jobs = [
    {
      id: 1,
      title: 'Executive Assistant for Tech CEO',
      company: 'StartupXYZ',
      location: 'Remote (US timezone)',
      rate: '$30-40/hr',
      hours: '20-30 hrs/week',
      type: 'Ongoing',
      skills: ['Calendar Management', 'Email', 'Travel'],
      posted: '2 hours ago',
      proposals: 12,
      featured: true,
      tier: 'Expert'
    },
    {
      id: 2,
      title: 'Social Media Manager - Fashion Brand',
      company: 'Luxe Fashion Co',
      location: 'Remote (Flexible)',
      rate: '$25-35/hr',
      hours: '15-20 hrs/week',
      type: 'Ongoing',
      skills: ['Instagram', 'TikTok', 'Content Creation'],
      posted: '5 hours ago',
      proposals: 8,
      featured: false,
      tier: 'Professional'
    },
    {
      id: 3,
      title: 'Customer Support VA - E-commerce',
      company: 'ShopFast Inc',
      location: 'Remote (EU timezone)',
      rate: '$20-25/hr',
      hours: '40 hrs/week',
      type: 'Full-time',
      skills: ['Zendesk', 'Live Chat', 'Order Management'],
      posted: '1 day ago',
      proposals: 25,
      featured: false,
      tier: 'Associate'
    },
    {
      id: 4,
      title: 'Data Entry & Research Specialist',
      company: 'DataCorp',
      location: 'Remote (Any)',
      rate: '$15-20/hr',
      hours: '10-15 hrs/week',
      type: 'Project',
      skills: ['Excel', 'Research', 'Data Analysis'],
      posted: '2 days ago',
      proposals: 45,
      featured: false,
      tier: 'Apprentice'
    },
    {
      id: 5,
      title: 'Real Estate VA - Transaction Coordinator',
      company: 'Prestige Realty',
      location: 'Remote (US)',
      rate: '$35-45/hr',
      hours: '25-35 hrs/week',
      type: 'Ongoing',
      skills: ['Real Estate', 'Transaction Coordination', 'CRM'],
      posted: '3 days ago',
      proposals: 6,
      featured: true,
      tier: 'Expert'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Find Jobs</h1>
          <p className="text-maiki-400">Discover opportunities matched to your skills</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" leftIcon={<Bookmark className="w-4 h-4" />}>
            Saved (3)
          </Button>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-maiki-400" />
              <input
                type="text"
                placeholder="Search jobs, skills, or companies..."
                className="w-full bg-maiki-950 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-maiki-500 focus:outline-none focus:border-maiki-500"
              />
            </div>
            <Button
              variant="outline"
              leftIcon={<Filter className="w-4 h-4" />}
              rightIcon={<ChevronDown className="w-4 h-4" />}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              Filters
            </Button>
          </div>

          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div>
                <label className="block text-sm text-maiki-400 mb-2">Job Type</label>
                <select className="w-full bg-maiki-950 border border-white/10 rounded-lg px-3 py-2 text-white">
                  <option>All Types</option>
                  <option>Ongoing</option>
                  <option>Project</option>
                  <option>Full-time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-maiki-400 mb-2">Hourly Rate</label>
                <select className="w-full bg-maiki-950 border border-white/10 rounded-lg px-3 py-2 text-white">
                  <option>Any Rate</option>
                  <option>$10-20/hr</option>
                  <option>$20-40/hr</option>
                  <option>$40+/hr</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-maiki-400 mb-2">Hours/Week</label>
                <select className="w-full bg-maiki-950 border border-white/10 rounded-lg px-3 py-2 text-white">
                  <option>Any Hours</option>
                  <option>0-10 hrs</option>
                  <option>10-20 hrs</option>
                  <option>20-40 hrs</option>
                  <option>40+ hrs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-maiki-400 mb-2">Tier Required</label>
                <select className="w-full bg-maiki-950 border border-white/10 rounded-lg px-3 py-2 text-white">
                  <option>Any Tier</option>
                  <option>Apprentice+</option>
                  <option>Associate+</option>
                  <option>Professional+</option>
                </select>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Job Listings */}
      <div className="space-y-4">
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`hover:border-maiki-500/50 transition-colors ${job.featured ? 'border-gold-400/30' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                      {job.featured && (
                        <Badge variant="gold">Featured</Badge>
                      )}
                    </div>

                    <p className="text-maiki-300 mb-3">{job.company}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-maiki-400 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.rate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.hours}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Tier: {job.tier}</Badge>
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="soft">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-sm text-maiki-400">Posted {job.posted}</p>
                      <p className="text-sm text-maiki-400">{job.proposals} proposals</p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon-sm">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm">Apply Now</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center pt-8">
        <Button variant="outline">Load More Jobs</Button>
      </div>
    </div>
  )
}
