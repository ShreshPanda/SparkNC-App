import { z } from 'zod';
import { TaskRepository, type CreateTaskInput, type UpdateTaskInput } from '../repositories/TaskRepository';
import { GrowthTimelineRepository } from '../repositories/GrowthTimelineRepository';
import { assertNonEmpty } from '../validators/baseValidator';
import { XPService } from './xpService';
import { StreakService } from './streakService';
import { NotificationService } from './notificationService';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  dueDate: z.string().optional(),
  completed: z.boolean().optional(),
  xpReward: z.number().int().nonnegative().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  dueDate: z.string().optional(),
  completed: z.boolean().optional(),
  xpReward: z.number().int().nonnegative().optional(),
});

export class TaskService {
  constructor(
    private readonly repository: TaskRepository,
    private readonly xpService: XPService,
    private readonly streakService: StreakService,
    private readonly growthRepository: GrowthTimelineRepository,
    private readonly notificationService?: NotificationService,
  ) {}

  async getTask(taskId: string, userId: string) {
    assertNonEmpty(taskId, 'Task id is required');
    assertNonEmpty(userId, 'User id is required');
    const task = await this.repository.getTask(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }
    return { ok: true, item: task };
  }

  async listTasks(userId: string) {
    assertNonEmpty(userId, 'User id is required');
    return this.repository.listTasks(userId);
  }

  async createTask(input: unknown, userId: string) {
    assertNonEmpty(userId, 'User id is required');
    const parsed = createTaskSchema.parse(input);
    const payload: CreateTaskInput = {
      title: parsed.title,
      description: parsed.description,
      category: parsed.category,
      dueDate: parsed.dueDate,
      completed: parsed.completed ?? false,
      xpReward: parsed.xpReward ?? 0,
    };

    const task = await this.repository.createTask(payload, userId);

    let xpAwarded = 0;
    let streak = { current: 0, longest: 0, updated: false };
    if (task.completed) {
      xpAwarded = await this.xpService.awardTaskCompletion(userId, task.xpReward);
      streak = await this.streakService.recordActivity(userId);
      const now = new Date().toISOString();
      await this.growthRepository.recordEvent(userId, {
        eventType: 'task_completed',
        title: 'Completed task',
        description: task.title,
        occurredAt: task.updatedAt ?? now,
        metadata: JSON.stringify({ taskId: task.id, xp: xpAwarded }),
      });
    }

    return {
      ok: true,
      item: task,
      message: 'Task created successfully',
      xpAwarded,
      streak,
    };
  }

  async updateTask(taskId: string, input: unknown, userId: string) {
    assertNonEmpty(taskId, 'Task id is required');
    assertNonEmpty(userId, 'User id is required');
    const parsed = updateTaskSchema.parse(input);
    const payload: UpdateTaskInput = {
      title: parsed.title,
      description: parsed.description,
      category: parsed.category,
      dueDate: parsed.dueDate,
      completed: parsed.completed,
      xpReward: parsed.xpReward,
    };

    const task = await this.repository.updateTask(taskId, payload, userId);

    if (!task) {
      throw new Error('Task not found');
    }

    return {
      ok: true,
      item: task,
      message: 'Task updated successfully',
    };
  }

  async completeTask(taskId: string, userId: string) {
    assertNonEmpty(taskId, 'Task id is required');
    assertNonEmpty(userId, 'User id is required');

    const task = await this.repository.getTask(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }
    if (task.completed) {
      throw new Error('Task already completed');
    }

    const updated = await this.repository.updateTask(taskId, { completed: true }, userId);
    if (!updated) {
      throw new Error('Task not found');
    }

    const xpAwarded = await this.xpService.awardTaskCompletion(userId, updated.xpReward);
    const streak = await this.streakService.recordActivity(userId);
    const now = new Date().toISOString();
    await this.growthRepository.recordEvent(userId, {
      eventType: 'task_completed',
      title: 'Completed task',
      description: updated.title,
      occurredAt: updated.updatedAt ?? now,
      metadata: JSON.stringify({ taskId: updated.id, xp: xpAwarded }),
    });

    if (this.notificationService) {
      await this.notificationService.createNotification({
        userId,
        title: 'Task completed',
        body: `You completed "${updated.title}" and earned ${xpAwarded} XP.`,
        kind: 'success',
        entityType: 'task',
        entityId: updated.id,
      });
    }

    return {
      ok: true,
      item: updated,
      message: 'Task completed successfully',
      xpAwarded,
      streak,
    };
  }

  async deleteTask(taskId: string, userId: string) {
    assertNonEmpty(taskId, 'Task id is required');
    assertNonEmpty(userId, 'User id is required');
    const deleted = await this.repository.deleteTask(taskId, userId);
    return {
      ok: true,
      deleted,
      taskId,
      message: 'Task deleted successfully',
    };
  }
}
