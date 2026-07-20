import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, typography } from '../../theme';

interface Achievement {
  id: string;
  title: string;
  unlockedAt?: string;
}

interface AchievementCarouselProps {
  achievements: Achievement[];
}

export function AchievementCarousel({ achievements }: AchievementCarouselProps) {
  const { colors } = useTheme();

  if (achievements.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.emptyText, { color: colors.muted }]}>No achievements yet. Complete a task to get started.</Text>
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={achievements}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
          {item.unlockedAt ? (
            <Text style={[styles.date, { color: colors.muted }]}>{new Date(item.unlockedAt).toLocaleDateString()}</Text>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm, paddingHorizontal: 2 },
  card: { width: 160, padding: spacing.md, borderRadius: 20, borderWidth: 1, gap: spacing.xs },
  title: { ...typography.heading },
  date: { ...typography.caption },
  empty: { padding: spacing.md, borderRadius: 20, borderWidth: 1 },
  emptyText: { ...typography.body, textAlign: 'center' },
});
