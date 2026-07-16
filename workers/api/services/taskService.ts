import { z } from 'zod';
import { TaskRepository, type CreateTaskInput, type UpdateTaskInput } from '../repositories/TaskRepository';
import { assertNonEmpty } from '../validators/baseValidator';

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
  constructor(private readonly repository: TaskRepository) {}

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

    return {
      ok: true,
      item: task,
      message: 'Task created successfully',
      xpPrepared: task.completed ? task.xpReward : 0,
      streakPrepared: false,
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
      xpPrepared: task.completed ? task.xpReward : 0,
      streakPrepared: false,
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
