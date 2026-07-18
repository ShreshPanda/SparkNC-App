import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { authService, type AuthSession } from '../../services/authService';
import { spacing, typography } from '../../theme';

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
      <AppShell title="Profile">
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </AppShell>
    );
  }

  if (error || !user) {
    return (
      <AppShell title="Profile">
        <Text style={[styles.body, { color: colors.highlight }]}>{error ?? 'Not authenticated'}</Text>
      </AppShell>
    );
  }

  return (
    <AppShell title="Profile">
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>{user.name}</Text>
          <Text style={[styles.body, { color: colors.muted }]}>{user.email}</Text>
          <Text style={[styles.role, { color: colors.accent }]}>{user.role}</Text>
        </View>

        <View style={[styles.row, styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.highlight }]}>{user.xp ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>XP</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.accent }]}>{user.streak?.current ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Streak</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{user.streak?.longest ?? 0}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Best</Text>
          </View>
        </View>

        <View style={styles.button}>
          <Button title="Sign out" onPress={handleLogout} color={colors.accent} />
        </View>
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
  role: { ...typography.caption, textTransform: 'capitalize' },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { ...typography.title },
  statLabel: { ...typography.caption },
  button: { marginTop: spacing.md },
});
