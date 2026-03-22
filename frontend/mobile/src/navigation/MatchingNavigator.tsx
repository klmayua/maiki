import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MatchingStackParamList } from './NavigationTypes';

import MatchingScreen from '../screens/matching/MatchingScreen';
import MatchDetailScreen from '../screens/matching/MatchDetailScreen';
import SkillGapScreen from '../screens/matching/SkillGapScreen';

const Stack = createNativeStackNavigator<MatchingStackParamList>();

export function MatchingNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MatchingHome"
        component={MatchingScreen}
        options={{ title: 'AI Matches', headerShown: false }}
      />
      <Stack.Screen
        name="MatchDetail"
        component={MatchDetailScreen}
        options={{ title: 'Match Details' }}
      />
      <Stack.Screen
        name="SkillGap"
        component={SkillGapScreen}
        options={{ title: 'Skill Analysis' }}
      />
    </Stack.Navigator>
  );
}
