import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import { Event } from '../../shared/types';

export default function CalendarScreen() {
  const { colors } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', startsAt: '', endsAt: '', location: '' });

  async function load() {
    try {
      setLoading(true);
      const items = await cloudflareService.listEvents();
      setEvents(items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  async function rsvp(id: string) {
    try {
      await cloudflareService.registerForEvent(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'RSVP failed');
    }
  }

  async function create() {
    try {
      await cloudflareService.createEvent({
        title: form.title,
        startsAt: form.startsAt,
        endsAt: form.endsAt || undefined,
        location: form.location || undefined,
      });
      setForm({ title: '', startsAt: '', endsAt: '', location: '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell title="Calendar">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: spacing.md }}>
        {loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={<Text style={{ color: colors.muted }}>No upcoming events.</Text>}
            renderItem={({ item }) => (
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={[styles.heading, { color: colors.foreground }]}>{item.title}</Text>
                <Text style={{ color: colors.muted }}>{item.startsAt}{item.endsAt ? ` - ${item.endsAt}` : ''}</Text>
                {item.location ? <Text style={{ color: colors.muted }}>{item.location}</Text> : null}
                <View style={styles.row}>
                  <Text style={{ color: colors.foreground }}>{item.attendeeCount ?? 0} attending</Text>
                  <Pressable
                    onPress={() => rsvp(item.id)}
                    style={[styles.button, { backgroundColor: item.isRegistered ? colors.muted : colors.accent }]}
                  >
                    <Text style={{ color: '#fff' }}>{item.isRegistered ? 'Registered' : 'RSVP'}</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        )}

        {error ? <Text style={{ color: colors.error }}>{error}</Text> : null}

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Create Event</Text>
          <TextInput
            placeholder="Title"
            placeholderTextColor={colors.muted}
            value={form.title}
            onChangeText={(text) => setForm((f) => ({ ...f, title: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <TextInput
            placeholder="Start (ISO)"
            placeholderTextColor={colors.muted}
            value={form.startsAt}
            onChangeText={(text) => setForm((f) => ({ ...f, startsAt: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <TextInput
            placeholder="End (ISO, optional)"
            placeholderTextColor={colors.muted}
            value={form.endsAt}
            onChangeText={(text) => setForm((f) => ({ ...f, endsAt: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <TextInput
            placeholder="Location"
            placeholderTextColor={colors.muted}
            value={form.location}
            onChangeText={(text) => setForm((f) => ({ ...f, location: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <Pressable onPress={create} style={[styles.button, { backgroundColor: colors.accent }]}>
            <Text style={{ color: '#fff' }}>Create</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: 20, gap: spacing.sm },
  heading: { ...typography.heading },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  button: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 12, alignSelf: 'flex-start' },
  input: { borderWidth: 1, borderRadius: 12, padding: spacing.md },
});
