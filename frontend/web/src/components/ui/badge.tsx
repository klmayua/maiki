import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-navy-900',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-teal-500 text-navy-900 hover:bg-teal-400 font-bold',
        secondary:
          'border-transparent bg-navy-700 text-text-primary hover:bg-navy-600',
        destructive:
          'border-transparent bg-red-500 text-white hover:bg-red-400',
        outline: 'text-teal-400 border-teal-500/50 bg-transparent',
        success:
          'border-transparent bg-emerald-500 text-white hover:bg-emerald-400',
        warning:
          'border-transparent bg-amber-500 text-navy-900 hover:bg-amber-400 font-bold',
        gold:
          'border-transparent bg-gold-500 text-navy-900 hover:bg-gold-400 font-bold',
        glass:
          'border-white/10 bg-white/5 text-text-primary hover:bg-white/10',
        teal:
          'border-teal-500/30 bg-teal-500/20 text-teal-400 hover:bg-teal-500/30',
        navy:
          'border-navy-600/50 bg-navy-800/50 text-text-secondary hover:bg-navy-700/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
