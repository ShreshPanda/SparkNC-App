import { z } from 'zod';
import { GoalRepository, type CreateGoalInput, type UpdateGoalInput } from '../repositories/GoalRepository';
import { assertNonEmpty } from '../validators/baseValidator';
import { XPService } from './xpService';
import { StreakService } from './streakService';
import { NotificationService } from './notificationService';

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Goal title is required'),
  description: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  completed: z.boolean().optional(),
  xpReward: z.number().int().nonnegative().optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  completed: z.boolean().optional(),
  xpReward: z.number().int().nonnegative().optional(),
});

export class GoalService {
  constructor(
    private readonly repository: GoalRepository,
    private readonly xpService: XPService,
    private readonly streakService: StreakService,
    private readonly notificationService?: NotificationService,
  ) {}

  async getGoal(goalId: string, userId: string) {
    assertNonEmpty(goalId, 'Goal id is required');
    assertNonEmpty(userId, 'User id is required');
    const goal = await this.repository.getGoal(goalId, userId);
    if (!goal) {
      throw new Error('Goal not found');
    }
    return { ok: true, item: goal };
  }

  async listGoals(userId: string) {
    assertNonEmpty(userId, 'User id is required');
    return this.repository.listGoals(userId);
  }

  async createGoal(input: unknown, userId: string) {
    assertNonEmpty(userId, 'User id is required');
    const parsed = createGoalSchema.parse(input);
    const payload: CreateGoalInput = {
      title: parsed.title,
      description: parsed.description,
      progress: parsed.progress ?? 0,
      completed: parsed.completed ?? false,
      xpReward: parsed.xpReward ?? 0,
    };

    const goal = await this.repository.createGoal(payload, userId);

    let xpAwarded = 0;
    let streak = { current: 0, longest: 0, updated: false };
    if (goal.completed) {
      xpAwarded = await this.xpService.awardGoalCompletion(userId, goal.xpReward);
      streak = await this.streakService.recordActivity(userId);
    }

    return {
      ok: true,
      item: goal,
      message: 'Goal created successfully',
      xpAwarded,
      streak,
    };
  }

  async updateGoal(goalId: string, input: unknown, userId: string) {
    assertNonEmpty(goalId, 'Goal id is required');
    assertNonEmpty(userId, 'User id is required');
    const parsed = updateGoalSchema.parse(input);
    const payload: UpdateGoalInput = {
      title: parsed.title,
      description: parsed.description,
      progress: parsed.progress,
      completed: parsed.completed,
      xpReward: parsed.xpReward,
    };

    const goal = await this.repository.updateGoal(goalId, payload, userId);

    if (!goal) {
      throw new Error('Goal not found');
    }

    return {
      ok: true,
      item: goal,
      message: 'Goal updated successfully',
    };
  }

  async completeGoal(goalId: string, userId: string) {
    assertNonEmpty(goalId, 'Goal id is required');
    assertNonEmpty(userId, 'User id is required');

    const goal = await this.repository.getGoal(goalId, userId);
    if (!goal) {
      throw new Error('Goal not found');
    }
    if (goal.completed) {
      throw new Error('Goal already completed');
    }

    const updated = await this.repository.updateGoal(goalId, { completed: true, progress: 100 }, userId);
    if (!updated) {
      throw new Error('Goal not found');
    }

    const xpAwarded = await this.xpService.awardGoalCompletion(userId, updated.xpReward);
    const streak = await this.streakService.recordActivity(userId);

    if (this.notificationService) {
      await this.notificationService.createNotification({
        userId,
        title: 'Goal completed',
        body: `You completed "${updated.title}" and earned ${xpAwarded} XP.`,
        kind: 'success',
        entityType: 'goal',
        entityId: updated.id,
      });
    }

    return {
      ok: true,
      item: updated,
      message: 'Goal completed successfully',
      xpAwarded,
      streak,
    };
  }

  async deleteGoal(goalId: string, userId: string) {
    assertNonEmpty(goalId, 'Goal id is required');
    assertNonEmpty(userId, 'User id is required');
    const deleted = await this.repository.deleteGoal(goalId, userId);
    return {
      ok: true,
      deleted,
      goalId,
      message: 'Goal deleted successfully',
    };
  }
}
