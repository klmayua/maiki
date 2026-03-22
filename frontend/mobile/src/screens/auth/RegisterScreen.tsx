import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useAuthContext } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/NavigationTypes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const theme = useTheme();
  const { register } = useAuthContext();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'va' | 'client' | 'both'>('va');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register({ firstName, lastName, email, password, role });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>Create Account</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Join Maiki and connect with top VAs and clients
          </Text>
        </div>

        <View style={styles.form}>
          {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

          <TextInput
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
          />

          <Text variant="titleSmall" style={styles.roleLabel}>I want to:</Text>
          <RadioButton.Group onValueChange={(value) => setRole(value as any)} value={role}>
            <View>
              <RadioButton.Item label="Work as a VA" value="va" />
              <RadioButton.Item label="Hire VAs" value="client" />
              <RadioButton.Item label="Both" value="both" />
            </div>
          </RadioButton.Group>

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.registerButton}
          >
            Create Account
          </Button>

          <Button mode="text" onPress={() => navigation.navigate('Login')}>
            Already have an account? Sign In
          </Button>
        </div>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  input: {
    marginBottom: 8,
  },
  error: {
    textAlign: 'center',
    marginBottom: 8,
  },
  roleLabel: {
    marginTop: 8,
    fontWeight: '600',
  },
  registerButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
