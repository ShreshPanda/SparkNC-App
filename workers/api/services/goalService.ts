import { z } from 'zod';
import { GoalRepository, type CreateGoalInput, type UpdateGoalInput } from '../repositories/GoalRepository';
import { assertNonEmpty } from '../validators/baseValidator';

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
  constructor(private readonly repository: GoalRepository) {}

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

    return {
      ok: true,
      item: goal,
      message: 'Goal created successfully',
      xpPrepared: goal.completed ? goal.xpReward : 0,
      streakPrepared: false,
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
      xpPrepared: goal.completed ? goal.xpReward : 0,
      streakPrepared: false,
    };
  }
}
