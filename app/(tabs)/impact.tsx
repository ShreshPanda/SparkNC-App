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
import { SparkEmptyState } from '../../components/SparkEmptyState';
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
      <AppShell title="Impact Dashboard" overline="IMPACT" mode="data">
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </AppShell>
    );
  }

  const totalStudents = impact?.engagement.totalStudents ?? 0;
  const weeklyActive = impact?.engagement.weeklyActiveStudents ?? 0;
  const engagementRate = totalStudents > 0 ? Math.round((weeklyActive / totalStudents) * 100) : 0;

  return (
    <AppShell title="Impact Dashboard" overline="IMPACT" mode="data">
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={[styles.body, { color: colors.error }]}>{error}</Text>}
        {success && <Text style={[styles.body, { color: colors.success }]}>{success}</Text>}

        <FadeIn delay={0}>
          <View style={styles.hero}>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>Program impact</Text>
            <Text style={[styles.heroBody, { color: colors.muted }]}>
              {totalStudents} students · {weeklyActive} active · {engagementRate}% engagement · {impact ? Math.round(impact.studentExperience.averageSatisfaction) : 0}/5 satisfaction
            </Text>
          </View>
        </FadeIn>

        <FadeIn delay={80}>
          <SparkSection title="KEY METRICS" inset={false}>
            <View style={styles.kpiRow}>
              <SparkMetric label="Students" value={totalStudents} icon="people-outline" color={colors.primary} />
              <SparkMetric label="Active" value={weeklyActive} icon="flame-outline" color={colors.success} />
              <SparkMetric label="Task rate" value={Math.round((impact?.engagement.taskCompletionRate ?? 0) * 100)} suffix="%" icon="checkmark-done-outline" color={colors.primary} />
              <SparkMetric label="Goal rate" value={Math.round((impact?.engagement.goalCompletionRate ?? 0) * 100)} suffix="%" icon="trophy-outline" color={colors.highlight} />
              <SparkMetric label="Event rate" value={Math.round((impact?.engagement.eventParticipationRate ?? 0) * 100)} suffix="%" icon="calendar-outline" color={colors.info} />
              <SparkMetric label="Satisfaction" value={impact ? Math.round(impact.studentExperience.averageSatisfaction) : 0} icon="happy-outline" color={colors.warning} />
            </View>
          </SparkSection>
        </FadeIn>

        <FadeIn delay={160}>
          <SparkSection title="FEEDBACK THEMES" inset={false}>
            <SparkCard variant="grouped">
              {(impact?.studentExperience.topThemes ?? []).length === 0 ? (
                <SparkEmptyState
                  icon={<Ionicons name="chatbubbles-outline" size={32} color={colors.primary} />}
                  title="No themes yet"
                  message="Feedback data will appear here once collected."
                />
              ) : (
                (impact?.studentExperience.topThemes ?? []).map((t, i) => (
                  <SparkListRow
                    key={i}
                    title={t.category}
                    detail={`${t.count}`}
                    icon="pricetag-outline"
                    showChevron={false}
                  />
                ))
              )}
            </SparkCard>
          </SparkSection>
        </FadeIn>

        <FadeIn delay={240}>
          <SparkSection title="RECOMMENDATIONS" inset={false}>
            <SparkCard variant="grouped">
              {recommendations.length === 0 ? (
                <Text style={[styles.body, { color: colors.muted }]}>No recommendations yet.</Text>
              ) : (
                recommendations.map((rec) => (
                  <SparkListRow
                    key={rec.id}
                    title={rec.title}
                    icon="bulb-outline"
                    iconColor={colors.primary}
                    showChevron={false}
                  />
                ))
              )}
            </SparkCard>
            <SparkButton title="Generate Recommendations" onPress={generateRecommendations} variant="primary" />
          </SparkSection>
        </FadeIn>

        <FadeIn delay={320}>
          <SparkSection title="REPORTS" inset={false}>
            <SparkCard variant="grouped">
              {reports.length === 0 ? (
                <Text style={[styles.body, { color: colors.muted }]}>No impact reports yet.</Text>
              ) : (
                reports.map((r) => (
                  <SparkListRow
                    key={r.id}
                    title={r.reportType}
                    detail={r.createdAt?.split('T')[0]}
                    icon="document-text-outline"
                    showChevron={false}
                  />
                ))
              )}
            </SparkCard>
            <SparkButton title="Generate Monthly Report" onPress={generateReport} variant="primary" />
          </SparkSection>
        </FadeIn>

        <FadeIn delay={400}>
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
