'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  href?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-base sm:text-lg px-2.5 py-1',
  md: 'text-xl sm:text-2xl px-3 sm:px-4 py-1.5 sm:py-2',
  lg: 'text-2xl sm:text-3xl px-4 sm:px-5 py-2 sm:py-2.5',
}

export default function Logo({ href = '/', className, size = 'md' }: LogoProps) {
  const logo = (
    <div className={cn('bg-navy-800 border border-navy-600/60 rounded inline-block', sizeClasses[size], className)}>
      <span className="font-bold tracking-[0.04em]">
        <span className="text-teal-400">m</span>
        <span className="text-text-primary">aiki</span>
      </span>
    </div>
  )

  if (href) {
    return <Link href={href} className="flex items-center">{logo}</Link>
  }

  return logo
}
