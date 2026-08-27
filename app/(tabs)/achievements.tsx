import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SparkButton } from "../../components/SparkButton";
import { AppShell } from '../../components/AppShell';
import { SparkCard } from '../../components/SparkCard';
import { SparkEmptyState } from '../../components/SparkEmptyState';
import { EmptyAchievementsIllustration } from '../../components/visual/EmptyIllustration';
import { SparkBadge } from '../../components/SparkBadge';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import type { Achievement } from '../../shared/types';

export default function AchievementsScreen() {
  const { colors } = useTheme();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await cloudflareService.listAchievements();
      setAchievements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }

  async function check() {
    try {
      setChecking(true);
      await cloudflareService.checkAchievements();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check achievements');
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <AppShell title="Achievements" overline="MILESTONES" mode="immersive">
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </AppShell>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  return (
    <AppShell title="Achievements" overline="MILESTONES" mode="immersive">
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={[styles.body, { color: colors.error }]}>{error}</Text>}

        <View style={styles.hero}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>{unlockedCount}</Text>
          <Text style={[styles.heroBody, { color: colors.muted }]}>
            {unlockedCount} of {achievements.length} unlocked
          </Text>
        </View>

        {achievements.length === 0 ? (
          <SparkEmptyState
            illustration={<EmptyAchievementsIllustration />}
            title="No achievements yet"
            message="Complete tasks, goals, and events to earn your first achievement."
          />
        ) : (
          achievements.map((achievement: Achievement) => (
            <SparkCard
              key={achievement.id}
              style={[styles.card, { opacity: achievement.unlockedAt ? 1 : 0.6 }]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.heading, { color: colors.foreground }]}>{achievement.title}</Text>
                <SparkBadge
                  label={achievement.unlockedAt ? 'Unlocked' : `Locked — ${achievement.points} XP`}
                  color={achievement.unlockedAt ? colors.success : colors.muted}
                  size="sm"
                />
              </View>
              <Text style={[styles.body, { color: colors.muted }]}>{achievement.description}</Text>
              {achievement.unlockedAt ? (
                <Text style={[styles.caption, { color: colors.primary }]}>
                  Unlocked {achievement.unlockedAt.split('T')[0]}
                </Text>
              ) : null}
            </SparkCard>
          ))
        )}

        <SparkButton title={checking ? 'Checking...' : 'Check for New Unlocks'} onPress={check} variant="primary" disabled={checking} />
        <SparkButton title="Refresh" onPress={load} variant="secondary" />
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { gap: spacing.sm, marginBottom: spacing.md },
  heroTitle: { ...typography.metricLarge },
  heroBody: { ...typography.body },
  card: { padding: spacing.lg, borderRadius: 20, gap: spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  heading: { ...typography.heading },
  body: { ...typography.body },
  caption: { ...typography.caption },
});
