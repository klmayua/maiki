'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  Brain,
  Target,
  TrendingUp,
  Award,
  Zap,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

interface MatchResult {
  job_id: number
  job_title: string
  match_score: number
  breakdown: {
    skill_match: number
    experience_match: number
    rate_match: number
    availability_match: number
    cultural_fit: number
  }
  reasoning: string
  recommendation: string
}

interface Assessment {
  skill: string
  questions: Array<{
    type: string
    question: string
    options: string[]
    difficulty: string
  }>
  time_estimate_minutes: number
  passing_score: number
}

interface Badge {
  name: string
  tier: string
  description: string
  icon: string
}

export function AIMatchCard({ jobId }: { jobId: number }) {
  const [matchData, setMatchData] = useState<MatchResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatchScore()
  }, [jobId])

  const fetchMatchScore = async () => {
    try {
      const response = await api.get(`/ai-matching/candidates/match-score/${jobId}`)
      setMatchData(response.data)
    } catch (error) {
      console.error('Failed to fetch match score:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
        <div className="h-8 bg-white/10 rounded w-1/4 mb-4" />
        <div className="space-y-2">
          <div className="h-2 bg-white/10 rounded" />
          <div className="h-2 bg-white/10 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (!matchData) return null

  const score = matchData.match_score
  const scoreColor = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'
  const scoreColors = {
    green: 'text-green-400 bg-green-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/20',
    red: 'text-red-400 bg-red-500/20',
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5 text-maiki-400" />
            <span className="text-sm text-maiki-400">AI Match Score</span>
          </div>
          <h3 className="text-2xl font-bold text-white">
            {matchData.job_title}
          </h3>
        </div>
        <div
          className={cn(
            'text-3xl font-bold px-4 py-2 rounded-xl',
            scoreColors[scoreColor]
          )}
        >
          {Math.round(score)}%
        </div>
      </div>

      {/* Match Breakdown */}
      <div className="space-y-3 mb-6">
        <MatchBar
          label="Skills Match"
          value={matchData.breakdown.skill_match}
          color="blue"
        />
        <MatchBar
          label="Experience"
          value={matchData.breakdown.experience_match}
          color="purple"
        />
        <MatchBar
          label="Rate Alignment"
          value={matchData.breakdown.rate_match}
          color="green"
        />
        <MatchBar
          label="Availability"
          value={matchData.breakdown.availability_match}
          color="gold"
        />
        <MatchBar
          label="Cultural Fit"
          value={matchData.breakdown.cultural_fit}
          color="pink"
        />
      </div>

      {/* AI Reasoning */}
      <div className="bg-maiki-900/50 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-white/90">{matchData.reasoning}</p>
        </div>
      </div>

      {/* Recommendation */}
      <div
        className={cn(
          'flex items-center gap-2 text-sm font-medium',
          matchData.recommendation === 'Apply'
            ? 'text-green-400'
            : 'text-yellow-400'
        )}
      >
        {matchData.recommendation === 'Apply' ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <AlertCircle className="w-4 h-4" />
        )}
        AI Recommendation: {matchData.recommendation}
      </div>
    </div>
  )
}

function MatchBar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    gold: 'bg-gold-500',
    pink: 'bg-pink-500',
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-maiki-400 w-28">{label}</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', colorClasses[color])}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm text-white w-10 text-right">{Math.round(value)}%</span>
    </div>
  )
}

