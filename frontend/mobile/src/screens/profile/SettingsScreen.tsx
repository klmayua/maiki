import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, List, Switch, Divider, useTheme } from 'react-native-paper';
import { useThemeContext } from '../../context/ThemeContext';

export default function SettingsScreen() {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.title}>Settings</Text>

      <List.Section>
        <List.Item
          title="Dark Mode"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => <Switch value={isDarkMode} onValueChange={toggleTheme} />}
        />
        <Divider />
        <List.Item
          title="Notifications"
          left={props => <List.Icon {...props} icon="bell" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="Privacy"
          left={props => <List.Icon {...props} icon="shield" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="Help & Support"
          left={props => <List.Icon {...props} icon="help-circle" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </List.Section>

      <Text variant="bodySmall" style={styles.version}>
        Version 1.0.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  version: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 24,
  },
});