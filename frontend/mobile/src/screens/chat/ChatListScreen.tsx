import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, useTheme, List } from 'react-native-paper';

export default function ChatListScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.title}>Messages</Text>
      <Card style={styles.card}>
        <List.Item
          title="AI Assistant"
          description="How can I help you today?"
          left={props => <List.Icon {...props} icon="robot" />}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  card: { marginBottom: 12 },
});