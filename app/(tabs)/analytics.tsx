import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SparkButton } from "../../components/SparkButton";
import { AppShell } from '../../components/AppShell';
import { FadeIn } from '../../components/AnimatedWrapper';
import { SparkCard } from '../../components/SparkCard';
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
      <AppShell title="Admin Analytics">
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </AppShell>
    );
  }

  const totalStudents = metrics?.totalStudents ?? 0;
  const weeklyActive = metrics?.weeklyActiveStudents ?? 0;
  const engagementRate = totalStudents > 0 ? Math.round((weeklyActive / totalStudents) * 100) : 0;

  return (
    <AppShell title="Admin Analytics">
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={[styles.body, { color: colors.highlight }]}>{error}</Text>}

        <FadeIn delay={0}>
          <SparkCard style={[styles.hero, { backgroundColor: colors.primary }]}>
            <Text style={[styles.heroTitle, { color: colors.card }]}>Program overview</Text>
            <Text style={[styles.heroBody, { color: colors.card }]}>
              {totalStudents} students · {weeklyActive} active this week · {engagementRate}% weekly engagement
            </Text>
          </SparkCard>
        </FadeIn>

        <FadeIn delay={80}>
          <SparkCard style={styles.kpiGrid}>
            <KpiTile icon="people-outline" label="Total students" value={totalStudents} colors={colors} />
            <KpiTile icon="flame-outline" label="Active (7d)" value={weeklyActive} colors={colors} accent />
            <KpiTile icon="pulse-outline" label="Active (24h)" value={metrics?.dailyActiveStudents ?? 0} colors={colors} />
            <KpiTile icon="checkmark-done-outline" label="Tasks" value={metrics?.totalTasksCompleted ?? 0} colors={colors} />
            <KpiTile icon="trophy-outline" label="Goals" value={metrics?.totalGoalsCompleted ?? 0} colors={colors} />
            <KpiTile icon="calendar-outline" label="Events" value={metrics?.totalEventsAttended ?? 0} colors={colors} />
          </SparkCard>
        </FadeIn>

        <FadeIn delay={160}>
          <SparkCard>
            <Text style={[styles.heading, { color: colors.foreground }]}>XP Trend</Text>
            {metrics?.xpTrend?.length === 0 ? (
              <Text style={[styles.body, { color: colors.muted }]}>No recent XP data.</Text>
            ) : (
              metrics?.xpTrend?.map((point, i) => (
                <View key={i} style={styles.trendRow}>
                  <Text style={[styles.trendDate, { color: colors.muted }]}>{point.date}</Text>
                  <Text style={[styles.trendValue, { color: colors.accent }]}>{point.xp} XP</Text>
                </View>
              ))
            )}
          </SparkCard>
        </FadeIn>

        <FadeIn delay={240}>
          <SparkButton title="Refresh" onPress={load} variant="primary" />
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}

function KpiTile({ icon, label, value, colors, accent }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: number; colors: any; accent?: boolean }) {
  return (
    <View style={styles.kpi}>
      <Ionicons name={icon} size={24} color={accent ? colors.accent : colors.muted} />
      <Text style={[styles.kpiValue, { color: accent ? colors.accent : colors.foreground }]}>{value}</Text>
      <Text style={[styles.kpiLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { padding: spacing.xl, borderRadius: 24, gap: spacing.sm },
  heroTitle: { ...typography.title, fontSize: 28 },
  heroBody: { ...typography.body },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, borderRadius: 20, gap: 0 },
  kpi: { width: '33%', alignItems: 'center', padding: spacing.sm },
  kpiValue: { ...typography.title },
  kpiLabel: { ...typography.caption, textAlign: 'center' },
  heading: { ...typography.heading },
  body: { ...typography.body },
  trendRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  trendDate: { ...typography.body },
  trendValue: { ...typography.body, fontWeight: '700' },
});
