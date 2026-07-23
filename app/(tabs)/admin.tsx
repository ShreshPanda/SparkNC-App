import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { EmptyState } from '../../components/EmptyState';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import type { User } from '../../shared/types';

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
    <AppShell title="Admin">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: spacing.md, padding: spacing.md, paddingBottom: spacing.xl }}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>User Management</Text>
          {loadingUsers ? (
            <ActivityIndicator color={colors.accent} />
          ) : users.length === 0 ? (
            <EmptyState title="No users yet" message="Invite students and ambassadors to start building your community." icon="people-outline" />
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
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Create Event</Text>
          <TextInput
            placeholder="Event title"
            placeholderTextColor={colors.muted}
            value={event.title}
            onChangeText={(text) => setEvent((f) => ({ ...f, title: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <TextInput
            placeholder="Start time, e.g. 2024-12-31T09:00"
            placeholderTextColor={colors.muted}
            value={event.startsAt}
            onChangeText={(text) => setEvent((f) => ({ ...f, startsAt: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <TextInput
            placeholder="End time (optional)"
            placeholderTextColor={colors.muted}
            value={event.endsAt}
            onChangeText={(text) => setEvent((f) => ({ ...f, endsAt: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <TextInput
            placeholder="Location or room"
            placeholderTextColor={colors.muted}
            value={event.location}
            onChangeText={(text) => setEvent((f) => ({ ...f, location: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <Pressable onPress={createEvent} style={[styles.button, { backgroundColor: colors.accent }]} accessibilityRole="button" accessibilityLabel="Create event">
            <Text style={{ color: colors.foreground }}>Create Event</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Create Announcement</Text>
          <TextInput
            placeholder="Announcement title"
            placeholderTextColor={colors.muted}
            value={announcement.title}
            onChangeText={(text) => setAnnouncement((f) => ({ ...f, title: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <TextInput
            placeholder="Announcement message"
            placeholderTextColor={colors.muted}
            value={announcement.body}
            onChangeText={(text) => setAnnouncement((f) => ({ ...f, body: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <TextInput
            placeholder="Scope: global, school, or location"
            placeholderTextColor={colors.muted}
            value={announcement.scope}
            onChangeText={(text) => setAnnouncement((f) => ({ ...f, scope: text as any }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <TextInput
            placeholder="School ID (optional)"
            placeholderTextColor={colors.muted}
            value={announcement.schoolId}
            onChangeText={(text) => setAnnouncement((f) => ({ ...f, schoolId: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <Pressable onPress={createAnnouncement} style={[styles.button, { backgroundColor: colors.accent }]} accessibilityRole="button" accessibilityLabel="Create announcement">
            <Text style={{ color: colors.foreground }}>Create Announcement</Text>
          </Pressable>
        </View>

        {success ? <Text style={{ color: colors.success }}>{success}</Text> : null}
        {error ? <Text style={{ color: colors.error }}>{error}</Text> : null}
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: 20, gap: spacing.sm },
  heading: { ...typography.heading },
  body: { ...typography.body },
  caption: { ...typography.caption },
  userRow: { paddingVertical: spacing.xs },
  input: { borderWidth: 1, borderRadius: 12, padding: spacing.md },
  button: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 12, alignSelf: 'flex-start' },
});
