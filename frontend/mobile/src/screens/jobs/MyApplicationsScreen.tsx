import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';

export default function MyApplicationsScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.title}>My Applications</Text>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium">No applications yet</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  card: { marginBottom: 12 },
});