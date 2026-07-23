import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { colors, spacing, typography } from '../../theme';
import type { Task } from '../../shared/types';

export default function TasksScreen() {
  const { colors } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  async function load() {
    setLoading(true);
    try {
      const items = await cloudflareService.listTasks();
      setTasks(items);
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
      const { item } = await cloudflareService.createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
      });
      setTasks((prev) => [item, ...prev]);
      setTitle('');
      setDescription('');
      setCategory('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create task');
    }
  }

  async function handleComplete(id: string) {
    try {
      const { item } = await cloudflareService.completeTask(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? item : t)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to complete task');
    }
  }

  async function handleDelete(id: string) {
    try {
      await cloudflareService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete task');
    }
  }

  function renderItem({ item }: { item: Task }) {
    return (
      <View style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.title}</Text>
          {item.completed && <Text style={[styles.badge, { color: colors.accent }]}>Done</Text>}
        </View>
        {item.description ? <Text style={[styles.body, { color: colors.muted }]}>{item.description}</Text> : null}
        {item.category ? <Text style={[styles.caption, { color: colors.muted }]}>{item.category}</Text> : null}
        <View style={styles.actions}>
          {!item.completed && (
            <Pressable onPress={() => handleComplete(item.id)} style={[styles.actionButton, { backgroundColor: colors.accent }]} accessibilityRole="button" accessibilityLabel={`Complete ${item.title}`}>
              <Text style={styles.actionButtonText}>Complete</Text>
            </Pressable>
          )}
          <Pressable onPress={() => handleDelete(item.id)} style={[styles.actionButton, { backgroundColor: colors.highlight }]} accessibilityRole="button" accessibilityLabel={`Delete ${item.title}`}>
            <Text style={styles.actionButtonText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <AppShell title="Tasks">
      <View style={styles.form}>
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
          placeholder="What do you need to do?"
          placeholderTextColor={colors.muted}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
          placeholder="Add a few details"
          placeholderTextColor={colors.muted}
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
          placeholder="Category, e.g. Homework, Club, Wellness"
          placeholderTextColor={colors.muted}
          value={category}
          onChangeText={setCategory}
        />
        <Pressable onPress={handleAdd} style={[styles.addButton, { backgroundColor: colors.accent }]} accessibilityRole="button" accessibilityLabel="Add new task">
          <Text style={styles.addButtonText}>Add task</Text>
        </Pressable>
      </View>

      {loading && tasks.length === 0 ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={[styles.body, { color: colors.muted }]}>No tasks yet</Text>}
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
  actionButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 12 },
  actionButtonText: { color: colors.white, fontWeight: '700' },
  addButton: { paddingVertical: spacing.md, borderRadius: 16, alignItems: 'center' },
  addButtonText: { color: colors.white, fontWeight: '700' },
});
