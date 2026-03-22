import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useAuthContext } from '../../context/AuthContext';

export default function EditProfileScreen() {
  const theme = useTheme();
  const { user, updateUser } = useAuthContext();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  const handleSave = () => {
    // API call would go here
    updateUser({ ...user, firstName, lastName } as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.title}>Edit Profile</Text>

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

      <Button mode="contained" onPress={handleSave} style={styles.button}>
        Save Changes
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: 'bold', marginBottom: 24 },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
});