import { StudentInsightRepository } from '../repositories/StudentInsightRepository';
import { NotificationService } from './notificationService';
import { assertNonEmpty } from '../validators/baseValidator';

export interface OptimizedNotificationInput {
  userId: string;
  title: string;
  body: string;
  kind: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  bestHour: number;
}

export class NotificationOptimizationService {
  constructor(
    private readonly insightRepository: StudentInsightRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async buildStreakProtectionNotification(userId: string): Promise<OptimizedNotificationInput | null> {
    assertNonEmpty(userId, 'User id is required');
    const stats = await this.insightRepository.getUserStats(userId);
    const incomplete = await this.getIncompleteTaskCount(userId);
    if (stats.currentStreak === 0 || stats.currentStreak >= 1) {
      // Remind if there are incomplete tasks and a streak could be lost.
      if (incomplete === 0) return null;
      const bestHour = await this.getBestHour(userId);
      return {
        userId,
        title: 'Streak at risk',
        body: `You usually complete tasks around ${bestHour} PM. You have ${incomplete} unfinished task${incomplete === 1 ? '' : 's'} today.`,
        kind: 'warning',
        priority: 'high',
        bestHour,
      };
    }
    return null;
  }

  async buildTaskDeadlineReminder(userId: string, hoursUntilDeadline = 24): Promise<OptimizedNotificationInput | null> {
    assertNonEmpty(userId, 'User id is required');
    const dueSoon = await this.getDueSoonTasks(userId, hoursUntilDeadline);
    if (dueSoon === 0) return null;
    const bestHour = await this.getBestHour(userId);
    return {
      userId,
      title: 'Upcoming task deadline',
      body: `You have ${dueSoon} task${dueSoon === 1 ? '' : 's'} due soon. Based on your patterns, now is a good time to start.`,
      kind: 'info',
      priority: 'normal',
      bestHour,
    };
  }

  async createOptimizedNotification(userId: string, type: 'streak' | 'deadline'): Promise<{ created: boolean; notification?: OptimizedNotificationInput }> {
    assertNonEmpty(userId, 'User id is required');
    const builder = type === 'streak'
      ? await this.buildStreakProtectionNotification(userId)
      : await this.buildTaskDeadlineReminder(userId);
    if (!builder) return { created: false };
    await this.notificationService.createNotification({
      userId: builder.userId,
      title: builder.title,
      body: builder.body,
      kind: builder.kind,
    });
    return { created: true, notification: builder };
  }

  private async getBestHour(userId: string): Promise<number> {
    const times = await this.insightRepository.getCompletedTaskTimes(userId);
    if (times.length === 0) return 18;
    const hourly = new Array(24).fill(0);
    for (const t of times) hourly[t.hour]++;
    return hourly.indexOf(Math.max(...hourly));
  }

  private async getIncompleteTaskCount(userId: string): Promise<number> {
    const result = await this.insightRepository['db']
      ?.prepare('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND completed = 0')
      .bind(userId)
      .all();
    return Number((result?.results?.[0] as { count?: number })?.count ?? 0);
  }

  private async getDueSoonTasks(userId: string, hours: number): Promise<number> {
    const until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    const result = await this.insightRepository['db']
      ?.prepare('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND completed = 0 AND due_date IS NOT NULL AND due_date <= ?')
      .bind(userId, until)
      .all();
    return Number((result?.results?.[0] as { count?: number })?.count ?? 0);
  }
}
