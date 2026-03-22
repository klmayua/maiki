import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, useTheme, ProgressBar } from 'react-native-paper';

export default function SkillGapScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.title}>Skill Analysis</Text>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium" style={{ marginBottom: 12 }}>Current Progress</Text>
          <ProgressBar progress={0.6} color={theme.colors.primary} />
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