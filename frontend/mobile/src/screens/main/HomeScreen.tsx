import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, useTheme, Avatar } from 'react-native-paper';
import { useAuthContext } from '../../context/AuthContext';

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuthContext();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.welcome}>
          <Text variant="headlineSmall" style={styles.greeting}>
            Good morning,
          </Text>
          <Text variant="titleLarge" style={styles.name}>
            {user?.firstName || 'Guest'}!
          </Text>
        </View>
        <Avatar.Icon
          size={48}
          icon="account"
          style={{ backgroundColor: theme.colors.primaryContainer }}
        />
      </div>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Ready to find your next opportunity?</Text>
          <Text variant="bodyMedium" style={styles.cardText}>
            AI has found 3 new job matches for you today.
          </Text>
          <Button
            mode="contained"
            onPress={() => {}}
            style={styles.button}
          >
            View Matches
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Recent Activity</Text>
        <Card style={styles.activityCard}>
          <Card.Content>
            <Text variant="bodyMedium">No recent activity</Text>
          </Card.Content>
        </Card>
      </div>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  welcome: {
    flex: 1,
  },
  greeting: {
    opacity: 0.7,
  },
  name: {
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  cardText: {
    marginVertical: 12,
    opacity: 0.7,
  },
  button: {
    marginTop: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  activityCard: {
    marginBottom: 8,
  },
});
