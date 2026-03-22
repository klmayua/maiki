import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Avatar, Card, List, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../../context/AuthContext';

export default function ProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { user, logout } = useAuthContext();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={user?.firstName?.[0] || 'U'}
          style={{ backgroundColor: theme.colors.primary }}
        />
        <Text variant="headlineSmall" style={styles.name}>
          {user ? `${user.firstName} ${user.lastName}` : 'User'}
        </Text>
        <Text variant="bodyMedium" style={styles.email}>
          {user?.email || 'email@example.com'}
        </Text>
      </div>

      <List.Section>
        <List.Item
          title="Edit Profile"
          left={props => <List.Icon {...props} icon="account-edit" />}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <List.Item
          title="My Skills"
          left={props => <List.Icon {...props} icon="star" />}
          onPress={() => navigation.navigate('Skills')}
        />
        <List.Item
          title="Portfolio"
          left={props => <List.Icon {...props} icon="briefcase" />}
          onPress={() => navigation.navigate('Portfolio')}
        />
        <List.Item
          title="Wallet"
          left={props => <List.Icon {...props} icon="wallet" />}
          onPress={() => navigation.navigate('Wallet')}
        />
        <List.Item
          title="Settings"
          left={props => <List.Icon {...props} icon="cog" />}
          onPress={() => navigation.navigate('Settings')}
        />
      </List.Section>

      <Button mode="outlined" onPress={logout} style={styles.logoutButton}>
        Log Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
  },
  name: {
    fontWeight: 'bold',
    marginTop: 16,
  },
  email: {
    opacity: 0.7,
    marginTop: 4,
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
  },
});