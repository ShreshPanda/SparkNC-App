import { BaseRepository } from './baseRepository';

export interface ConversationRecord {
  id: string;
  participantIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  body: string;
  readStatus: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

export class MessageRepository extends BaseRepository {
  constructor(private readonly db: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        run: () => Promise<unknown>;
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  }) {
    super();
  }

  async findConversationByParticipants(participantIds: string[]): Promise<ConversationRecord | null> {
    const sorted = [...participantIds].sort();
    const placeholders = sorted.map(() => '?').join(',');
    try {
      const result = await this.db
        .prepare(`SELECT c.id, c.created_at, c.updated_at FROM conversations c JOIN conversation_participants cp ON c.id = cp.conversation_id WHERE cp.user_id IN (${placeholders}) GROUP BY c.id HAVING COUNT(DISTINCT cp.user_id) = ?`)
        .bind(...sorted, sorted.length)
        .all();
      const rows = result.results ?? [];
      // For simplicity, pick the first candidate and verify exact participant set
      for (const row of rows) {
        const participants = await this.getConversationParticipants(String(row.id ?? ''));
        const match = participants.length === sorted.length && sorted.every((id) => participants.includes(id));
        if (match) {
          return {
            id: String(row.id ?? ''),
            participantIds: participants,
            createdAt: String(row.created_at ?? ''),
            updatedAt: String(row.updated_at ?? ''),
          };
        }
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to find conversation: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async getConversationParticipants(conversationId: string): Promise<string[]> {
    const result = await this.db
      .prepare('SELECT user_id FROM conversation_participants WHERE conversation_id = ?')
      .bind(conversationId)
      .all();
    return (result.results ?? []).map((row) => String(row.user_id ?? ''));
  }

  async listConversations(userId: string): Promise<ConversationRecord[]> {
    try {
      const result = await this.db
        .prepare('SELECT c.id, c.created_at, c.updated_at FROM conversations c JOIN conversation_participants cp ON c.id = cp.conversation_id WHERE cp.user_id = ? ORDER BY c.updated_at DESC')
        .bind(userId)
        .all();

      const records: ConversationRecord[] = [];
      for (const row of result.results ?? []) {
        const id = String(row.id ?? '');
        const participants = await this.getConversationParticipants(id);
        records.push({
          id,
          participantIds: participants,
          createdAt: String(row.created_at ?? ''),
          updatedAt: String(row.updated_at ?? ''),
        });
      }
      return records;
    } catch (error) {
      throw new Error(`Failed to list conversations: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async getConversation(conversationId: string): Promise<ConversationRecord | null> {
    try {
      const result = await this.db.prepare('SELECT id, created_at, updated_at FROM conversations WHERE id = ?').bind(conversationId).all();
      const row = result.results?.[0];
      if (!row) return null;
      const participants = await this.getConversationParticipants(conversationId);
      return {
        id: String(row.id ?? ''),
        participantIds: participants,
        createdAt: String(row.created_at ?? ''),
        updatedAt: String(row.updated_at ?? ''),
      };
    } catch (error) {
      throw new Error(`Failed to get conversation: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async createConversation(participantIds: string[]): Promise<ConversationRecord> {
    const now = this.now();
    const conversationId = this.createId('conv');

    try {
      await this.db.prepare('INSERT INTO conversations (id, created_at, updated_at) VALUES (?, ?, ?)').bind(conversationId, now, now).run();
      for (const userId of participantIds) {
        await this.db.prepare('INSERT OR IGNORE INTO conversation_participants (conversation_id, user_id, created_at) VALUES (?, ?, ?)').bind(conversationId, userId, now).run();
      }
      return {
        id: conversationId,
        participantIds,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      throw new Error(`Failed to create conversation: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async listMessages(conversationId: string): Promise<MessageRecord[]> {
    try {
      const result = await this.db
        .prepare('SELECT id, conversation_id, sender_id, recipient_id, body, read_status, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC')
        .bind(conversationId)
        .all();
      return (result.results ?? []).map((row) => this.mapMessageRow(row));
    } catch (error) {
      throw new Error(`Failed to list messages: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async sendMessage(conversationId: string, senderId: string, recipientId: string, body: string): Promise<MessageRecord> {
    const now = this.now();
    const messageId = this.createId('msg');

    try {
      await this.db
        .prepare('INSERT INTO messages (id, conversation_id, sender_id, recipient_id, body, read_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(messageId, conversationId, senderId, recipientId, body, 'sent', now)
        .run();
      await this.db.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?').bind(now, conversationId).run();
      return {
        id: messageId,
        conversationId,
        senderId,
        recipientId,
        body,
        readStatus: 'sent',
        createdAt: now,
      };
    } catch (error) {
      throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async markMessagesRead(conversationId: string, userId: string): Promise<void> {
    try {
      await this.db
        .prepare("UPDATE messages SET read_status = 'read' WHERE conversation_id = ? AND recipient_id = ? AND read_status != 'read'")
        .bind(conversationId, userId)
        .run();
    } catch (error) {
      throw new Error(`Failed to mark messages read: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  private mapMessageRow(row: Record<string, unknown>): MessageRecord {
    return {
      id: String(row.id ?? ''),
      conversationId: String(row.conversation_id ?? ''),
      senderId: String(row.sender_id ?? ''),
      recipientId: String(row.recipient_id ?? ''),
      body: String(row.body ?? ''),
      readStatus: String(row.read_status ?? 'sent') as MessageRecord['readStatus'],
      createdAt: String(row.created_at ?? ''),
    };
  }
}
