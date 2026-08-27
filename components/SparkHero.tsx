// SparkNC Hero
// A reusable hero surface for greetings, labels, and insight CTAs.

import React from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { radius, spacing, typography } from '../theme';

interface SparkHeroProps extends ViewProps {
  overline?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'editorial' | 'immersive';
}

export function SparkHero({ overline, title, subtitle, children, variant = 'default', style, ...rest }: SparkHeroProps) {
  const { colors } = useTheme();
  const isImmersive = variant === 'immersive';

  return (
    <View
      style={[
        styles.hero,
        {
          backgroundColor: isImmersive ? colors.navy900 : 'transparent',
          padding: variant === 'editorial' ? 0 : spacing.xl,
        },
        style,
      ]}
      {...rest}
    >
      {overline ? (
        <Text style={[styles.overline, { color: colors.muted }]}>{overline}</Text>
      ) : null}
      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.sm,
    borderRadius: radius.xxl,
  },
  overline: { ...typography.caption1, textTransform: 'uppercase' },
  title: { ...typography.largeTitle },
  subtitle: { ...typography.subheadline },
});
