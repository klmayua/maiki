'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Briefcase, Sparkles, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

const steps = [
  { id: 'details', title: 'Job Details', icon: Briefcase },
  { id: 'skills', title: 'Skills Required', icon: Sparkles },
  { id: 'budget', title: 'Budget', icon: DollarSign },
  { id: 'review', title: 'Review', icon: CheckCircle },
]

export default function PostJobPage() {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header */}
      <header className="glass-nav border-b border-navy-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-navy-900" />
              </div>
              <span className="font-bold text-text-primary text-xl">maiki</span>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-text-secondary">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-text-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-gold-500/20 text-gold-400 border-gold-500/30">
                <Briefcase className="w-3 h-3 mr-1" />
                Post a Job
              </Badge>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Post Your <span className="text-gradient-teal">VA Job</span>
              </h1>
              <p className="text-text-secondary">
                Find the perfect virtual assistant for your needs
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={step.id} className="flex items-center"
                  >
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                        index === currentStep
                          ? 'bg-teal-500 text-navy-900'
                          : index < currentStep
                          ? 'bg-teal-500/20 text-teal-400'
                          : 'bg-navy-800 text-text-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-navy-700 mx-2" />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Form Card */}
            <Card className="glass-card">
              <CardContent className="p-8">
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-text-primary mb-2 block">
                        Job Title *
                      </label>
                      <Input
                        placeholder="e.g., Executive Assistant for Tech CEO"
                        className="text-lg"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-text-primary mb-2 block">
                        Job Description *
                      </label>
                      <textarea
                        className="w-full bg-navy-800/50 border border-navy-700/50 rounded-lg p-4 text-text-primary placeholder:text-text-muted min-h-[150px] focus:border-teal-500/50 focus:outline-none"
                        placeholder="Describe the role, responsibilities, and requirements..."
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-text-primary mb-2 block">
                          Location
                        </label>
                        <Input placeholder="Remote (timezone)" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-primary mb-2 block">
                          Job Type
                        </label>
                        <select className="w-full bg-navy-800/50 border border-navy-700/50 rounded-lg px-4 py-2.5 text-text-primary focus:border-teal-500/50 focus:outline-none"
                        >
                          <option>Ongoing</option>
                          <option>Project-based</option>
                          <option>Full-time</option>
                          <option>Part-time</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6"
>
                    <p className="text-text-secondary">Select the skills required for this job:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Calendar Management', 'Email Handling', 'Social Media', 'Customer Support', 'Data Entry', 'Travel Planning', 'Project Management'].map((skill) => (
                        <button
                          key={skill}
                          className="px-4 py-2 rounded-full border border-navy-700/50 text-text-secondary hover:border-teal-500/50 hover:text-teal-400 transition-colors"
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-text-primary mb-2 block">
                          Hourly Rate Range
                        </label>
                        <div className="flex items-center gap-4">
                          <Input type="number" placeholder="Min" className="text-center" />
                          <span className="text-text-secondary">to</span>
                          <Input type="number" placeholder="Max" className="text-center" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-primary mb-2 block">
                          Estimated Hours per Week
                        </label>
                        <Input type="number" placeholder="e.g., 20" />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-10 h-10 text-teal-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary">Ready to Post!</h2>
                    <p className="text-text-secondary">
                      Review your job details and post when ready.
                    </p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-8 border-t border-navy-700/50"
                >
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="border-navy-600/50"
                  >
                    Previous
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="bg-teal-500 text-navy-900"
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button className="bg-teal-500 text-navy-900"
                    >
                      Post Job
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
