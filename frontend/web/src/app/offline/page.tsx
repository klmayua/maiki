'use client'

import Link from 'next/link'
import { WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function OfflinePage() {
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = () => {
    setIsChecking(true)
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-maiki-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-maiki-800/50 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-maiki-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">You're Offline</h1>

        <p className="text-maiki-400 mb-8">
          Don't worry! Some features are available offline. Your changes will sync when you're back online.
        </p>

        <div className="space-y-3">
          <Button
            onClick={checkConnection}
            disabled={isChecking}
            className="w-full"
            leftIcon={<RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />}
          >
            {isChecking ? 'Checking...' : 'Try Again'}
          </Button>

          <Link href="/dashboard" className="block">
            <Button variant="outline" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-8 p-4 glass-card rounded-xl">
          <p className="text-sm text-maiki-400 mb-3">Available offline:</p>
          <ul className="text-sm text-maiki-300 space-y-1">
            <li>✓ View your profile</li>
            <li>✓ Browse saved jobs</li>
            <li>✓ View completed courses</li>
            <li>✓ Draft applications (will sync later)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
