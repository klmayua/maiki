import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JobsStackParamList } from './NavigationTypes';

import JobsListScreen from '../screens/jobs/JobsListScreen';
import JobDetailScreen from '../screens/jobs/JobDetailScreen';
import ApplyScreen from '../screens/jobs/ApplyScreen';
import MyApplicationsScreen from '../screens/jobs/MyApplicationsScreen';

const Stack = createNativeStackNavigator<JobsStackParamList>();

export function JobsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="JobsList"
        component={JobsListScreen}
        options={{ title: 'Find Jobs' }}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: 'Job Details' }}
      />
      <Stack.Screen
        name="Apply"
        component={ApplyScreen}
        options={{ title: 'Apply', presentation: 'modal' }}
      />
      <Stack.Screen
        name="MyApplications"
        component={MyApplicationsScreen}
        options={{ title: 'My Applications' }}
      />
    </Stack.Navigator>
  );
}
