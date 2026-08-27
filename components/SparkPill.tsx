// SparkNC Pill
// A quick-action or category pill with a toggle/press feel.

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { radius, spacing, typography } from '../theme';

interface SparkPillProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export function SparkPill({ label, active, onPress, disabled }: SparkPillProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.pill,
        { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active, disabled: !!disabled }}
    >
      <Text style={[styles.text, { color: active ? colors.surface : colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { ...typography.footnote },
});
