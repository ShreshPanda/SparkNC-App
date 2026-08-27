import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { SparkEmptyState } from '../../components/SparkEmptyState';
import { SparkInput } from '../../components/SparkInput';
import { SparkButton } from '../../components/SparkButton';
import { SparkCard } from '../../components/SparkCard';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { radius, spacing, typography } from '../../theme';
import type { User } from '../../shared/types';
import { Ionicons } from '@expo/vector-icons';

export default function AdminScreen() {
  const { colors } = useTheme();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  const [event, setEvent] = useState({ title: '', startsAt: '', endsAt: '', location: '', schoolId: '' });
  const [announcement, setAnnouncement] = useState({ title: '', body: '', scope: 'global' as 'global' | 'school' | 'location', schoolId: '' });

  async function loadUsers() {
    try {
      setLoadingUsers(true);
      const data = await cloudflareService.listAdminUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function createEvent() {
    try {
      setSuccess(null);
      setError(null);
      await cloudflareService.createAdminEvent({
        title: event.title,
        startsAt: event.startsAt,
        endsAt: event.endsAt || undefined,
        location: event.location || undefined,
      });
      setSuccess('Event created');
      setEvent({ title: '', startsAt: '', endsAt: '', location: '', schoolId: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    }
  }

  async function createAnnouncement() {
    try {
      setSuccess(null);
      setError(null);
      await cloudflareService.createAdminAnnouncement({
        title: announcement.title,
        body: announcement.body,
        scope: announcement.scope,
      });
      setSuccess('Announcement created');
      setAnnouncement({ title: '', body: '', scope: 'global', schoolId: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create announcement');
    }
  }

  return (
    <AppShell title="Admin" overline="CENTER" mode="clean">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: spacing.md, padding: spacing.md, paddingBottom: spacing.xl }}>
        <SparkCard>
          <Text style={[styles.heading, { color: colors.foreground }]}>User Management</Text>
          {loadingUsers ? (
            <ActivityIndicator color={colors.primary} />
          ) : users.length === 0 ? (
            <SparkEmptyState
              icon={<Ionicons name="people-outline" size={32} color={colors.primary} />}
              title="No users yet"
              message="Invite students and ambassadors to start building your community."
            />
          ) : (
            users.map((user) => (
              <View key={user.id} style={styles.userRow}>
                <Text style={[styles.body, { color: colors.foreground }]}>{user.name}</Text>
                <Text style={[styles.caption, { color: colors.muted }]}>
                  {user.email} · {user.role}
                </Text>
              </View>
            ))
          )}
        </SparkCard>

        <SparkCard>
          <Text style={[styles.heading, { color: colors.foreground }]}>Create Event</Text>
          <SparkInput
            placeholder="Event title"
            value={event.title}
            onChangeText={(text) => setEvent((f) => ({ ...f, title: text }))}
          />
          <SparkInput
            placeholder="Start time, e.g. 2024-12-31T09:00"
            value={event.startsAt}
            onChangeText={(text) => setEvent((f) => ({ ...f, startsAt: text }))}
          />
          <SparkInput
            placeholder="End time (optional)"
            value={event.endsAt}
            onChangeText={(text) => setEvent((f) => ({ ...f, endsAt: text }))}
          />
          <SparkInput
            placeholder="Location or room"
            value={event.location}
            onChangeText={(text) => setEvent((f) => ({ ...f, location: text }))}
          />
          <SparkButton title="Create Event" onPress={createEvent} accessibilityLabel="Create event" />
        </SparkCard>

        <SparkCard>
          <Text style={[styles.heading, { color: colors.foreground }]}>Create Announcement</Text>
          <SparkInput
            placeholder="Announcement title"
            value={announcement.title}
            onChangeText={(text) => setAnnouncement((f) => ({ ...f, title: text }))}
          />
          <SparkInput
            placeholder="Announcement message"
            value={announcement.body}
            onChangeText={(text) => setAnnouncement((f) => ({ ...f, body: text }))}
          />
          <SparkInput
            placeholder="Scope: global, school, or location"
            value={announcement.scope}
            onChangeText={(text) => setAnnouncement((f) => ({ ...f, scope: text as any }))}
          />
          <SparkInput
            placeholder="School ID (optional)"
            value={announcement.schoolId}
            onChangeText={(text) => setAnnouncement((f) => ({ ...f, schoolId: text }))}
          />
          <SparkButton title="Create Announcement" onPress={createAnnouncement} accessibilityLabel="Create announcement" />
        </SparkCard>

        {success ? <Text style={{ color: colors.success }}>{success}</Text> : null}
        {error ? <Text style={{ color: colors.error }}>{error}</Text> : null}
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heading: { ...typography.title2, marginBottom: spacing.sm },
  body: { ...typography.body },
  caption: { ...typography.footnote },
  userRow: { paddingVertical: spacing.xs },
});
