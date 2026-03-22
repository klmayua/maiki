import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';

export default function PortfolioScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.title}>Portfolio</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium">Your portfolio items will appear here</Text>
        </Card.Content>
      </Card>

      <Button mode="outlined" onPress={() => {}} style={styles.button}>
        Add Portfolio Item
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  card: { marginBottom: 16 },
  button: { marginTop: 8 },
});