import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Chip, useTheme, Button } from 'react-native-paper';

export default function SkillsScreen() {
  const theme = useTheme();
  const skills = ['React', 'TypeScript', 'Node.js', 'Communication'];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.title}>My Skills</Text>

      <View style={styles.skillsContainer}>
        {skills.map((skill) => (
          <Chip key={skill} style={styles.chip}>{skill}</Chip>
        ))}
      </View>

      <Button mode="outlined" onPress={() => {}} style={styles.button}>
        Add Skill
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: 'bold', marginBottom: 16 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { marginBottom: 8 },
  button: { marginTop: 24 },
});