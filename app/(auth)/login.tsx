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
import { colors, spacing, typography } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.login(email.trim(), password.trim());
      router.replace('/(tabs)/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
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
            <SparkButton title="Continue" onPress={handleLogin} loading={loading} disabled={!email.trim() || !password.trim()} />
            <Link href="/(auth)/signup" asChild>
              <Pressable accessibilityRole="link" accessibilityLabel="Create an account">
                <Text style={[styles.link, { color: colors.primary }]}>Create an account</Text>
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
});
