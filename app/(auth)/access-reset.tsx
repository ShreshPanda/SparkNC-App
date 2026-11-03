import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { FadeIn } from '../../components/AnimatedWrapper';
import { GlassCard } from '../../components/GlassCard';
import { SparkButton } from '../../components/SparkButton';
import { SparkInput } from '../../components/SparkInput';
import { SparkOrb } from '../../components/visual/SparkOrb';
import { useTheme } from '../../providers/ThemeProvider';
import { checkAccessPhrase, enrollmentService, mapEnrollmentError } from '../../services/enrollmentService';
import { spacing, typography } from '../../theme';

// Student access recovery: complete a one-time reset issued by a lab
// leader or admin. A successful reset revokes every existing session —
// the student must log in again with the new phrase.
export default function AccessResetScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const initialToken = Array.isArray(params.token) ? params.token[0] : params.token;

  const [token, setToken] = useState(initialToken ?? '');
  const [phrase, setPhrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleReset() {
    const check = checkAccessPhrase(phrase);
    if (!check.valid) {
      setError(check.message ?? 'Invalid access phrase');
      return;
    }
    if (phrase !== confirm) {
      setError('Access phrases do not match');
      return;
    }
    if (!token.trim()) {
      setError('Enter your reset token');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await enrollmentService.completeReset(token, phrase);
      setDone(true);
    } catch (err) {
      setError(mapEnrollmentError(err, 'Reset could not be completed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Reset Access" mode="atmospheric" overline="SPARKNC">
      <ScrollView contentContainerStyle={styles.container}>
        <FadeIn delay={0}>
          <View style={styles.hero}>
            <SparkOrb size={72} color={colors.primary} pulse={false} />
            <Text style={[styles.title, { color: colors.foreground }]}>Reset access</Text>
          </View>
        </FadeIn>

        <FadeIn delay={120}>
          <GlassCard style={styles.card}>
            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

            {done ? (
              <>
                <Text style={[styles.heading, { color: colors.foreground }]}>Access reset complete</Text>
                <Text style={[styles.body, { color: colors.muted }]}>
                  Your new access phrase is set. For your security, every existing sign-in was revoked — log in again with your student ID and new phrase.
                </Text>
                <SparkButton title="Sign in" onPress={() => router.replace('/(auth)/login')} />
              </>
            ) : (
              <>
                <Text style={[styles.heading, { color: colors.foreground }]}>Set a new access phrase</Text>
                <Text style={[styles.body, { color: colors.muted }]}>
                  Paste the reset token your lab leader gave you and choose a new phrase (at least 12 characters and 3 words).
                </Text>
                <SparkInput placeholder="Reset token" value={token} onChangeText={setToken} autoCapitalize="none" autoCorrect={false} editable={!initialToken} />
                <SparkInput placeholder="New access phrase" value={phrase} onChangeText={setPhrase} secureTextEntry autoCapitalize="none" autoCorrect={false} />
                <SparkInput placeholder="Confirm new phrase" value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" autoCorrect={false} />
                <SparkButton title="Reset my access" onPress={handleReset} loading={loading} disabled={!token.trim() || !phrase.trim() || !confirm.trim()} />
                <Link href="/(auth)/login" asChild>
                  <Pressable accessibilityRole="link">
                    <Text style={[styles.link, { color: colors.primary }]}>Back to sign in</Text>
                  </Pressable>
                </Link>
              </>
            )}
          </GlassCard>
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', gap: spacing.xl, padding: spacing.md },
  hero: { alignItems: 'center', gap: spacing.md },
  title: { ...typography.title, fontSize: 30 },
  card: { gap: spacing.md, padding: spacing.lg, borderRadius: 24, borderWidth: 1 },
  heading: { ...typography.heading },
  body: { ...typography.body },
  error: { ...typography.body },
  link: { textAlign: 'center', ...typography.body },
});
