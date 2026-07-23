import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../../components/AppShell';
import { useTheme } from '../../../providers/ThemeProvider';
import { authService, type AuthSession } from '../../../services/authService';
import { cloudflareService } from '../../../services/cloudflareService';
import { spacing, typography } from '../../../theme';
import { ProgressRing } from './ProgressRing';
import { StatsWidget } from './StatsWidget';
import { HeatmapWidget } from './HeatmapWidget';
import { AchievementCarousel } from './AchievementCarousel';
import type { Event, Goal, Task } from '../../../shared/types';

export function GrowthDashboard() {
  const { colors } = useTheme();
  const [user, setUser] = useState<AuthSession | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [achievements, setAchievements] = useState<{ id: string; title: string; unlockedAt?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [u, t, g, e, a] = await Promise.all([
        authService.getSession().catch(() => null),
        cloudflareService.listTasks().catch(() => []),
        cloudflareService.listGoals().catch(() => []),
        cloudflareService.listEvents().catch(() => []),
        cloudflareService.listAchievements?.().catch(() => []),
      ]);
      setUser(u);
      setTasks(t.filter((x) => !x.completed).slice(0, 5));
      setGoals(g.filter((x) => !x.completed).slice(0, 5));
      setEvents(e.slice(0, 5));
      setAchievements((a ?? []).slice(0, 6));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const xp = user?.xp ?? 0;
  const level = Math.max(1, Math.floor(xp / 100));
  const nextLevel = level * 100;
  const progress = (xp % 100) / 100;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const streak = user?.streak?.current ?? 0;

  const heatmap = {
    weeks: Array.from({ length: 12 }, (_, w) => ({
      days: Array.from({ length: 7 }, (_, d) => ((w * 7 + d) % 5)),
    })),
  };

  if (loading && !user) {
    return (
      <AppShell title="Dashboard">
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="Dashboard">
      <ScrollView contentContainerStyle={styles.container}>
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.foreground }]}>
            {user ? `Good to see you, ${user.name}` : 'Welcome back'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Here is your growth today</Text>
        </View>

        <View style={styles.ringSection}>
          <ProgressRing progress={progress} label={`Level ${level}`} sublabel={`${xp} / ${nextLevel} XP`} />
        </View>

        <View style={styles.statsRow}>
          <StatsWidget value={streak} label="Day streak" accent="accent" />
          <StatsWidget value={completedTasks} label="Tasks done" accent="highlight" />
          <StatsWidget value={completedGoals} label="Goals done" accent="success" />
        </View>

        <HeatmapWidget weeks={heatmap.weeks} />

        <View style={styles.section}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Recent achievements</Text>
          <AchievementCarousel achievements={achievements} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Upcoming events</Text>
          {events.length === 0 ? (
            <Text style={[styles.body, { color: colors.muted }]}>No events this week</Text>
          ) : (
            events.map((event) => (
              <Text key={event.id} style={[styles.listItem, { color: colors.foreground }]}>
                {event.title}
              </Text>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Active goals</Text>
          {goals.length === 0 ? (
            <Text style={[styles.body, { color: colors.muted }]}>No active goals</Text>
          ) : (
            goals.map((goal) => (
              <View key={goal.id} style={styles.goalRow}>
                <Text style={[styles.listItem, { color: colors.foreground, flex: 1 }]}>{goal.title}</Text>
                <Text style={[styles.body, { color: colors.muted }]}>{goal.progress}%</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.xl, padding: spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { gap: spacing.xs, marginTop: spacing.sm },
  greeting: { ...typography.title },
  subtitle: { ...typography.body },
  ringSection: { alignItems: 'center', marginVertical: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  section: { gap: spacing.sm },
  heading: { ...typography.heading },
  body: { ...typography.body },
  listItem: { ...typography.body, paddingVertical: spacing.xs },
  goalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  error: { ...typography.body, marginVertical: spacing.sm },
});
