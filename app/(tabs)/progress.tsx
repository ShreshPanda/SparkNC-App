import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
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

        <View style={[styles.row, styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.highlight }]}>{dashboard?.xp ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>XP</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.accent }]}>{dashboard?.level ?? 1}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Level</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{dashboard?.currentStreak ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Streak</Text>
          </View>
        </View>

        <View style={[styles.row, styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.highlight }]}>{dashboard?.tasksCompleted ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Tasks</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.accent }]}>{dashboard?.goalsCompleted ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Goals</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{dashboard?.eventsAttended ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Events</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Engagement Score</Text>
          <Text style={[styles.statValue, { color: colors.accent }]}>{dashboard?.engagementScore ?? 0}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Insights</Text>
          {dashboard?.insights && dashboard.insights.length === 0 ? (
            <Text style={[styles.body, { color: colors.muted }]}>No insights yet. Tap Generate to analyze your data.</Text>
          ) : (
            dashboard?.insights?.map((insight: StudentInsight) => (
              <View key={insight.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.heading, { color: colors.foreground }]}>{insight.title}</Text>
                <Text style={[styles.body, { color: colors.muted }]}>{insight.description}</Text>
              </View>
            ))
          )}
        </View>

        <Button title={generating ? 'Analyzing...' : 'Generate Insights'} onPress={generate} color={colors.accent} disabled={generating} />
        <Button title="Refresh" onPress={load} color={colors.muted} />
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: spacing.lg, borderRadius: 20, borderWidth: 1, gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  heading: { ...typography.heading },
  body: { ...typography.body },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { ...typography.title },
  statLabel: { ...typography.caption },
  section: { gap: spacing.sm },
});
