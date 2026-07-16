import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, typography } from '../../theme';

export default function TasksScreen() {
  const { colors } = useTheme();

  return (
    <AppShell title="Tasks">
      <View style={styles.card}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Task queue</Text>
        <Text style={[styles.body, { color: colors.muted }]}>Upcoming work and responsibilities will appear here.</Text>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: 20, backgroundColor: '#ffffff', gap: spacing.sm },
  heading: { ...typography.heading },
  body: { ...typography.body },
});
