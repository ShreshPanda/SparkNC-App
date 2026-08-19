import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { AnimatedNumber } from './AnimatedNumber';
import { SparkCard } from './SparkCard';
import { spacing, typography } from '../theme';

interface XPWidgetProps {
  xp: number;
  nextLevel?: number;
  label?: string;
}

export function XPWidget({ xp, nextLevel, label = 'XP' }: XPWidgetProps) {
  const { colors } = useTheme();
  const progress = nextLevel && nextLevel > 0 ? Math.min(100, (xp % nextLevel) / nextLevel * 100) : 0;

  return (
    <SparkCard style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        <AnimatedNumber value={xp} style={[styles.value, { color: colors.highlight }]} suffix=" XP" />
        <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      </View>
      {nextLevel ? (
        <View style={[styles.track, { backgroundColor: colors.border }]}>
          <View style={[styles.fill, { width: `${progress}%`, backgroundColor: colors.highlight }]} />
        </View>
      ) : null}
    </SparkCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  value: { ...typography.heading, fontSize: 22 },
  label: { ...typography.caption },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%' },
});
