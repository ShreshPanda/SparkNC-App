import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { FadeIn } from '../../components/AnimatedWrapper';
import { SparkCard } from '../../components/SparkCard';
import { SparkInput } from '../../components/SparkInput';
import { SparkButton } from '../../components/SparkButton';
import { SparkOrb } from '../../components/visual/SparkOrb';
import { useTheme } from '../../providers/ThemeProvider';
import { authService } from '../../services/authService';
import { cloudflareService } from '../../services/cloudflareService';
import { colors as baseColors, radius, spacing, typography } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const INSIGHTS = [
  { icon: 'bulb-outline', title: 'Reflection', prompt: 'What did I learn this week?', color: baseColors.gold },
  { icon: 'trophy-outline', title: 'Celebrate', prompt: 'What should I celebrate?', color: baseColors.spark },
  { icon: 'flag-outline', title: 'Goal check-in', prompt: 'What should I focus on next?', color: baseColors.info },
  { icon: 'calendar-outline', title: 'Plan', prompt: 'Help me plan my week', color: baseColors.creative },
];

export default function AIScreen() {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');
  const [coach, setCoach] = useState<{ reflection: string; suggestion: string } | null>(null);
  const [coachLoading, setCoachLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    const base = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    authService.getSession().then((s) => {
      const name = s?.name ? `, ${s.name.split(' ')[0]}` : '';
      setGreeting(`${base}${name}, I'm Spark.`);
    }).catch(() => setGreeting(`${base}, I'm Spark.`));
    loadCoach();
  }, []);

  async function loadCoach() {
    setCoachLoading(true);
    try {
      const [reflection, plan] = await Promise.all([
        cloudflareService.getAIReflection().catch(() => null),
        cloudflareService.getAIPlan().catch(() => null),
      ]);
      setCoach({
        reflection: reflection?.reply ?? 'Take a moment to look back on what you accomplished this week.',
        suggestion: plan?.reply ?? 'Try setting one small goal for tomorrow.',
      });
    } catch {
      setCoach({
        reflection: 'Take a moment to look back on what you accomplished this week.',
        suggestion: 'Try setting one small goal for tomorrow.',
      });
    } finally {
      setCoachLoading(false);
    }
  }

  async function ask(text: string) {
    setHistory((prev) => [...prev, { role: 'user', content: text }]);
    setMessage('');
    setLoading(true);
    setError(null);
    try {
      const response = await cloudflareService.askAI(text);
      setHistory((prev) => [...prev, { role: 'assistant', content: response.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Spark" overline="AI COMPANION" mode="ambient">
      <ScrollView style={styles.history} contentContainerStyle={styles.historyContent}>
        <FadeIn delay={0}>
          <View style={styles.hero}>
            <SparkOrb size={80} color={colors.primary} />
            <Text style={[styles.greeting, { color: colors.foreground }]}>{greeting || "Hi, I'm Spark."}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Ask about your growth, goals, or opportunities.</Text>
          </View>
        </FadeIn>

        <FadeIn delay={80}>
          <SparkCard>
            <View style={styles.coachHeader}>
              <Ionicons name="sparkles" size={22} color={colors.primary} />
              <Text style={[styles.coachTitle, { color: colors.foreground }]}>Growth Coach</Text>
            </View>
            {coachLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={[styles.coachText, { color: colors.foreground }]}>{coach?.reflection}</Text>
                <Text style={[styles.coachText, { color: colors.muted }]}>{coach?.suggestion}</Text>
              </>
            )}
          </SparkCard>
        </FadeIn>

        <FadeIn delay={140}>
          <View style={styles.insightGrid}>
            {INSIGHTS.map((insight, i) => (
              <Pressable key={i} onPress={() => ask(insight.prompt)} style={styles.insightCard} accessibilityRole="button" accessibilityLabel={`${insight.title}: ${insight.prompt}`}>
                <SparkCard style={{ backgroundColor: insight.color }}>
                  <View style={[styles.iconPill, { backgroundColor: `${baseColors.white}20` }]}>
                    <Ionicons name={insight.icon as React.ComponentProps<typeof Ionicons>['name']} size={18} color={baseColors.white} />
                  </View>
                  <Text style={[styles.insightTitle, { color: baseColors.white }]}>{insight.title}</Text>
                </SparkCard>
              </Pressable>
            ))}
          </View>
        </FadeIn>

        {history.length > 0 && (
          <View style={styles.conversation}>
            {history.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.bubble,
                  { backgroundColor: item.role === 'user' ? colors.primary : colors.card, borderColor: colors.border },
                  item.role === 'user' ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text style={[styles.bubbleText, { color: item.role === 'user' ? colors.surface : colors.foreground }]}>{item.content}</Text>
              </View>
            ))}
            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
            {loading ? <ActivityIndicator color={colors.primary} style={{ alignSelf: 'center' }} /> : null}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <SparkInput
          placeholder="Ask Spark..."
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={() => message.trim() && ask(message)}
          style={{ flex: 1 }}
        />
        <SparkButton
          icon="arrow-up"
          title=""
          onPress={() => message.trim() && ask(message)}
          disabled={loading || !message.trim()}
          style={styles.send}
        />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  history: { flex: 1, padding: spacing.lg },
  historyContent: { gap: spacing.lg, paddingBottom: spacing.xxl },
  hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  greeting: { ...typography.title1, marginBottom: spacing.sm },
  subtitle: { ...typography.body, marginBottom: spacing.md, textAlign: 'center' },
  insightGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center' },
  insightCard: { width: '47%' },
  coachHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  coachTitle: { ...typography.headline },
  coachText: { ...typography.body },
  iconPill: { padding: spacing.sm, borderRadius: 999, alignSelf: 'flex-start' },
  insightTitle: { ...typography.footnote, fontWeight: '700' },
  conversation: { gap: spacing.md, marginTop: spacing.md },
  bubble: { padding: spacing.md, borderRadius: radius.xl, borderWidth: 1, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: radius.sm },
  assistantBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: radius.sm },
  bubbleText: { ...typography.body },
  error: { ...typography.footnote },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  send: { width: 48, height: 48, padding: 0, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
