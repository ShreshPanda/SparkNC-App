import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { FadeIn } from '../../components/AnimatedWrapper';
import { EmptyState } from '../../components/EmptyState';
import { SparkButton } from '../../components/SparkButton';
import { SparkCard } from '../../components/SparkCard';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { colors, spacing, typography } from '../../theme';
import type { GrowthEvent, GrowthStatistics, GrowthStory } from '../../shared/types';

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
      <AppShell title="Growth Timeline">
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="Growth Timeline">
      <ScrollView contentContainerStyle={styles.container}>
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        {stats ? (
          <FadeIn delay={0}>
            <SparkCard>
              <Text style={[styles.heading, { color: colors.foreground }]}>Growth Statistics</Text>
              <View style={styles.statsGrid}>
                <StatPill label="XP" value={stats.xp} color={colors.highlight} />
                <StatPill label="Goals" value={stats.goalsCompleted} color={colors.accent} />
                <StatPill label="Tasks" value={stats.tasksCompleted} color={colors.foreground} />
                <StatPill label="Events" value={stats.eventsAttended} color={colors.muted} />
                <StatPill label="Streak" value={stats.currentStreak} color={colors.highlight} />
                <StatPill label="Achievements" value={stats.achievementsUnlocked} suffix={`/${stats.totalAchievements}`} color={colors.accent} />
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
              <EmptyState title="Your story is waiting to be told" message="Generate your growth timeline to see how far you've come." icon="time-outline" />
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

function StatPill({ label, value, suffix = '', color }: { label: string; value: number; suffix?: string; color: string }) {
  return (
    <View style={styles.pill}>
      <AnimatedNumber value={value} style={[styles.pillValue, { color }]} suffix={suffix} />
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, padding: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { ...typography.heading },
  body: { ...typography.body },
  lead: { ...typography.body, fontStyle: 'italic', marginBottom: spacing.md },
  caption: { ...typography.caption },
  error: { ...typography.body },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginVertical: spacing.md },
  pill: { width: '30%', alignItems: 'center', padding: spacing.md },
  pillValue: { ...typography.heading, fontSize: 20 },
  pillLabel: { ...typography.caption, marginTop: spacing.xs },
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
