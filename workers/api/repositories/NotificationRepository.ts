import { BaseRepository } from './baseRepository';

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  body: string;
  kind: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationInput {
  userId: string;
  title: string;
  body: string;
  kind?: 'info' | 'success' | 'warning' | 'error';
  entityType?: string;
  entityId?: string;
}

export class NotificationRepository extends BaseRepository {
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

  async listNotifications(userId: string): Promise<NotificationRecord[]> {
    try {
      const result = await this.db
        .prepare('SELECT id, user_id, title, body, kind, is_read, entity_type, entity_id, created_at, updated_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC')
        .bind(userId)
        .all();
      return (result.results ?? []).map((row) => this.mapRow(row));
    } catch (error) {
      throw new Error(`Failed to list notifications: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async createNotification(input: CreateNotificationInput): Promise<NotificationRecord> {
    const now = this.now();
    const notificationId = this.createId('notif');

    try {
      await this.db
        .prepare('INSERT INTO notifications (id, user_id, title, body, kind, is_read, entity_type, entity_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(
          notificationId,
          input.userId,
          input.title,
          input.body,
          input.kind ?? 'info',
          0,
          input.entityType ?? null,
          input.entityId ?? null,
          now,
          now,
        )
        .run();

      return {
        id: notificationId,
        userId: input.userId,
        title: input.title,
        body: input.body,
        kind: input.kind ?? 'info',
        isRead: false,
        entityType: input.entityType,
        entityId: input.entityId,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      throw new Error(`Failed to create notification: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async markRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      await this.db
        .prepare('UPDATE notifications SET is_read = 1, updated_at = ? WHERE id = ? AND user_id = ?')
        .bind(this.now(), notificationId, userId)
        .run();
      return true;
    } catch (error) {
      throw new Error(`Failed to mark notification read: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async markAllRead(userId: string): Promise<boolean> {
    try {
      await this.db
        .prepare('UPDATE notifications SET is_read = 1, updated_at = ? WHERE user_id = ?')
        .bind(this.now(), userId)
        .run();
      return true;
    } catch (error) {
      throw new Error(`Failed to mark all notifications read: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  private mapRow(row: Record<string, unknown>): NotificationRecord {
    return {
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      title: String(row.title ?? ''),
      body: String(row.body ?? ''),
      kind: String(row.kind ?? 'info') as NotificationRecord['kind'],
      isRead: Boolean(row.is_read),
      entityType: row.entity_type == null ? undefined : String(row.entity_type),
      entityId: row.entity_id == null ? undefined : String(row.entity_id),
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? ''),
    };
  }
}
