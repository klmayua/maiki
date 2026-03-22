'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowLeft, Mail, Lock, Github, Chrome } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-maiki-950 animated-gradient noise-overlay relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-maiki-500/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-400/10 rounded-full blur-[128px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Link */}
        <Link href="/">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} className="mb-6">
            Back to home
          </Button>
        </Link>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-maiki-400 to-maiki-600 flex items-center justify-center shadow-lg shadow-maiki-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your Maiki account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="glass" leftIcon={<Chrome className="w-4 h-4" />}>
                Google
              </Button>
              <Button variant="glass" leftIcon={<Github className="w-4 h-4" />}>
                GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-maiki-900 px-2 text-maiki-400">Or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-maiki-400" />
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-white">Password</label>
                  <Link href="/forgot-password" className="text-sm text-maiki-400 hover:text-maiki-300">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-maiki-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-maiki-400">Don't have an account?{' '}</span>
              <Link href="/register" className="text-maiki-300 hover:text-white font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
