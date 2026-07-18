import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: spacing.md }}>
        {loading ? <ActivityIndicator color={colors.accent} /> : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={<Text style={{ color: colors.muted }}>No conversations yet.</Text>}
            renderItem={({ item }) => (
              <Pressable onPress={() => openConversation(item)} style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={[styles.heading, { color: colors.foreground }]}>{item.participantIds.join(', ')}</Text>
                {item.unreadCount ? <Text style={{ color: colors.accent }}>{item.unreadCount} unread</Text> : null}
              </Pressable>
            )}
          />
        )}

        {selected ? (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.heading, { color: colors.foreground }]}>Messages</Text>
            {messages.length === 0 ? <Text style={{ color: colors.muted }}>No messages.</Text> : null}
            {messages.map((m) => (
              <View key={m.id} style={{ marginBottom: spacing.sm }}>
                <Text style={{ color: colors.foreground }}>{m.senderId}: {m.body}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{m.readStatus}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.heading, { color: colors.foreground }]}>New Message</Text>
          <TextInput
            placeholder="Recipient ID"
            placeholderTextColor={colors.muted}
            value={form.recipientId}
            onChangeText={(text) => setForm((f) => ({ ...f, recipientId: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <TextInput
            placeholder="Message"
            placeholderTextColor={colors.muted}
            value={form.body}
            onChangeText={(text) => setForm((f) => ({ ...f, body: text }))}
            style={[styles.input, { color: colors.foreground, borderColor: colors.muted }]}
          />
          <Pressable onPress={send} style={[styles.button, { backgroundColor: colors.accent }]}>
            <Text style={{ color: '#fff' }}>Send</Text>
          </Pressable>
        </View>

        {error ? <Text style={{ color: colors.error }}>{error}</Text> : null}
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: 20, gap: spacing.sm },
  heading: { ...typography.heading },
  input: { borderWidth: 1, borderRadius: 12, padding: spacing.md },
  button: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 12, alignSelf: 'flex-start' },
});
