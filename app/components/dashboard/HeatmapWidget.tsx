import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, typography } from '../../theme';

interface HeatmapWidgetProps {
  title?: string;
  weeks?: { days: number[] }[];
}

export function HeatmapWidget({ title = 'Consistency', weeks = [] }: HeatmapWidgetProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {title ? <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text> : null}
      <View style={styles.grid}>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.week}>
            {week.days.map((level, di) => (
              <View
                key={di}
                style={[
                  styles.day,
                  {
                    backgroundColor:
                      level === 0 ? colors.muted : level < 3 ? `${colors.accent}40` : colors.accent,
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, borderRadius: 20, borderWidth: 1, gap: spacing.sm },
  title: { ...typography.heading },
  grid: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  week: { gap: spacing.xs },
  day: { width: 14, height: 14, borderRadius: 4 },
});
