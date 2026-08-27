import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { radius, shadows, spacing } from '../theme';

type GlassCardProps = ViewProps & { intensity?: 'low' | 'medium' | 'high' };

export function GlassCard({ children, style, intensity = 'medium', ...rest }: GlassCardProps) {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.border,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
});
