'use client'

import Hero2030 from '@/components/landing/Hero2030'
import TalentBentoGrid from '@/components/landing/TalentBentoGrid'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      <Hero2030 />
      <TalentBentoGrid />
    </div>
  )
}
