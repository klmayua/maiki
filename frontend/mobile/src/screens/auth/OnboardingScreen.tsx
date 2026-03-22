import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/NavigationTypes';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const theme = useTheme();
  const navigation = useNavigation<OnboardingScreenNavigationProp>();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.iconPlaceholder}>
          <Text style={styles.iconText}>✨</Text>
        </div>

        <Text variant="headlineLarge" style={styles.title}>
          Maiki
        </Text>

        <Text variant="headlineSmall" style={styles.subtitle}>
          The Virtual Assistant OS
        </Text>

        <Text variant="bodyLarge" style={styles.description}>
          Connect with top virtual assistants and clients. Powered by AI for better matches and smarter work.
        </Text>
      </div>

      <View style={styles.buttons}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Register')}
          style={styles.button}
        >
          Get Started
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        >
          I already have an account
        </Button>
      </div>
    </div>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 60,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.8,
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    opacity: 0.6,
    maxWidth: 300,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 8,
  },
});
