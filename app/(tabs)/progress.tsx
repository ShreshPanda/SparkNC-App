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
      <AppShell title="Student Progress">
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="Student Progress">
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={[styles.body, { color: colors.highlight }]}>{error}</Text>}

        <FadeIn delay={0}>
          <SparkCard style={[styles.hero, { backgroundColor: colors.primary }]}>
            <Text style={[styles.heroTitle, { color: colors.card }]}>Your progress</Text>
            <Text style={[styles.heroBody, { color: colors.card }]}>
              {dashboard?.xp ?? 0} XP · Level {dashboard?.level ?? 1} · {dashboard?.currentStreak ?? 0}-day streak
            </Text>
          </SparkCard>
        </FadeIn>

        <FadeIn delay={80}>
          <SparkCard style={styles.kpiGrid}>
            <KpiTile icon="flame-outline" label="XP" value={dashboard?.xp ?? 0} colors={colors} accent />
            <KpiTile icon="trending-up-outline" label="Level" value={dashboard?.level ?? 1} colors={colors} />
            <KpiTile icon="flash-outline" label="Streak" value={dashboard?.currentStreak ?? 0} colors={colors} />
            <KpiTile icon="checkmark-done-outline" label="Tasks" value={dashboard?.tasksCompleted ?? 0} colors={colors} />
            <KpiTile icon="trophy-outline" label="Goals" value={dashboard?.goalsCompleted ?? 0} colors={colors} />
            <KpiTile icon="calendar-outline" label="Events" value={dashboard?.eventsAttended ?? 0} colors={colors} />
          </SparkCard>
        </FadeIn>

        <FadeIn delay={160}>
          <SparkCard>
            <Text style={[styles.heading, { color: colors.foreground }]}>Engagement score</Text>
            <Text style={[styles.score, { color: colors.accent }]}>{dashboard?.engagementScore ?? 0}</Text>
          </SparkCard>
        </FadeIn>

        <FadeIn delay={240}>
          <SparkCard>
            <Text style={[styles.heading, { color: colors.foreground }]}>Insights</Text>
            {dashboard?.insights && dashboard.insights.length === 0 ? (
              <Text style={[styles.body, { color: colors.muted }]}>No insights yet. Tap Generate to analyze your data.</Text>
            ) : (
              dashboard?.insights?.map((insight: StudentInsight) => (
                <View key={insight.id} style={styles.insightRow}>
                  <Ionicons name="sparkles-outline" size={16} color={colors.accent} />
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
  score: { ...typography.title },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: spacing.xs },
  insightText: { flex: 1 },
  insightTitle: { ...typography.body, fontWeight: '700' },
});
