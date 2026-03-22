import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, useTheme, List } from 'react-native-paper';

export default function WalletScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.title}>Wallet</Text>

      <Card style={styles.balanceCard}>
        <Card.Content>
          <Text variant="bodyMedium">Available Balance</Text>
          <Text variant="headlineLarge" style={styles.balance}>$0.00</Text>
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={() => {}} style={styles.button}>
        Withdraw
      </Button>

      <Text variant="titleMedium" style={styles.sectionTitle}>Recent Transactions</Text>

      <Card>
        <List.Item
          title="No transactions yet"
          description="Your transaction history will appear here"
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  balanceCard: {
    backgroundColor: '#8b5cf6',
    marginBottom: 16,
  },
  balance: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
  },
  button: { marginBottom: 24 },
  sectionTitle: { marginBottom: 12 },
});