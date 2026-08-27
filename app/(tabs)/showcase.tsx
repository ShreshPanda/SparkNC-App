import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SparkButton } from "../../components/SparkButton";
import { AppShell } from '../../components/AppShell';
import { SparkEmptyState } from '../../components/SparkEmptyState';
import { FadeIn } from '../../components/AnimatedWrapper';
import { SparkCard } from '../../components/SparkCard';
import { SparkMetric } from '../../components/SparkMetric';
import { SparkSection } from '../../components/SparkSection';
import { SparkListRow } from '../../components/SparkListRow';
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
      <AppShell title="SparkNC Showcase" overline="DEMO" mode="data">
        <ScrollView contentContainerStyle={styles.container}>
          <ActivityIndicator color={colors.primary} />
        </ScrollView>
      </AppShell>
    );
  }

  if (error || !scenario) {
    return (
      <AppShell title="SparkNC Showcase" overline="DEMO" mode="data">
        <ScrollView contentContainerStyle={styles.container}>
          <SparkEmptyState
            icon={<Ionicons name="sad-outline" size={32} color={colors.primary} />}
            title="Showcase unavailable"
            message={error ?? 'No demo data loaded.'}
          />
          <SparkButton title="Retry" onPress={load} variant="primary" />
        </ScrollView>
      </AppShell>
    );
  }

  return (
    <AppShell title="SparkNC Showcase" overline="DEMO" mode="data">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.headline, { color: colors.foreground }]}>Leadership Demo</Text>
        <Text style={[styles.sub, { color: colors.muted }]}>See the student, ambassador, and admin experiences.</Text>

        <FadeIn delay={0}>
          <SparkSection title="STUDENT GROWTH" inset={false}>
            <SparkCard variant="grouped">
              {scenario.students.map((s: { id: string; name: string; xp: number; streak: number }) => (
                <SparkListRow
                  key={s.id}
                  title={s.name}
                  subtitle={`Level ${Math.floor(s.xp / 100) + 1}`}
                  detail={`${s.xp} XP · ${s.streak} streak`}
                  icon="person-outline"
                  iconColor={colors.primary}
                  showChevron={false}
                />
              ))}
            </SparkCard>
          </SparkSection>
        </FadeIn>

        <FadeIn delay={100}>
          <SparkSection title="AMBASSADOR VIEW" inset={false}>
            <SparkCard variant="grouped">
              {scenario.ambassadorView.map((a) => (
                <SparkListRow
                  key={a.studentId}
                  title={a.name}
                  subtitle={a.status}
                  detail={a.recommendation}
                  icon="people-outline"
                  iconColor={colors.success}
                  showChevron={false}
                />
              ))}
            </SparkCard>
          </SparkSection>
        </FadeIn>

        <FadeIn delay={200}>
          <SparkSection title="ADMIN IMPACT" inset={false}>
            <View style={styles.kpiRow}>
              <SparkMetric
                label="Students"
                value={scenario.adminMetrics.totalStudents}
                icon="people-outline"
                color={colors.primary}
              />
              <SparkMetric
                label="Active this month"
                value={scenario.adminMetrics.activeThisMonth}
                icon="flame-outline"
                color={colors.success}
              />
            </View>
            <SparkCard>
              <Text style={[styles.heading, { color: colors.foreground }]}>Top improvement</Text>
              <Text style={[styles.body, { color: colors.muted }]}>{scenario.adminMetrics.topImprovement}</Text>
            </SparkCard>
          </SparkSection>
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxl },
  headline: { ...typography.title1, marginBottom: spacing.sm },
  sub: { ...typography.body, marginBottom: spacing.lg },
  kpiRow: { flexDirection: 'row', gap: spacing.md },
  heading: { ...typography.title2, marginBottom: spacing.sm },
  body: { ...typography.body },
});
