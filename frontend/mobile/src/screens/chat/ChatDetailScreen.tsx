import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, TextInput, IconButton, useTheme } from 'react-native-paper';

export default function ChatDetailScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="titleLarge">AI Assistant</Text>
      </View>

      <View style={styles.messages}>
        <Text variant="bodyMedium" style={styles.placeholder}>
          Chat messages will appear here
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          placeholder="Type a message..."
          style={styles.input}
          right={<IconButton icon="send" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  messages: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    opacity: 0.5,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    backgroundColor: 'transparent',
  },
});