import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SparkButton } from "../../components/SparkButton";
import { AppShell } from '../../components/AppShell';
import { FadeIn } from '../../components/AnimatedWrapper';
import { SparkCard } from '../../components/SparkCard';
import { SparkEmptyState } from '../../components/SparkEmptyState';
import { SparkMetric } from '../../components/SparkMetric';
import { SparkProgressRing } from '../../components/visual/SparkProgressRing';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import type { StudentDashboard, StudentInsight } from '../../shared/types';

export default function ProgressScreen() {
  const { colors } = useTheme();
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await cloudflareService.getStudentDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    try {
      setGenerating(true);
      await cloudflareService.generateStudentInsights();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <AppShell title="Student Progress" overline="PROGRESS" mode="immersive">
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </AppShell>
    );
  }

  const xp = dashboard?.xp ?? 0;
  const level = dashboard?.level ?? 1;
  const streak = dashboard?.currentStreak ?? 0;
  const nextLevelXp = level * 1000;
  const progress = Math.min(1, xp / nextLevelXp);

  return (
    <AppShell title="Student Progress" overline="PROGRESS" mode="immersive">
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={[styles.body, { color: colors.error }]}>{error}</Text>}

        <FadeIn delay={0}>
          <View style={styles.hero}>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>Level {level}</Text>
            <Text style={[styles.heroBody, { color: colors.muted }]}>
              {xp} / {nextLevelXp} XP · {streak}-day streak
            </Text>
            <View style={styles.ring}>
              <SparkProgressRing progress={progress} size={120} color={colors.primary} showGlow />
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={80}>
          <View style={styles.kpiRow}>
            <SparkMetric label="XP" value={xp} icon="flame-outline" color={colors.primary} />
            <SparkMetric label="Level" value={level} icon="trending-up-outline" color={colors.info} />
            <SparkMetric label="Streak" value={streak} icon="flash-outline" color={colors.warning} />
            <SparkMetric label="Tasks" value={dashboard?.tasksCompleted ?? 0} icon="checkmark-done-outline" color={colors.success} />
            <SparkMetric label="Goals" value={dashboard?.goalsCompleted ?? 0} icon="trophy-outline" color={colors.highlight} />
            <SparkMetric label="Events" value={dashboard?.eventsAttended ?? 0} icon="calendar-outline" color={colors.info} />
          </View>
        </FadeIn>

        <FadeIn delay={160}>
          <SparkCard>
            <Text style={[styles.heading, { color: colors.foreground }]}>Engagement score</Text>
            <Text style={[styles.score, { color: colors.primary }]}>{dashboard?.engagementScore ?? 0}</Text>
          </SparkCard>
        </FadeIn>

        <FadeIn delay={240}>
          <SparkCard>
            <Text style={[styles.heading, { color: colors.foreground }]}>Insights</Text>
            {dashboard?.insights && dashboard.insights.length === 0 ? (
              <SparkEmptyState
                icon={<Ionicons name="sparkles-outline" size={32} color={colors.primary} />}
                title="No insights yet"
                message="Tap Generate to analyze your growth data."
              />
            ) : (
              dashboard?.insights?.map((insight: StudentInsight) => (
                <View key={insight.id} style={styles.insightRow}>
                  <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
                  <View style={styles.insightText}>
                    <Text style={[styles.insightTitle, { color: colors.foreground }]}>{insight.title}</Text>
                    <Text style={[styles.body, { color: colors.muted }]}>{insight.description}</Text>
                  </View>
                </View>
              ))
            )}
          </SparkCard>
        </FadeIn>

        <FadeIn delay={320}>
          <SparkButton title={generating ? 'Analyzing...' : 'Generate Insights'} onPress={generate} variant="primary" disabled={generating} />
          <SparkButton title="Refresh" onPress={load} variant="secondary" />
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { gap: spacing.sm, padding: spacing.xl, borderRadius: 24 },
  heroTitle: { ...typography.largeTitle },
  heroBody: { ...typography.body },
  ring: { alignItems: 'center', marginTop: spacing.md },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  heading: { ...typography.title2 },
  body: { ...typography.body },
  score: { ...typography.metricLarge },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: spacing.xs },
  insightText: { flex: 1 },
  insightTitle: { ...typography.headline },
});
