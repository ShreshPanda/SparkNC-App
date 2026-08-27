import React, { useState } from 'react';
import { ActivityIndicator, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { FadeIn } from '../components/AnimatedWrapper';
import { ProgressBar } from '../components/ProgressBar';
import { SparkButton } from '../components/SparkButton';
import { SparkInput } from '../components/SparkInput';
import { SparkOrb } from '../components/visual/SparkOrb';
import { AppShell } from '../components/AppShell';
import { useTheme } from '../providers/ThemeProvider';
import { cloudflareService } from '../services/cloudflareService';
import { colors, spacing, typography } from '../theme';

const SUPPORT_STYLES = [
  { key: 'gentle', label: 'Gentle', description: 'Soft guidance and encouragement' },
  { key: 'direct', label: 'Direct', description: 'Clear, no-nonsense feedback' },
  { key: 'structured', label: 'Structured', description: 'Step-by-step plans' },
  { key: 'casual', label: 'Casual', description: 'Friendly and conversational' },
] as const;

const QUESTIONS = [
  { label: 'What are your goals?', hint: 'Learn programming, get organized...', stateKey: 'goals' as const },
  { label: 'What are you interested in?', hint: 'Design, science, entrepreneurship...', stateKey: 'interests' as const },
  { label: 'Where do you want to grow?', hint: 'Communication, time management...', stateKey: 'growthAreas' as const },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState('');
  const [interests, setInterests] = useState('');
  const [growthAreas, setGrowthAreas] = useState('');
  const [supportStyle, setSupportStyle] = useState<string>('gentle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const values = { goals, interests, growthAreas };
  const setters = { goals: setGoals, interests: setInterests, growthAreas: setGrowthAreas };

  const submit = async () => {
    const payload = {
      goals: goals.split(',').map((s) => s.trim()).filter(Boolean),
      interests: interests.split(',').map((s) => s.trim()).filter(Boolean),
      growthAreas: growthAreas.split(',').map((s) => s.trim()).filter(Boolean),
      supportStyle,
      completed: true,
    };
    try {
      setIsSubmitting(true);
      setError(null);
      await cloudflareService.saveOnboarding(payload);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to save onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((step + 1) / 4) * 100;

  return (
    <AppShell title="Welcome" overline="ONBOARDING" mode="atmospheric">
      <ScrollView contentContainerStyle={styles.container}>
        <FadeIn delay={0}>
          <View style={styles.hero}>
            <SparkOrb size={80} color={colors.primary} pulse={false} />
            <Text style={[styles.title, { color: colors.foreground }]}>Let&apos;s build your spark</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>A few quick questions so SparkNC feels like it was made for you.</Text>
          </View>
        </FadeIn>

        <FadeIn delay={120}>
          <View style={styles.progressCard}>
            <ProgressBar progress={progress} color={colors.primary} />
            <Text style={[styles.stepLabel, { color: colors.muted }]}>Step {step + 1} of 4</Text>
          </View>
        </FadeIn>

        <FadeIn delay={200}>
          {step < 3 ? (
            <View style={styles.step}>
              <Text style={[styles.question, { color: colors.foreground }]}>{QUESTIONS[step].label}</Text>
              <SparkInput
                placeholder={QUESTIONS[step].hint}
                multiline
                value={values[QUESTIONS[step].stateKey]}
                onChangeText={setters[QUESTIONS[step].stateKey]}
                style={{ minHeight: 80, textAlignVertical: 'top' }}
              />
            </View>
          ) : (
            <View style={styles.step}>
              <Text style={[styles.question, { color: colors.foreground }]}>How do you like support?</Text>
              {SUPPORT_STYLES.map((style) => (
                <Pressable
                  key={style.key}
                  onPress={() => setSupportStyle(style.key)}
                  style={[styles.styleOption, { backgroundColor: colors.card, borderColor: colors.border }, supportStyle === style.key && { borderColor: colors.primary, backgroundColor: colors.primarySoft }]}
                >
                  <Text style={[styles.styleLabel, { color: supportStyle === style.key ? colors.primary : colors.foreground }]}>{style.label}</Text>
                  <Text style={[styles.styleDescription, { color: colors.muted }]}>{style.description}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </FadeIn>

        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <FadeIn delay={280}>
          <View style={styles.actions}>
            {step > 0 ? (
              <SparkButton title="Back" onPress={() => setStep(step - 1)} disabled={isSubmitting} variant="secondary" />
            ) : <View />}
            {step < 3 ? (
              <SparkButton title="Next" onPress={() => setStep(step + 1)} />
            ) : (
              isSubmitting ? <ActivityIndicator color={colors.primary} /> : <SparkButton title="Finish" onPress={submit} disabled={isSubmitting} variant="primary" />
            )}
          </View>
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, gap: spacing.lg, justifyContent: 'center' },
  hero: { alignItems: 'center', gap: spacing.md },
  title: { ...typography.title, marginBottom: spacing.sm, textAlign: 'center' },
  subtitle: { ...typography.body, textAlign: 'center' },
  progressCard: { gap: spacing.sm, marginBottom: spacing.sm },
  stepLabel: { ...typography.caption, textAlign: 'center' },
  step: { gap: spacing.md },
  question: { ...typography.heading },
  styleOption: { padding: spacing.md, borderRadius: 12, borderWidth: 1, gap: spacing.xs },
  styleLabel: { ...typography.body, fontWeight: '700' },
  styleDescription: { ...typography.caption },
  error: { ...typography.body, marginTop: spacing.sm },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
});
