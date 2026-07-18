import { z } from 'zod';
import { MessageRepository, type ConversationRecord, type MessageRecord } from '../repositories/MessageRepository';
import { assertNonEmpty } from '../validators/baseValidator';
import { NotificationService } from './notificationService';

export const sendMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient is required'),
  body: z.string().min(1, 'Message body is required'),
});

export interface EnrichedConversation {
  id: string;
  participantIds: string[];
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
}

export interface EnrichedMessage extends MessageRecord {}

export class MessageService {
  constructor(
    private readonly repository: MessageRepository,
    private readonly notificationService?: NotificationService,
  ) {}

  async listConversations(userId: string): Promise<EnrichedConversation[]> {
    assertNonEmpty(userId, 'User id is required');
    const conversations = await this.repository.listConversations(userId);
    return this.enrichConversations(conversations, userId);
  }

  async getConversation(conversationId: string, userId: string): Promise<ConversationRecord | null> {
    assertNonEmpty(conversationId, 'Conversation id is required');
    assertNonEmpty(userId, 'User id is required');
    const conversation = await this.repository.getConversation(conversationId);
    if (!conversation || !conversation.participantIds.includes(userId)) {
      return null;
    }
    return conversation;
  }

  async listMessages(conversationId: string, userId: string): Promise<MessageRecord[]> {
    assertNonEmpty(conversationId, 'Conversation id is required');
    assertNonEmpty(userId, 'User id is required');
    const conversation = await this.repository.getConversation(conversationId);
    if (!conversation || !conversation.participantIds.includes(userId)) {
      throw new Error('Conversation not found');
    }
    return this.repository.listMessages(conversationId);
  }

  async sendMessage(input: unknown, senderId: string): Promise<EnrichedMessage> {
    assertNonEmpty(senderId, 'User id is required');
    const parsed = sendMessageSchema.parse(input);
    if (parsed.recipientId === senderId) {
      throw new Error('Cannot send message to yourself');
    }

    let conversation = await this.repository.findConversationByParticipants([senderId, parsed.recipientId]);
    if (!conversation) {
      conversation = await this.repository.createConversation([senderId, parsed.recipientId]);
    }

    const message = await this.repository.sendMessage(conversation.id, senderId, parsed.recipientId, parsed.body);

    if (this.notificationService) {
      await this.notificationService.createNotification({
        userId: parsed.recipientId,
        title: 'New message',
        body: `You received a new message.`,
        kind: 'info',
        entityType: 'message',
        entityId: message.id,
      });
    }

    return message;
  }

  async markRead(conversationId: string, userId: string): Promise<void> {
    assertNonEmpty(conversationId, 'Conversation id is required');
    assertNonEmpty(userId, 'User id is required');
    const conversation = await this.repository.getConversation(conversationId);
    if (!conversation || !conversation.participantIds.includes(userId)) {
      throw new Error('Conversation not found');
    }
    await this.repository.markMessagesRead(conversationId, userId);
  }

  private async enrichConversations(conversations: ConversationRecord[], userId: string): Promise<EnrichedConversation[]> {
    const result: EnrichedConversation[] = [];
    for (const conversation of conversations) {
      const messages = await this.repository.listMessages(conversation.id);
      const unreadCount = messages.filter((m) => m.recipientId === userId && m.readStatus !== 'read').length;
      result.push({
        ...conversation,
        unreadCount,
      });
    }
    return result;
  }
}
