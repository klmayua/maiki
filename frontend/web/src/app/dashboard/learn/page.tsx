'use client'

import { motion } from 'framer-motion'
import {
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  Lock,
  PlayCircle,
  TrendingUp,
  Target,
  Star,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function LearnPage() {
  const learningPaths = [
    {
      title: 'Administrative Excellence',
      description: 'Master calendar, email, and office management',
      courses: 8,
      completed: 5,
      hours: 24,
      level: 'Beginner to Professional',
      icon: Target,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Customer Success',
      description: 'Support, retention, and satisfaction strategies',
      courses: 6,
      completed: 2,
      hours: 18,
      level: 'Associate to Expert',
      icon: Star,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Social Media Management',
      description: 'Content creation, scheduling, and analytics',
      courses: 10,
      completed: 0,
      hours: 32,
      level: 'Beginner to Master',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'AI-Augmented VA',
      description: 'Leverage AI tools to 10x your productivity',
      courses: 5,
      completed: 1,
      hours: 15,
      level: 'Professional to Legend',
      icon: Award,
      color: 'from-gold-500 to-gold-600'
    }
  ]

  const myCourses = [
    {
      title: 'Calendar Management Mastery',
      progress: 75,
      totalLessons: 12,
      completedLessons: 9,
      lastAccessed: '2 hours ago',
      thumbnail: '📅',
      nextLesson: 'Time Zone Coordination'
    },
    {
      title: 'Professional Email Communication',
      progress: 30,
      totalLessons: 10,
      completedLessons: 3,
      lastAccessed: '1 day ago',
      thumbnail: '✉️',
      nextLesson: 'Email Templates'
    },
    {
      title: 'ChatGPT for VAs',
      progress: 10,
      totalLessons: 8,
      completedLessons: 1,
      lastAccessed: '3 days ago',
      thumbnail: '🤖',
      nextLesson: 'Prompt Engineering Basics'
    }
  ]

  const certifications = [
    {
      name: 'Certified Administrative Professional',
      provider: 'Maiki Academy',
      tier: 'Professional',
      hours: 40,
      students: 1250,
      nft: true
    },
    {
      name: 'Customer Support Specialist',
      provider: 'Maiki Academy',
      tier: 'Associate',
      hours: 25,
      students: 890,
      nft: true
    },
    {
      name: 'AI Tools Certification',
      provider: 'Maiki Academy',
      tier: 'Expert',
      hours: 20,
      students: 450,
      nft: true
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Learning Center</h1>
          <p className="text-maiki-400">Grow your skills, advance your tier, boost your earnings</p>
        </div>

        <div className="flex items-center gap-4 glass-card px-4 py-2 rounded-lg">
          <div>
            <p className="text-sm text-maiki-400">Learning Streak</p>
            <p className="text-xl font-bold text-white">12 days 🔥</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-sm text-maiki-400">Hours Learned</p>
            <p className="text-xl font-bold text-white">47h</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-sm text-maiki-400">Certificates</p>
            <p className="text-xl font-bold text-white">3 🏆</p>
          </div>
        </div>
      </motion.div>

      {/* Continue Learning */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Continue Learning</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {myCourses.map((course, index) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4">{course.thumbnail}</div>
                  <h3 className="font-semibold text-white mb-2">{course.title}</h3>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-maiki-400">{course.progress}% complete</span>
                      <span className="text-maiki-400">{course.completedLessons}/{course.totalLessons}</span>
                    </div>
                    <div className="w-full bg-maiki-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-maiki-500 to-gold-400 h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-maiki-400 mb-4">
                    <PlayCircle className="w-4 h-4" />
                    <span>Next: {course.nextLesson}</span>
                  </div>

                  <Button size="sm" className="w-full">
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Learning Paths */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Learning Paths</h2>
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            View All
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {learningPaths.map((path, index) => (
            <motion.div
              key={path.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full group hover:border-maiki-500/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center flex-shrink-0`}>
                      <path.icon className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{path.title}</h3>
                      <p className="text-sm text-maiki-400 mb-3">{path.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="soft">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {path.courses} courses
                        </Badge>
                        <Badge variant="soft">
                          <Clock className="w-3 h-3 mr-1" />
                          {path.hours} hours
                        </Badge>
                        <Badge variant="secondary">{path.level}</Badge>
                      </div>

                      {path.completed > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-maiki-400">Progress</span>
                            <span className="text-white">{path.completed}/{path.courses} courses</span>
                          </div>
                          <div className="w-full bg-maiki-800 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-maiki-500 to-gold-400 h-2 rounded-full"
                              style={{ width: `${(path.completed / path.courses) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <Button variant={path.completed > 0 ? 'default' : 'outline'} size="sm" className="w-full">
                        {path.completed > 0 ? 'Continue Path' : 'Start Path'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Certifications</h2>
          <Button variant="ghost" size="sm">Browse All</Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div
                  key={cert.name}
                  className="flex items-center justify-between p-4 bg-maiki-950/50 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-500/20 flex items-center justify-center">
                      <Award className="w-6 h-6 text-gold-400" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-white">{cert.name}</h3>
                      <p className="text-sm text-maiki-400">{cert.provider}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" size="sm">Tier: {cert.tier}</Badge>
                        <Badge variant="soft" size="sm">{cert.hours} hours</Badge>
                        <Badge variant="gold" size="sm">NFT Verified</Badge>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    {index === 0 ? 'Continue' : 'Start'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Skill Assessment */}
      <section>
        <Card className="bg-gradient-to-br from-maiki-800/50 to-maiki-900/50 border-maiki-500/30">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-maiki-400 to-gold-400 flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white">Take a Skill Assessment</h3>
                  <p className="text-maiki-300">
                    Prove your skills, earn verified badges, unlock higher-paying jobs
                  </p>
                </div>
              </div>

              <Button size="lg">
                View Assessments
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
