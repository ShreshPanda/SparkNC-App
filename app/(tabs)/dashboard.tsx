import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { AnimatedNumber } from '../../components/AnimatedNumber';
import { EmptyState } from '../../components/EmptyState';
import { FadeIn } from '../../components/AnimatedWrapper';
import { ProgressRing } from '../../components/ProgressRing';
import { SparkCard } from '../../components/SparkCard';
import { TodaysSpark } from '../../components/TodaysSpark';
import { useTheme } from '../../providers/ThemeProvider';
import { authService, type AuthSession } from '../../services/authService';
import { cloudflareService } from '../../services/cloudflareService';
import { colors, spacing, typography } from '../../theme';
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task');
    } finally {
      setPressedTask(null);
    }
  }

  if (loading && !user) {
    return (
      <AppShell title="Dashboard">
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </AppShell>
    );
  }

  const xp = user?.xp ?? 0;
  const xpProgress = Math.min(100, (xp % NEXT_LEVEL_XP) / NEXT_LEVEL_XP * 100);
  const priority = computePriority(tasks, events, goals, user);

  const insights = useMemo(() => {
    const list: { message: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [];
    const remaining = NEXT_LEVEL_XP - (xp % NEXT_LEVEL_XP);
    list.push({ message: `You are ${remaining} XP from your next level.`, icon: 'trending-up-outline' });
    if (tasks.length > 1) list.push({ message: `You have ${tasks.length} active tasks today.`, icon: 'checkmark-circle-outline' });
    if (goals.length > 0) {
      const top = goals.reduce((a, b) => (a.progress < b.progress ? a : b));
      list.push({ message: `${top.title} is at ${top.progress}% — keep going.`, icon: 'flag-outline' });
    }
    if (events.length > 0) list.push({ message: `Upcoming: ${events[0].title} on ${events[0].startsAt ? events[0].startsAt.split('T')[0] : 'soon'}`, icon: 'calendar-outline' });
    if (opportunities.length > 0) list.push({ message: `${opportunities[0].title} looks like a great fit.`, icon: 'compass-outline' });
    const streak = user?.streak?.current ?? 0;
    if (streak > 0) list.push({ message: `Your ${streak}-day streak is alive.`, icon: 'flame-outline' });
    return list;
  }, [xp, tasks.length, goals, events, opportunities, user?.streak?.current]);

  return (
    <AppShell title="Dashboard">
      <ScrollView contentContainerStyle={styles.container}>
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <FadeIn delay={0}>
          <SparkCard style={[styles.priorityCard, { backgroundColor: colors.highlight }]} accessible accessibilityRole="header" accessibilityLabel={`Priority: ${priority.title}. ${priority.message}`}>
            <View style={styles.priorityRow}>
              <Ionicons name={priority.icon} size={28} color={colors.foreground} accessibilityLabel={priority.title} />
              <View style={styles.priorityText}>
                <Text style={[styles.priorityTitle, { color: colors.foreground }]}>{priority.title}</Text>
                <Text style={[styles.priorityMessage, { color: colors.foreground }]}>{priority.message}</Text>
              </View>
              {priority.action ? <Text style={[styles.priorityAction, { color: colors.foreground }]}>{priority.action}</Text> : null}
            </View>
          </SparkCard>
        </FadeIn>

        <FadeIn delay={40}>
          <SparkCard style={[styles.headerCard, { backgroundColor: colors.primary }]}>
            <Text style={[styles.title, { color: colors.card }]}>
              {user ? getGreeting(user.name) : 'Welcome to SparkNC'}
            </Text>
            <Text style={[styles.body, { color: colors.muted }]}>
              {user ? `${user.role} · ${user.xp ?? 0} XP` : 'Sign in to start tracking'}
            </Text>
            {school ? <Text style={[styles.caption, { color: colors.muted }]}>{school.name}{school.mascot ? ` · ${school.mascot}` : ''}</Text> : null}
          </SparkCard>
        </FadeIn>

        <FadeIn delay={80}>
          <TodaysSpark insights={insights} />
        </FadeIn>

        <FadeIn delay={160}>
          <View style={styles.statsRow}>
            <SparkCard style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <AnimatedNumber value={xp} style={[styles.statValue, { color: colors.highlight }]} suffix=" XP" />
              <Text style={[styles.statLabel, { color: colors.muted }]}>XP</Text>
            </SparkCard>
            <SparkCard style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <AnimatedNumber value={user?.streak?.current ?? 0} style={[styles.statValue, { color: colors.accent }]} />
              <Text style={[styles.statLabel, { color: colors.muted }]}>Streak</Text>
            </SparkCard>
            <SparkCard style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <AnimatedNumber value={tasks.length} style={[styles.statValue, { color: colors.foreground }]} />
              <Text style={[styles.statLabel, { color: colors.muted }]}>Active</Text>
            </SparkCard>
          </View>
        </FadeIn>

        <FadeIn delay={240}>
          <SparkCard>
            <View style={styles.sectionHeader}>
              <Text style={[styles.heading, { color: colors.foreground }]}>Level Progress</Text>
              <Text style={[styles.caption, { color: colors.muted }]}>{Math.floor(xp / NEXT_LEVEL_XP)} → {Math.floor(xp / NEXT_LEVEL_XP) + 1}</Text>
            </View>
            <View style={styles.ringRow}>
              <ProgressRing progress={xpProgress} size={100} strokeWidth={10} color={colors.accent} trackColor={colors.border} label={`${Math.round(xpProgress)}%`} />
              <View style={styles.ringText}>
                <Text style={[styles.body, { color: colors.foreground }]}>{NEXT_LEVEL_XP - (xp % NEXT_LEVEL_XP)} XP to next level</Text>
                <Text style={[styles.caption, { color: colors.muted }]}>Keep the streak alive.</Text>
              </View>
            </View>
          </SparkCard>
        </FadeIn>

        <FadeIn delay={320}>
          <SparkCard>
            <View style={styles.sectionHeader}>
              <Text style={[styles.heading, { color: colors.foreground }]}>Active Tasks</Text>
              {tasks.length > 0 ? <Text style={[styles.caption, { color: colors.muted }]}>{tasks.length} remaining</Text> : null}
            </View>
            {tasks.length === 0 ? (
              <EmptyState title="Your day is wide open" message="Head to the Tasks tab to add your first action." icon="checkmark-circle-outline" />
            ) : (
              tasks.map((task) => (
                <Animated.View key={task.id} style={{ transform: [{ scale: pressedTask === task.id ? bounce : 1 }] }}>
                  <Pressable onPress={() => completeTask(task)} style={styles.row} accessible accessibilityRole="button" accessibilityLabel={`Complete task ${task.title} for ${task.xpReward} XP`}>
                    <View style={[styles.check, { borderColor: colors.accent }]} />
                    <Text style={[styles.listItem, { color: colors.foreground, flex: 1 }]}>{task.title}</Text>
                    <Text style={[styles.caption, { color: colors.accent }]}>+{task.xpReward ?? 0}</Text>
                  </Pressable>
                </Animated.View>
              ))
            )}
          </SparkCard>
        </FadeIn>

        <FadeIn delay={400}>
          <SparkCard>
            <View style={styles.sectionHeader}>
              <Text style={[styles.heading, { color: colors.foreground }]}>Daily Goals</Text>
            </View>
            {goals.length === 0 ? (
              <EmptyState title="No active goals" message="Set a goal to start building momentum." icon="flag-outline" />
            ) : (
              goals.map((goal) => (
                <View key={goal.id} style={styles.goalRow}>
                  <Text style={[styles.listItem, { color: colors.foreground, flex: 1 }]}>{goal.title}</Text>
                  <View style={[styles.progress, { backgroundColor: colors.border }]}>
                    <Animated.View style={[styles.progressFill, { width: `${Math.min(goal.progress ?? 0, 100)}%`, backgroundColor: colors.accent }]} />
                  </View>
                  <AnimatedNumber value={goal.progress ?? 0} style={[styles.caption, { color: colors.muted, width: 40, textAlign: 'right' }]} suffix="%" />
                </View>
              ))
            )}
          </SparkCard>
        </FadeIn>

        <FadeIn delay={480}>
          <SparkCard>
            <View style={styles.sectionHeader}>
              <Text style={[styles.heading, { color: colors.foreground }]}>Upcoming Events</Text>
            </View>
            {events.length === 0 ? (
              <EmptyState title="No upcoming events" message="Check the Calendar tab to find and RSVP to events." icon="calendar-outline" />
            ) : (
              events.map((event) => (
                <View key={event.id} style={styles.row}>
                  <View style={[styles.dot, { backgroundColor: colors.accent }]} />
                  <Text style={[styles.listItem, { color: colors.foreground, flex: 1 }]}>{event.title}</Text>
                  <Text style={[styles.caption, { color: colors.muted }]}>{event.startsAt ? event.startsAt.split('T')[0] : ''}</Text>
                </View>
              ))
            )}
          </SparkCard>
        </FadeIn>

        <FadeIn delay={520}>
          <SparkCard>
            <View style={styles.sectionHeader}>
              <Text style={[styles.heading, { color: colors.foreground }]}>Opportunities for You</Text>
            </View>
            {opportunities.length === 0 ? (
              <EmptyState title="No opportunities yet" message="Keep completing tasks and goals to unlock personalized recommendations." icon="compass-outline" />
            ) : (
              opportunities.map((op) => (
                <View key={op.id} style={styles.opportunityRow}>
                  <View style={styles.opportunityText}>
                    <Text style={[styles.listItem, { color: colors.foreground }]}>{op.title}</Text>
                    <Text style={[styles.caption, { color: colors.muted }]}>{op.reason}</Text>
                  </View>
                  <View style={[styles.scorePill, { backgroundColor: colors.border }]}>
                    <Text style={[styles.caption, { color: colors.foreground, fontWeight: '700' }]}>{op.score}</Text>
                  </View>
                </View>
              ))
            )}
          </SparkCard>
        </FadeIn>

        <FadeIn delay={600}>
          <Pressable onPress={() => load(true)} disabled={refreshing} style={[styles.refresh, { backgroundColor: colors.highlight }]}>
            <Text style={styles.refreshText}>{refreshing ? 'Refreshing…' : 'Refresh'}</Text>
          </Pressable>
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, padding: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { padding: spacing.xl, borderRadius: 24, gap: spacing.sm },
  priorityCard: { padding: spacing.lg, borderRadius: 20, gap: spacing.sm },
  priorityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  priorityText: { flex: 1 },
  priorityTitle: { ...typography.heading, fontSize: 16 },
  priorityMessage: { ...typography.body },
  priorityAction: { ...typography.caption, fontWeight: '700' },
  title: { ...typography.title },
  heading: { ...typography.heading },
  body: { ...typography.body },
  caption: { ...typography.caption },
  error: { ...typography.body },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: { flex: 1, alignItems: 'center', padding: spacing.md },
  statValue: { ...typography.heading, fontSize: 22 },
  statLabel: { ...typography.caption },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  ringRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  ringText: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  check: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  listItem: { ...typography.body },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  opportunityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  opportunityText: { flex: 1 },
  scorePill: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 999, minWidth: 40, alignItems: 'center' },
  progress: { height: 6, borderRadius: 3, flex: 1, overflow: 'hidden' },
  progressFill: { height: '100%' },
  refresh: { padding: spacing.md, borderRadius: 16, alignItems: 'center' },
  refreshText: { color: colors.white, fontWeight: '700' },
});
