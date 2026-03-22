'use client'

import { motion } from 'framer-motion'
import {
  Briefcase,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, John! <span className="text-2xl"></span></h1>
          <p className="text-maiki-400 mt-1">Here's what's happening with your work today.</p>
        </div>
        <Link href="/dashboard/jobs">
          <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
            Find Jobs
          </Button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Jobs"
          value="3"
          change="+1 this week"
          icon={Briefcase}
          trend="up"
        />
        <StatCard
          title="Hours Worked"
          value="127"
          change="This month"
          icon={Clock}
          trend="up"
        />
        <StatCard
          title="Earnings"
          value="$2,450"
          change="+$420 this week"
          icon={DollarSign}
          trend="up"
        />
        <StatCard
          title="Rating"
          value="4.8"
          change="12 reviews"
          icon={Star}
          trend="neutral"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Current Jobs</CardTitle>
              <Link href="/dashboard/jobs" className="text-sm text-maiki-400 hover:text-white">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: 'Executive Assistant - Tech Startup',
                  client: 'Acme Corp',
                  rate: '$25/hr',
                  hours: '12/40 hours',
                  progress: 30,
                  status: 'active'
                },
                {
                  title: 'Social Media Management',
                  client: 'Fashion Brand Co',
                  rate: '$30/hr',
                  hours: '25/50 hours',
                  progress: 50,
                  status: 'active'
                },
                {
                  title: 'Data Entry Project',
                  client: 'Data Solutions LLC',
                  rate: '$20/hr',
                  hours: '2/10 hours',
                  progress: 20,
                  status: 'pending'
                }
              ].map((job, i) => (
                <div key={i} className="p-4 bg-maiki-950/50 rounded-lg border border-white/5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-white">{job.title}</h3>
                      <p className="text-sm text-maiki-400">{job.client}</p>
                    </div>
                    <Badge variant={job.status === 'active' ? 'success' : 'warning'}>
                      {job.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-maiki-400 mb-3">
                    <span>{job.rate}</span>
                    <span>•</span>
                    <span>{job.hours}</span>
                  </div>

                  <div className="w-full bg-maiki-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-maiki-500 to-maiki-400 h-2 rounded-full"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { message: 'Payment received from Acme Corp', time: '2 hours ago', type: 'payment' },
                  { message: 'New review: 5 stars from Fashion Brand Co', time: '5 hours ago', type: 'review' },
                  { message: 'Completed milestone: Social Media Strategy', time: '1 day ago', type: 'milestone' },
                  { message: 'New job invitation: Customer Support VA', time: '2 days ago', type: 'invitation' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'payment' ? 'bg-emerald-400' :
                      activity.type === 'review' ? 'bg-gold-400' :
                      activity.type === 'milestone' ? 'bg-maiki-400' :
                      'bg-blue-400'
                    }`} />
                    <div>
                      <p className="text-white">{activity.message}</p>
                      <p className="text-sm text-maiki-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-maiki-500 to-maiki-600 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                JD
              </div>
              <h3 className="font-bold text-white text-lg">John Doe</h3>
              <p className="text-maiki-400 text-sm">Professional Tier</p>

              <div className="flex justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= 4 ? 'text-gold-400 fill-gold-400' : 'text-maiki-600'}`}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                <div>
                  <div className="text-2xl font-bold text-white">127</div>
                  <div className="text-xs text-maiki-400">Hours</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">12</div>
                  <div className="text-xs text-maiki-400">Jobs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verified Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Calendar Management', 'Email Handling', 'Social Media', 'Customer Support', 'Data Entry'].map((skill) => (
                  <Badge key={skill} variant="soft">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {skill}
                  </Badge>
                ))}
              </div>
              <Link href="/dashboard/growth">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Add Skills
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { text: 'Complete your profile', done: true },
                { text: 'Take Email Management course', done: true },
                { text: 'Connect payment method', done: false },
                { text: 'Join a Guild', done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    step.done ? 'bg-emerald-500' : 'bg-maiki-700'
                  }`}>
                    {step.done ? (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    ) : (
                      <span className="text-xs text-white">{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm ${step.done ? 'text-maiki-400 line-through' : 'text-white'}`}>
                    {step.text}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Guild Invitation */}
          <Card className="border-gold-400/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold-400/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Join the E-Commerce VA Guild</h4>
                  <p className="text-sm text-maiki-400 mt-1">Connect with 500+ VAs in your field</p>
                  <Button variant="gold" size="sm" className="mt-3">
                    Join Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, change, icon: Icon, trend }: {
  title: string
  value: string
  change: string
  icon: React.ElementType
  trend: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-maiki-400">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
          </div>
          <div className="p-2 bg-maiki-800/50 rounded-lg">
            <Icon className="w-5 h-5 text-maiki-400" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-4">
          <TrendingUp className={`w-4 h-4 ${
            trend === 'up' ? 'text-emerald-400' :
            trend === 'down' ? 'text-red-400' :
            'text-maiki-400'
          }`} />
          <span className={`text-sm ${
            trend === 'up' ? 'text-emerald-400' :
            trend === 'down' ? 'text-red-400' :
            'text-maiki-400'
          }`}>{change}</span>
        </div>
      </CardContent>
    </Card>
  )
}
