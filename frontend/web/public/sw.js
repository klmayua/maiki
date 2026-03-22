"""
Maiki Service Worker
Provides offline support, push notifications, and background sync
"""

const CACHE_NAME = 'maiki-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/register',
  '/offline.html',
  '/styles/main.css',
]

const API_CACHE_NAME = 'maiki-api-v1'
const API_ROUTES = [
  '/api/v1/jobs',
  '/api/v1/users/me',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Return offline response for API
            return new Response(
              JSON.stringify({ error: 'You are offline', offline: true }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            )
          })
        })
    )
    return
  }

  // Static assets - cache first, network fallback
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/static/') ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(request).then((response) => {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
      })
    )
    return
  }

  // Page requests - network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone)
        })
        return response
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Return offline page
          return caches.match('/offline.html')
        })
      })
  )
})

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-applications') {
    event.waitUntil(syncApplications())
  }
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages())
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json()

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: data.image,
    data: data.data,
    actions: data.actions || [],
    requireInteraction: true,
    vibrate: [200, 100, 200],
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const { action, url } = event.notification.data || {}

  event.waitUntil(
    clients.openWindow(url || '/dashboard')
  )
})

// Sync functions
async function syncApplications() {
  // Sync pending job applications
  const pending = await getPendingApplications()
  for (const application of pending) {
    try {
      await fetch('/api/v1/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application)
      })
      await removePendingApplication(application.id)
    } catch (error) {
      console.error('Failed to sync application:', error)
    }
  }
}

async function syncMessages() {
  // Sync pending messages
  const pending = await getPendingMessages()
  for (const message of pending) {
    try {
      await fetch('/api/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      })
      await removePendingMessage(message.id)
    } catch (error) {
      console.error('Failed to sync message:', error)
    }
  }
}

// IndexedDB helpers (simplified)
async function getPendingApplications() {
  // Implementation would use IndexedDB
  return []
}

async function removePendingApplication(id) {
  // Implementation would use IndexedDB
}

async function getPendingMessages() {
  return []
}

async function removePendingMessage(id) {
  // Implementation would use IndexedDB
}
