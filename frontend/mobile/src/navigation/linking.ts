import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { RootStackParamList } from './NavigationTypes';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'maiki://',
    'https://maiki.io',
    'https://staging.maiki.io',
    Linking.createURL('/'),
  ],

  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          VerifyEmail: 'verify-email',
          ResetPassword: 'reset-password',
        },
      },
      Main: {
        screens: {
          Home: 'home',
          Jobs: {
            screens: {
              JobsList: 'jobs',
              JobDetail: 'jobs/:jobId',
              MyApplications: 'applications',
            },
          },
          Matching: {
            screens: {
              MatchingHome: 'matching',
              MatchDetail: 'matches/:matchId',
            },
          },
          Chat: {
            screens: {
              ChatList: 'chat',
              ChatDetail: 'chat/:conversationId',
            },
          },
          Profile: {
            screens: {
              ProfileHome: 'profile',
              Settings: 'settings',
              Wallet: 'wallet',
            },
          },
        },
      },
    },
  },

  // Handle incoming links
  getInitialURL() {
    // Check if app was opened from a deep link
    return Linking.getInitialURL();
  },

  // Subscribe to incoming links
  subscribe(listener) {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });

    return () => {
      // Clean up the event listener
      subscription.remove();
    };
  },

  // Custom handler for matching paths
  getStateFromPath(path, options) {
    // Handle special cases like email verification tokens
    if (path.startsWith('verify-email')) {
      const token = path.split('?token=')[1];
      if (token) {
        return {
          routes: [
            {
              name: 'Auth',
              state: {
                routes: [
                  {
                    name: 'VerifyEmail',
                    params: { token },
                  },
                ],
              },
            },
          ],
        };
      }
    }

    // Handle password reset
    if (path.startsWith('reset-password')) {
      const token = path.split('?token=')[1];
      if (token) {
        return {
          routes: [
            {
              name: 'Auth',
              state: {
                routes: [
                  {
                    name: 'ResetPassword',
                    params: { token },
                  },
                ],
              },
            },
          ],
        };
      }
    }

    // Default handling
    return undefined;
  },
};

export { linking };
