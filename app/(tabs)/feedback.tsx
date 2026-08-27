import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SparkButton } from "../../components/SparkButton";
import { AppShell } from '../../components/AppShell';
import { FadeIn } from '../../components/AnimatedWrapper';
import { SparkCard } from '../../components/SparkCard';
import { SparkInput } from '../../components/SparkInput';
import { SparkListRow } from '../../components/SparkListRow';
import { SparkEmptyState } from '../../components/SparkEmptyState';
import { SparkSection } from '../../components/SparkSection';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import type { FeatureRequest, StudentFeedback } from '../../shared/types';

const CATEGORIES = ['Weekly check-in', 'Feature suggestion', 'Problem', 'Idea', 'General'];

export default function FeedbackScreen() {
  const { colors } = useTheme();
  const [category, setCategory] = useState('Weekly check-in');
  const [rating, setRating] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requestCategory, setRequestCategory] = useState('App improvement');
  const [myFeedback, setMyFeedback] = useState<StudentFeedback[]>([]);
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [f, r] = await Promise.all([
        cloudflareService.getMyFeedback().catch(() => []),
        cloudflareService.listFeatureRequests().catch(() => []),
      ]);
      setMyFeedback(f);
      setFeatureRequests(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }

  async function submitFeedback() {
    try {
      setSuccess(null);
      setError(null);
      await cloudflareService.submitFeedback({
        category,
        rating: rating ? Number(rating) : undefined,
        feedbackText,
      });
      setSuccess('Feedback submitted');
      setFeedbackText('');
      setRating('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    }
  }

  async function submitFeature() {
    try {
      setSuccess(null);
      setError(null);
      await cloudflareService.createFeatureRequest({ title, description, category: requestCategory });
      setSuccess('Feature request submitted');
      setTitle('');
      setDescription('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    }
  }

  async function vote(id: string) {
    try {
      setError(null);
      await cloudflareService.voteFeatureRequest(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell title="Feedback Center" overline="SHARE" mode="clean">
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={[styles.body, { color: colors.error }]}>{error}</Text>}
        {success && <Text style={[styles.body, { color: colors.success }]}>{success}</Text>}

        <FadeIn delay={0}>
          <SparkSection title="SUBMIT FEEDBACK" inset={false}>
            <SparkCard>
              <SparkInput
                placeholder="Feedback topic, e.g. App, Events, Learning"
                value={category}
                onChangeText={setCategory}
              />
              <SparkInput
                placeholder="Rating 1–5"
                keyboardType="numeric"
                value={rating}
                onChangeText={setRating}
              />
              <SparkInput
                placeholder="What did you like? What can we improve?"
                multiline
                value={feedbackText}
                onChangeText={setFeedbackText}
                style={{ minHeight: 80 }}
              />
              <SparkButton title="Submit Feedback" onPress={submitFeedback} variant="primary" />
            </SparkCard>
          </SparkSection>
        </FadeIn>

        <FadeIn delay={80}>
          <SparkSection title="SUGGEST A FEATURE" inset={false}>
            <SparkCard>
              <SparkInput
                placeholder="Feature idea title"
                value={title}
                onChangeText={setTitle}
              />
              <SparkInput
                placeholder="Describe the idea and why it would help"
                multiline
                value={description}
                onChangeText={setDescription}
                style={{ minHeight: 80 }}
              />
              <SparkInput
                placeholder="Idea category, e.g. App, Events, Learning"
                value={requestCategory}
                onChangeText={setRequestCategory}
              />
              <SparkButton title="Submit Idea" onPress={submitFeature} variant="primary" />
            </SparkCard>
          </SparkSection>
        </FadeIn>

        {loading ? <ActivityIndicator color={colors.primary} /> : null}

        <FadeIn delay={160}>
          <SparkSection title="YOUR FEEDBACK" inset={false}>
            <SparkCard variant="grouped">
              {myFeedback.length === 0 ? (
                <SparkEmptyState
                  icon={<Ionicons name="chatbubble-outline" size={32} color={colors.primary} />}
                  title="No feedback yet"
                  message="Share your thoughts to help improve SparkNC."
                />
              ) : (
                myFeedback.map((f) => (
                  <SparkListRow
                    key={f.id}
                    title={f.category}
                    subtitle={f.feedbackText ?? 'No details'}
                    detail={f.rating ? `${f.rating}/5` : f.sentiment}
                    icon="chatbubble-ellipses-outline"
                    iconColor={colors.primary}
                    showChevron={false}
                  />
                ))
              )}
            </SparkCard>
          </SparkSection>
        </FadeIn>

        <FadeIn delay={240}>
          <SparkSection title="IDEAS BOARD" inset={false}>
            <SparkCard variant="grouped">
              {featureRequests.length === 0 ? (
                <SparkEmptyState
                    icon={<Ionicons name="bulb-outline" size={32} color={colors.primary} />}
                    title="No ideas yet"
                    message="Be the first to suggest a feature."
                  />
              ) : (
                featureRequests.map((r) => (
                  <SparkListRow
                    key={r.id}
                    title={r.title}
                    subtitle={r.category}
                    detail={`${r.votes} votes`}
                    icon="bulb-outline"
                    iconColor={colors.primary}
                    onPress={() => vote(r.id)}
                    showChevron={false}
                  />
                ))
              )}
            </SparkCard>
          </SparkSection>
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, paddingBottom: spacing.xl },
  body: { ...typography.body },
});
