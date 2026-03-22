import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maiki-500 focus-visible:ring-offset-2 focus-visible:ring-offset-maiki-950 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-maiki-600 to-maiki-500 text-white hover:from-maiki-500 hover:to-maiki-400 shadow-lg shadow-maiki-500/25 hover:shadow-maiki-500/40 hover:-translate-y-0.5',
        primary: 'bg-gradient-to-r from-maiki-600 to-maiki-500 text-white hover:from-maiki-500 hover:to-maiki-400 shadow-lg shadow-maiki-500/25 hover:shadow-maiki-500/40 hover:-translate-y-0.5',
        destructive: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5',
        success: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5',
        warning: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5',
        outline: 'border-2 border-maiki-500/50 bg-transparent text-maiki-400 hover:border-maiki-400 hover:bg-maiki-500/10 hover:text-maiki-300 shadow-sm hover:shadow',
        secondary: 'bg-maiki-800 text-maiki-100 hover:bg-maiki-700 shadow-sm hover:shadow',
        ghost: 'text-maiki-300 hover:bg-maiki-800/50 hover:text-white',
        link: 'text-maiki-400 underline-offset-4 hover:underline hover:text-maiki-300',
        soft: 'bg-maiki-500/20 text-maiki-400 hover:bg-maiki-500/30',
        glass: 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30 backdrop-blur-sm',
        gold: 'bg-gradient-to-r from-gold-500 to-amber-500 text-maiki-950 hover:from-gold-400 hover:to-amber-400 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:-translate-y-0.5 font-bold',
      },
      size: {
        sm: 'h-9 rounded-md px-3 text-xs gap-1.5',
        default: 'h-11 rounded-lg px-5 py-2 text-sm gap-2',
        md: 'h-12 rounded-lg px-6 text-base gap-2',
        lg: 'h-14 rounded-xl px-8 text-base gap-2',
        xl: 'h-16 rounded-xl px-10 text-lg gap-2.5 font-bold',
        icon: 'h-11 w-11 p-0',
        'icon-sm': 'h-9 w-9 p-0',
        'icon-lg': 'h-14 w-14 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, loadingText, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {loadingText || children}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </div>
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
