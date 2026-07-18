import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';

export default function AdminScreen() {
  const { colors } = useTheme();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [event, setEvent] = useState({ title: '', startsAt: '', endsAt: '', location: '', schoolId: '' });
  const [announcement, setAnnouncement] = useState({ title: '', body: '', scope: 'global' as 'global' | 'school' | 'location', schoolId: '' });

  async function createEvent() {
    try {
      setError(null);
      await cloudflareService.createEvent({
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
      setError(null);
      await cloudflareService.createAnnouncement({
        title: announcement.title,
        body: announcement.body,
        scope: announcement.scope,
        schoolId: announcement.schoolId || undefined,
      });
      setSuccess('Announcement created');
      setAnnouncement({ title: '', body: '', scope: 'global', schoolId: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create announcement');
    }
  }

  return (
    <AppShell title="Admin">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: spacing.md }}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>User Management</Text>
          <Text style={{ color: colors.muted }}>User list and role controls will be added here.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Create Event</Text>
          <TextInput
            placeholder="Title"
            placeholderTextColor={colors.muted}
            value={event.title}
            onChangeText={(text) => setEvent((f) => ({ ...f, title: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <TextInput
            placeholder="Start (ISO)"
            placeholderTextColor={colors.muted}
            value={event.startsAt}
            onChangeText={(text) => setEvent((f) => ({ ...f, startsAt: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <TextInput
            placeholder="End (ISO)"
            placeholderTextColor={colors.muted}
            value={event.endsAt}
            onChangeText={(text) => setEvent((f) => ({ ...f, endsAt: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <TextInput
            placeholder="Location"
            placeholderTextColor={colors.muted}
            value={event.location}
            onChangeText={(text) => setEvent((f) => ({ ...f, location: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <Pressable onPress={createEvent} style={[styles.button, { backgroundColor: colors.accent }]}>
            <Text style={{ color: '#fff' }}>Create Event</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Create Announcement</Text>
          <TextInput
            placeholder="Title"
            placeholderTextColor={colors.muted}
            value={announcement.title}
            onChangeText={(text) => setAnnouncement((f) => ({ ...f, title: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <TextInput
            placeholder="Body"
            placeholderTextColor={colors.muted}
            value={announcement.body}
            onChangeText={(text) => setAnnouncement((f) => ({ ...f, body: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <TextInput
            placeholder="Scope (global | school | location)"
            placeholderTextColor={colors.muted}
            value={announcement.scope}
            onChangeText={(text) => setAnnouncement((f) => ({ ...f, scope: text as any }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <TextInput
            placeholder="School ID"
            placeholderTextColor={colors.muted}
            value={announcement.schoolId}
            onChangeText={(text) => setAnnouncement((f) => ({ ...f, schoolId: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <Pressable onPress={createAnnouncement} style={[styles.button, { backgroundColor: colors.accent }]}>
            <Text style={{ color: '#fff' }}>Create Announcement</Text>
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
  input: { borderWidth: 1, borderRadius: 12, padding: spacing.md },
  button: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 12, alignSelf: 'flex-start' },
});
