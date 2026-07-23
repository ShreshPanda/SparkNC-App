import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SparkButton } from "../../components/SparkButton";
import { AppShell } from '../../components/AppShell';
import { FadeIn } from '../../components/AnimatedWrapper';
import { SparkCard } from '../../components/SparkCard';
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
    <AppShell title="Feedback Center">
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={[styles.body, { color: colors.highlight }]}>{error}</Text>}
        {success && <Text style={[styles.body, { color: colors.accent }]}>{success}</Text>}

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Submit Feedback</Text>
          <TextInput
            placeholder="Feedback topic, e.g. App, Events, Learning"
            placeholderTextColor={colors.muted}
            value={category}
            onChangeText={setCategory}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted, backgroundColor: colors.card }]}
          />
          <TextInput
            placeholder="Rating 1–5"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={rating}
            onChangeText={setRating}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted, backgroundColor: colors.card }]}
          />
          <TextInput
            placeholder="What did you like? What can we improve?"
            placeholderTextColor={colors.muted}
            multiline
            value={feedbackText}
            onChangeText={setFeedbackText}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted, backgroundColor: colors.card, minHeight: 80 }]}
          />
          <SparkButton title="Submit Feedback" onPress={submitFeedback} variant="primary" />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Suggest a Feature</Text>
          <TextInput
            placeholder="Feature idea title"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted, backgroundColor: colors.card }]}
          />
          <TextInput
            placeholder="Describe the idea and why it would help"
            placeholderTextColor={colors.muted}
            multiline
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted, backgroundColor: colors.card, minHeight: 80 }]}
          />
          <TextInput
            placeholder="Idea category, e.g. App, Events, Learning"
            placeholderTextColor={colors.muted}
            value={requestCategory}
            onChangeText={setRequestCategory}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted, backgroundColor: colors.card }]}
          />
          <SparkButton title="Submit Idea" onPress={submitFeature} variant="primary" />
        </View>

        {loading ? <ActivityIndicator color={colors.accent} /> : null}

        <View style={styles.section}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Your Feedback</Text>
          {myFeedback.length === 0 ? (
            <Text style={[styles.body, { color: colors.muted }]}>You haven't shared feedback yet.</Text>
          ) : (
            myFeedback.map((f) => (
              <View key={f.id} style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>{f.category}</Text>
                <Text style={{ color: colors.muted }}>{f.sentiment}{f.rating ? ` - ${f.rating}/5` : ''}</Text>
                {f.feedbackText ? <Text style={[styles.body, { color: colors.foreground }]}>{f.feedbackText}</Text> : null}
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Ideas Board</Text>
          {featureRequests.length === 0 ? (
            <Text style={[styles.body, { color: colors.muted }]}>No ideas submitted yet. Be the first!</Text>
          ) : (
            featureRequests.map((r) => (
              <View key={r.id} style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>{r.title}</Text>
                <Text style={{ color: colors.muted }}>{r.category} • {r.status}</Text>
                <View style={styles.voteRow}>
                  <Text style={{ color: colors.foreground }}>{r.votes} votes</Text>
                  <SparkButton title="Vote" onPress={() => vote(r.id)} variant="primary" />
                </View>
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
  rowCard: { padding: spacing.md, borderRadius: 16, borderWidth: 1, gap: spacing.xs },
  voteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
});