export function SkillsAssessmentCard({ skillName }: { skillName: string }) {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    fetchAssessment()
  }, [skillName])

  const fetchAssessment = async () => {
    try {
      const response = await api.get(`/ai-matching/assessments/${skillName}`)
      setAssessment(response.data)
    } catch (error) {
      console.error('Failed to fetch assessment:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/2 mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded" />
          <div className="h-4 bg-white/10 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (!assessment) return null

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-maiki-400" />
            <span className="text-sm text-maiki-400">AI Skills Assessment</span>
          </div>
          <h3 className="text-xl font-bold text-white capitalize">
            {assessment.skill}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-sm text-maiki-400">Passing Score</div>
          <div className="text-lg font-bold text-gold-400">
            {assessment.passing_score}%
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-maiki-400 mb-6">
        <div className="flex items-center gap-2">
          <span>{assessment.questions.length} Questions</span>
        </div>
        <div className="flex items-center gap-2">
          <span>~{assessment.time_estimate_minutes} minutes</span>
        </div>
      </div>

      {!started ? (
        <button
          onClick={() => setStarted(true)}
          className="w-full py-3 bg-maiki-600 hover:bg-maiki-500 text-white rounded-lg font-medium transition-colors"
        >
          Start Assessment
        </button>
      ) : (
        <div className="space-y-4">
          {assessment.questions.map((q, i) => (
            <div key={i} className="bg-maiki-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded',
                    q.difficulty === 'advanced'
                      ? 'bg-red-500/20 text-red-400'
                      : q.difficulty === 'intermediate'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  )}
                >
                  {q.difficulty}
                </span>
              </div>
              <p className="text-white mb-3">{q.question}</p>
              {q.options && (
                <div className="space-y-2">
                  {q.options.map((option, j) => (
                    <button
                      key={j}
                      className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-maiki-300 transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function BadgesDisplay({ userId }: { userId: number }) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBadges()
  }, [userId])

  const fetchBadges = async () => {
    try {
      const response = await api.get('/ai-matching/badges')
      setBadges(response.data.badges)
    } catch (error) {
      console.error('Failed to fetch badges:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-white/10 rounded" />
            <div className="h-24 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-gold-400" />
        <h3 className="text-lg font-bold text-white">Proof-of-Work Badges</h3>
      </div>

      {badges.length === 0 ? (
        <p className="text-maiki-400 text-center py-4">
          No badges yet. Complete work to earn badges!
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {badges.map((badge, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-maiki-600/20 to-maiki-700/20 rounded-lg p-4 border border-maiki-500/30"
            >
              <div className="text-2xl mb-2">{badge.icon}</div>
              <div className="text-sm font-medium text-white">{badge.name}</div>
              <div
                className={cn(
                  'text-xs mt-1',
                  badge.tier === 'diamond'
                    ? 'text-purple-400'
                    : badge.tier === 'platinum'
                    ? 'text-blue-400'
                    : badge.tier === 'gold'
                    ? 'text-gold-400'
                    : 'text-silver-400'
                )}
              >
                {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)} Tier
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function SkillGapAnalysis({ targetRole }: { targetRole: string }) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalysis()
  }, [targetRole])

  const fetchAnalysis = async () => {
    try {
      const response = await api.get(`/ai-matching/skill-gaps/${targetRole}`)
      setAnalysis(response.data)
    } catch (error) {
      console.error('Failed to fetch skill gap analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/2 mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded" />
          <div className="h-4 bg-white/10 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-maiki-400" />
        <h3 className="text-lg font-bold text-white">
          Skill Gap Analysis: {targetRole}
        </h3>
      </div>

      <div className="space-y-6">
        {/* Missing Skills */}
        <div>
          <h4 className="text-sm font-medium text-maiki-400 mb-2">
            Missing Critical Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.missing_critical_skills?.map((skill: string) => (
              <span
                key={skill}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Learning Path */}
        <div>
          <h4 className="text-sm font-medium text-maiki-400 mb-2">
            Recommended Learning Path
          </h4>
          <div className="space-y-2">
            {analysis.learning_path?.map((step: string, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-maiki-600 flex items-center justify-center text-xs text-white font-medium">
                  {i + 1}
                </div>
                <span className="text-sm text-white">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Time Estimate */}
        <div className="bg-maiki-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-maiki-400">Time to Readiness</span>
            <span className="text-lg font-bold text-gold-400">
              {analysis.time_to_readiness_weeks} weeks
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
