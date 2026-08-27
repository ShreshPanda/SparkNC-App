import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SparkButton } from "../../components/SparkButton";
import { AppShell } from '../../components/AppShell';
import { SparkAvatar } from '../../components/SparkAvatar';
import { SparkMetric } from '../../components/SparkMetric';
import { SparkCard } from '../../components/SparkCard';
import { useTheme } from '../../providers/ThemeProvider';
import { authService, type AuthSession } from '../../services/authService';
import { radius, spacing, typography } from '../../theme';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const u = await authService.getSession();
        if (!cancelled) setUser(u);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleLogout() {
    await authService.signOut();
    router.replace('/(auth)/login');
  }

  if (loading) {
    return (
      <AppShell title="Profile" overline="YOU" mode="editorial">
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </AppShell>
    );
  }

  if (error || !user) {
    return (
      <AppShell title="Profile" overline="YOU" mode="editorial">
        <Text style={[styles.body, { color: colors.error }]}>{error ?? 'Not authenticated'}</Text>
      </AppShell>
    );
  }

  return (
    <AppShell title="Profile" overline="YOU" mode="editorial">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <SparkAvatar name={user.name ?? 'You'} size="xl" />
          <View style={styles.identity}>
            <Text style={[styles.heading, { color: colors.foreground }]}>{user.name}</Text>
            <Text style={[styles.body, { color: colors.muted }]}>{user.email}</Text>
            <Text style={[styles.role, { color: colors.primary }]}>{user.role}</Text>
          </View>
        </View>

        <SparkCard variant="grouped">
          <View style={styles.row}>
            <SparkMetric label="XP" value={user.xp ?? 0} color={colors.yellow} style={styles.stat} size="small" />
            <SparkMetric label="Streak" value={user.streak?.current ?? 0} color={colors.success} style={styles.stat} size="small" />
            <SparkMetric label="Best" value={user.streak?.longest ?? 0} color={colors.foreground} style={styles.stat} size="small" />
          </View>
        </SparkCard>

        <View style={styles.button}>
          <SparkButton title="Sign out" onPress={handleLogout} variant="secondary" />
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  identity: { alignItems: 'center', gap: spacing.xs },
  heading: { ...typography.title2 },
  body: { ...typography.body },
  role: { ...typography.caption, textTransform: 'capitalize' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  stat: { flex: 1 },
  button: { marginTop: spacing.md },
});
