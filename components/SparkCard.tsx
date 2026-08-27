import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { radius, shadows, spacing } from '../theme';

type SparkCardVariant = 'elevated' | 'grouped' | 'flat' | 'hero' | 'glass';

export function SparkCard({
  children,
  style,
  variant = 'elevated',
  ...rest
}: ViewProps & { variant?: SparkCardVariant }) {
  const { colors } = useTheme();
  const isFlat = variant === 'flat';
  const isHero = variant === 'hero';

  return (
    <View
      style={[
        styles.base,
        styles[variant],
        {
          backgroundColor: isFlat ? 'transparent' : isHero ? colors.primary : colors.card,
          borderColor: isFlat ? 'transparent' : colors.border,
        },
        (variant === 'elevated' || variant === 'hero') && shadows.sm,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1, padding: spacing.lg, gap: spacing.sm },
  elevated: { borderRadius: radius.xl },
  grouped: { borderRadius: radius.lg, padding: 0, gap: 0, overflow: 'hidden' },
  flat: { borderRadius: 0, padding: 0, borderWidth: 0, gap: spacing.sm },
  hero: { borderRadius: radius.xxl, padding: spacing.xl, gap: spacing.md },
  glass: { borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1 },
});
