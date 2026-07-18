import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import type { DemoScenario, ImpactAnalytics, ImprovementRecommendation, ImpactReport } from '../../shared/types';

export default function ImpactScreen() {
  const { colors } = useTheme();
  const [impact, setImpact] = useState<ImpactAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<ImprovementRecommendation[]>([]);
  const [reports, setReports] = useState<ImpactReport[]>([]);
  const [demo, setDemo] = useState<DemoScenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [i, r, p, d] = await Promise.all([
        cloudflareService.getImpactAnalytics().catch(() => null),
        cloudflareService.listRecommendations().catch(() => []),
        cloudflareService.listImpactReports().catch(() => []),
        cloudflareService.getDemoScenario().catch(() => null),
      ]);
      setImpact(i);
      setRecommendations(r);
      setReports(p);
      setDemo(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load impact analytics');
    } finally {
      setLoading(false);
    }
  }

  async function generateReport() {
    try {
      setSuccess(null);
      setError(null);
      await cloudflareService.generateImpactReport();
      setSuccess('Report generated');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    }
  }

  async function generateRecommendations() {
    try {
      setSuccess(null);
      setError(null);
      await cloudflareService.generateRecommendations();
      setSuccess('Recommendations refreshed');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading && !impact) {
    return (
      <AppShell title="Impact Dashboard">
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="Impact Dashboard">
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={[styles.body, { color: colors.highlight }]}>{error}</Text>}
        {success && <Text style={[styles.body, { color: colors.accent }]}>{success}</Text>}

        <View style={[styles.row, styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.highlight }]}>{impact?.engagement.totalStudents ?? demo?.adminMetrics.totalStudents ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Students</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.accent }]}>{impact?.engagement.weeklyActiveStudents ?? demo?.adminMetrics.activeThisMonth ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Active</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{impact?.studentExperience.averageSatisfaction.toFixed(0) ?? demo?.adminMetrics.studentSatisfaction ?? 0}%</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Satisfaction</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Engagement</Text>
          <Text style={[styles.body, { color: colors.muted }]}>Tasks: {((impact?.engagement.taskCompletionRate ?? 0) * 100).toFixed(0)}%</Text>
          <Text style={[styles.body, { color: colors.muted }]}>Goals: {((impact?.engagement.goalCompletionRate ?? 0) * 100).toFixed(0)}%</Text>
          <Text style={[styles.body, { color: colors.muted }]}>Events: {((impact?.engagement.eventParticipationRate ?? 0) * 100).toFixed(0)}%</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Feedback Themes</Text>
          {(impact?.studentExperience.topThemes ?? demo?.adminMetrics.feedbackThemes ?? []).length === 0 ? (
            <Text style={[styles.body, { color: colors.muted }]}>No themes yet.</Text>
          ) : (
            (impact?.studentExperience.topThemes ?? demo?.adminMetrics.feedbackThemes ?? []).map((t, i) => (
              <Text key={i} style={[styles.body, { color: colors.foreground }]}>{t.category}: {t.count}</Text>
            ))
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Recommendations</Text>
          {recommendations.length === 0 && (demo?.adminMetrics.recommendations ?? []).length === 0 ? (
            <Text style={[styles.body, { color: colors.muted }]}>No recommendations yet.</Text>
          ) : (
            recommendations.map((rec) => (
              <Text key={rec.id} style={[styles.body, { color: colors.foreground }]}>• {rec.title}</Text>
            ))
          )}
          {(demo?.adminMetrics.recommendations ?? []).map((rec, i) => (
            <Text key={`demo-${i}`} style={[styles.body, { color: colors.foreground }]}>• {rec}</Text>
          ))}
          <Button title="Generate Recommendations" onPress={generateRecommendations} color={colors.accent} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Reports</Text>
          {reports.length === 0 ? (
            <Text style={[styles.body, { color: colors.muted }]}>No impact reports yet.</Text>
          ) : (
            reports.map((r) => (
              <Text key={r.id} style={[styles.body, { color: colors.foreground }]}>{r.reportType} report - {r.createdAt?.split('T')[0]}</Text>
            ))
          )}
          <Button title="Generate Monthly Report" onPress={generateReport} color={colors.accent} />
        </View>

        <Button title="Refresh" onPress={load} color={colors.muted} />
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
