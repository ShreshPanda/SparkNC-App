import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FadeIn } from './AnimatedWrapper';
import { useTheme } from '../providers/ThemeProvider';
import { spacing, typography } from '../theme';

export type SparkInsight = {
  message: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

type TodaysSparkProps = {
  insights?: SparkInsight[];
};

export function TodaysSpark({ insights }: TodaysSparkProps) {
  const { colors } = useTheme();
  const items = insights?.length ? insights : fallbackInsights();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(id);
  }, [items.length]);

  const active = items[index] ?? items[0];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        <Ionicons name={active.icon} size={28} color={colors.accent} />
        <Text style={[styles.label, { color: colors.muted }]}>Today&apos;s Spark</Text>
      </View>
      <FadeIn key={`${index}`} delay={50}>
        <Text style={[styles.message, { color: colors.foreground }]}>{active.message}</Text>
      </FadeIn>
    </View>
  );
}

function fallbackInsights(): SparkInsight[] {
  return [
    { message: 'You are 120 XP from your next level.', icon: 'trending-up-outline' },
    { message: 'The Robotics Club has an event tomorrow.', icon: 'calendar-outline' },
    { message: 'Three new leadership opportunities opened.', icon: 'people-outline' },
    { message: 'Complete your daily streak before 10 PM.', icon: 'flame-outline' },
  ];
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: 20, borderWidth: 1, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { ...typography.caption, textTransform: 'uppercase', letterSpacing: 0.5 },
  message: { ...typography.heading },
});
