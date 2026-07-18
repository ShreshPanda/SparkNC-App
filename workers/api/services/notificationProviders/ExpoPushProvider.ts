import type { NotificationProvider, PushNotificationPayload } from './types';

export class ExpoPushProvider implements NotificationProvider {
  readonly name = 'expo';

  private expoAccessToken: string | undefined;

  constructor(env?: Record<string, string | undefined>) {
    this.expoAccessToken = env?.EXPO_ACCESS_TOKEN;
  }

  async sendPush(token: string, payload: PushNotificationPayload): Promise<{ success: boolean; providerMessageId?: string; error?: string }> {
    if (!this.expoAccessToken) {
      return { success: false, error: 'EXPO_ACCESS_TOKEN not configured' };
    }

    const expoToken = this.normalizeExpoPushToken(token);
    if (!expoToken) {
      return { success: false, error: 'Invalid Expo push token' };
    }

    const body = JSON.stringify([{
      to: expoToken,
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
      priority: payload.priority === 'high' ? 'high' : 'default',
    }]);

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.expoAccessToken}`,
        },
        body,
      });

      const json = await response.json<{ data?: { id?: string; status?: string; message?: string }[]; errors?: { message: string }[] }>();

      if (!response.ok || json.errors?.length) {
        return { success: false, error: json.errors?.[0]?.message ?? `Expo push failed: ${response.status}` };
      }

      const first = json.data?.[0];
      if (first?.status === 'error') {
        return { success: false, error: first.message ?? 'Expo rejected the push' };
      }

      return { success: true, providerMessageId: first?.id };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  async validateToken(token: string): Promise<{ valid: boolean; normalizedToken?: string; error?: string }> {
    const normalized = this.normalizeExpoPushToken(token);
    return normalized ? { valid: true, normalizedToken: normalized } : { valid: false, error: 'Not an Expo push token' };
  }

  private normalizeExpoPushToken(token: string): string | null {
    const trimmed = token.trim();
    if (trimmed.startsWith('ExponentPushToken[') && trimmed.endsWith(']')) return trimmed;
    if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) return `ExponentPushToken[${trimmed}]`;
    return null;
  }
}
