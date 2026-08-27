import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { radius, spacing, typography } from '../theme';
import { AnimatedNumber } from './AnimatedNumber';

type SparkMetricSize = 'default' | 'large' | 'small';

type SparkMetricProps = {
  label: string;
  value: number;
  suffix?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  size?: SparkMetricSize;
  style?: StyleProp<ViewStyle>;
};

export function SparkMetric({ label, value, suffix = '', icon, color, trend, size = 'default', style }: SparkMetricProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.primary;
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  const trendColor = trend === 'up' ? colors.success : trend === 'down' ? colors.error : colors.muted;
  const trendIcon = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove';

  return (
    <View
      style={[
        styles.metric,
        { backgroundColor: colors.card, borderColor: colors.border },
        isLarge && styles.metricLarge,
        isSmall && styles.metricSmall,
        style,
      ]}
    >
      {icon ? (
        <View style={[styles.iconPill, { backgroundColor: `${tint}15` }]}>
          <Ionicons name={icon} size={isSmall ? 16 : 22} color={tint} />
        </View>
      ) : null}
      <AnimatedNumber
        value={value}
        style={[styles.value, { color: tint }, isLarge && styles.valueLarge, isSmall && styles.valueSmall]}
        suffix={suffix}
      />
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      {trend ? (
        <View style={styles.trend}>
          <Ionicons name={trendIcon} size={14} color={trendColor} />
          <Text style={[styles.trendText, { color: trendColor }]}>{trend}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  metric: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    gap: spacing.xs,
  },
  metricLarge: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    minHeight: 120,
    alignItems: 'flex-start',
  },
  metricSmall: {
    padding: spacing.sm,
    borderRadius: radius.md,
    minHeight: 64,
  },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { ...typography.metric },
  valueLarge: { ...typography.metricLarge },
  valueSmall: { ...typography.headline },
  label: { ...typography.caption1, marginTop: spacing.xs },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  trendText: { ...typography.caption1 },
});
