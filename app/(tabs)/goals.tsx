import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { SparkButton } from '../../components/SparkButton';
import { SparkCard } from '../../components/SparkCard';
import { SparkInput } from '../../components/SparkInput';
import { SparkListRow } from '../../components/SparkListRow';
import { SparkEmptyState } from '../../components/SparkEmptyState';
import { SparkBadge } from '../../components/SparkBadge';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { radius, spacing, spark, typography } from '../../theme';
import type { Goal, GrowthStatistics } from '../../shared/types';
import { Ionicons } from '@expo/vector-icons';

type SuggestedGoal = {
  id: string;
  title: string;
  description: string;
  reason: string;
};

function generateSuggestions(stats: GrowthStatistics, existingGoals: Goal[]): SuggestedGoal[] {
  const suggestions: SuggestedGoal[] = [];
  const lowerTitles = existingGoals.map((g) => g.title.toLowerCase());
  const has = (text: string) => lowerTitles.some((t) => t.includes(text.toLowerCase()));

  if (stats.currentStreak < 7 && !has('streak')) {
    suggestions.push({
      id: 'streak-7',
      title: 'Build a 7-day streak',
      description: 'Complete at least one task each day for the next week.',
      reason: `Your current streak is ${stats.currentStreak} days.`,
    });
  }
  if (stats.eventsAttended < 3 && !has('event')) {
    suggestions.push({
      id: 'attend-event',
      title: 'Attend one community event',
      description: 'Join an event that matches your interests.',
      reason: `You have attended ${stats.eventsAttended} events.`,
    });
  }
  if (stats.tasksCompleted < 5 && !has('task')) {
    suggestions.push({
      id: 'complete-tasks',
      title: 'Complete three tasks',
      description: 'Finish three tasks to build momentum and earn XP.',
      reason: `You have completed ${stats.tasksCompleted} tasks.`,
    });
  }
  if (!has('leadership')) {
    suggestions.push({
      id: 'explore-leadership',
      title: 'Explore a leadership opportunity',
      description: 'Look for a club or project where you can take initiative.',
      reason: 'Leadership goals help grow impact and confidence.',
    });
  }
  return suggestions.slice(0, 3);
}

export default function GoalsScreen() {
  const { colors } = useTheme();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedGoal[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [items, stats] = await Promise.all([
        cloudflareService.listGoals(),
        cloudflareService.getGrowthStatistics().catch(() => null),
      ]);
      setGoals(items);
      if (stats) {
        setSuggestions(generateSuggestions(stats, items));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(customTitle?: string, customDescription?: string) {
    const t = (customTitle ?? title).trim();
    if (!t) return;
    try {
      const { item } = await cloudflareService.createGoal({
        title: t,
        description: (customDescription ?? description).trim() || undefined,
      });
      setGoals((prev) => [item, ...prev]);
      setTitle('');
      setDescription('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create goal');
    }
  }

  async function handleComplete(id: string) {
    try {
      const { item } = await cloudflareService.completeGoal(id);
      setGoals((prev) => prev.map((g) => (g.id === id ? item : g)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to complete goal');
    }
  }

  async function handleDelete(id: string) {
    try {
      await cloudflareService.deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete goal');
    }
  }

  function handleAccept(s: SuggestedGoal) {
    handleAdd(s.title, s.description);
    setSuggestions((prev) => prev.filter((x) => x.id !== s.id));
  }

  function handleDismiss(id: string) {
    setDismissed((prev) => [...prev, id]);
  }

  function renderSuggestion(s: SuggestedGoal) {
    if (dismissed.includes(s.id)) return null;
    return (
      <SparkCard
        key={s.id}
        style={{
          backgroundColor: `${colors.yellow}15`,
          borderColor: colors.yellow,
          padding: spacing.md,
          borderRadius: radius.xl,
          gap: spacing.xs,
        }}
      >
        <View style={styles.suggestionHeader}>
          <Text style={[styles.itemTitle, { color: colors.foreground }]}>{s.title}</Text>
          <SparkBadge label={s.reason} color={colors.yellow} size="sm" />
        </View>
        <Text style={[styles.body, { color: colors.muted }]}>{s.description}</Text>
        <View style={styles.suggestionActions}>
          <SparkButton title="Accept" onPress={() => handleAccept(s)} variant="success" style={{ flex: 1 }} />
          <SparkButton title="Dismiss" onPress={() => handleDismiss(s.id)} variant="secondary" style={{ flex: 1 }} />
        </View>
      </SparkCard>
    );
  }

  function renderItem({ item }: { item: Goal }) {
    return (
      <SparkListRow
        title={item.title}
        subtitle={item.description}
        detail={`${item.progress}%`}
        icon={item.completed ? 'checkmark-circle' : 'flag'}
        iconColor={item.completed ? colors.success : colors.primary}
        showChevron={false}
        onPress={() => { if (!item.completed) handleComplete(item.id); }}
      />
    );
  }

  return (
    <AppShell title="Goals" overline="GROWTH" mode="editorial">
      <View style={styles.form}>
        <SparkInput placeholder="What do you want to achieve?" value={title} onChangeText={setTitle} />
        <SparkInput placeholder="Why does this matter to you?" value={description} onChangeText={setDescription} />
        <SparkButton title="Add goal" onPress={() => handleAdd()} accessibilityLabel="Add new goal" />
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionsSection}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Suggested Goals</Text>
          {suggestions.map(renderSuggestion)}
        </View>
      )}

      {loading && goals.length === 0 ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <SparkEmptyState
              icon={<Ionicons name="flag-outline" size={32} color={colors.primary} />}
              title="No goals yet"
              message="Set a goal to grow your impact."
            />
          }
        />
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.sm, marginBottom: spacing.md },
  heading: { ...typography.title2, marginBottom: spacing.sm },
  suggestionsSection: { gap: spacing.md, marginBottom: spacing.md },
  suggestionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  suggestionActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  list: { paddingBottom: spacing.xxl },
  itemTitle: { ...typography.headline },
  body: { ...typography.body },
});
