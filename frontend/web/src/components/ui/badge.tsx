import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-maiki-500 focus:ring-offset-2 focus:ring-offset-maiki-950',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-maiki-500 text-white hover:bg-maiki-400',
        secondary:
          'border-transparent bg-maiki-800 text-maiki-100 hover:bg-maiki-700',
        destructive:
          'border-transparent bg-red-500 text-white hover:bg-red-400',
        outline: 'text-maiki-300 border-maiki-500/50',
        success:
          'border-transparent bg-emerald-500 text-white hover:bg-emerald-400',
        warning:
          'border-transparent bg-amber-500 text-white hover:bg-amber-400',
        gold:
          'border-transparent bg-gold-400 text-maiki-950 hover:bg-gold-300 font-bold',
        glass:
          'border-white/20 bg-white/10 text-white hover:bg-white/20',
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
