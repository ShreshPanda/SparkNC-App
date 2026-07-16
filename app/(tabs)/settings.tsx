import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, typography } from '../../theme';

export default function SettingsScreen() {
  const { colors } = useTheme();

  return (
    <AppShell title="Settings">
      <View style={styles.card}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Preferences</Text>
        <Text style={[styles.body, { color: colors.muted }]}>Appearance, permissions, and account controls will live here.</Text>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: 20, backgroundColor: '#ffffff', gap: spacing.sm },
  heading: { ...typography.heading },
  body: { ...typography.body },
});
