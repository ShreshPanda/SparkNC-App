import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/AppShell';
import { SparkEmptyState } from '../../components/SparkEmptyState';
import { SparkBadge } from '../../components/SparkBadge';
import { SparkAvatar } from '../../components/SparkAvatar';
import { FadeIn } from '../../components/AnimatedWrapper';
import { SparkButton } from '../../components/SparkButton';
import { SparkCard } from '../../components/SparkCard';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { radius, spacing, spark, typography } from '../../theme';
import type { AmbassadorStudentSupport } from '../../shared/types';

const ACTIONS = [
  { key: 'goal', label: 'Recommend goal', body: 'I think a leadership goal would be a great next step for you. Let me know if you want suggestions.' },
  { key: 'event', label: 'Recommend event', body: 'There is an upcoming event that matches your interests. Would you like to attend together?' },
  { key: 'celebrate', label: 'Celebrate', body: 'I noticed your recent progress — keep up the great work!' },
  { key: 'follow-up', label: 'Flag follow-up', body: 'Can we check in this week? I want to make sure you have what you need.' },
];

export default function AmbassadorScreen() {
  const { colors } = useTheme();
  const [students, setStudents] = useState<AmbassadorStudentSupport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<Record<string, string>>({});

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

  async function sendAction(studentId: string, body: string, key: string) {
    try {
      await cloudflareService.sendMessage({ recipientId: studentId, body });
      setSent((prev) => ({ ...prev, [`${studentId}-${key}`]: 'Sent' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }

  const sorted = useMemo(
    () =>
      [...students].sort((a, b) => {
        const priority = (s: AmbassadorStudentSupport) => (s.status === 'needs_attention' ? 0 : s.status === 'at_risk' ? 1 : s.status === 'active' ? 2 : 3);
        return priority(a) - priority(b);
      }),
    [students]
  );

  if (loading) {
    return (
      <AppShell title="Ambassador" overline="LEADERSHIP" mode="editorial">
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </AppShell>
    );
  }

  const needsAttention = students.filter((s) => s.status === 'needs_attention').length;
  const thriving = students.filter((s) => s.status === 'thriving').length;

  return (
    <AppShell title="Ambassador" overline="LEADERSHIP" mode="editorial">
      <ScrollView contentContainerStyle={styles.container}>
        {error ? <Text style={[styles.body, { color: colors.error }]}>{error}</Text> : null}

        <FadeIn delay={0}>
          <SparkCard style={[styles.summary, { backgroundColor: colors.primary }]}>
            <Text style={[styles.summaryTitle, { color: spark.white }]}>Today's focus</Text>
            <Text style={[styles.summaryBody, { color: spark.white }]}>
              {students.length === 0 ? 'No assigned students yet.' : `${needsAttention} need attention · ${thriving} thriving`}
            </Text>
          </SparkCard>
        </FadeIn>

        {students.length === 0 ? (
          <SparkEmptyState
            icon={<Ionicons name="people-outline" size={32} color={colors.primary} />}
            title="No assigned students"
            message="Check back once students are matched with you."
          />
        ) : (
          sorted.map((item: AmbassadorStudentSupport, i: number) => (
            <FadeIn key={item.student.id} delay={80 + i * 60}>
              <SparkCard>
                <View style={styles.studentHeader}>
                  <View style={styles.studentMeta}>
                    <SparkAvatar name={item.student.name ?? 'Student'} size="md" />
                    <View>
                      <Text style={[styles.heading, { color: colors.foreground }]}>{item.student.name ?? item.student.email ?? item.student.id}</Text>
                      <Text style={[styles.body, { color: colors.muted }]}>{item.reason}</Text>
                    </View>
                  </View>
                  <SparkBadge label={item.status} color={statusColor(item.status, colors)} size="sm" />
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="flame-outline" size={14} color={colors.muted} />
                  <Text style={[styles.body, { color: colors.muted }]}>{item.stats.xp} XP</Text>
                  <Ionicons name="flash-outline" size={14} color={colors.muted} />
                  <Text style={[styles.body, { color: colors.muted }]}>{item.stats.currentStreak} streak</Text>
                  <Ionicons name="checkmark-circle-outline" size={14} color={colors.muted} />
                  <Text style={[styles.body, { color: colors.muted }]}>{item.stats.tasksCompleted} tasks</Text>
                </View>
                <Text style={[styles.caption, { color: colors.primary }]}>Suggested: {item.suggestedAction}</Text>
                <View style={styles.actions}>
                  {ACTIONS.map((a) => (
                    <Pressable key={a.key} onPress={() => sendAction(item.student.id, a.body, a.key)} style={[styles.actionButton, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]} accessibilityRole="button" accessibilityLabel={`${a.label} ${item.student.name ?? item.student.email ?? 'student'}`}>
                      <Text style={[styles.actionText, { color: sent[`${item.student.id}-${a.key}`] ? colors.primary : colors.foreground }]}>
                        {sent[`${item.student.id}-${a.key}`] ?? a.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </SparkCard>
            </FadeIn>
          ))
        )}

        <FadeIn delay={600}>
          <SparkButton title="Refresh" onPress={load} variant="muted" />
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}

function statusColor(status: string, colors: any): string {
  switch (status) {
    case 'thriving':
      return colors.success ?? '#22c55e';
    case 'active':
      return colors.info ?? '#3b82f6';
    case 'needs_attention':
      return colors.error ?? '#ef4444';
    case 'at_risk':
      return colors.warning ?? '#f59e0b';
    default:
      return colors.border;
  }
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summary: { padding: spacing.lg, borderRadius: 24, gap: spacing.sm },
  summaryTitle: { ...typography.title1 },
  summaryBody: { ...typography.body },
  studentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  studentMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  heading: { ...typography.title2 },
  body: { ...typography.body },
  caption: { ...typography.footnote, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap', marginTop: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  actionButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
  actionText: { ...typography.footnote, fontWeight: '700' },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 999 },
  statusText: { ...typography.footnote, fontWeight: '700' },
});
