import React, { useState } from 'react';
import { ActivityIndicator, View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { FadeIn } from '../components/AnimatedWrapper';
import { GlassCard } from '../components/GlassCard';
import { ProgressBar } from '../components/ProgressBar';
import { SparkButton } from '../components/SparkButton';
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
    <AnimatedBackground>
      <ScrollView contentContainerStyle={styles.container}>
      <FadeIn delay={0}>
        <Text style={[styles.title, { color: colors.foreground }]}>Let&apos;s build your spark</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>A few quick questions so SparkNC feels like it was made for you.</Text>
      </FadeIn>

      <FadeIn delay={120}>
        <GlassCard style={styles.glass} intensity="low">
          <ProgressBar progress={progress} color={colors.accent} />
          <Text style={[styles.stepLabel, { color: colors.muted }]}>Step {step + 1} of 4</Text>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={200}>
        {step < 3 ? (
          <GlassCard style={styles.step} intensity="high">
            <Text style={[styles.question, { color: colors.foreground }]}>{QUESTIONS[step].label}</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
              placeholder={QUESTIONS[step].hint}
              placeholderTextColor={colors.muted}
              multiline
              value={values[QUESTIONS[step].stateKey]}
              onChangeText={setters[QUESTIONS[step].stateKey]}
            />
          </GlassCard>
        ) : (
          <GlassCard style={styles.step} intensity="high">
            <Text style={[styles.question, { color: colors.foreground }]}>How do you like support?</Text>
            {SUPPORT_STYLES.map((style) => (
              <Pressable
                key={style.key}
                onPress={() => setSupportStyle(style.key)}
                style={[styles.styleOption, { backgroundColor: colors.card, borderColor: colors.border }, supportStyle === style.key && { borderColor: colors.accent, backgroundColor: colors.accent + '15' }]}
              >
                <Text style={[styles.styleLabel, { color: supportStyle === style.key ? colors.accent : colors.foreground }]}>{style.label}</Text>
                <Text style={[styles.styleDescription, { color: colors.muted }]}>{style.description}</Text>
              </Pressable>
            ))}
          </GlassCard>
        )}
      </FadeIn>

      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

      <FadeIn delay={280}>
        <View style={styles.actions}>
          {step > 0 ? (
            <SparkButton title="Back" onPress={() => setStep(step - 1)} disabled={isSubmitting} variant="muted" />
          ) : <View />}
          {step < 3 ? (
            <SparkButton title="Next" onPress={() => setStep(step + 1)} />
          ) : (
            isSubmitting ? <ActivityIndicator color={colors.accent} /> : <SparkButton title="Finish" onPress={submit} disabled={isSubmitting} variant="secondary" />
          )}
        </View>
      </FadeIn>
    </ScrollView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, gap: spacing.lg, justifyContent: 'center' },
  title: { ...typography.title, marginBottom: spacing.sm },
  subtitle: { ...typography.body },
  glass: { gap: spacing.sm, marginBottom: spacing.sm },
  stepLabel: { ...typography.caption, textAlign: 'center' },
  step: { gap: spacing.md },
  question: { ...typography.heading },
  input: { borderWidth: 1, borderRadius: 12, padding: spacing.md, minHeight: 80, textAlignVertical: 'top' },
  styleOption: { padding: spacing.md, borderRadius: 12, borderWidth: 1, gap: spacing.xs },
  styleLabel: { ...typography.body, fontWeight: '700' },
  styleDescription: { ...typography.caption },
  error: { ...typography.body, marginTop: spacing.sm },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  primaryButton: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: 16, minWidth: 120, alignItems: 'center' },
  secondaryButton: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: 16, alignItems: 'center' },
  secondaryButtonText: { fontWeight: '700' },
});
