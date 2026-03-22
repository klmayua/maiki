# Maiki Mobile App Architecture

## Overview

The Maiki mobile app is built with **React Native + Expo** to provide a native-like experience for both iOS and Android platforms while maintaining a single codebase.

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React Native 0.73+ | Cross-platform mobile development |
| Build Tool | Expo SDK 50+ | Development, build, and deployment |
| Navigation | React Navigation 6+ | Screen navigation and routing |
| State Management | Zustand | Global state management |
| Query Management | TanStack Query (React Query) | Server state, caching, syncing |
| Storage | MMKV + AsyncStorage | Local storage with encryption |
| Networking | Axios + WebSocket | API communication |
| UI Components | React Native Paper + Custom | Material Design components |
| Animations | React Native Reanimated 3 | Smooth 60fps animations |
| Forms | React Hook Form + Zod | Form handling and validation |
| Notifications | Expo Notifications | Push notifications |
| Deep Linking | Expo Linking | Universal links handling |
| Biometrics | Expo LocalAuthentication | Face/Touch ID |
| Offline | NetInfo + custom cache | Offline-first architecture |

## Project Structure

```
frontend/mobile/
├── App.tsx                    # Entry point
├── app.json                   # Expo configuration
├── package.json
├── tsconfig.json
├── src/
│   ├── api/                   # API layer
│   │   ├── client.ts          # Axios instance
│   │   ├── interceptors.ts    # Request/response interceptors
│   │   ├── endpoints/         # API endpoint definitions
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── jobs.ts
│   │   │   ├── matching.ts
│   │   │   ├── payments.ts
│   │   │   ├── chat.ts
│   │   │   └── notifications.ts
│   │   └── websocket.ts       # WebSocket client
│   │
│   ├── components/            # Reusable components
│   │   ├── ui/                # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── index.ts
│   │   ├── layout/            # Layout components
│   │   │   ├── SafeAreaView.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── TabBar.tsx
│   │   │   └── ScreenWrapper.tsx
│   │   ├── forms/             # Form components
│   │   │   ├── FormInput.tsx
│   │   │   ├── FormSelect.tsx
│   │   │   └── FormDatePicker.tsx
│   │   ├── chat/              # Chat components
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── ChatBubble.tsx
│   │   ├── matching/          # Matching components
│   │   │   ├── MatchCard.tsx
│   │   │   ├── SkillBadge.tsx
│   │   │   └── ScoreRing.tsx
│   │   └── index.ts
│   │
│   ├── screens/               # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   └── OnboardingScreen.tsx
│   │   ├── main/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── JobsScreen.tsx
│   │   │   ├── MatchingScreen.tsx
│   │   │   ├── CommunityScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── jobs/
│   │   │   ├── JobListScreen.tsx
│   │   │   ├── JobDetailScreen.tsx
│   │   │   ├── ApplyScreen.tsx
│   │   │   └── MyApplicationsScreen.tsx
│   │   ├── chat/
│   │   │   ├── ChatListScreen.tsx
│   │   │   ├── ChatDetailScreen.tsx
│   │   │   └── AIMatchChatScreen.tsx
│   │   ├── payments/
│   │   │   ├── WalletScreen.tsx
│   │   │   ├── WithdrawScreen.tsx
│   │   │   └── TransactionsScreen.tsx
│   │   ├── profile/
│   │   │   ├── EditProfileScreen.tsx
│   │   │   ├── SkillsScreen.tsx
│   │   │   ├── PortfolioScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   └── index.ts
│   │
│   ├── navigation/            # Navigation configuration
│   │   ├── NavigationTypes.ts # TypeScript types
│   │   ├── AuthNavigator.tsx  # Auth flow navigator
│   │   ├── MainNavigator.tsx    # Main tab navigator
│   │   ├── JobsNavigator.tsx    # Jobs stack navigator
│   │   ├── ChatNavigator.tsx    # Chat stack navigator
│   │   ├── RootNavigator.tsx    # Root with modals
│   │   └── linking.ts           # Deep linking config
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useUser.ts
│   │   ├── useJobs.ts
│   │   ├── useMatching.ts
│   │   ├── useChat.ts
│   │   ├── useNotifications.ts
│   │   ├── usePayments.ts
│   │   ├── useNetworkStatus.ts
│   │   ├── useBiometric.ts
│   │   └── useRefreshOnFocus.ts
│   │
│   ├── stores/                # Zustand stores
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   ├── jobsStore.ts
│   │   ├── matchingStore.ts
│   │   ├── chatStore.ts
│   │   ├── uiStore.ts
│   │   └── index.ts
│   │
│   ├── context/               # React contexts
│   │   ├── ThemeContext.tsx
│   │   ├── NotificationContext.tsx
│   │   └── WebSocketContext.tsx
│   │
│   ├── services/              # Business logic services
│   │   ├── authService.ts
│   │   ├── matchingService.ts
│   │   ├── notificationService.ts
│   │   ├── storageService.ts
│   │   ├── syncService.ts
│   │   └── aiService.ts
│   │
│   ├── utils/                 # Utility functions
│   │   ├── formatters.ts      # Currency, date formatting
│   │   ├── validators.ts      # Input validation
│   │   ├── constants.ts       # App constants
│   │   ├── helpers.ts         # Helper functions
│   │   └── permissions.ts     # Permission handling
│   │
│   ├── theme/                 # Theme configuration
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── shadows.ts
│   │   └── index.ts
│   │
│   ├── types/                 # TypeScript definitions
│   │   ├── api.ts
│   │   ├── models.ts
│   │   ├── navigation.ts
│   │   └── index.ts
│   │
│   └── config/                # App configuration
│       ├── api.config.ts
│       ├── firebase.config.ts
│       └── app.config.ts
│
├── assets/                    # Static assets
│   ├── images/
│   ├── fonts/
│   ├── icons/
│   └── animations/
│
└── scripts/                   # Build scripts
    ├── build-ios.sh
    ├── build-android.sh
    └── generate-icons.js
```

