import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Authentication Middleware
 * Protects authenticated routes and redirects appropriately
 */

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
]

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = [
  '/login',
  '/register',
]

// Public routes that don't need authentication
const PUBLIC_ROUTES = [
  '/',
  '/community',
  '/chat',
  '/about',
  '/pricing',
  '/help',
  '/api', // API routes are handled separately
  '/_next', // Next.js internal routes
  '/favicon.ico',
  '/icons',
  '/manifest.json',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get token from cookies or localStorage (we use cookies in middleware)
  const token = request.cookies.get('token')?.value
  const isAuthenticated = !!token

  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if this is an auth route
  const isAuthRoute = AUTH_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if explicitly public
  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route)
  )

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    // Store the original URL to redirect back after login
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Add security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

// Configure middleware to run on all routes except static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
