import { NotificationRepository, type CreateNotificationInput, type NotificationRecord } from '../repositories/NotificationRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export class NotificationService {
  constructor(private readonly repository: NotificationRepository) {}

  async listNotifications(userId: string): Promise<NotificationRecord[]> {
    assertNonEmpty(userId, 'User id is required');
    return this.repository.listNotifications(userId);
  }

  async createNotification(input: CreateNotificationInput): Promise<NotificationRecord> {
    assertNonEmpty(input.userId, 'User id is required');
    assertNonEmpty(input.title, 'Notification title is required');
    assertNonEmpty(input.body, 'Notification body is required');
    return this.repository.createNotification(input);
  }

  async markRead(notificationId: string, userId: string): Promise<boolean> {
    assertNonEmpty(notificationId, 'Notification id is required');
    assertNonEmpty(userId, 'User id is required');
    return this.repository.markRead(notificationId, userId);
  }

  async markAllRead(userId: string): Promise<boolean> {
    assertNonEmpty(userId, 'User id is required');
    return this.repository.markAllRead(userId);
  }
}
