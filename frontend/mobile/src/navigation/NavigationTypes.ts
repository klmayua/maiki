import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Onboarding: undefined;
  VerifyEmail: { token: string };
  ResetPassword: { token: string };
};

// Main Tabs
export type MainTabParamList = {
  Home: undefined;
  Jobs: NavigatorScreenParams<JobsStackParamList>;
  Matching: NavigatorScreenParams<MatchingStackParamList>;
  Chat: NavigatorScreenParams<ChatStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Jobs Stack
export type JobsStackParamList = {
  JobsList: { filters?: JobFilters };
  JobDetail: { jobId: string };
  Apply: { jobId: string };
  MyApplications: undefined;
  SavedJobs: undefined;
};

// Matching Stack
export type MatchingStackParamList = {
  MatchingHome: undefined;
  MatchDetail: { matchId: string };
  SkillGap: { skillId: string };
  AIMatchChat: { matchId: string };
};

// Chat Stack
export type ChatStackParamList = {
  ChatList: undefined;
  ChatDetail: { conversationId: string; userId?: string };
  NewChat: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Skills: undefined;
  Portfolio: undefined;
  Wallet: undefined;
  Settings: undefined;
  Notifications: undefined;
  PaymentMethods: undefined;
};

// Root Stack (includes modals)
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Search: undefined;
  Filters: { currentFilters: JobFilters };
  Payment: { intentId: string; amount: number };
  Withdraw: { balance: number };
  NotificationSettings: undefined;
};

// Filters type
export interface JobFilters {
  categories?: string[];
  minBudget?: number;
  maxBudget?: number;
  hourlyOnly?: boolean;
  remoteOnly?: boolean;
  skills?: string[];
  experienceLevel?: string;
  sortBy?: 'newest' | 'budget_high' | 'budget_low' | 'relevance';
}

// User type (simplified for navigation)
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'va' | 'client' | 'both';
  tier: string;
  isVerified: boolean;
}

// Job type (simplified for navigation)
export interface Job {
  id: string;
  title: string;
  description: string;
  budget?: { min: number; max: number };
  hourlyRate?: { min: number; max: number };
  skills: string[];
  location: string;
  postedAt: string;
  client: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
}

// Chat types
export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
}

// Match types
export interface Match {
  id: string;
  jobId: string;
  jobTitle: string;
  score: number;
  reason: string;
  skills: string[];
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
