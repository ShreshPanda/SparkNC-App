// SparkNC Badge
// Small status or category pill.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { radius, spacing, typography } from '../theme';

interface SparkBadgeProps {
  label: string;
  color?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  size?: 'sm' | 'md';
}

export function SparkBadge({ label, color, icon, size = 'md' }: SparkBadgeProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.primary;
  const backgroundColor = `${tint}15`;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor },
        size === 'sm' && styles.badgeSmall,
      ]}
    >
      {icon ? <Ionicons name={icon} size={12} color={tint} /> : null}
      <Text style={[styles.text, { color: tint }, size === 'sm' && styles.textSmall]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  text: { ...typography.caption1 },
  textSmall: { ...typography.caption2 },
});
