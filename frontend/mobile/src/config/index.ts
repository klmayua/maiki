import Constants from 'expo-constants';

const ENV = {
  dev: {
    API_URL: 'http://localhost:8000/api/v1',
    WS_URL: 'ws://localhost:8000/ws',
    ENVIRONMENT: 'development',
  },
  staging: {
    API_URL: 'https://staging-api.maiki.io/api/v1',
    WS_URL: 'wss://staging-api.maiki.io/ws',
    ENVIRONMENT: 'staging',
  },
  production: {
    API_URL: 'https://api.maiki.io/api/v1',
    WS_URL: 'wss://api.maiki.io/ws',
    ENVIRONMENT: 'production',
  },
};

const getEnvVars = () => {
  // Check if running in EAS build
  const env = process.env.APP_ENV || 'dev';
  return ENV[env as keyof typeof ENV] || ENV.dev;
};

export const config = getEnvVars();
