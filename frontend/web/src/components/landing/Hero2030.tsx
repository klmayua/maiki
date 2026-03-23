'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Search, ArrowRight, Sparkles, Users, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Animated particle network component
function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
    }> = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    const createParticles = () => {
      particles = []
      const count = Math.floor((canvas.width * canvas.height) / 25000)
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 1,
          color: Math.random() > 0.5 ? 'rgba(0, 212, 170, 0.5)' : 'rgba(244, 196, 48, 0.3)'
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.2
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(0, 212, 170, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()

        // Update position
        p.x += p.vx
        p.y += p.vy

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    resize()
    createParticles()
    draw()

    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  )
}

// 3D Floating Card
function FloatingCard({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -20 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className="absolute right-[10%] top-[20%] hidden xl:block"
    >
      <div className="glass-card-2030 p-6 w-72 float-3d"
      >
        <div className="flex items-center gap-3 mb-4"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center"
          >
            <Users className="w-5 h-5 text-navy-900" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">AI Matching</p>
            <p className="text-lg font-bold text-text-primary">Live</p>
          </div>
        </div>

        {/* Animated matching visualization */}
        <div className="space-y-2"
        >
          {[
            { name: 'Executive Assistant', match: 94 },
            { name: 'Social Media Manager', match: 91 },
            { name: 'Data Entry Specialist', match: 88 },
          ].map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: delay + 0.5 + i * 0.2, duration: 0.8 }}
              className="flex items-center gap-3"
            >
              <div className="flex-1 h-2 bg-navy-700 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.match}%` }}
                  transition={{ delay: delay + 0.8 + i * 0.2, duration: 1 }}
                  className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                />
              </div>
              <span className="text-xs font-medium text-teal-400 w-8">{item.match}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Stats Counter
function StatsCounter({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, value])

  return (
    <div ref={ref} className="text-center"
    >
      <div className="text-3xl md:text-4xl font-bold text-text-primary"
      >
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-text-secondary mt-1">{label}</div>
    </div>
  )
}

export default function Hero2030() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setMousePosition({ x, y })

      // Update CSS custom properties for cursor glow
      document.documentElement.style.setProperty('--cursor-x', `${x}%`)
      document.documentElement.style.setProperty('--cursor-y', `${y}%`)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden mesh-gradient cursor-glow"
    >
      {/* Animated Background Layers */}
      <div className="absolute inset-0"
      >
        {/* Gradient orbs */}
        <motion.div
          style={{ y }}
          className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[150px]"
        />
        <motion.div
          style={{ y }}
          className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-gold-500/10 rounded-full blur-[150px]"
        />

        {/* Particle Network */}
        <ParticleNetwork />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 min-h-screen flex flex-col justify-center px-6 pt-20"
      >
        <div className="container mx-auto max-w-6xl"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left Content */}
            <div className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-2030"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-400 live-pulse" />
                  <span className="text-sm text-text-secondary">The Future of Work is Here</span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.7 }}
                className="space-y-4"
              >
                <h1 className="heading-fluid font-bold"
                >
                  Virtual Assistants,{' '}
                  <span className="text-gradient-teal">Reimagined</span>
                  <br />
                  for 2030
                </h1>
                <p className="text-xl text-text-secondary max-w-lg"
                >
                  AI-matched opportunities, blockchain-verified reputation,
                  and career paths that compound.
                </p>
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/discover"
                >
                  <Button
                    size="lg"
                    className="magnetic-btn bg-teal-500 text-navy-900 font-bold text-lg px-8 py-6"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Hire Elite Talent
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard/jobs"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="glass-card-2030-hover border-teal-500/50 text-teal-400 text-lg px-8 py-6"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Join as VA
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex flex-wrap gap-6 pt-4"
              >
                {[
                  { icon: Shield, text: 'Blockchain Verified' },
                  { icon: Zap, text: 'AI-Matched in 2hrs' },
                  { icon: Users, text: '12,000+ VAs' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-text-secondary"
                  >
                    <Icon className="w-4 h-4 text-teal-400" />
                    <span className="text-sm">{text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right - 3D Elements */}
            <div className="relative h-[400px] lg:h-[500px]"
            >
              <FloatingCard delay={0.3} />

              {/* Secondary floating elements */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute left-[5%] bottom-[10%] hidden xl:block"
              >
                <div className="glass-card-2030 p-4"
                >
                  <div className="flex items-center gap-2 mb-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center"
                    >
                      <Shield className="w-4 h-4 text-navy-900" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">Verified</span>
                  </div>
                  <p className="text-xs text-text-secondary">Stellar Blockchain</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20"
          >
            <div className="glass-card-2030 p-8"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8"
              >
                <StatsCounter value={12000} suffix="+" label="Verified VAs" />
                <StatsCounter value={500} suffix="+" label="Companies" />
                <StatsCounter value={98} suffix="%" label="Success Rate" />
                <StatsCounter value={2} suffix="hrs" label="Avg Match Time" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-text-secondary">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border-2 border-text-secondary/30 flex justify-center pt-1"
          >
            <motion.div className="w-1 h-2 bg-text-secondary/50 rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
