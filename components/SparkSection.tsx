// SparkNC Section
// iOS-style grouped section with an optional header.

import React from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { spacing, typography } from '../theme';

interface SparkSectionProps extends ViewProps {
  title?: string;
  children: React.ReactNode;
  inset?: boolean;
}

export function SparkSection({ title, children, inset = true, style, ...rest }: SparkSectionProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.section,
        { paddingHorizontal: inset ? spacing.lg : 0 },
        style,
      ]}
      {...rest}
    >
      {title ? <Text style={[styles.title, { color: colors.muted }]}>{title}</Text> : null}
      <View style={{ gap: spacing.sm }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.caption1,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
});
