'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Calendar,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface RevenueData {
  time_series: Array<{
    period: string
    gmv: number
    transactions: number
    revenue: number
  }>
  gmv: {
    total: number
    transaction_count: number
    average_transaction: number
  }
  platform_revenue: number
}

interface TalentData {
  total_vas: number
  verified_vas: number
  verification_rate: number
  active_last_30_days: number
  tier_distribution: Array<{
    tier: string
    count: number
    avg_rating: number
    avg_hours: number
  }>
  top_skills: Array<{
    skill: string
    count: number
  }>
}

export function RevenueDashboard() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchData()
  }, [timeRange])

  const fetchData = async () => {
    try {
      const response = await api.get(`/analytics/revenue?group_by=day`)
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading analytics...</div>
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="GMV"
          value={`$${data.gmv.total.toLocaleString()}`}
          change="+12%"
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Platform Revenue"
          value={`$${data.platform_revenue.toLocaleString()}`}
          change="+8%"
          icon={TrendingUp}
          color="blue"
        />
        <KPICard
          title="Transactions"
          value={data.gmv.transaction_count.toString()}
          change="+15%"
          icon={Activity}
          color="purple"
        />
        <KPICard
          title="Avg Transaction"
          value={`$${data.gmv.average_transaction.toFixed(2)}`}
          change="-3%"
          icon={BarChart3}
          color="gold"
        />
      </div>

      {/* Revenue Chart */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">
          Revenue Over Time
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.time_series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="period"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }
                stroke="#666"
              />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="gmv"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="GMV"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#fbbf24"
                strokeWidth={2}
                name="Platform Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export function TalentAnalyticsDashboard() {
  const [data, setData] = useState<TalentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await api.get('/analytics/talent')
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch talent data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading talent analytics...</div>
  }

  if (!data) return null

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Total VAs"
          value={data.total_vas.toString()}
          subtitle={`${data.verified_vas} verified`}
          icon={Users}
          color="blue"
        />
        <KPICard
          title="Verification Rate"
          value={`${data.verification_rate.toFixed(1)}%`}
          icon={Activity}
          color="green"
        />
        <KPICard
          title="Active (30d)"
          value={data.active_last_30_days.toString()}
          icon={Calendar}
          color="purple"
        />
        <KPICard
          title="Top Skill"
          value={data.top_skills[0]?.skill || 'N/A'}
          icon={TrendingUp}
          color="gold"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Distribution */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Tier Distribution
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.tier_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="tier"
                  label
                >
                  {data.tier_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Skills */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Top Skills
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.top_skills.slice(0, 10)}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#666" />
                <YAxis
                  dataKey="skill"
                  type="category"
                  width={100}
                  stroke="#666"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({
  title,
  value,
  change,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  change?: string
  subtitle?: string
  icon: React.ElementType
  color: string
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/20 text-blue-400',
    green: 'from-green-500/20 to-green-600/20 text-green-400',
    purple: 'from-purple-500/20 to-purple-600/20 text-purple-400',
    gold: 'from-gold-500/20 to-gold-600/20 text-gold-400',
  }

  return (
    <div
      className={cn(
        'glass-card rounded-xl p-6 bg-gradient-to-br',
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p
              className={cn(
                'text-xs mt-1',
                change.startsWith('+') ? 'text-green-400' : 'text-red-400'
              )}
            >
              {change}
            </p>
          )}
          {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-lg bg-white/10">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
