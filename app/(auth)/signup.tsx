import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { SparkButton } from '../../components/SparkButton';
import { SparkInput } from '../../components/SparkInput';
import { SparkOrb } from '../../components/visual/SparkOrb';
import { useTheme } from '../../providers/ThemeProvider';
import { authService } from '../../services/authService';
import { spacing, typography } from '../../theme';

export default function SignupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Name, email, and password are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.register(email.trim(), password.trim(), name.trim());
      await authService.login(email.trim(), password.trim());
      router.replace('/(tabs)/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Create Account" overline="SPARKNC" mode="atmospheric">
      <View style={styles.container}>
        <View style={styles.hero}>
          <SparkOrb size={80} color={colors.primary} pulse={false} />
          <Text style={[styles.title, { color: colors.foreground }]}>Join SparkNC</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Build your spark with a community that grows with you.</Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Create your account</Text>
          {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
          <SparkInput
            placeholder="Full name"
            value={name}
            onChangeText={setName}
          />
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
          <SparkButton title="Get started" onPress={handleRegister} loading={loading} disabled={!name.trim() || !email.trim() || !password.trim()} />
          <Link href="/(auth)/login" asChild>
            <Pressable accessibilityRole="link" accessibilityLabel="Sign in to existing account">
              <Text style={[styles.link, { color: colors.primary }]}>Already have an account? Sign in</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.md },
  title: { ...typography.title, textAlign: 'center' },
  subtitle: { ...typography.body, textAlign: 'center' },
  card: { gap: spacing.md, padding: spacing.lg, borderRadius: 24, borderWidth: 1 },
  heading: { ...typography.heading },
  error: { ...typography.body },
  link: { textAlign: 'center', ...typography.body },
});
