import type { NotificationProvider, PushNotificationPayload } from './types';

/**
 * Default provider that does nothing. Use this in local dev or until a real
 * provider (Expo, APNs, FCM) is configured.
 */
export class NoopNotificationProvider implements NotificationProvider {
  readonly name = 'noop';

  async sendPush(token: string, payload: PushNotificationPayload) {
    return { success: true, providerMessageId: `noop-${Date.now()}` };
  }
}
