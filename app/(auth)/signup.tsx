import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { authService } from '../../services/authService';
import { colors, spacing, typography } from '../../theme';

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
    <AppShell title="Create Account">
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.foreground }]}>Join SparkNC</Text>
        {error && <Text style={[styles.error, { color: colors.highlight }]}>{error}</Text>}
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="Full name"
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Pressable style={[styles.button, { backgroundColor: colors.accent }]} onPress={handleRegister} disabled={loading} accessibilityRole="button" accessibilityLabel={loading ? 'Creating account' : 'Create account'}>
          {loading ? <ActivityIndicator color={colors.foreground} /> : <Text style={styles.buttonText}>Get started</Text>}
        </Pressable>
        <Link href="/(auth)/login" asChild>
          <Pressable accessibilityRole="link" accessibilityLabel="Sign in to existing account">
            <Text style={[styles.link, { color: colors.accent }]}>Already have an account? Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md, padding: spacing.lg, borderRadius: 20, borderWidth: 1 },
  heading: { ...typography.heading },
  error: { ...typography.body },
  input: { padding: spacing.md, borderRadius: 12, borderWidth: 1 },
  button: { paddingVertical: spacing.md, borderRadius: 999, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '700' },
  link: { textAlign: 'center', ...typography.body },
});
