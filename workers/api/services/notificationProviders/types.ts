export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  priority?: 'normal' | 'high';
}

export interface PushTokenRecord {
  id: string;
  userId: string;
  deviceType: 'ios' | 'android' | 'web' | 'unknown';
  token: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface NotificationProvider {
  readonly name: string;

  /**
   * Send a push notification to a single device token.
   */
  sendPush(token: string, payload: PushNotificationPayload): Promise<{ success: boolean; providerMessageId?: string; error?: string }>;

  /**
   * Validate a raw device token or registration without sending.
   */
  validateToken?(token: string, deviceType: string): Promise<{ valid: boolean; normalizedToken?: string; error?: string }>;
}
