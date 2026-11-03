import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { FadeIn } from '../../components/AnimatedWrapper';
import { GlassCard } from '../../components/GlassCard';
import { SparkButton } from '../../components/SparkButton';
import { SparkInput } from '../../components/SparkInput';
import { SparkOrb } from '../../components/visual/SparkOrb';
import { useTheme } from '../../providers/ThemeProvider';
import { authService } from '../../services/authService';
import { isDemoMode } from '../../services/cloudflareService';
import { useAuth } from '../../providers/AuthProvider';
import { colors, spacing, typography } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { setSession } = useAuth();
  const [mode, setMode] = useState<'staff' | 'student'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [publicId, setPublicId] = useState('');
  const [phrase, setPhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const demoMode = isDemoMode();

  async function handleLogin() {
    const ready = mode === 'staff' ? email.trim() && password.trim() : publicId.trim() && phrase.trim();
    if (!ready) {
      setError(mode === 'staff' ? 'Email and password are required' : 'Student ID and access phrase are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const session =
        mode === 'staff'
          ? await authService.login(email.trim(), password.trim())
          : await authService.loginStudent(publicId.trim(), phrase);
      setSession(session);
      router.replace('/(tabs)/dashboard');
    } catch (err) {
      const code = (err as { code?: string }).code;
      setError(
        code === 'INVALID_CREDENTIALS'
          ? mode === 'staff'
            ? 'Invalid email or password'
            : 'Invalid student ID or access phrase'
          : err instanceof Error
            ? err.message
            : 'Login failed',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setLoading(true);
    setError(null);
    try {
      const session = await authService.demoLogin();
      setSession(session);
      router.replace('/(tabs)/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo mode unavailable');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Welcome" mode="atmospheric" overline="SPARKNC">
      <ScrollView contentContainerStyle={styles.container}>
        <FadeIn delay={0}>
          <View style={styles.hero}>
            <SparkOrb size={80} color={colors.primary} pulse={false} />
            <Text style={[styles.title, { color: colors.foreground }]}>SparkNC</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Your growth. Your community. Your spark.</Text>
          </View>
        </FadeIn>

        <FadeIn delay={120}>
          <GlassCard style={styles.card}>
            <Text style={[styles.heading, { color: colors.foreground }]}>Sign in</Text>
            <View style={styles.toggle}>
              {(['student', 'staff'] as const).map((m) => (
                <Pressable
                  key={m}
                  accessibilityRole="button"
                  accessibilityState={{ selected: mode === m }}
                  onPress={() => { setMode(m); setError(null); }}
                  style={[styles.toggleOption, mode === m && { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.toggleText, { color: mode === m ? '#fff' : colors.muted }]}>
                    {m === 'student' ? 'Student' : 'Staff'}
                  </Text>
                </Pressable>
              ))}
            </View>
            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
            {mode === 'staff' ? (
              <>
                <SparkInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <SparkInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </>
            ) : (
              <>
                <SparkInput
                  placeholder="Student ID (stu_...)"
                  value={publicId}
                  onChangeText={setPublicId}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <SparkInput
                  placeholder="Access phrase"
                  value={phrase}
                  onChangeText={setPhrase}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Link href="/(auth)/access-reset" asChild>
                  <Pressable accessibilityRole="link" accessibilityLabel="Reset your access">
                    <Text style={[styles.link, { color: colors.primary }]}>Forgot your access phrase?</Text>
                  </Pressable>
                </Link>
              </>
            )}
            <SparkButton
              title="Continue"
              onPress={handleLogin}
              loading={loading}
              disabled={mode === 'staff' ? !email.trim() || !password.trim() : !publicId.trim() || !phrase.trim()}
            />
            {demoMode ? (
              <SparkButton title="Enter demo" onPress={handleDemo} disabled={loading} />
            ) : null}
            <Link href="/(auth)/enroll" asChild>
              <Pressable accessibilityRole="link" accessibilityLabel="Enroll with invitation">
                <Text style={[styles.link, { color: colors.primary }]}>Have an invitation? Enroll</Text>
              </Pressable>
            </Link>
          </GlassCard>
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', gap: spacing.xl, padding: spacing.md },
  hero: { alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  logoPill: { padding: spacing.lg, borderRadius: 999 },
  title: { ...typography.title, fontSize: 38 },
  subtitle: { ...typography.body, textAlign: 'center' },
  card: { gap: spacing.md, padding: spacing.lg, borderRadius: 24, borderWidth: 1 },
  heading: { ...typography.heading },
  error: { ...typography.body },
  input: { padding: spacing.md, borderRadius: 12, borderWidth: 1 },
  button: { paddingVertical: spacing.md, borderRadius: 999, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '700' },
  link: { textAlign: 'center', ...typography.body },
  toggle: { flexDirection: 'row', borderRadius: 999, borderWidth: 1, borderColor: '#00000022', overflow: 'hidden', alignSelf: 'center' },
  toggleOption: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  toggleText: { ...typography.body, fontWeight: '600' },
});
