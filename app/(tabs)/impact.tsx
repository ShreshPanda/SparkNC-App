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
import type { ImpactAnalytics, ImprovementRecommendation, ImpactReport } from '../../shared/types';

export default function ImpactScreen() {
  const { colors } = useTheme();
  const [impact, setImpact] = useState<ImpactAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<ImprovementRecommendation[]>([]);
  const [reports, setReports] = useState<ImpactReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [i, r, p] = await Promise.all([
        cloudflareService.getImpactAnalytics().catch(() => null),
        cloudflareService.listRecommendations().catch(() => []),
        cloudflareService.listImpactReports().catch(() => []),
      ]);
      setImpact(i);
      setRecommendations(r);
      setReports(p);
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

  const totalStudents = impact?.engagement.totalStudents ?? 0;
  const weeklyActive = impact?.engagement.weeklyActiveStudents ?? 0;
  const engagementRate = totalStudents > 0 ? Math.round((weeklyActive / totalStudents) * 100) : 0;

  return (
    <AppShell title="Impact Dashboard">
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={[styles.body, { color: colors.highlight }]}>{error}</Text>}
        {success && <Text style={[styles.body, { color: colors.accent }]}>{success}</Text>}

        <FadeIn delay={0}>
          <SparkCard style={[styles.hero, { backgroundColor: colors.primary }]}>
            <Text style={[styles.heroTitle, { color: colors.card }]}>Program impact</Text>
            <Text style={[styles.heroBody, { color: colors.card }]}>
              {totalStudents} students · {weeklyActive} active · {engagementRate}% engagement · {impact ? Math.round(impact.studentExperience.averageSatisfaction) : 0}/5 satisfaction
            </Text>
          </SparkCard>
        </FadeIn>

        <FadeIn delay={80}>
          <SparkCard style={styles.kpiGrid}>
            <KpiTile icon="people-outline" label="Students" value={totalStudents} colors={colors} />
            <KpiTile icon="flame-outline" label="Active" value={weeklyActive} colors={colors} accent />
            <KpiTile icon="checkmark-done-outline" label="Task rate" value={`${((impact?.engagement.taskCompletionRate ?? 0) * 100).toFixed(0)}%`} colors={colors} />
            <KpiTile icon="trophy-outline" label="Goal rate" value={`${((impact?.engagement.goalCompletionRate ?? 0) * 100).toFixed(0)}%`} colors={colors} />
            <KpiTile icon="calendar-outline" label="Event rate" value={`${((impact?.engagement.eventParticipationRate ?? 0) * 100).toFixed(0)}%`} colors={colors} />
            <KpiTile icon="happy-outline" label="Satisfaction" value={`${impact ? Math.round(impact.studentExperience.averageSatisfaction) : 0}`} colors={colors} />
          </SparkCard>
        </FadeIn>

        <FadeIn delay={160}>
          <SparkCard>
            <Text style={[styles.heading, { color: colors.foreground }]}>Feedback themes</Text>
            {(impact?.studentExperience.topThemes ?? []).length === 0 ? (
              <Text style={[styles.body, { color: colors.muted }]}>No themes yet.</Text>
            ) : (
              (impact?.studentExperience.topThemes ?? []).map((t, i) => (
                <View key={i} style={styles.themeRow}>
                  <Text style={[styles.themeCategory, { color: colors.foreground }]}>{t.category}</Text>
                  <Text style={[styles.themeCount, { color: colors.accent }]}>{t.count}</Text>
                </View>
              ))
            )}
          </SparkCard>
        </FadeIn>

        <FadeIn delay={240}>
          <SparkCard>
            <Text style={[styles.heading, { color: colors.foreground }]}>Recommendations</Text>
            {recommendations.length === 0 ? (
              <Text style={[styles.body, { color: colors.muted }]}>No recommendations yet.</Text>
            ) : (
              recommendations.map((rec) => (
                <View key={rec.id} style={styles.itemRow}>
                  <Ionicons name="bulb-outline" size={16} color={colors.accent} />
                  <Text style={[styles.itemText, { color: colors.foreground }]}>{rec.title}</Text>
                </View>
              ))
            )}
            <SparkButton title="Generate Recommendations" onPress={generateRecommendations} variant="primary" />
          </SparkCard>
        </FadeIn>

        <FadeIn delay={320}>
          <SparkCard>
            <Text style={[styles.heading, { color: colors.foreground }]}>Reports</Text>
            {reports.length === 0 ? (
              <Text style={[styles.body, { color: colors.muted }]}>No impact reports yet.</Text>
            ) : (
              reports.map((r) => (
                <View key={r.id} style={styles.itemRow}>
                  <Ionicons name="document-text-outline" size={16} color={colors.muted} />
                  <Text style={[styles.itemText, { color: colors.foreground }]}>{r.reportType} — {r.createdAt?.split('T')[0]}</Text>
                </View>
              ))
            )}
            <SparkButton title="Generate Monthly Report" onPress={generateReport} variant="primary" />
          </SparkCard>
        </FadeIn>

        <FadeIn delay={400}>
          <SparkButton title="Refresh" onPress={load} variant="muted" />
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}

function KpiTile({ icon, label, value, colors, accent }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string | number; colors: any; accent?: boolean }) {
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
  themeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  themeCategory: { ...typography.body },
  themeCount: { ...typography.body, fontWeight: '700' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  itemText: { ...typography.body },
});
