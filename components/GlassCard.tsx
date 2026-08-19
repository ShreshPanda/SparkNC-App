import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { radius, shadows, spacing, spark } from '../theme';

type GlassCardProps = ViewProps & { intensity?: 'low' | 'medium' | 'high' };

export function GlassCard({ children, style, intensity = 'medium', ...rest }: GlassCardProps) {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';

  const alpha = intensity === 'high' ? 0.92 : intensity === 'low' ? 0.65 : 0.8;
  const bgBase = isDark ? [20, 26, 46] : [255, 255, 255];
  const backgroundColor = `rgba(${bgBase[0]}, ${bgBase[1]}, ${bgBase[2]}, ${alpha})`;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor: colors.border,
          shadowColor: spark.blue,
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
    borderRadius: radius.xxl,
    borderWidth: 1,
    padding: spacing.xl,
    ...shadows.md,
    overflow: 'hidden',
  },
});
