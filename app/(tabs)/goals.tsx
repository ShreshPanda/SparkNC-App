import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { SparkButton } from '../../components/SparkButton';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { colors, spacing, typography } from '../../theme';
import type { Goal, GrowthStatistics } from '../../shared/types';

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
      <View key={s.id} style={[styles.suggestion, { backgroundColor: colors.highlight + '20', borderColor: colors.highlight }]}>
        <Text style={[styles.itemTitle, { color: colors.foreground }]}>{s.title}</Text>
        <Text style={[styles.body, { color: colors.muted }]}>{s.description}</Text>
        <Text style={[styles.caption, { color: colors.highlight }]}>{s.reason}</Text>
        <View style={styles.suggestionActions}>
          <Pressable onPress={() => handleAccept(s)} style={[styles.suggestionButton, { backgroundColor: colors.accent }]} accessibilityRole="button" accessibilityLabel={`Accept suggestion ${s.title}`}>
            <Text style={styles.suggestionButtonText}>Accept</Text>
          </Pressable>
          <Pressable onPress={() => handleDismiss(s.id)} style={[styles.suggestionButton, { backgroundColor: colors.border }]} accessibilityRole="button" accessibilityLabel={`Dismiss suggestion ${s.title}`}>
            <Text style={[styles.suggestionButtonText, { color: colors.foreground }]}>Dismiss</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderItem({ item }: { item: Goal }) {
    return (
      <View style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.title}</Text>
          {item.completed && <Text style={[styles.badge, { color: colors.accent }]}>Done</Text>}
        </View>
        {item.description ? <Text style={[styles.body, { color: colors.muted }]}>{item.description}</Text> : null}
        <Text style={[styles.caption, { color: colors.muted }]}>Progress: {item.progress}%</Text>
        <View style={styles.actions}>
          {!item.completed && (
            <SparkButton title="Complete" onPress={() => handleComplete(item.id)} variant="primary" accessibilityLabel={`Complete ${item.title}`} />
          )}
          <SparkButton title="Delete" onPress={() => handleDelete(item.id)} variant="secondary" accessibilityLabel={`Delete ${item.title}`} />
        </View>
      </View>
    );
  }

  return (
    <AppShell title="Goals">
      <View style={styles.form}>
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
          placeholder="What do you want to achieve?"
          placeholderTextColor={colors.muted}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
          placeholder="Why does this matter to you?"
          placeholderTextColor={colors.muted}
          value={description}
          onChangeText={setDescription}
        />
        <SparkButton title="Add goal" onPress={() => handleAdd()} variant="primary" accessibilityLabel="Add new goal" />
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionsSection}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Suggested Goals</Text>
          {suggestions.map(renderSuggestion)}
        </View>
      )}

      {loading && goals.length === 0 ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={[styles.body, { color: colors.muted }]}>No goals yet</Text>}
        />
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.sm, marginBottom: spacing.md },
  input: { padding: spacing.md, borderRadius: 12, borderWidth: 1 },
  heading: { ...typography.heading, marginBottom: spacing.sm },
  suggestionsSection: { gap: spacing.md, marginBottom: spacing.md },
  suggestion: { padding: spacing.md, borderRadius: 16, borderWidth: 1, gap: spacing.xs },
  suggestionActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  suggestionButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 12 },
  suggestionButtonText: { color: colors.white, fontWeight: '700' },
  list: { gap: spacing.md, paddingBottom: spacing.xl },
  item: { padding: spacing.md, borderRadius: 16, borderWidth: 1, gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { ...typography.heading },
  body: { ...typography.body },
  caption: { ...typography.caption },
  badge: { ...typography.caption },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
});
