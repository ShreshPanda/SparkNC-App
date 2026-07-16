import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, typography } from '../../theme';

export default function AdminScreen() {
  const { colors } = useTheme();

  return (
    <AppShell title="Admin">
      <View style={styles.card}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Administration tools</Text>
        <Text style={[styles.body, { color: colors.muted }]}>Role-based controls and governance workflows will be surfaced here.</Text>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: 20, backgroundColor: '#ffffff', gap: spacing.sm },
  heading: { ...typography.heading },
  body: { ...typography.body },
});
