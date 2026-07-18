import { PushTokenRepository } from '../repositories/PushTokenRepository';
import type { NotificationProvider, PushNotificationPayload, PushTokenRecord } from './notificationProviders/types';
import { NoopNotificationProvider } from './notificationProviders/noopProvider';

export class PushNotificationService {
  private providers: NotificationProvider[] = [new NoopNotificationProvider()];

  constructor(private readonly tokenRepository: PushTokenRepository) {}

  registerProvider(provider: NotificationProvider) {
    // Insert real providers before the noop fallback so they are tried first.
    this.providers.unshift(provider);
  }

  async registerToken(userId: string, deviceType: string, rawToken: string): Promise<PushTokenRecord> {
    const normalizedType = this.normalizeDeviceType(deviceType);
    const record = await this.tokenRepository.saveToken({
      userId,
      deviceType: normalizedType,
      token: rawToken,
    });
    return record;
  }

  async sendToUser(userId: string, payload: PushNotificationPayload): Promise<{ delivered: number; failed: number; errors: string[] }> {
    const tokens = await this.tokenRepository.getTokensForUser(userId);
    const errors: string[] = [];
    let delivered = 0;
    let failed = 0;

    for (const token of tokens) {
      let result: { success: boolean; error?: string } | null = null;
      for (const provider of this.providers) {
        try {
          result = await provider.sendPush(token.token, payload);
          if (result.success) {
            await this.tokenRepository.updateLastUsed(token.id);
            break;
          }
        } catch (err) {
          result = { success: false, error: err instanceof Error ? err.message : String(err) };
        }
      }
      if (result?.success) {
        delivered += 1;
      } else {
        failed += 1;
        if (result?.error) errors.push(result.error);
      }
    }

    return { delivered, failed, errors };
  }

  private normalizeDeviceType(value: string): PushTokenRecord['deviceType'] {
    const lower = value.toLowerCase();
    if (lower === 'ios') return 'ios';
    if (lower === 'android') return 'android';
    if (lower === 'web') return 'web';
    return 'unknown';
  }
}
