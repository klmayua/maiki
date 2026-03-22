'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  Award,
  Star,
  Clock,
  Users,
  ArrowRight,
  Lock,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function GrowthPage() {
  const tiers = [
    {
      name: 'Apprentice',
      range: '$5-10/hr',
      color: 'bg-gray-500',
      current: false,
      requirements: [
        'Complete onboarding',
        'Pass basic skills test',
        'Create profile'
      ],
      unlocked: true
    },
    {
      name: 'Associate',
      range: '$10-15/hr',
      color: 'bg-blue-500',
      current: false,
      requirements: [
        '50 hours worked',
        '4.5+ rating',
        'Complete 4 courses'
      ],
      unlocked: true
    },
    {
      name: 'Professional',
      range: '$15-25/hr',
      color: 'bg-purple-500',
      current: true,
      requirements: [
        '200 hours worked',
        '4.7+ rating',
        '1 certification'
      ],
      unlocked: true,
      progress: 75
    },
    {
      name: 'Expert',
      range: '$25-40/hr',
      color: 'bg-maiki-400',
      current: false,
      requirements: [
        '500 hours worked',
        '4.8+ rating',
        '2 specializations'
      ],
      unlocked: false
    },
    {
      name: 'Master',
      range: '$40-75/hr',
      color: 'bg-gold-400',
      current: false,
      requirements: [
        '1000 hours worked',
        '4.9+ rating',
        'Mentor 5 VAs'
      ],
      unlocked: false
    },
    {
      name: 'Legend',
      range: '$75+/hr',
      color: 'bg-gradient-to-r from-gold-400 to-maiki-400',
      current: false,
      requirements: [
        'Invite only',
        '5+ years experience',
        'Industry impact'
      ],
      unlocked: false
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white">Growth Path</h1>
        <p className="text-maiki-400">Track your progress and unlock new opportunities</p>
      </motion.div>

      {/* Current Tier Card */}
      <Card className="bg-gradient-to-br from-maiki-800/50 to-maiki-900/50 border-purple-500/30">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Award className="w-10 h-10 text-white" />
              </div>

              <div>
                <p className="text-sm text-maiki-400">Current Tier</p>
                <h2 className="text-3xl font-bold text-white">Professional</h2>
                <p className="text-purple-400 font-semibold">$15-25/hr earning potential</p>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-sm text-maiki-400 mb-1">Progress to Expert</p>
              <p className="text-2xl font-bold text-white mb-2">75%</p>
              <div className="w-48 h-2 bg-maiki-800 rounded-full">
                <div className="w-3/4 h-full bg-gradient-to-r from-purple-500 to-maiki-400 rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Progression */}
      <Card>
        <CardHeader>
          <CardTitle>Tier Progression</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`relative p-4 rounded-xl border transition-all ${
                tier.current
                  ? 'bg-purple-500/10 border-purple-500/50'
                  : tier.unlocked
                  ? 'bg-maiki-950/50 border-white/5 hover:border-white/10'
                  : 'bg-maiki-950/30 border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${tier.color} ${tier.current ? 'ring-4 ring-purple-500/30' : ''}`} />

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className={`font-semibold ${tier.current ? 'text-purple-400' : 'text-white'}`}>
                      {tier.name}
                    </h3>
                    {tier.current && <Badge variant="purple">Current</Badge>}
                    {!tier.unlocked && <Lock className="w-4 h-4 text-maiki-500" />}
                  </div>
                  <p className="text-gold-400 font-medium">{tier.range}</p>
                </div>

                <div className="flex-1 hidden md:block">
                  <ul className="space-y-1">
                    {tier.requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-maiki-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {tier.current && tier.progress && (
                <div className="mt-4 pt-4 border-t border-purple-500/20">
                  <p className="text-sm text-maiki-400 mb-2">Complete these to reach Expert:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-maiki-300">Hours Worked</span>
                          <span className="text-white">150/200</span>
                        </div>
                        <div className="w-full bg-maiki-800 rounded-full h-2">
                          <div className="w-3/4 h-full bg-purple-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills to Unlock */}
      <Card>
        <CardHeader>
          <CardTitle>Skills to Unlock at Expert</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {['Executive Support', 'Team Management', 'Client Relations'].map((skill) => (
              <div key={skill} className="p-4 bg-maiki-950/50 rounded-lg border border-white/5">
                <Lock className="w-5 h-5 text-maiki-500 mb-2" />
                <h4 className="font-medium text-white">{skill}</h4>
                <p className="text-sm text-maiki-400">Unlock at Expert tier</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
