import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, typography } from '../../theme';

interface StatsWidgetProps {
  value: number | string;
  label: string;
  trend?: number;
  accent?: 'accent' | 'highlight' | 'success' | 'foreground';
}

export function StatsWidget({ value, label, trend, accent = 'foreground' }: StatsWidgetProps) {
  const { colors } = useTheme();
  const color = colors[accent] ?? colors.foreground;
  const trendText = trend === undefined ? undefined : trend >= 0 ? `+${trend}%` : `${trend}%`;
  const trendColor = trend === undefined ? undefined : trend >= 0 ? colors.success : colors.error;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      {trendText && trendColor ? (
        <Text style={[styles.trend, { color: trendColor }]}>{trendText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 100, padding: spacing.md, borderRadius: 20, borderWidth: 1, gap: spacing.xs },
  value: { ...typography.title },
  label: { ...typography.caption },
  trend: { ...typography.caption, fontWeight: '600' },
});
