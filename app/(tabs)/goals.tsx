import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import type { Goal } from '../../shared/types';

export default function GoalsScreen() {
  const { colors } = useTheme();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  async function load() {
    setLoading(true);
    try {
      const items = await cloudflareService.listGoals();
      setGoals(items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    if (!title.trim()) return;
    try {
      const { item } = await cloudflareService.createGoal({
        title: title.trim(),
        description: description.trim() || undefined,
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
            <Button title="Complete" onPress={() => handleComplete(item.id)} color={colors.accent} />
          )}
          <Button title="Delete" onPress={() => handleDelete(item.id)} color={colors.highlight} />
        </View>
      </View>
    );
  }

  return (
    <AppShell title="Goals">
      <View style={styles.form}>
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
          placeholder="Goal title"
          placeholderTextColor={colors.muted}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
          placeholder="Description"
          placeholderTextColor={colors.muted}
          value={description}
          onChangeText={setDescription}
        />
        <Button title="Add goal" onPress={handleAdd} color={colors.accent} />
      </View>

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
  list: { gap: spacing.md, paddingBottom: spacing.xl },
  item: { padding: spacing.md, borderRadius: 16, borderWidth: 1, gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { ...typography.heading },
  body: { ...typography.body },
  caption: { ...typography.caption },
  badge: { ...typography.caption },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
});
