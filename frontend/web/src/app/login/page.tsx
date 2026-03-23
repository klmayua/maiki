'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowLeft, Mail, Lock, Github, Chrome } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Link */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-text-secondary"
>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Button>
        </Link>

        <Card className="glass-card"
        >
          <CardHeader className="text-center"
          >
            <div className="flex justify-center mb-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25"
              >
                <Sparkles className="w-6 h-6 text-navy-900" />
              </div>
            </div>
            <CardTitle className="text-2xl text-text-primary">Welcome back</CardTitle>
            <CardDescription>Sign in to your Maiki account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4"
          >
            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3"
            >
              <Button variant="glass"
              >
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button variant="glass"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>

            <div className="relative"
            >
              <div className="absolute inset-0 flex items-center"
              >
                <div className="w-full border-t border-navy-700/50" />
              </div>
              <div className="relative flex justify-center text-xs"
              >
                <span className="bg-navy-800 px-2 text-text-muted">Or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form className="space-y-4"
            >
              <div className="space-y-2"
              >
                <label className="text-sm font-medium text-text-primary">Email</label>
                <div className="relative"
                >
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2"
              >
                <div className="flex justify-between"
                >
                  <label className="text-sm font-medium text-text-primary">Password</label>
                  <Link href="/forgot-password" className="text-sm text-teal-400 hover:text-teal-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative"
                >
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-teal-500 text-navy-900"
              >
                Sign In
              </Button>
            </form>

            <div className="text-center text-sm"
            >
              <span className="text-text-muted">Don&apos;t have an account?{' '}</span>
              <Link href="/register" className="text-teal-400 hover:text-teal-300 font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
