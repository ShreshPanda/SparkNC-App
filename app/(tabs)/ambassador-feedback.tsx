import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SparkButton } from "../../components/SparkButton";
import { AppShell } from '../../components/AppShell';
import { SparkInput } from '../../components/SparkInput';
import { SparkListRow } from '../../components/SparkListRow';
import { SparkEmptyState } from '../../components/SparkEmptyState';
import { SparkSection } from '../../components/SparkSection';
import { SparkCard } from '../../components/SparkCard';
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
    <AppShell title="Ambassador Feedback" overline="OBSERVE" mode="clean">
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={[styles.body, { color: colors.error }]}>{error}</Text>}
        {success && <Text style={[styles.body, { color: colors.success }]}>{success}</Text>}

        <SparkSection title="STUDENT OBSERVATION" inset={false}>
          <SparkCard>
            <SparkInput
              placeholder="Category"
              value={category}
              onChangeText={setCategory}
            />
            <SparkInput
              placeholder="Student ID (optional)"
              value={studentId}
              onChangeText={setStudentId}
            />
            <SparkInput
              placeholder="Describe what you observed"
              multiline
              value={observation}
              onChangeText={setObservation}
              style={{ minHeight: 80 }}
            />
            <SparkInput
              placeholder="Suggest a next step or resource (optional)"
              multiline
              value={suggestedImprovement}
              onChangeText={setSuggestedImprovement}
              style={{ minHeight: 80 }}
            />
            <SparkButton title="Submit Observation" onPress={submit} variant="primary" />
          </SparkCard>
        </SparkSection>

        {loading ? <ActivityIndicator color={colors.primary} /> : null}

        <SparkSection title="YOUR OBSERVATIONS" inset={false}>
          <SparkCard variant="grouped">
            {items.length === 0 ? (
              <SparkEmptyState
                icon={<Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.primary} />}
                title="No observations yet"
                message="Record what you notice about students to help them grow."
              />
            ) : (
              items.map((item) => (
                <SparkListRow
                  key={item.id}
                  title={item.category}
                  subtitle={item.observation}
                icon="people-outline"
                iconColor={colors.primary}
                detail={item.suggestedImprovement ?? ''}
                showChevron={false}
              />
            ))
          )}
          </SparkCard>
        </SparkSection>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.xl },
  body: { ...typography.body },
});
