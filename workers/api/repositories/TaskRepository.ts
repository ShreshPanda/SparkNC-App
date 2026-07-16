import { BaseRepository, type RepositoryResult } from './baseRepository';

export interface TaskRecord {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
  completed: boolean;
  xpReward: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
  completed?: boolean;
  xpReward?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  category?: string;
  dueDate?: string;
  completed?: boolean;
  xpReward?: number;
}

export class TaskRepository extends BaseRepository {
  constructor(private readonly db: { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } }) {
    super();
  }

  async listTasks(userId: string): Promise<TaskRecord[]> {
    try {
      const statement = this.db.prepare('SELECT id, user_id, title, description, category, due_date, completed, xp_reward, created_at, updated_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC');
      const result = await statement.bind(userId).all();
      return (result.results ?? []).map((row) => this.mapRow(row));
    } catch (error) {
      throw new Error(`Failed to list tasks: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async createTask(input: CreateTaskInput, userId: string): Promise<TaskRecord> {
    const now = this.now();
    const taskId = this.createId('task');
    const completed = input.completed ?? false;
    const xpReward = input.xpReward ?? 0;

    try {
      await this.db
        .prepare('INSERT INTO tasks (id, user_id, title, description, category, due_date, completed, xp_reward, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(taskId, userId, input.title, input.description ?? null, input.category ?? null, input.dueDate ?? null, completed ? 1 : 0, xpReward, now, now)
        .run();

      return {
        id: taskId,
        userId,
        title: input.title,
        description: input.description,
        category: input.category,
        dueDate: input.dueDate,
        completed,
        xpReward,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      throw new Error(`Failed to create task: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async updateTask(taskId: string, input: UpdateTaskInput, userId: string): Promise<TaskRecord | null> {
    const now = this.now();
    const completed = input.completed ?? false;
    const xpReward = input.xpReward ?? 0;

    try {
      await this.db
        .prepare('UPDATE tasks SET updated_at = ?, completed = ?, xp_reward = ?, title = ?, description = ?, category = ?, due_date = ? WHERE id = ? AND user_id = ?')
        .bind(now, completed ? 1 : 0, xpReward, input.title ?? null, input.description ?? null, input.category ?? null, input.dueDate ?? null, taskId, userId)
        .run();

      const current = await this.db.prepare('SELECT id, user_id, title, description, category, due_date, completed, xp_reward, created_at, updated_at FROM tasks WHERE id = ? AND user_id = ?').bind(taskId, userId).all();
      const row = current.results?.[0];
      if (!row) {
        return null;
      }

      return this.mapRow(row);
    } catch (error) {
      throw new Error(`Failed to update task: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async deleteTask(taskId: string, userId: string): Promise<boolean> {
    try {
      await this.db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').bind(taskId, userId).run();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete task: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  private mapRow(row: Record<string, unknown>): TaskRecord {
    return {
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      title: String(row.title ?? ''),
      description: row.description == null ? undefined : String(row.description),
      category: row.category == null ? undefined : String(row.category),
      dueDate: row.due_date == null ? undefined : String(row.due_date),
      completed: Boolean(row.completed),
      xpReward: Number(row.xp_reward ?? 0),
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? ''),
    };
  }
}
