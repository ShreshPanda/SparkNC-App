import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, typography } from '../../theme';

export default function DashboardScreen() {
  const { colors } = useTheme();

  return (
    <AppShell title="Dashboard">
      <View style={styles.card}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Your command center</Text>
        <Text style={[styles.body, { color: colors.muted }]}>Track tasks, goals, messages, and community momentum from one refined experience.</Text>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: 20, backgroundColor: '#ffffff', gap: spacing.sm },
  heading: { ...typography.heading },
  body: { ...typography.body },
});
