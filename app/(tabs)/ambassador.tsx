import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import type { AmbassadorStudentSupport } from '../../shared/types';

export default function AmbassadorScreen() {
  const { colors } = useTheme();
  const [students, setStudents] = useState<AmbassadorStudentSupport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await cloudflareService.getAmbassadorDashboard();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ambassador dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <AppShell title="Ambassador Dashboard">
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="Ambassador Dashboard">
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={[styles.body, { color: colors.highlight }]}>{error}</Text>}

        {students.length === 0 ? (
          <Text style={[styles.body, { color: colors.muted }]}>No assigned students.</Text>
        ) : (
          students.map((item: AmbassadorStudentSupport) => (
            <View key={item.student.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.heading, { color: colors.foreground }]}>{item.student.name ?? item.student.email ?? item.student.id}</Text>
              <Text style={[styles.body, { color: colors.muted }]}>Status: {item.status}</Text>
              <Text style={[styles.body, { color: colors.muted }]}>{item.reason}</Text>
              <Text style={[styles.caption, { color: colors.accent }]}>Suggested action: {item.suggestedAction}</Text>
              <View style={styles.row}>
                <Text style={[styles.body, { color: colors.muted }]}>XP: {item.stats.xp}</Text>
                <Text style={[styles.body, { color: colors.muted }]}>Streak: {item.stats.currentStreak}</Text>
                <Text style={[styles.body, { color: colors.muted }]}>Tasks: {item.stats.tasksCompleted}</Text>
              </View>
            </View>
          ))
        )}
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
  row: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
});
