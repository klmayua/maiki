/**
 * Mobile-optimized animations.
 */
import { useIsMobile, usePrefersReducedMotion } from './useMediaQuery'

export function useMobileAnimations() {
  const isMobile = useIsMobile()
  const prefersReducedMotion = usePrefersReducedMotion()

  const shouldAnimate = !prefersReducedMotion

  // Mobile-optimized fade variants
  const fadeVariants = {
    hidden: {
      opacity: 0,
      y: isMobile ? 10 : 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0.3 : 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: isMobile ? -10 : -20,
      transition: {
        duration: isMobile ? 0.2 : 0.3
      }
    }
  }

  // Mobile-optimized slide variants
  const slideVariants = {
    hidden: {
      x: isMobile ? '100%' : 300,
      opacity: 0
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: isMobile ? 300 : 400,
        damping: isMobile ? 30 : 25
      }
    },
    exit: {
      x: isMobile ? '100%' : 300,
      opacity: 0,
      transition: {
        duration: isMobile ? 0.2 : 0.3
      }
    }
  }

  // Bottom sheet variants (mobile specific)
  const sheetVariants = {
    hidden: {
      y: '100%',
      borderRadius: 0
    },
    visible: {
      y: 0,
      borderRadius: 20,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      y: '100%',
      transition: {
        duration: 0.2
      }
    }
  }

  return {
    shouldAnimate,
    fadeVariants,
    slideVariants,
    sheetVariants,
    isMobile
  }
}

// Touch-friendly gesture config
export const gestureConfig = {
  dragElastic: 0.2,
  dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
  dragTransition: { bounceStiffness: 300, bounceDamping: 20 }
}
