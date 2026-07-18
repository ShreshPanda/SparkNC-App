import { NotificationPreferenceRepository } from '../repositories/NotificationPreferenceRepository';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { StudentInsightRepository } from '../repositories/StudentInsightRepository';
import { NotificationOptimizationService, type OptimizedNotificationInput } from './notificationOptimizationService';
import { NotificationService } from './notificationService';
import { assertNonEmpty } from '../validators/baseValidator';

export interface NotificationGenerationResult {
  generated: number;
  notifications: OptimizedNotificationInput[];
}

export class NotificationEngineService {
  private readonly optimizationService: NotificationOptimizationService;
  private readonly notificationService: NotificationService;

  constructor(
    private readonly db: {
      prepare: (query: string) => {
        bind: (...values: unknown[]) => {
          run: () => Promise<unknown>;
          all: () => Promise<{ results: Record<string, unknown>[] }>;
        };
      };
    },
  ) {
    const insightRepository = new StudentInsightRepository(db);
    const notificationRepository = new NotificationRepository(db);
    this.notificationService = new NotificationService(notificationRepository);
    this.optimizationService = new NotificationOptimizationService(insightRepository, this.notificationService);
  }

  async generateForUser(userId: string): Promise<NotificationGenerationResult> {
    assertNonEmpty(userId, 'User id is required');
    const preferenceRepository = new NotificationPreferenceRepository(this.db);
    const prefs = await preferenceRepository.getPreferences(userId);
    const created: OptimizedNotificationInput[] = [];

    if (prefs?.sendStreakAlerts) {
      const streak = await this.optimizationService.buildStreakProtectionNotification(userId);
      if (streak) created.push(streak);
    }

    if (prefs?.sendDeadlines) {
      const deadline = await this.optimizationService.buildTaskDeadlineReminder(userId);
      if (deadline) created.push(deadline);
    }

    for (const n of created) {
      await this.notificationService.createNotification({
        userId: n.userId,
        title: n.title,
        body: n.body,
        kind: n.kind,
      });
    }

    return { generated: created.length, notifications: created };
  }
}