## Navigation Architecture

### Navigator Hierarchy

```
RootNavigator (Stack)
├── AuthNavigator (Stack) - when not authenticated
│   ├── LoginScreen
│   ├── RegisterScreen
│   ├── ForgotPasswordScreen
│   └── OnboardingScreen
│
├── MainNavigator (Bottom Tabs) - when authenticated
│   ├── HomeStack (Stack)
│   │   └── HomeScreen
│   │
│   ├── JobsStack (Stack)
│   │   ├── JobsListScreen
│   │   ├── JobDetailScreen
│   │   ├── ApplyScreen
│   │   └── MyApplicationsScreen
│   │
│   ├── MatchingStack (Stack)
│   │   ├── MatchingScreen
│   │   ├── MatchDetailScreen
│   │   └── SkillGapScreen
│   │
│   ├── ChatStack (Stack)
│   │   ├── ChatListScreen
│   │   ├── ChatDetailScreen
│   │   └── AIMatchChatScreen
│   │
│   └── ProfileStack (Stack)
│       ├── ProfileScreen
│       ├── EditProfileScreen
│       ├── SkillsScreen
│       ├── PortfolioScreen
│       ├── WalletScreen
│       └── SettingsScreen
│
├── ModalScreens (Stack.Modal)
│   ├── SearchModal
│   ├── FiltersModal
│   ├── PaymentModal
│   └── NotificationSettingsModal
```

### Deep Linking Structure

| Route | Path | Description |
|-------|------|-------------|
| Job Detail | `maiki://jobs/:id` | Open specific job |
| Chat | `maiki://chat/:id` | Open chat conversation |
| Profile | `maiki://profile/:id` | View user profile |
| Payment | `maiki://payment/:intentId` | Complete payment |
| Verify Email | `maiki://verify-email?token=:token` | Email verification |
| Reset Password | `maiki://reset-password?token=:token` | Password reset |

## State Management

### Zustand Store Pattern

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  updateToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/auth/login', { email, password });
          set({
            user: response.data.user,
            token: response.data.access_token,
            isAuthenticated: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),
      updateToken: (token) => set({ token }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (key) => storage.getString(key) || null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      })),
    }
  )
);
```

## Offline-First Architecture

### Sync Strategy

1. **Optimistic Updates**: UI updates immediately, syncs in background
2. **Queue Pattern**: Failed requests are queued and retried
3. **Conflict Resolution**: Server wins, notify user of changes
4. **Selective Sync**: Only sync what's needed based on user actions

### Implementation

```typescript
// services/syncService.ts
class SyncService {
  private queue: SyncOperation[] = [];
  private isOnline: boolean = true;

  async queueOperation(operation: SyncOperation) {
    this.queue.push(operation);
    await this.persistQueue();

    if (this.isOnline) {
      await this.processQueue();
    }
  }

