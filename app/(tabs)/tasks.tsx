import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { SparkButton } from '../../components/SparkButton';
import { SparkCard } from '../../components/SparkCard';
import { SparkInput } from '../../components/SparkInput';
import { SparkListRow } from '../../components/SparkListRow';
import { SparkEmptyState } from '../../components/SparkEmptyState';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { colors, radius, spacing, typography } from '../../theme';
import type { Task } from '../../shared/types';
import { Ionicons } from '@expo/vector-icons';

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
      <SparkListRow
        title={item.title}
        subtitle={item.description || item.category}
        detail={item.completed ? 'Done' : `+${item.xpReward ?? 0}`}
        icon={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
        iconColor={item.completed ? colors.success : colors.primary}
        showChevron={false}
        onPress={() => { if (!item.completed) handleComplete(item.id); }}
      />
    );
  }

  return (
    <AppShell title="Tasks" mode="editorial">
      <View style={styles.form}>
        <SparkInput placeholder="What do you need to do?" value={title} onChangeText={setTitle} />
        <SparkInput placeholder="Add a few details" value={description} onChangeText={setDescription} />
        <SparkInput placeholder="Category, e.g. Homework, Club, Wellness" value={category} onChangeText={setCategory} />
        <SparkButton title="Add task" onPress={handleAdd} style={styles.add} />
      </View>

      {loading && tasks.length === 0 ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <SparkEmptyState
              icon={<Ionicons name="checkmark-circle-outline" size={32} color={colors.primary} />}
              title="No tasks yet"
              message="Add your first task to start earning XP."
            />
          }
        />
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.sm, marginBottom: spacing.lg },
  add: { marginTop: spacing.sm },
  list: { paddingBottom: spacing.xxl },
});
