import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/AppShell';
import { SparkEmptyState } from '../../components/SparkEmptyState';
import { FadeIn } from '../../components/AnimatedWrapper';
import { SparkButton } from '../../components/SparkButton';
import { SparkCard } from '../../components/SparkCard';
import { SparkInput } from '../../components/SparkInput';
import { SparkListRow } from '../../components/SparkListRow';
import { SparkAvatar } from '../../components/SparkAvatar';
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
    <AppShell title="Messages" overline="CONNECT" mode="clean">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : conversations.length === 0 ? (
          <SparkEmptyState
            icon={<Ionicons name="chatbubble-outline" size={32} color={colors.primary} />}
            title="No conversations yet"
            message="Start a new message to connect with a mentor or peer."
          />
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <SparkListRow
                title={item.participantIds.join(', ')}
                subtitle={item.unreadCount ? 'New messages' : 'Tap to view'}
                detail={item.unreadCount ? `${item.unreadCount} unread` : undefined}
                badge={item.unreadCount ? `${item.unreadCount}` : undefined}
                badgeColor={item.unreadCount ? colors.primary : undefined}
                icon="chatbubbles-outline"
                iconColor={colors.primary}
                onPress={() => openConversation(item)}
                accessibilityLabel={`Conversation with ${item.participantIds.join(', ')}`}
              />
            )}
          />
        )}

        {selected ? (
          <FadeIn delay={80}>
            <SparkCard>
              <Text style={[styles.heading, { color: colors.foreground }]}>Messages</Text>
              {messages.length === 0 ? (
                <Text style={[styles.body, { color: colors.muted }]}>No messages.</Text>
              ) : (
                messages.map((m, i) => (
                  <View key={m.id} style={[styles.messageRow, { marginBottom: spacing.sm, alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end' }]}>
                    <View style={[styles.messageBubble, { backgroundColor: i % 2 === 0 ? colors.surface : colors.primary }]}>
                      <Text style={[styles.messageSender, { color: colors.foreground }]}>{m.senderId}</Text>
                      <Text style={[styles.messageBody, { color: colors.foreground }]}>{m.body}</Text>
                      <Text style={[styles.messageMeta, { color: colors.muted }]}>{m.readStatus}</Text>
                    </View>
                  </View>
                ))
              )}
            </SparkCard>
          </FadeIn>
        ) : null}

        <FadeIn delay={160}>
          <SparkCard>
            <Text style={[styles.heading, { color: colors.foreground }]}>New message</Text>
            <SparkInput
              placeholder="Who should receive this?"
              value={form.recipientId}
              onChangeText={(text) => setForm((f) => ({ ...f, recipientId: text }))}
            />
            <SparkInput
              placeholder="Write your message..."
              value={form.body}
              onChangeText={(text) => setForm((f) => ({ ...f, body: text }))}
            />
            <SparkButton title="Send" onPress={send} variant="primary" />
          </SparkCard>
        </FadeIn>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, padding: spacing.md, paddingBottom: spacing.xl },
  heading: { ...typography.title3 },
  body: { ...typography.body },
  messageRow: { alignItems: 'flex-start' },
  messageBubble: { padding: spacing.sm, borderRadius: 12, gap: spacing.xs, maxWidth: '80%' },
  messageSender: { ...typography.footnote, fontWeight: '700' },
  messageBody: { ...typography.body },
  messageMeta: { ...typography.footnote },
  error: { ...typography.body },
});
