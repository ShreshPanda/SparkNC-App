import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import type { GrowthEvent } from '../../shared/types';

export default function GrowthTimelineScreen() {
  const { colors } = useTheme();
  const [events, setEvents] = useState<GrowthEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await cloudflareService.getGrowthTimeline();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    try {
      setGenerating(true);
      await cloudflareService.generateGrowthTimeline();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate timeline');
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <AppShell title="Growth Timeline">
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="Growth Timeline">
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={[styles.body, { color: colors.highlight }]}>{error}</Text>}

        {events.length === 0 ? (
          <Text style={[styles.body, { color: colors.muted }]}>No growth events yet. Tap Generate to build your timeline.</Text>
        ) : (
          events.map((event: GrowthEvent) => (
            <View key={event.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.heading, { color: colors.foreground }]}>{event.title}</Text>
              <Text style={[styles.body, { color: colors.muted }]}>{event.description}</Text>
              <Text style={[styles.caption, { color: colors.muted }]}>{event.occurredAt?.split('T')[0]}</Text>
            </View>
          ))
        )}

        <Button title={generating ? 'Building...' : 'Generate Timeline'} onPress={generate} color={colors.accent} disabled={generating} />
        <Button title="Refresh" onPress={load} color={colors.muted} />
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: spacing.lg, borderRadius: 20, borderWidth: 1, gap: spacing.sm },
  heading: { ...typography.heading },
  body: { ...typography.body },
  caption: { ...typography.caption },
});
