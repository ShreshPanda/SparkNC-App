import React, { useEffect, useState } from 'react';
import {  ScrollView, StyleSheet, Text, View } from 'react-native';
import { SparkButton } from "../../components/SparkButton";
import { AppShell } from '../../components/AppShell';
import { EmptyState } from '../../components/EmptyState';
import { FadeIn } from '../../components/AnimatedWrapper';
import { SparkCard } from '../../components/SparkCard';
import { Skeleton } from '../../components/Skeleton';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import type { DemoScenario } from '../../shared/types';

export default function ShowcaseScreen() {
  const { colors } = useTheme();
  const [scenario, setScenario] = useState<DemoScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await cloudflareService.getDemoScenario();
      setScenario(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load showcase');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <AppShell title="SparkNC Showcase">
        <ScrollView contentContainerStyle={styles.container}>
          <Skeleton height={180} borderRadius={20} />
          <Skeleton height={120} borderRadius={20} />
          <Skeleton height={160} borderRadius={20} />
        </ScrollView>
      </AppShell>
    );
  }

  if (error || !scenario) {
    return (
      <AppShell title="SparkNC Showcase">
        <EmptyState title="Showcase unavailable" message={error ?? 'No demo data loaded.'} icon="sad-outline" />
        <View style={styles.retry}>
          <SparkButton title="Retry" onPress={load} variant="primary" />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="SparkNC Showcase">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.headline, { color: colors.foreground }]}>Leadership Demo</Text>
        <Text style={[styles.sub, { color: colors.muted }]}>See the student, ambassador, and admin experiences.</Text>

        <FadeIn delay={0}>
          <SparkCard style={styles.section}>
            <Text style={[styles.heading, { color: colors.foreground }]}>Student Growth</Text>
            {scenario.students.map((s: { id: string; name: string; xp: number; streak: number }) => (
              <View key={s.id} style={styles.studentRow}>
                <Text style={[styles.body, { color: colors.foreground }]}>{s.name}</Text>
                <Text style={[styles.caption, { color: colors.muted }]}>Level {Math.floor(s.xp / 100) + 1} · {s.xp} XP · {s.streak} streak</Text>
              </View>
            ))}
          </SparkCard>
        </FadeIn>

        <FadeIn delay={100}>
          <SparkCard style={styles.section}>
            <Text style={[styles.heading, { color: colors.foreground }]}>Ambassador View</Text>
            {scenario.ambassadorView.map((a) => (
              <View key={a.studentId} style={styles.studentRow}>
                <Text style={[styles.body, { color: colors.foreground }]}>{a.name}</Text>
                <Text style={[styles.caption, { color: colors.muted }]}>{a.status} — {a.recommendation}</Text>
              </View>
            ))}
          </SparkCard>
        </FadeIn>

        <FadeIn delay={200}>
          <SparkCard style={styles.section}>
            <Text style={[styles.heading, { color: colors.foreground }]}>Admin Impact</Text>
            <Text style={[styles.body, { color: colors.foreground }]}>{scenario.adminMetrics.totalStudents} students · {scenario.adminMetrics.activeThisMonth} active this month</Text>
            <Text style={[styles.caption, { color: colors.muted }]}>Top improvement: {scenario.adminMetrics.topImprovement}</Text>
          </SparkCard>
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.xl },
  headline: { ...typography.heading, fontSize: 24, marginBottom: spacing.sm },
  sub: { ...typography.body, marginBottom: spacing.lg },
  section: { marginBottom: spacing.md },
  heading: { ...typography.heading, marginBottom: spacing.sm },
  body: { ...typography.body },
  caption: { ...typography.caption },
  studentRow: { marginBottom: spacing.sm, gap: spacing.xs },
  retry: { padding: spacing.lg },
});
