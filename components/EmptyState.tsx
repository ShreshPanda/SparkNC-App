import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { radius, spacing, typography } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { SparkButton } from './SparkButton';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, icon = 'cube-outline', actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconPill, { backgroundColor: colors.surfaceSubtle }]}>
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
      {actionLabel && onAction ? (
        <SparkButton title={actionLabel} onPress={onAction} variant="primary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  iconPill: {
    padding: spacing.lg,
    borderRadius: radius.xxl,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title2,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    textAlign: 'center',
  },
});
