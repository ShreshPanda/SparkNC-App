import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import type { AmbassadorFeedback } from '../../shared/types';

const CATEGORIES = ['Student Engagement', 'Common struggles', 'Suggestions', 'Event feedback'];

export default function AmbassadorFeedbackScreen() {
  const { colors } = useTheme();
  const [category, setCategory] = useState('Student Engagement');
  const [observation, setObservation] = useState('');
  const [suggestedImprovement, setSuggestedImprovement] = useState('');
  const [studentId, setStudentId] = useState('');
  const [items, setItems] = useState<AmbassadorFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await cloudflareService.getAmbassadorFeedback().catch(() => []);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load observations');
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    try {
      setSuccess(null);
      setError(null);
      await cloudflareService.submitAmbassadorFeedback({
        category,
        observation,
        suggestedImprovement,
        studentId: studentId || undefined,
      });
      setSuccess('Observation submitted');
      setObservation('');
      setSuggestedImprovement('');
      setStudentId('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit observation');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell title="Ambassador Feedback">
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={[styles.body, { color: colors.highlight }]}>{error}</Text>}
        {success && <Text style={[styles.body, { color: colors.accent }]}>{success}</Text>}

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Student Observation</Text>
          <TextInput
            placeholder="Category"
            placeholderTextColor={colors.muted}
            value={category}
            onChangeText={setCategory}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted, backgroundColor: colors.card }]}
          />
          <TextInput
            placeholder="Student ID (optional)"
            placeholderTextColor={colors.muted}
            value={studentId}
            onChangeText={setStudentId}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted, backgroundColor: colors.card }]}
          />
          <TextInput
            placeholder="Observation"
            placeholderTextColor={colors.muted}
            multiline
            value={observation}
            onChangeText={setObservation}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted, backgroundColor: colors.card, minHeight: 80 }]}
          />
          <TextInput
            placeholder="Suggested improvement (optional)"
            placeholderTextColor={colors.muted}
            multiline
            value={suggestedImprovement}
            onChangeText={setSuggestedImprovement}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted, backgroundColor: colors.card, minHeight: 80 }]}
          />
          <Button title="Submit Observation" onPress={submit} color={colors.accent} />
        </View>

        {loading ? <ActivityIndicator color={colors.accent} /> : null}

        <View style={styles.section}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Your Observations</Text>
          {items.length === 0 ? (
            <Text style={[styles.body, { color: colors.muted }]}>No observations yet.</Text>
          ) : (
            items.map((item) => (
              <View key={item.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground, ...typography.heading }}>{item.category}</Text>
                <Text style={[styles.body, { color: colors.foreground }]}>{item.observation}</Text>
                {item.suggestedImprovement ? <Text style={{ color: colors.accent }}>{item.suggestedImprovement}</Text> : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.xl },
  card: { padding: spacing.lg, borderRadius: 20, borderWidth: 1, gap: spacing.sm },
  section: { gap: spacing.sm },
  heading: { ...typography.heading },
  body: { ...typography.body },
  input: { borderWidth: 1, borderRadius: 12, padding: spacing.md },
});
