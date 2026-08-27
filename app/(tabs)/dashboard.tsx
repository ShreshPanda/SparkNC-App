import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, RefreshControl, ScrollView, StyleSheet, Text, Vibration, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { Confetti } from '../../components/Confetti';
import { FadeIn } from '../../components/AnimatedWrapper';
import { useRouter } from 'expo-router';
import { SparkCard } from '../../components/SparkCard';
import { SparkListRow } from '../../components/SparkListRow';
import { SparkMetric } from '../../components/SparkMetric';
import { SparkBadge } from '../../components/SparkBadge';
import { SparkButton } from '../../components/SparkButton';
import { SparkEmptyState } from '../../components/SparkEmptyState';
import { SparkProgressRing } from '../../components/visual/SparkProgressRing';
import { EmptyTasksIllustration } from '../../components/visual/EmptyIllustration';
import { useTheme } from '../../providers/ThemeProvider';
import { authService, type AuthSession } from '../../services/authService';
import { cloudflareService } from '../../services/cloudflareService';
import { radius, spacing, typography } from '../../theme';
import type { Event, Goal, OpportunityRecommendation, SchoolIdentity, Task } from '../../shared/types';
import { Ionicons } from '@expo/vector-icons';

const NEXT_LEVEL_XP = 500;

function getGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  const base = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return name ? `${base}, ${name}` : base;
}

type PriorityItem = {
  title: string;
  message: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  action?: string;
};

