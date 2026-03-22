import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatStackParamList } from './NavigationTypes';

import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatDetailScreen from '../screens/chat/ChatDetailScreen';

const Stack = createNativeStackNavigator<ChatStackParamList>();

export function ChatNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen
        name="ChatDetail"
        component={ChatDetailScreen}
        options={{ title: 'Chat' }}
      />
    </Stack.Navigator>
  );
}
