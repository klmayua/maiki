'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowLeft, Mail, Lock, User, Briefcase, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

export default function RegisterPage() {
  const [userType, setUserType] = useState<'va' | 'client' | null>(null)

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
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Join the 2030 workforce</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* User Type Selection */}
            {!userType ? (
              <div className="space-y-3">
                <p className="text-center text-sm text-maiki-400 mb-4">I want to...</p>

                <button
                  onClick={() => setUserType('va')}
                  className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-maiki-500/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-maiki-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserCircle className="w-6 h-6 text-maiki-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Work as a VA</div>
                      <div className="text-sm text-maiki-400">Find jobs, build skills, grow your career</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setUserType('client')}
                  className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-gold-400/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gold-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Briefcase className="w-6 h-6 text-gold-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Hire a VA</div>
                      <div className="text-sm text-maiki-400">Post jobs, find talent, get work done</div>
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 p-3 bg-maiki-800/50 rounded-lg mb-4">
                  <button
                    onClick={() => setUserType(null)}
                    className="text-sm text-maiki-400 hover:text-white flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back
                  </button>
                  <span className="text-maiki-300">Signing up as a{' '}<span className="text-white font-medium">{userType === 'va' ? 'Virtual Assistant' : 'Client'}</span>
                  </span>
                </div>

                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-maiki-400" />
                        <Input placeholder="John" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Last Name</label>
                      <Input placeholder="Doe" />
                    </div>
                  </div>

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
                    <label className="text-sm font-medium text-white">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-maiki-400" />
                      <Input
                        type="password"
                        placeholder="Create a strong password"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-maiki-400">Must be at least 8 characters with a number and symbol</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <input type="checkbox" id="terms" className="mt-1 rounded border-white/20 bg-maiki-950" />
                    <label htmlFor="terms" className="text-sm text-maiki-300">
                      I agree to the{' '}
                      <Link href="/terms" className="text-maiki-400 hover:text-white">Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-maiki-400 hover:text-white">Privacy Policy</Link>
                    </label>
                  </div>

                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                </form>
              </>
            )}

            <div className="text-center text-sm pt-4 border-t border-white/10">
              <span className="text-maiki-400">Already have an account?{' '}</span>
              <Link href="/login" className="text-maiki-300 hover:text-white font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