function computePriority(tasks: Task[], events: Event[], goals: Goal[], user: AuthSession | null): PriorityItem {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const overdue = tasks.find((t) => !t.completed && t.dueDate && t.dueDate < today);
  if (overdue) {
    return { title: 'Overdue', message: overdue.title, icon: 'alert-circle', action: 'Complete it today' };
  }
  const todayEvent = events.find((e) => e.startsAt?.startsWith(today));
  if (todayEvent) {
    return { title: 'Happening today', message: todayEvent.title, icon: 'calendar', action: 'View event' };
  }
  const streak = user?.streak?.current ?? 0;
  if (streak === 0 && tasks.length > 0) {
    return { title: 'Streak recovery', message: 'Complete a task to start a new streak.', icon: 'flame', action: 'Pick a task' };
  }
  if (goals.length > 0) {
    const lowest = goals.reduce((a, b) => (a.progress < b.progress ? a : b));
    return { title: 'Keep going', message: `${lowest.title} is at ${lowest.progress}%`, icon: 'flag', action: 'Continue goal' };
  }
  if (tasks.length > 0) {
    return { title: 'Next up', message: tasks[0].title, icon: 'checkmark-circle', action: `+${tasks[0].xpReward} XP` };
  }
  return { title: 'All caught up', message: 'You have no urgent items right now.', icon: 'sparkles', action: 'Explore opportunities' };
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<AuthSession | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityRecommendation[]>([]);
  const [school, setSchool] = useState<SchoolIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pressedTask, setPressedTask] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [bounce] = useState(() => new Animated.Value(1));

  async function load(silent = false) {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const [u, t, g, e, o] = await Promise.all([
        authService.getSession().catch(() => null),
        cloudflareService.listTasks().catch(() => []),
        cloudflareService.listGoals().catch(() => []),
        cloudflareService.listEvents().catch(() => []),
        cloudflareService.getOpportunities().catch(() => []),
      ]);
      setUser(u);
      setTasks(t.filter((x) => !x.completed).slice(0, 5));
      setGoals(g.filter((x) => !x.completed).slice(0, 5));
      setEvents(e.slice(0, 5));
      setOpportunities(o);
      if (u?.schoolId) {
        setSchool(await cloudflareService.getSchool(u.schoolId).catch(() => null));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function completeTask(task: Task) {
    setPressedTask(task.id);
    Animated.sequence([
      Animated.timing(bounce, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 1.02, duration: 120, useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    try {
      await cloudflareService.updateTask(task.id, { completed: true });
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      Vibration.vibrate([0, 50, 50, 100]);
      setConfetti(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task');
    } finally {
      setPressedTask(null);
    }
  }

  const xp = user?.xp ?? 0;
  const xpProgress = Math.min(100, (xp % NEXT_LEVEL_XP) / NEXT_LEVEL_XP * 100);
  const priority = computePriority(tasks, events, goals, user);


  if (loading && !user) {
    return (
      <AppShell title="Dashboard" mode="atmospheric" transparent>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={user ? getGreeting(user.name) : 'Welcome to SparkNC'}
      overline="HOME"
      mode="atmospheric"
      trailing={
        user && (user.streak?.current ?? 0) > 0 ? (
          <SparkBadge label={`${user.streak.current} streak`} color={colors.yellow} icon="flame" size="sm" />
        ) : null
      }
    >
      <Confetti active={confetti} onDone={() => setConfetti(false)} />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={colors.primary}
          />
        }
      >
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <FadeIn delay={0}>
          <View style={styles.heroCard}>
            <SparkProgressRing progress={xpProgress / 100} size={96} stroke={8} color={colors.success} showGlow>
              <View style={styles.ringText}>
                <Text style={[styles.ringValue, { color: colors.foreground }]}>{Math.floor(xp / NEXT_LEVEL_XP)}</Text>
                <Text style={[styles.ringLabel, { color: colors.muted }]}>LVL</Text>
              </View>
            </SparkProgressRing>
            <View style={styles.heroText}>
              <Text style={[styles.heroCaption, { color: colors.muted }]}>
                {school ? school.mascot ?? school.name : user?.role ?? 'Student'}
              </Text>
              <Text style={[styles.heroXPLabel, { color: colors.foreground }]}>
                {xp} <Text style={{ color: colors.muted }}>/ {NEXT_LEVEL_XP} XP</Text>
              </Text>
              <Text style={[styles.xpToNext, { color: colors.success }]}>
                {NEXT_LEVEL_XP - (xp % NEXT_LEVEL_XP)} XP to next level
              </Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={80}>
          <SparkCard variant="grouped">
            <SparkListRow
              title={priority.title}
              subtitle={priority.message}
              detail={priority.action}
              icon={priority.icon}
              iconBackground={colors.primarySoft}
              onPress={() => router.push('/(tabs)/tasks')}
            />
          </SparkCard>
        </FadeIn>

        <FadeIn delay={160}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.heading, { color: colors.foreground }]}>Active Tasks</Text>
            <Pressable onPress={() => router.push('/(tabs)/tasks')} accessibilityRole="button" accessibilityLabel="View all tasks">
              <Text style={[styles.link, { color: colors.primary }]}>View all</Text>
            </Pressable>
          </View>
          {tasks.length === 0 ? (
            <SparkEmptyState
              illustration={<EmptyTasksIllustration />}
              title="Your day is wide open"
              message="Add a task to start your streak."
              action={{ label: 'Add a task', onPress: () => router.push('/(tabs)/tasks') }}
            />
          ) : (
            <SparkCard variant="grouped">
              {tasks.slice(0, 3).map((task, index) => (
                <React.Fragment key={task.id}>
                  <SparkListRow
                    title={task.title}
                    subtitle={`+${task.xpReward ?? 0} XP`}
                    detail={pressedTask === task.id ? 'Completing…' : ''}
                    icon="ellipse-outline"
                    iconColor={colors.primary}
                    onPress={() => completeTask(task)}
                    showChevron={false}
                  />
                  {index < Math.min(tasks.length, 3) - 1 ? null : null}
                </React.Fragment>
              ))}
            </SparkCard>
          )}
        </FadeIn>

        {opportunities.length > 0 ? (
          <FadeIn delay={240}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.heading, { color: colors.foreground }]}>Discover</Text>
            </View>
            <SparkCard variant="hero">
              <Text style={[styles.oppTitle, { color: colors.foreground }]} numberOfLines={2}>{opportunities[0].title}</Text>
              <Text style={[styles.oppWhy, { color: colors.muted }]} numberOfLines={2}>{opportunities[0].reason}</Text>
              <SparkButton title="Explore" onPress={() => router.push('/(tabs)/more')} variant="secondary" style={{ marginTop: spacing.sm }} />
            </SparkCard>
          </FadeIn>
        ) : null}

        <FadeIn delay={320}>
          <SparkButton title="Add a task" onPress={() => router.push('/(tabs)/tasks')} style={styles.addButton} />
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { ...typography.body },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  heroText: { flex: 1, gap: spacing.xs },
  heroCaption: { ...typography.footnote },
  heroXPLabel: { ...typography.title2 },
  xpToNext: { ...typography.caption1 },
  ringText: { alignItems: 'center', justifyContent: 'center' },
  ringValue: { ...typography.metric },
  ringLabel: { ...typography.caption2 },
  heading: { ...typography.title2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  link: { ...typography.footnote, fontWeight: '600' },
  oppTitle: { ...typography.headline },
  oppWhy: { ...typography.subheadline },
  addButton: { marginTop: spacing.md },
});
