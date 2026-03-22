import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { MainTabParamList } from './NavigationTypes';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import { JobsNavigator } from './JobsNavigator';
import { MatchingNavigator } from './MatchingNavigator';
import { ChatNavigator } from './ChatNavigator';
import { ProfileNavigator } from './ProfileNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabBarIcon = (name: keyof typeof Ionicons.glyphMap) =>
  ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} size={size} color={color} />
  );

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: tabBarIcon('home-outline'),
          tabBarIconFocused: tabBarIcon('home'),
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsNavigator}
        options={{
          title: 'Jobs',
          tabBarIcon: tabBarIcon('briefcase-outline'),
          tabBarIconFocused: tabBarIcon('briefcase'),
        }}
      />
      <Tab.Screen
        name="Matching"
        component={MatchingNavigator}
        options={{
          title: 'Matches',
          tabBarIcon: tabBarIcon('sparkles-outline'),
          tabBarIconFocused: tabBarIcon('sparkles'),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatNavigator}
        options={{
          title: 'Chat',
          tabBarIcon: tabBarIcon('chatbubble-outline'),
          tabBarIconFocused: tabBarIcon('chatbubble'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          title: 'Profile',
          tabBarIcon: tabBarIcon('person-outline'),
          tabBarIconFocused: tabBarIcon('person'),
        }}
      />
    </Tab.Navigator>
  );
}
