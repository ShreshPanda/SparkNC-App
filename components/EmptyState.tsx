import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { spacing, typography } from '../theme';
import { Ionicons } from '@expo/vector-icons';

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
      <View style={[styles.iconPill, { backgroundColor: colors.border }]}>
        <Ionicons name={icon} size={32} color={colors.accent} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={[styles.button, { backgroundColor: colors.accent }]} accessibilityRole="button" accessibilityLabel={actionLabel}>
          <Text style={[styles.buttonText, { color: colors.foreground }]}>{actionLabel}</Text>
        </Pressable>
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
    padding: spacing.md,
    borderRadius: 999,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.heading,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  buttonText: {
    ...typography.body,
    fontWeight: '700',
  },
});