  async processQueue() {
    while (this.queue.length > 0) {
      const operation = this.queue[0];
      try {
        await this.executeOperation(operation);
        this.queue.shift();
        await this.persistQueue();
      } catch (error) {
        // Retry with exponential backoff
        break;
      }
    }
  }

  private async persistQueue() {
    await AsyncStorage.setItem('syncQueue', JSON.stringify(this.queue));
  }
}
```

## Security

### Authentication Flow

1. **Login**: JWT tokens with refresh token rotation
2. **Biometric**: Optional Face ID / Touch ID for app unlock
3. **Secure Storage**: Tokens in MMKV encrypted storage
4. **Certificate Pinning**: SSL pinning for API calls

### Data Protection

```typescript
// services/storageService.ts
import { MMKV } from 'react-native-mmkv';
import * as Crypto from 'expo-crypto';

const storage = new MMKV({
  id: 'maiki-secure',
  encryptionKey: getEncryptionKey(), // Hardware-backed when available
});

export const secureStorage = {
  set: (key: string, value: string) => {
    storage.set(key, value);
  },
  get: (key: string): string | null => {
    return storage.getString(key) || null;
  },
  delete: (key: string) => {
    storage.delete(key);
  },
  clear: () => {
    storage.clearAll();
  },
};
```

## Real-Time Features

### WebSocket Connection

```typescript
// context/WebSocketContext.tsx
interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  send: (message: any) => void;
  subscribe: (channel: string, callback: (data: any) => void) => void;
}

export const WebSocketProvider: React.FC = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptions = useRef(new Map());

  useEffect(() => {
    const ws = new WebSocket(`wss://api.maiki.io/ws`);

    ws.onopen = () => {
      setIsConnected(true);
      // Authenticate
      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const callbacks = subscriptions.current.get(data.channel) || [];
      callbacks.forEach((cb: any) => cb(data));
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Reconnect with backoff
    };

    setSocket(ws);
    return () => ws.close();
  }, [token]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, send, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};
```

## Performance Optimization

### Techniques

1. **Code Splitting**: Lazy load screens
2. **Image Optimization**: Expo Image with caching
3. **List Virtualization**: FlashList for long lists
4. **Memoization**: React.memo for expensive components
5. **Background Tasks**: expo-task-manager for sync

```typescript
// Lazy load screens
const JobsScreen = React.lazy(() => import('./screens/jobs/JobsScreen'));

// FlashList for performance
import { FlashList } from "@shopify/flash-list";

<FlashList
  data={jobs}
  renderItem={renderJobItem}
  estimatedItemSize={100}
  onEndReached={loadMore}
/>
```

## Build Configuration

### Environment Management

```typescript
// config/app.config.ts
const ENV = {
  dev: {
    API_URL: 'http://localhost:8000',
    WS_URL: 'ws://localhost:8000/ws',
  },
  staging: {
    API_URL: 'https://staging-api.maiki.io',
    WS_URL: 'wss://staging-api.maiki.io/ws',
  },
  production: {
    API_URL: 'https://api.maiki.io',
    WS_URL: 'wss://api.maiki.io/ws',
  },
};

export const config = ENV[process.env.APP_ENV || 'dev'];
```

## Testing Strategy

### Structure

```
__tests__/
├── unit/
│   ├── components/
│   ├── hooks/
│   ├── stores/
│   └── utils/
├── integration/
│   ├── api/
│   └── navigation/
└── e2e/
    ├── auth/
    ├── jobs/
    └── payments/
```

### Tools

- **Unit**: Jest + React Native Testing Library
- **E2E**: Detox
- **Visual**: Storybook

## Deployment

### App Store / Play Store

1. **CI/CD**: GitHub Actions → EAS Build
2. **Code Signing**: Automatic with EAS
3. **OTA Updates**: Expo Updates for hotfixes
4. **Beta Testing**: TestFlight / Play Console

```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

## Feature Roadmap

### Phase 1: MVP (Core Features)
- [ ] Authentication (Login/Register)
- [ ] Job browsing and search
- [ ] Basic profile management
- [ ] Push notifications
- [ ] Chat with AI assistant

### Phase 2: Matching & Applications
- [ ] AI-powered job matching
- [ ] Application flow
- [ ] Skills assessment
- [ ] Portfolio showcase

### Phase 3: Payments & Contracts
- [ ] Wallet integration
- [ ] Payment processing
- [ ] Contract management
- [ ] Time tracking

### Phase 4: Community & Advanced
- [ ] Guild/community features
- [ ] Video calls
- [ ] Advanced analytics
- [ ] Offline mode
