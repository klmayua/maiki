import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/lib/providers'
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00d4aa' },
    { media: '(prefers-color-scheme: dark)', color: '#101218' },
  ],
}

export const metadata: Metadata = {
  title: { default: 'Maiki - Virtual Assistant OS', template: '%s | Maiki' },
  description: 'The world\'s first Virtual Assistant Operating System. AI-powered marketplace for VAs, clients, and the future of work.',
  keywords: ['virtual assistant', 'AI agents', 'freelance', 'remote work', 'VA marketplace', 'maiki'],
  authors: [{ name: 'Maiki' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Maiki',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
    ],
    shortcut: '/icons/favicon.ico',
  },
  openGraph: {
    title: 'Maiki - The Virtual Assistant Operating System',
    description: 'Join the operating system for the 2030 workforce. AI + Human collaboration.',
    type: 'website',
    siteName: 'Maiki',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maiki - Virtual Assistant OS',
    description: 'The world\'s first VA Operating System',
    creator: '@maiki',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-navy-900`}>
        <Providers>
          {children}
          <ChatbotWidget />
        </Providers>
      </body>
    </html>
  )
}
