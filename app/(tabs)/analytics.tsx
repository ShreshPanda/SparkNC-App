import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
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
      <AppShell title="Analytics">
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="Admin Analytics">
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={[styles.body, { color: colors.highlight }]}>{error}</Text>}

        <View style={[styles.row, styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.highlight }]}>{metrics?.totalStudents ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Students</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.accent }]}>{metrics?.weeklyActiveStudents ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Active (7d)</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{metrics?.dailyActiveStudents ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Active (24h)</Text>
          </View>
        </View>

        <View style={[styles.row, styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.highlight }]}>{metrics?.totalTasksCompleted ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Tasks</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.accent }]}>{metrics?.totalGoalsCompleted ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Goals</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{metrics?.totalEventsAttended ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Events</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>XP Trend</Text>
          {metrics?.xpTrend?.length === 0 ? (
            <Text style={[styles.body, { color: colors.muted }]}>No recent XP data.</Text>
          ) : (
            metrics?.xpTrend?.map((point, i) => (
              <Text key={i} style={[styles.body, { color: colors.muted }]}>
                {point.date}: {point.xp} XP
              </Text>
            ))
          )}
        </View>

        <Button title="Refresh" onPress={load} color={colors.accent} />
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: spacing.lg, borderRadius: 20, borderWidth: 1, gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  heading: { ...typography.heading },
  body: { ...typography.body },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { ...typography.title },
  statLabel: { ...typography.caption },
});
