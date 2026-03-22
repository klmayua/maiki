import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setIsLoading(true);
    // API call would go here
    setTimeout(() => {
      setIsLoading(false);
      setSent(true);
    }, 1000);
  };

  if (sent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="headlineMedium" style={styles.successTitle}>
          Check your email
        </Text>
        <Text variant="bodyMedium" style={styles.successText}>
          We've sent password reset instructions to {email}
        </Text>
      </div>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text variant="headlineMedium" style={styles.title}>
        Reset Password
      </Text>

      <Text variant="bodyMedium" style={styles.description}>
        Enter your email address and we'll send you instructions to reset your password.
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        mode="outlined"
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading || !email}
        style={styles.button}
      >
        Send Instructions
      </Button>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    paddingVertical: 8,
  },
  successTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  successText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
