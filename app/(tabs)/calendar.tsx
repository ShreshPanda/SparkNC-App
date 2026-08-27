import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/AppShell';
import { SparkButton } from '../../components/SparkButton';
import { SparkCard } from '../../components/SparkCard';
import { SparkInput } from '../../components/SparkInput';
import { SparkListRow } from '../../components/SparkListRow';
import { SparkEmptyState } from '../../components/SparkEmptyState';
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
    <AppShell title="Calendar" overline="TIME" mode="clean">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : events.length === 0 ? (
          <SparkEmptyState
            icon={<Ionicons name="calendar-outline" size={32} color={colors.primary} />}
            title="No upcoming events"
            message="Add an event or check back for new opportunities."
          />
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <SparkCard>
                <Text style={[styles.heading, { color: colors.foreground }]}>{item.title}</Text>
                <Text style={[styles.meta, { color: colors.muted }]}>{item.startsAt}{item.endsAt ? ` - ${item.endsAt}` : ''}</Text>
                {item.location ? <Text style={[styles.meta, { color: colors.muted }]}>{item.location}</Text> : null}
                <View style={styles.row}>
                  <Text style={[styles.meta, { color: colors.foreground }]}>{item.attendeeCount ?? 0} attending</Text>
                  <SparkButton
                    title={item.isRegistered ? 'Registered' : 'RSVP'}
                    onPress={() => rsvp(item.id)}
                    variant={item.isRegistered ? 'secondary' : 'primary'}
                    accessibilityLabel={item.isRegistered ? 'Registered for event' : `RSVP to ${item.title}`}
                  />
                </View>
              </SparkCard>
            )}
          />
        )}

        <SparkCard>
          <Text style={[styles.heading, { color: colors.foreground }]}>Create Event</Text>
          <SparkInput
            placeholder="Event title"
            value={form.title}
            onChangeText={(text) => setForm((f) => ({ ...f, title: text }))}
          />
          <SparkInput
            placeholder="Start time, e.g. 2024-12-31T09:00"
            value={form.startsAt}
            onChangeText={(text) => setForm((f) => ({ ...f, startsAt: text }))}
          />
          <SparkInput
            placeholder="End time (optional)"
            value={form.endsAt}
            onChangeText={(text) => setForm((f) => ({ ...f, endsAt: text }))}
          />
          <SparkInput
            placeholder="Location or room"
            value={form.location}
            onChangeText={(text) => setForm((f) => ({ ...f, location: text }))}
          />
          <SparkButton title="Create" onPress={create} accessibilityLabel="Create new event" />
        </SparkCard>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, padding: spacing.md, paddingBottom: spacing.xl },
  heading: { ...typography.title3 },
  meta: { ...typography.footnote },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  error: { ...typography.body },
});
