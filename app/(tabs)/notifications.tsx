import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/AppShell';
import { SparkButton } from '../../components/SparkButton';
import { SparkCard } from '../../components/SparkCard';
import { SparkListRow } from '../../components/SparkListRow';
import { SparkEmptyState } from '../../components/SparkEmptyState';
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
    <AppShell title="Notifications" overline="ALERTS" mode="clean">
      <View style={styles.container}>
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : notifications.length === 0 ? (
          <SparkEmptyState
            icon={<Ionicons name="notifications-off-outline" size={32} color={colors.primary} />}
            title="No notifications"
            message="You're all caught up. We'll let you know when something important happens."
          />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <SparkListRow
                title={item.title}
                subtitle={item.body}
                icon={item.isRead ? 'mail-open-outline' : 'mail-outline'}
                iconColor={item.isRead ? colors.muted : colors.primary}
                badge={!item.isRead ? 'New' : undefined}
                badgeColor={!item.isRead ? colors.primary : undefined}
                onPress={() => markRead(item.id)}
                showChevron={false}
                accessibilityLabel={`${item.title}. ${item.isRead ? 'Read' : 'Unread'}`}
              />
            )}
          />
        )}

        {notifications.length > 0 ? (
          <View style={styles.footer}>
            <SparkButton title="Mark All Read" onPress={markAllRead} variant="secondary" accessibilityLabel="Mark all notifications as read" />
          </View>
        ) : null}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.md, padding: spacing.md, paddingBottom: spacing.xl },
  list: { gap: spacing.xs },
  footer: { marginTop: spacing.sm },
  heading: { ...typography.title3 },
  body: { ...typography.body },
  error: { ...typography.body },
});
