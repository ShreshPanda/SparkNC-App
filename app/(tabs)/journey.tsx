import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SparkButton } from "../../components/SparkButton";
import { AppShell } from '../../components/AppShell';
import { SparkEmptyState } from '../../components/SparkEmptyState';
import { EmptyJourneyIllustration } from '../../components/visual/EmptyIllustration';
import { SparkCard } from '../../components/SparkCard';
import { SparkSection } from '../../components/SparkSection';
import { SparkBadge } from '../../components/SparkBadge';
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
      <AppShell title="Spark Journey" overline="JOURNEY" mode="editorial">
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="Spark Journey" overline="JOURNEY" mode="editorial">
      <ScrollView contentContainerStyle={styles.container}>
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <View style={styles.hero}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>Your journey</Text>
          <Text style={[styles.heroSubtitle, { color: colors.muted }]}>
            Every task, goal, and event becomes a milestone.
          </Text>
        </View>

        {journey.length === 0 ? (
          <SparkEmptyState
            illustration={<EmptyJourneyIllustration />}
            title="Your Spark Journey is waiting"
            message="Every task, goal, and event you complete becomes a milestone here."
          />
        ) : (
          journey.map((section, index) => (
            <SparkSection key={section.month} title={section.month} inset={false}>
              <SparkCard variant="grouped" style={styles.monthCard}>
                <View style={styles.timeline}>
                  {section.events.map((event, i) => (
                    <View key={event.id} style={styles.eventRow}>
                      <View style={styles.dotColumn}>
                        <View style={[styles.dot, { backgroundColor: i === 0 ? colors.primary : colors.muted }]} />
                        {i < section.events.length - 1 ? <View style={[styles.stem, { backgroundColor: colors.border }]} /> : null}
                      </View>
                      <View style={styles.event}>
                        <View style={styles.eventHeader}>
                          <Text style={[styles.eventTitle, { color: colors.foreground }]}>{event.title}</Text>
                          {event.badge ? <SparkBadge label={event.badge} color={colors.yellow} size="sm" /> : null}
                        </View>
                        <Text style={[styles.eventDescription, { color: colors.muted }]}>{event.description}</Text>
                        <Text style={[styles.eventCategory, { color: colors.muted }]}>{event.category}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </SparkCard>
            </SparkSection>
          ))
        )}

        <SparkButton title="Refresh" onPress={load} variant="secondary" style={styles.refresh} />
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { marginBottom: spacing.md },
  heroTitle: { ...typography.largeTitle },
  heroSubtitle: { ...typography.subheadline },
  monthCard: { padding: spacing.md, borderRadius: 20, gap: spacing.sm },
  timeline: { gap: spacing.sm },
  eventRow: { flexDirection: 'row', gap: spacing.md },
  dotColumn: { alignItems: 'center', width: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  stem: { width: 2, flex: 1, marginVertical: spacing.xs },
  event: { flex: 1, gap: spacing.xs },
  eventHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  eventTitle: { ...typography.headline },
  eventDescription: { ...typography.body },
  eventCategory: { ...typography.footnote, textTransform: 'capitalize' },
  refresh: { marginTop: spacing.sm },
  error: { ...typography.body },
});
