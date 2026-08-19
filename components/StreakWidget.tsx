import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';
import { AnimatedNumber } from './AnimatedNumber';
import { SparkCard } from './SparkCard';
import { spacing, typography } from '../theme';

interface StreakWidgetProps {
  current: number;
  longest?: number;
  label?: string;
}

export function StreakWidget({ current, longest, label = 'Streak' }: StreakWidgetProps) {
  const { colors } = useTheme();
  const isHot = current > 0;

  return (
    <SparkCard style={[styles.card, { backgroundColor: isHot ? colors.card : colors.background, borderColor: colors.border }]}>
      <View style={styles.row}>
        <Ionicons name="flame" size={28} color={isHot ? colors.accent : colors.muted} />
        <View style={styles.text}>
          <AnimatedNumber value={current} style={[styles.value, { color: isHot ? colors.accent : colors.muted }]} />
          <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
        </View>
      </View>
      {longest !== undefined && longest > 0 ? (
        <Text style={[styles.best, { color: colors.muted }]}>Best: {longest} days</Text>
      ) : null}
    </SparkCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1 },
  value: { ...typography.heading, fontSize: 22 },
  label: { ...typography.caption },
  best: { ...typography.caption, textAlign: 'right' },
});
