import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { FadeIn } from '../../components/AnimatedWrapper';
import { useTheme } from '../../providers/ThemeProvider';
import { authService } from '../../services/authService';
import { cloudflareService } from '../../services/cloudflareService';
import { colors as baseColors, spacing, typography } from '../../theme';
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
    <AppShell title="Spark AI">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.history} contentContainerStyle={styles.historyContent}>
          <FadeIn delay={0}>
            <Text style={[styles.greeting, { color: colors.foreground }]}>{greeting || "Hi, I'm Spark."}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Proactive insights for your day. Ask anything about your growth, goals, or opportunities.</Text>
          </FadeIn>

          <FadeIn delay={80}>
            <View style={[styles.coachCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.coachHeader}>
                <Ionicons name="sparkles" size={22} color={colors.accent} />
                <Text style={[styles.insightTitle, { color: colors.foreground }]}>Growth Coach</Text>
              </View>
              {coachLoading ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <>
                  <Text style={[styles.coachText, { color: colors.foreground }]}>{coach?.reflection}</Text>
                  <Text style={[styles.coachText, { color: colors.muted }]}>{coach?.suggestion}</Text>
                </>
              )}
            </View>
          </FadeIn>

          <FadeIn delay={140}>
            <View style={styles.insightGrid}>
              {INSIGHTS.map((insight, i) => (
                <Pressable key={i} onPress={() => ask(insight.prompt)} style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.border }]} accessibilityRole="button" accessibilityLabel={`${insight.title}: ${insight.prompt}`}>
                  <View style={[styles.iconPill, { backgroundColor: insight.color }]}>
                    <Ionicons name={insight.icon as React.ComponentProps<typeof Ionicons>['name']} size={18} color={baseColors.white} />
                  </View>
                  <Text style={[styles.insightTitle, { color: colors.foreground }]}>{insight.title}</Text>
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
                    { backgroundColor: item.role === 'user' ? colors.accent : colors.card, borderColor: colors.border },
                    item.role === 'user' ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text style={[styles.bubbleText, { color: item.role === 'user' ? colors.card : colors.foreground }]}>{item.content}</Text>
                </View>
              ))}
              {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
              {loading ? <ActivityIndicator color={colors.accent} style={{ alignSelf: 'center' }} /> : null}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Ask Spark..."
            placeholderTextColor={colors.muted}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={() => message.trim() && ask(message)}
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
          />
          <Pressable onPress={() => message.trim() && ask(message)} disabled={loading || !message.trim()} style={[styles.send, { backgroundColor: colors.accent }]} accessibilityRole="button" accessibilityLabel="Send message to Spark">
            <Ionicons name="arrow-up" size={20} color={baseColors.white} />
          </Pressable>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: spacing.xl },
  history: { flex: 1, padding: spacing.md },
  historyContent: { gap: spacing.lg },
  greeting: { ...typography.title, marginBottom: spacing.sm },
  subtitle: { ...typography.body, marginBottom: spacing.md },
  insightGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  insightCard: { width: '47%', padding: spacing.md, borderRadius: 16, borderWidth: 1, gap: spacing.sm },
  coachCard: { padding: spacing.md, borderRadius: 16, borderWidth: 1, gap: spacing.sm },
  coachHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  coachText: { ...typography.body },
  iconPill: { padding: spacing.sm, borderRadius: 999, alignSelf: 'flex-start' },
  insightTitle: { ...typography.body, fontWeight: '700' },
  conversation: { gap: spacing.md, marginTop: spacing.md },
  bubble: { padding: spacing.md, borderRadius: 16, borderWidth: 1, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  assistantBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleText: { ...typography.body },
  error: { ...typography.body },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  input: { flex: 1, borderWidth: 1, borderRadius: 16, padding: spacing.md },
  send: { padding: spacing.md, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
