import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { authService, type AuthSession } from '../../services/authService';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import type { Event, Goal, Task } from '../../shared/types';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const [user, setUser] = useState<AuthSession | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [u, t, g, e] = await Promise.all([
        authService.getSession().catch(() => null),
        cloudflareService.listTasks().catch(() => []),
        cloudflareService.listGoals().catch(() => []),
        cloudflareService.listEvents().catch(() => []),
      ]);
      setUser(u);
      setTasks(t.filter((x) => !x.completed).slice(0, 5));
      setGoals(g.filter((x) => !x.completed).slice(0, 5));
      setEvents(e.slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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
        {error && <Text style={[styles.error, { color: colors.highlight }]}>{error}</Text>}

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {user ? `Hello, ${user.name}` : 'Welcome'}
          </Text>
          <Text style={[styles.body, { color: colors.muted }]}>
            {user ? user.role : 'Sign in to start tracking'}
          </Text>
        </View>

        <View style={[styles.row, styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.highlight }]}>{user?.xp ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>XP</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.accent }]}>{user?.streak?.current ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Streak</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{tasks.length}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Active</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Active tasks</Text>
          {tasks.length === 0 ? (
            <Text style={[styles.body, { color: colors.muted }]}>No active tasks</Text>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Text style={[styles.listItem, { color: colors.foreground }]}>{item.title}</Text>
              )}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Daily goals</Text>
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

        <View style={styles.section}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Upcoming events</Text>
          {events.length === 0 ? (
            <Text style={[styles.body, { color: colors.muted }]}>No upcoming events</Text>
          ) : (
            events.map((event) => (
              <Text key={event.id} style={[styles.listItem, { color: colors.foreground }]}>
                {event.title}
              </Text>
            ))
          )}
        </View>

        <Button title="Refresh" onPress={load} color={colors.accent} />
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: spacing.lg, borderRadius: 20, borderWidth: 1, gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { ...typography.title },
  heading: { ...typography.heading },
  body: { ...typography.body },
  error: { ...typography.body },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { ...typography.title },
  statLabel: { ...typography.caption },
  section: { gap: spacing.sm },
  listItem: { ...typography.body, paddingVertical: spacing.xs },
  goalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
