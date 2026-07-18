import type { OptimizedNotificationInput } from './notificationOptimizationService';
import type { NotificationPreferenceRecord } from '../repositories/NotificationPreferenceRepository';

export interface ScheduledNotification extends OptimizedNotificationInput {
  scheduledHour: number;
  canSend: boolean;
}

export class NotificationSchedulerService {
  schedule(notification: OptimizedNotificationInput, preferences: NotificationPreferenceRecord): ScheduledNotification {
    const now = new Date();
    const localHour = this.toLocalHour(now, preferences.timezone);
    const quietHours = localHour >= preferences.quietHoursStart || localHour < preferences.quietHoursEnd;
    const bestHour = this.resolveBestHour(notification.bestHour, preferences);

    return {
      ...notification,
      scheduledHour: bestHour,
      canSend: !quietHours,
    };
  }

  private resolveBestHour(bestHour: number, preferences: NotificationPreferenceRecord): number {
    let hour = Math.max(0, Math.min(23, bestHour));
    if (hour >= preferences.quietHoursStart || hour < preferences.quietHoursEnd) {
      hour = preferences.quietHoursEnd;
    }
    return hour;
  }

  private toLocalHour(date: Date, timezone: string): number {
    try {
      return Number(
        new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', hour12: false })
          .format(date)
          .replace('\u202f', ''),
      );
    } catch {
      return date.getUTCHours();
    }
  }
}
