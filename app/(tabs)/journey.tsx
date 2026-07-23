import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SparkButton } from "../../components/SparkButton";
import { AppShell } from '../../components/AppShell';
import { EmptyState } from '../../components/EmptyState';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService, type JourneyMonth } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';

export default function JourneyScreen() {
  const { colors } = useTheme();
  const [journey, setJourney] = useState<JourneyMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await cloudflareService.getJourney();
      setJourney(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journey');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <AppShell title="Spark Journey">
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="Spark Journey">
      <ScrollView contentContainerStyle={styles.container}>
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
        <Text style={[styles.intro, { color: colors.muted }]}>
          Your growth story, one milestone at a time.
        </Text>
        {journey.length === 0 ? (
          <EmptyState
            title="Your Spark Journey is waiting"
            message="Every task, goal, and event you complete becomes a milestone here."
            icon="map-outline"
          />
        ) : (
          journey.map((section) => (
            <View key={section.month} style={[styles.month, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.monthTitle, { color: colors.foreground }]}>{section.month}</Text>
              <View style={styles.timeline}>
                {section.events.map((event) => (
                  <View key={event.id} style={styles.eventRow}>
                    <View style={[styles.dot, { backgroundColor: colors.accent }]} />
                    <View style={styles.event}>
                      <Text style={[styles.eventTitle, { color: colors.foreground }]}>
                        {event.badge ? `${event.badge} ` : ''}{event.title}
                      </Text>
                      <Text style={[styles.eventDescription, { color: colors.muted }]}>{event.description}</Text>
                      <Text style={[styles.eventCategory, { color: colors.muted }]}>{event.category}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
        <SparkButton title="Refresh" onPress={load} variant="primary" />
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  intro: { ...typography.body, marginBottom: spacing.sm },
  month: { padding: spacing.md, borderRadius: 20, borderWidth: 1, gap: spacing.sm },
  monthTitle: { ...typography.heading },
  timeline: { gap: spacing.md, paddingLeft: spacing.sm },
  eventRow: { flexDirection: 'row', gap: spacing.md },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: spacing.xs },
  event: { flex: 1, gap: spacing.xs },
  eventTitle: { ...typography.body, fontWeight: '600' },
  eventDescription: { ...typography.body },
  eventCategory: { ...typography.caption, textTransform: 'capitalize' },
  error: { ...typography.body },
});
