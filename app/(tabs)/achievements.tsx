import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SparkButton } from "../../components/SparkButton";
import { AppShell } from '../../components/AppShell';
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
      <AppShell title="Achievements">
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="Achievements">
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={[styles.body, { color: colors.highlight }]}>{error}</Text>}

        {achievements.length === 0 ? (
          <Text style={[styles.body, { color: colors.muted }]}>No achievements available.</Text>
        ) : (
          achievements.map((achievement: Achievement) => (
            <View key={achievement.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: achievement.unlockedAt ? 1 : 0.6 }]}>
              <Text style={[styles.heading, { color: colors.foreground }]}>{achievement.title}</Text>
              <Text style={[styles.body, { color: colors.muted }]}>{achievement.description}</Text>
              <Text style={[styles.caption, { color: achievement.unlockedAt ? colors.accent : colors.muted }]}>
                {achievement.unlockedAt ? `Unlocked ${achievement.unlockedAt.split('T')[0]}` : `Locked - ${achievement.points} XP`}
              </Text>
            </View>
          ))
        )}

        <SparkButton title={checking ? 'Checking...' : 'Check for New Unlocks'} onPress={check} variant="primary" disabled={checking} />
        <SparkButton title="Refresh" onPress={load} variant="muted" />
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: spacing.lg, borderRadius: 20, borderWidth: 1, gap: spacing.sm },
  heading: { ...typography.heading },
  body: { ...typography.body },
  caption: { ...typography.caption },
});
