import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { FadeIn } from '../../components/AnimatedWrapper';
import { GlassCard } from '../../components/GlassCard';
import { SparkButton } from '../../components/SparkButton';
import { SparkInput } from '../../components/SparkInput';
import { SparkOrb } from '../../components/visual/SparkOrb';
import { useTheme } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import { authService } from '../../services/authService';
import { checkAccessPhrase, enrollmentService, mapEnrollmentError } from '../../services/enrollmentService';
import { spacing, typography } from '../../theme';
import type { ResolveInvitationPayload, VerifyClaimCodePayload } from '../../services/cloudflareService';

type Step = 'token' | 'code' | 'phrase' | 'done';

// Student enrollment: resolve invitation → verify claim code → set access
// phrase → claim account. Displays the server-generated public student ID
// once at the end; staff invitations never disclose roster identity until
// the claim code verifies.
export default function EnrollScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { setSession } = useAuth();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const initialToken = Array.isArray(params.token) ? params.token[0] : params.token;

  const [step, setStep] = useState<Step>(initialToken ? 'code' : 'token');
  const [token, setToken] = useState(initialToken ?? '');
  const [resolved, setResolved] = useState<ResolveInvitationPayload | null>(null);
  const [claimCode, setClaimCode] = useState('');
  const [identity, setIdentity] = useState<VerifyClaimCodePayload | null>(null);
  const [phrase, setPhrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [publicId, setPublicId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleResolve() {
    if (!token.trim()) {
      setError('Enter your invitation token');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await enrollmentService.resolveInvitation(token);
      setResolved(result);
      setStep('code');
    } catch (err) {
      setError(mapEnrollmentError(err, 'This invitation could not be resolved.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!claimCode.trim()) {
      setError('Enter your claim code');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await enrollmentService.verifyClaimCode(token, claimCode);
      setIdentity(result);
      setStep('phrase');
    } catch (err) {
      setError(mapEnrollmentError(err, 'That claim code could not be verified.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim() {
    const check = checkAccessPhrase(phrase);
    if (!check.valid) {
      setError(check.message ?? 'Invalid access phrase');
      return;
    }
    if (phrase !== confirm) {
      setError('Access phrases do not match');
      return;
    }
    if (!identity) return;
    setLoading(true);
    setError(null);
    try {
      const result = await enrollmentService.claim(identity.grantToken, phrase);
      setPublicId(result.publicId);
      // Claim already issued the session cookie — refresh pulls the
      // enrolled user (with publicId) into the provider so the dashboard
      // is reachable immediately, no restart required.
      const session = await authService.refreshSession();
      setSession(session);
      setStep('done');
    } catch (err) {
      setError(mapEnrollmentError(err, 'Enrollment could not be completed.'));
    } finally {
      setLoading(false);
    }
  }

  async function copyPublicId() {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(publicId);
      } else {
        await Share.share({ message: publicId });
      }
      setCopied(true);
    } catch {
      // Share sheet dismissed — still counts as offered.
    }
  }

  return (
    <AppShell title="Enroll" mode="atmospheric" overline="SPARKNC">
      <ScrollView contentContainerStyle={styles.container}>
        <FadeIn delay={0}>
          <View style={styles.hero}>
            <SparkOrb size={72} color={colors.primary} pulse={false} />
            <Text style={[styles.title, { color: colors.foreground }]}>Join SparkNC</Text>
          </View>
        </FadeIn>

        <FadeIn delay={120}>
          <GlassCard style={styles.card}>
            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

            {step === 'token' ? (
              <>
                <Text style={[styles.heading, { color: colors.foreground }]}>Enter your invitation</Text>
                <Text style={[styles.body, { color: colors.muted }]}>Paste the token from your invitation link or ask your lab leader.</Text>
                <SparkInput placeholder="Invitation token" value={token} onChangeText={setToken} autoCapitalize="none" autoCorrect={false} />
                <SparkButton title="Continue" onPress={handleResolve} loading={loading} disabled={!token.trim()} />
              </>
            ) : null}

            {step === 'code' ? (
              <>
                <Text style={[styles.heading, { color: colors.foreground }]}>Enter your claim code</Text>
                <Text style={[styles.body, { color: colors.muted }]}>
                  {resolved?.kind === 'school_link'
                    ? 'This is a school-wide invitation. Enter the 10-character claim code from your roster entry.'
                    : 'Enter the 10-character claim code for your invitation.'}
                </Text>
                <SparkInput placeholder="Claim code" value={claimCode} onChangeText={setClaimCode} autoCapitalize="characters" autoCorrect={false} maxLength={12} />
                <SparkButton title="Verify" onPress={handleVerify} loading={loading} disabled={!claimCode.trim()} />
                <Pressable accessibilityRole="button" onPress={() => { setStep('token'); setError(null); }}>
                  <Text style={[styles.link, { color: colors.primary }]}>Use a different invitation</Text>
                </Pressable>
              </>
            ) : null}

            {step === 'phrase' && identity ? (
              <>
                <Text style={[styles.heading, { color: colors.foreground }]}>Confirm your identity</Text>
                <Text style={[styles.body, { color: colors.muted }]}>
                  {identity.displayName} · {identity.schoolName}
                </Text>
                <Text style={[styles.body, { color: colors.muted }]}>Create a personal access phrase (at least 12 characters and 3 words). You'll use it to sign in.</Text>
                <SparkInput placeholder="Access phrase" value={phrase} onChangeText={setPhrase} secureTextEntry autoCapitalize="none" autoCorrect={false} />
                <SparkInput placeholder="Confirm access phrase" value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" autoCorrect={false} />
                <SparkButton title="Create account" onPress={handleClaim} loading={loading} disabled={!phrase.trim() || !confirm.trim()} />
              </>
            ) : null}

            {step === 'done' ? (
              <>
                <Text style={[styles.heading, { color: colors.foreground }]}>Enrollment complete</Text>
                <Text style={[styles.body, { color: colors.muted }]}>Save your student ID. You need it to sign in next time.</Text>
                <View style={[styles.idBox, { borderColor: colors.border ?? colors.primary }]}>
                  <Text style={[styles.idText, { color: colors.foreground }]} selectable>{publicId}</Text>
                </View>
                <SparkButton title={copied ? 'Copied' : 'Copy student ID'} onPress={copyPublicId} />
                <SparkButton title="Continue to SparkNC" onPress={() => router.replace('/(tabs)/dashboard')} />
              </>
            ) : null}

            {step !== 'done' ? (
              <Link href="/(auth)/login" asChild>
                <Pressable accessibilityRole="link">
                  <Text style={[styles.link, { color: colors.primary }]}>Back to sign in</Text>
                </Pressable>
              </Link>
            ) : null}
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
  idBox: { padding: spacing.md, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  idText: { ...typography.heading, letterSpacing: 1 },
  link: { textAlign: 'center', ...typography.body },
});
