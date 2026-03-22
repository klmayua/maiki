import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, useTheme, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function JobDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>Job Title</Text>
          <Text variant="bodyMedium" style={styles.description}>
            Job description would appear here with full details about the position, requirements, and compensation.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => {}} mode="contained">Apply Now</Button>
        </Card.Actions>
      </Card>
    </div>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    opacity: 0.7,
  },
});
