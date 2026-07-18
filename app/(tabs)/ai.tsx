import React, { useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIScreen() {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!message.trim()) return;
    const userMessage = message.trim();
    setHistory((prev) => [...prev, { role: 'user', content: userMessage }]);
    setMessage('');
    setLoading(true);
    setError(null);
    try {
      const response = await cloudflareService.askAI(userMessage);
      setHistory((prev) => [...prev, { role: 'assistant', content: response.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Spark AI Companion">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.history} contentContainerStyle={{ gap: spacing.md }}>
          {history.length === 0 && <Text style={[styles.body, { color: colors.muted }]}>Ask Spark anything about your progress, goals, or streak.</Text>}
          {history.map((item, index) => (
            <View
              key={index}
              style={[
                styles.bubble,
                { backgroundColor: item.role === 'user' ? colors.accent : colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={{ color: item.role === 'user' ? '#fff' : colors.foreground }}>{item.content}</Text>
            </View>
          ))}
          {error && <Text style={[styles.body, { color: colors.highlight }]}>{error}</Text>}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Ask Spark..."
            placeholderTextColor={colors.muted}
            value={message}
            onChangeText={setMessage}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted, backgroundColor: colors.card }]}
          />
          {loading ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <Button title="Send" onPress={send} color={colors.accent} />
          )}
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: spacing.xl },
  history: { flex: 1, padding: spacing.md },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, padding: spacing.md },
  bubble: { padding: spacing.md, borderRadius: 16, borderWidth: 1, alignSelf: 'flex-start' },
  body: { ...typography.body },
});
