import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/AppShell';
import { EmptyState } from '../../components/EmptyState';
import { FadeIn } from '../../components/AnimatedWrapper';
import { SparkButton } from '../../components/SparkButton';
import { SparkCard } from '../../components/SparkCard';
import { useTheme } from '../../providers/ThemeProvider';
import { cloudflareService } from '../../services/cloudflareService';
import { spacing, typography } from '../../theme';
import { Conversation, Message } from '../../shared/types';

export default function MessagesScreen() {
  const { colors } = useTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ recipientId: '', body: '' });

  async function load() {
    try {
      setLoading(true);
      const items = await cloudflareService.listConversations();
      setConversations(items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }

  async function openConversation(conversation: Conversation) {
    setSelected(conversation);
    try {
      const items = await cloudflareService.getMessages(conversation.id);
      setMessages(items);
      await cloudflareService.markConversationRead(conversation.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    }
  }

  async function send() {
    if (!form.recipientId || !form.body) return;
    try {
      await cloudflareService.sendMessage({ recipientId: form.recipientId, body: form.body });
      setForm({ recipientId: '', body: '' });
      await load();
      if (selected) {
        const items = await cloudflareService.getMessages(selected.id);
        setMessages(items);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell title="Messages">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: spacing.md, padding: spacing.md, paddingBottom: spacing.xl }}>
        {loading ? <ActivityIndicator color={colors.accent} /> : (
          conversations.length === 0 ? (
            <EmptyState title="No conversations yet" message="Start a new message to connect with a mentor or peer." icon="chatbubble-outline" />
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Pressable onPress={() => openConversation(item)} style={[styles.card, { backgroundColor: colors.card }]} accessibilityRole="button" accessibilityLabel={`Conversation with ${item.participantIds.join(', ')}`}>
                  <View style={styles.conversationHeader}>
                    <Ionicons name="chatbubbles-outline" size={20} color={colors.accent} />
                    <Text style={[styles.heading, { color: colors.foreground }]}>{item.participantIds.join(', ')}</Text>
                  </View>
                  {item.unreadCount ? (
                    <View style={[styles.unreadPill, { backgroundColor: colors.highlight }]}>
                      <Text style={[styles.unreadText, { color: colors.foreground }]}>{item.unreadCount} unread</Text>
                    </View>
                  ) : null}
                </Pressable>
              )}
            />
          )
        )}

        {selected ? (
          <FadeIn delay={80}>
            <SparkCard>
              <Text style={[styles.heading, { color: colors.foreground }]}>Messages</Text>
              {messages.length === 0 ? <Text style={[styles.body, { color: colors.muted }]}>No messages.</Text> : null}
              {messages.map((m, i) => (
                <View key={m.id} style={[styles.messageRow, { marginBottom: spacing.sm }]}>
                  <View style={[styles.messageBubble, i % 2 === 0 ? { backgroundColor: colors.border } : { backgroundColor: colors.highlight }]}>
                    <Text style={[styles.messageSender, { color: colors.foreground }]}>{m.senderId}</Text>
                    <Text style={[styles.messageBody, { color: colors.foreground }]}>{m.body}</Text>
                    <Text style={[styles.messageMeta, { color: colors.muted }]}>{m.readStatus}</Text>
                  </View>
                </View>
              ))}
            </SparkCard>
          </FadeIn>
        ) : null}

        <FadeIn delay={160}>
          <SparkCard>
            <Text style={[styles.heading, { color: colors.foreground }]}>New message</Text>
            <TextInput
              placeholder="Who should receive this?"
              placeholderTextColor={colors.muted}
              value={form.recipientId}
              onChangeText={(text) => setForm((f) => ({ ...f, recipientId: text }))}
              style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
            />
            <TextInput
              placeholder="Write your message..."
              placeholderTextColor={colors.muted}
              value={form.body}
              onChangeText={(text) => setForm((f) => ({ ...f, body: text }))}
              style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
            />
            <SparkButton title="Send" onPress={send} variant="primary" />
          </SparkCard>
        </FadeIn>

        {error ? <Text style={{ color: colors.error }}>{error}</Text> : null}
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: 20, gap: spacing.sm },
  heading: { ...typography.heading },
  body: { ...typography.body },
  conversationHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  unreadPill: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 999, marginTop: spacing.xs },
  unreadText: { ...typography.caption, fontWeight: '700' },
  messageRow: { alignItems: 'flex-start' },
  messageBubble: { padding: spacing.sm, borderRadius: 12 },
  messageSender: { ...typography.caption, fontWeight: '700' },
  messageBody: { ...typography.body },
  messageMeta: { ...typography.caption },
  input: { borderWidth: 1, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm },
});
