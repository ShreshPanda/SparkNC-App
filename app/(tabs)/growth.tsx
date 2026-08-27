import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { FadeIn } from '../../components/AnimatedWrapper';
import { SparkEmptyState } from '../../components/SparkEmptyState';
import { EmptyGrowthIllustration } from '../../components/visual/EmptyIllustration';
import { SparkButton } from '../../components/SparkButton';
import { SparkCard } from '../../components/SparkCard';
import { SparkMetric } from '../../components/SparkMetric';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import type { GrowthEvent, GrowthStatistics, GrowthStory } from '../../shared/types';
import { Ionicons } from '@expo/vector-icons';

export default function GrowthTimelineScreen() {
  const { colors } = useTheme();
  const [stats, setStats] = useState<GrowthStatistics | null>(null);
  const [story, setStory] = useState<GrowthStory | null>(null);
  const [events, setEvents] = useState<GrowthEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [s, st, ev] = await Promise.all([
        cloudflareService.getGrowthStatistics().catch(() => null),
        cloudflareService.getGrowthStory().catch(() => null),
        cloudflareService.getGrowthTimeline().catch(() => []),
      ]);
      setStats(s);
      setStory(st);
      setEvents(ev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    try {
      setGenerating(true);
      await cloudflareService.generateGrowthTimeline();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate timeline');
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <AppShell title="Growth" overline="GROWTH" mode="immersive">
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="Growth" overline="GROWTH" mode="immersive">
      <ScrollView contentContainerStyle={styles.container}>
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        {stats ? (
          <FadeIn delay={0}>
            <SparkCard>
              <Text style={[styles.heading, { color: colors.foreground }]}>Growth Statistics</Text>
              <View style={styles.statsGrid}>
                <SparkMetric label="XP" value={stats.xp} color={colors.highlight} style={styles.metric} />
                <SparkMetric label="Goals" value={stats.goalsCompleted} color={colors.primary} style={styles.metric} />
                <SparkMetric label="Tasks" value={stats.tasksCompleted} color={colors.foreground} style={styles.metric} />
                <SparkMetric label="Events" value={stats.eventsAttended} color={colors.muted} style={styles.metric} />
                <SparkMetric label="Streak" value={stats.currentStreak} color={colors.highlight} style={styles.metric} />
                <SparkMetric label="Achievements" value={stats.achievementsUnlocked} suffix={`/${stats.totalAchievements}`} color={colors.primary} style={styles.metric} />
              </View>
              <View style={styles.categories}>
                {stats.categories.map((cat, i) => (
                  <View key={i} style={styles.categoryRow}>
                    <Text style={[styles.body, { color: colors.foreground, width: 100 }]}>{cat.label}</Text>
                    <View style={[styles.progress, { backgroundColor: colors.border }]}>
                      <View style={[styles.progressFill, { width: `${Math.min(cat.score, 100)}%`, backgroundColor: i % 2 === 0 ? colors.accent : colors.highlight }]} />
                    </View>
                    <Text style={[styles.caption, { color: colors.muted, width: 40, textAlign: 'right' }]}>{cat.score}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.observations}>
                {stats.observations.map((obs, i) => (
                  <View key={i} style={styles.observationRow}>
                    <View style={[styles.dot, { backgroundColor: colors.highlight }]} />
                    <Text style={[styles.body, { color: colors.foreground, flex: 1 }]}>{obs}</Text>
                  </View>
                ))}
              </View>
            </SparkCard>
          </FadeIn>
        ) : null}

        {story ? (
          <FadeIn delay={120}>
            <SparkCard>
              <Text style={[styles.heading, { color: colors.foreground }]}>{story.title}</Text>
              <Text style={[styles.lead, { color: colors.muted }]}>{story.summary}</Text>
              {story.paragraphs.map((p, i) => (
                <Text key={i} style={[styles.body, { color: colors.foreground, marginBottom: spacing.sm }]}>{p}</Text>
              ))}
              <View style={styles.milestones}>
                {story.milestones.map((m, i) => (
                  <View key={i} style={styles.milestoneRow}>
                    <View style={[styles.dot, { backgroundColor: colors.accent }]} />
                    <Text style={[styles.body, { color: colors.foreground, flex: 1 }]}>{m}</Text>
                  </View>
                ))}
              </View>
            </SparkCard>
          </FadeIn>
        ) : null}

        <FadeIn delay={240}>
          <SparkCard>
            <Text style={[styles.heading, { color: colors.foreground }]}>Milestones</Text>
            {events.length === 0 ? (
              <SparkEmptyState
                illustration={<EmptyGrowthIllustration />}
                title="Your story is waiting to be told"
                message="Generate your growth timeline to see how far you've come."
              />
            ) : (
              events.map((event: GrowthEvent, i: number) => (
                <View key={event.id} style={styles.timelineRow}>
                  <View style={styles.timelineLine}>
                    <View style={[styles.timelineDot, { backgroundColor: i === 0 ? colors.accent : colors.highlight }]} />
                    {i < events.length - 1 ? <View style={[styles.timelineStem, { backgroundColor: colors.border }]} /> : null}
                  </View>
                  <View style={styles.timelineCard}>
                    <Text style={[styles.heading, { color: colors.foreground }]}>{event.title}</Text>
                    <Text style={[styles.body, { color: colors.muted }]}>{event.description}</Text>
                    <Text style={[styles.caption, { color: colors.muted }]}>{event.occurredAt?.split('T')[0]}</Text>
                  </View>
                </View>
              ))
            )}
          </SparkCard>
        </FadeIn>

        <FadeIn delay={360}>
          <View style={styles.actions}>
            <SparkButton title={generating ? 'Building…' : 'Generate Timeline'} onPress={generate} variant="primary" disabled={generating || loading} />
            <SparkButton title="Refresh Timeline" onPress={() => load()} variant="muted" />
          </View>
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}


const styles = StyleSheet.create({
  container: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { ...typography.title2 },
  body: { ...typography.body },
  lead: { ...typography.callout, marginBottom: spacing.md },
  caption: { ...typography.footnote },
  error: { ...typography.body },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: spacing.md },
  metric: { width: '30%', marginBottom: spacing.md },
  categories: { gap: spacing.sm, marginTop: spacing.sm },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  progress: { height: 6, borderRadius: 3, flex: 1, overflow: 'hidden' },
  progressFill: { height: '100%' },
  milestones: { gap: spacing.sm, marginTop: spacing.md },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  observations: { gap: spacing.sm, marginTop: spacing.md },
  observationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  timelineRow: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm },
  timelineLine: { width: 20, alignItems: 'center' },
  timelineDot: { width: 14, height: 14, borderRadius: 7 },
  timelineStem: { width: 2, flex: 1, marginVertical: spacing.xs },
  timelineCard: { flex: 1, gap: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center' },
});
