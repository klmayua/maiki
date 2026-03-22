import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthContext } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { linking } from './linking';
import { theme } from '../theme';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { user, isLoading } = useAuthContext();

  // Show loading screen while checking auth
  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer linking={linking} theme={theme.navigation}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            {/* Modal screens can be added here */}
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
