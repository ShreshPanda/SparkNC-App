import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SparkButton } from "../../components/SparkButton";
import { AppShell } from '../../components/AppShell';
import { FadeIn } from '../../components/AnimatedWrapper';
import { SparkCard } from '../../components/SparkCard';
import { SparkMetric } from '../../components/SparkMetric';
import { SparkListRow } from '../../components/SparkListRow';
import { SparkSection } from '../../components/SparkSection';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import type { AnalyticsOverview } from '../../shared/types';

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const [metrics, setMetrics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await cloudflareService.getAnalyticsOverview();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <AppShell title="Admin Analytics" overline="PROGRAM" mode="data">
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </AppShell>
    );
  }

  const totalStudents = metrics?.totalStudents ?? 0;
  const weeklyActive = metrics?.weeklyActiveStudents ?? 0;
  const engagementRate = totalStudents > 0 ? Math.round((weeklyActive / totalStudents) * 100) : 0;

  return (
    <AppShell title="Admin Analytics" overline="PROGRAM" mode="data">
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={[styles.body, { color: colors.error }]}>{error}</Text>}

        <FadeIn delay={0}>
          <View style={styles.hero}>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>Program overview</Text>
            <Text style={[styles.heroBody, { color: colors.muted }]}>
              {totalStudents} students · {weeklyActive} active this week · {engagementRate}% weekly engagement
            </Text>
          </View>
        </FadeIn>

        <FadeIn delay={80}>
          <SparkSection title="KEY METRICS" inset={false}>
            <View style={styles.kpiRow}>
              <SparkMetric label="Total students" value={totalStudents} icon="people-outline" color={colors.primary} />
              <SparkMetric label="Active (7d)" value={weeklyActive} icon="flame-outline" color={colors.success} />
              <SparkMetric label="Active (24h)" value={metrics?.dailyActiveStudents ?? 0} icon="pulse-outline" color={colors.info} />
              <SparkMetric label="Tasks" value={metrics?.totalTasksCompleted ?? 0} icon="checkmark-done-outline" color={colors.primary} />
              <SparkMetric label="Goals" value={metrics?.totalGoalsCompleted ?? 0} icon="trophy-outline" color={colors.highlight} />
              <SparkMetric label="Events" value={metrics?.totalEventsAttended ?? 0} icon="calendar-outline" color={colors.info} />
            </View>
          </SparkSection>
        </FadeIn>

        <FadeIn delay={160}>
          <SparkSection title="XP TREND" inset={false}>
            <SparkCard variant="grouped">
              {metrics?.xpTrend?.length === 0 ? (
                <Text style={[styles.body, { color: colors.muted }]}>No recent XP data.</Text>
              ) : (
                metrics?.xpTrend?.map((point, i) => (
                  <SparkListRow
                    key={i}
                    title={point.date}
                    detail={`${point.xp} XP`}
                    icon="time-outline"
                    showChevron={false}
                  />
                ))
              )}
            </SparkCard>
          </SparkSection>
        </FadeIn>

        <FadeIn delay={240}>
          <SparkButton title="Refresh" onPress={load} variant="secondary" />
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { gap: spacing.sm, marginBottom: spacing.md },
  heroTitle: { ...typography.largeTitle },
  heroBody: { ...typography.body },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  body: { ...typography.body },
});
