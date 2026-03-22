# Mobile App Architecture

## Overview

Maiki supports three mobile strategies:
1. **PWA (Progressive Web App)** - Available now, web-based
2. **React Native** - Future native apps (iOS/Android)
3. **Flutter** - Alternative native option

## Current: PWA-First Strategy

### Why PWA First?
- ✅ Instant deployment
- ✅ No app store approval
- ✅ Single codebase
- ✅ SEO benefits
- ✅ Offline support
- ✅ Push notifications

### Native App Timeline
- **Month 6-9:** React Native MVP
- **Month 12:** iOS/Android stores
- **Month 18:** Feature parity with web

---

## PWA Architecture

### Components
```
PWA Stack:
├── Service Worker (sw.js)
│   ├── Offline caching
│   ├── Background sync
│   └── Push notifications
├── Web App Manifest (manifest.json)
│   ├── Icons
│   ├── Theme colors
│   └── Shortcuts
├── Install Prompt
│   ├── Custom UI
│   └── Deferred prompt
└── Offline Page
    └── Fallback content
```

### Mobile-First Design System

#### Breakpoints
```typescript
// Mobile-first approach
sm: '640px'   // Small tablets
md: '768px'   // Tablets
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
```

#### Touch Targets
- Minimum: 44x44px (Apple)
- Recommended: 48x48px (Material)
- Spacing: 8px grid

#### Mobile Patterns
1. **Bottom Navigation** - Thumb-reachable
2. **Pull to Refresh** - Native feel
3. **Swipe Actions** - Quick actions
4. **Bottom Sheets** - Modals
5. **Floating Action Button** - Primary CTA

---

## React Native Architecture (Future)

### Tech Stack
```
React Native
├── Navigation: React Navigation v6
├── State: Zustand + React Query
├── UI: React Native Paper
├── Animations: React Native Reanimated
├── Maps: React Native Maps
├── Push: Firebase Cloud Messaging
├── Storage: AsyncStorage + MMKV
├── Images: FastImage
└── Offline: NetInfo + WatermelonDB
```

### Shared Code Strategy
```
shared/
├── api/           # API clients (shared)
├── types/         # TypeScript types
├── utils/         # Utilities
├── constants/     # Constants
└── hooks/         # Custom hooks
```

### Module Organization
```
mobile/
├── src/
│   ├── screens/      # Screen components
│   ├── components/   # Shared components
│   ├── navigation/   # Navigation config
│   ├── services/     # Native services
│   ├── store/        # State management
│   ├── hooks/        # Custom hooks
│   ├── utils/        # Utilities
│   └── constants/    # App constants
├── ios/              # iOS native code
├── android/          # Android native code
└── shared/           # Symlink to shared/
```

---

## API Design for Mobile

### Optimized Endpoints

#### 1. Mobile-Specific Responses
```typescript
// API returns mobile-optimized data
/api/v1/jobs?mobile=true&fields=title,company,rate

// Returns:
{
  "items": [...],
  "hasMore": true,
  "nextCursor": "abc123"
}
```

#### 2. Pagination Strategies
- **Cursor-based:** Infinite scroll
- **Page-based:** Traditional
- **Time-based:** Activity feeds

#### 3. Data Sync
```typescript
// Offline-first sync
interface SyncRequest {
  lastSync: timestamp
  tables: ['jobs', 'applications', 'messages']
}

interface SyncResponse {
  changes: Change[]
  serverTime: timestamp
}
```

---

## Push Notifications

### Architecture
```
Push Flow:
1. Device registers with FCM/APNs
2. Token sent to backend
3. Backend stores token
4. Event triggers notification
5. FCM/APNs delivers
6. Device displays notification
```

### Notification Types
| Type | Priority | Action |
|------|----------|--------|
| New Job Match | High | Open Job |
| Application Update | High | Open Application |
| Message | High | Open Chat |
| Payment Received | Medium | Open Earnings |
| Course Reminder | Low | Open Course |

### Deep Linking
```
maiki://job/123
maiki://chat/456
maiki://profile/789
```

---

## Offline Support

### Strategies

#### 1. Cache First
```typescript
// Jobs list - show cache, refresh in background
const { data } = useQuery({
  queryKey: ['jobs'],
  queryFn: fetchJobs,
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

#### 2. Optimistic Updates
```typescript
// Apply immediately, sync in background
const mutation = useMutation({
  mutationFn: applyToJob,
  onMutate: async (newApplication) => {
    // Update cache immediately
    queryClient.setQueryData(['applications'], (old) => [...old, newApplication])
  },
})
```

#### 3. Background Sync
```typescript
// Queue when offline, sync when online
navigator.serviceWorker.ready.then(registration => {
  registration.sync.register('sync-applications')
})
```

---

## Performance Targets

### PWA
| Metric | Target | Tool |
|--------|--------|------|
| FCP | < 1.8s | Lighthouse |
| LCP | < 2.5s | Lighthouse |
| TTI | < 3.8s | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| TBT | < 200ms | Lighthouse |

### Native
| Metric | Target |
|--------|--------|
| App Launch | < 2s |
| Screen Transition | < 300ms |
| API Response | < 500ms |
| Image Load | < 1s |

---

## Testing Strategy

### PWA Testing
- **Lighthouse:** Automated audits
- **Device Testing:** Physical devices
- **BrowserStack:** Cross-browser
- **Network Throttling:** 3G simulation

### Native Testing
- **Unit:** Jest
- **Integration:** Detox
- **E2E:** Appium
- **Performance:** Flipper

---

## Deployment

### PWA
```bash
# Automatic with Vercel
vercel --prod
```

### Native
```bash
# iOS
fastlane ios beta
fastlane ios release

# Android
fastlane android beta
fastlane android release
```

---

## Migration Path

### Phase 1: PWA (Now)
- ✅ Full-featured web app
- ✅ Installable
- ✅ Offline support

### Phase 2: Hybrid (Month 6)
- PWA with native shell
- Critical flows in native
- WebView for rest

### Phase 3: Native (Month 12)
- Full React Native app
- Feature parity
- App store presence

---

## Resources

### Tools
- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)

### Documentation
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [React Native Navigation](https://reactnavigation.org/)
