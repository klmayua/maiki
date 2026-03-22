import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, TextInput, Button, useTheme } from 'react-native-paper';

export default function ApplyScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.title}>Apply for Job</Text>
      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Cover Letter"
            multiline
            numberOfLines={6}
            mode="outlined"
            style={styles.input}
          />
          <Button mode="contained" onPress={() => {}} style={styles.button}>
            Submit Application
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  card: { marginBottom: 16 },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
});