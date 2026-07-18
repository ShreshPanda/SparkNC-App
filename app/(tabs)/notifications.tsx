import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import { Notification } from '../../shared/types';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const items = await cloudflareService.listNotifications();
      setNotifications(items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: string) {
    try {
      await cloudflareService.markNotificationRead(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark read');
    }
  }

  async function markAllRead() {
    try {
      await cloudflareService.markAllNotificationsRead();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all read');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell title="Notifications">
      <View style={{ flex: 1, gap: spacing.md }}>
        {loading ? <ActivityIndicator color={colors.accent} /> : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={{ color: colors.muted }}>No notifications.</Text>}
            renderItem={({ item }) => (
              <View style={[styles.card, { backgroundColor: colors.card, opacity: item.isRead ? 0.7 : 1 }]}>
                <Text style={[styles.heading, { color: colors.foreground }]}>{item.title}</Text>
                <Text style={{ color: colors.muted }}>{item.body}</Text>
                {!item.isRead ? (
                  <Pressable onPress={() => markRead(item.id)} style={[styles.button, { backgroundColor: colors.accent }]}>
                    <Text style={{ color: '#fff' }}>Mark Read</Text>
                  </Pressable>
                ) : null}
              </View>
            )}
          />
        )}
        {notifications.length > 0 ? (
          <Pressable onPress={markAllRead} style={[styles.button, { backgroundColor: colors.muted }]}>
            <Text style={{ color: '#fff' }}>Mark All Read</Text>
          </Pressable>
        ) : null}
        {error ? <Text style={{ color: colors.error }}>{error}</Text> : null}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: 20, gap: spacing.sm },
  heading: { ...typography.heading },
  button: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 12, alignSelf: 'flex-start' },
});
