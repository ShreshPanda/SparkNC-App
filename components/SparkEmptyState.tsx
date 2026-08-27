// SparkNC Empty State
// Consistent, calm empty state with an optional illustration slot.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { spacing, typography } from '../theme';
import { SparkButton } from './SparkButton';

interface SparkEmptyStateProps {
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  title: string;
  message: string;
  action?: { label: string; onPress: () => void };
  actionTitle?: string;
}

export function SparkEmptyState({ icon, illustration, title, message, action, actionTitle }: SparkEmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {illustration ? (
        <View style={[styles.illustration, { backgroundColor: colors.primarySoft }]}>{illustration}</View>
      ) : icon ? (
        <View style={[styles.pill, { backgroundColor: colors.primarySoft }]}>{icon}</View>
      ) : null}
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
      {action ? (
        <SparkButton
          title={actionTitle ?? action.label}
          onPress={action.onPress}
          variant="secondary"
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  pill: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  illustration: {
    width: 112,
    height: 112,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  title: { ...typography.title2 },
  message: { ...typography.body, textAlign: 'center' },
  action: { marginTop: spacing.md },
});
