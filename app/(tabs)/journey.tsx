import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, typography } from '../../theme';

interface JourneyMonth {
  month: string;
  events: { id: string; title: string; description: string; category: string; badge?: string }[];
}

export default function JourneyScreen() {
  const { colors } = useTheme();
  const [journey, setJourney] = useState<JourneyMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/journey');
      const json = await response.json().catch(() => ({}));
      setJourney(json.journey ?? sampleJourney());
    } catch {
      setJourney(sampleJourney());
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
        {journey.map((section) => (
          <View key={section.month} style={[styles.month, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.monthTitle, { color: colors.foreground }]}>{section.month}</Text>
            <View style={styles.timeline}>
              {section.events.map((event, index) => (
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
        ))}
      </ScrollView>
    </AppShell>
  );
}

function sampleJourney(): JourneyMonth[] {
  return [
    {
      month: 'September',
      events: [
        { id: '1', title: 'Joined SparkNC', description: 'Created your account and started the journey.', category: 'milestone' },
        { id: '2', title: 'Created first goal', description: 'Defined your first personal goal.', category: 'goal' },
      ],
    },
    {
      month: 'October',
      events: [
        { id: '3', title: 'Completed first project', description: 'Shipped your first task or project.', category: 'milestone' },
        { id: '4', title: 'Earned first badge', description: 'Earned the First Steps achievement.', category: 'achievement' },
      ],
    },
    {
      month: 'November',
      events: [
        { id: '5', title: 'Attended community event', description: 'Connected with peers at a SparkNC event.', category: 'event' },
        { id: '6', title: 'Improved consistency', description: 'Built a stronger daily habit.', category: 'reflection' },
      ],
    },
    {
      month: 'January',
      events: [
        { id: '7', title: 'Reached 500 XP', description: 'A big XP milestone.', category: 'milestone', badge: '🏆' },
        { id: '8', title: 'Became Top Contributor', description: 'Recognized for community impact.', category: 'achievement' },
      ],
    },
  ];
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
