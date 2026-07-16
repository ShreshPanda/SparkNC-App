import { BaseRepository } from './baseRepository';

export interface GoalRecord {
  id: string;
  userId: string;
  title: string;
  description?: string;
  progress: number;
  completed: boolean;
  xpReward: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  progress?: number;
  completed?: boolean;
  xpReward?: number;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  progress?: number;
  completed?: boolean;
  xpReward?: number;
}

export class GoalRepository extends BaseRepository {
  constructor(private readonly db: { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } }) {
    super();
  }

  async listGoals(userId: string): Promise<GoalRecord[]> {
    try {
      const statement = this.db.prepare('SELECT id, user_id, title, description, progress, completed, xp_reward, created_at, updated_at FROM goals WHERE user_id = ? ORDER BY created_at DESC');
      const result = await statement.bind(userId).all();
      return (result.results ?? []).map((row) => this.mapRow(row));
    } catch (error) {
      throw new Error(`Failed to list goals: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async createGoal(input: CreateGoalInput, userId: string): Promise<GoalRecord> {
    const now = this.now();
    const goalId = this.createId('goal');
    const completed = input.completed ?? false;
    const progress = input.progress ?? 0;
    const xpReward = input.xpReward ?? 0;

    try {
      await this.db
        .prepare('INSERT INTO goals (id, user_id, title, description, progress, completed, xp_reward, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(goalId, userId, input.title, input.description ?? null, progress, completed ? 1 : 0, xpReward, now, now)
        .run();

      return {
        id: goalId,
        userId,
        title: input.title,
        description: input.description,
        progress,
        completed,
        xpReward,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      throw new Error(`Failed to create goal: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async updateGoal(goalId: string, input: UpdateGoalInput, userId: string): Promise<GoalRecord | null> {
    const now = this.now();
    const completed = input.completed ?? false;
    const progress = input.progress ?? 0;
    const xpReward = input.xpReward ?? 0;

    try {
      await this.db
        .prepare('UPDATE goals SET updated_at = ?, progress = ?, completed = ?, xp_reward = ?, title = ?, description = ? WHERE id = ? AND user_id = ?')
        .bind(now, progress, completed ? 1 : 0, xpReward, input.title ?? null, input.description ?? null, goalId, userId)
        .run();

      const current = await this.db.prepare('SELECT id, user_id, title, description, progress, completed, xp_reward, created_at, updated_at FROM goals WHERE id = ? AND user_id = ?').bind(goalId, userId).all();
      const row = current.results?.[0];
      if (!row) {
        return null;
      }

      return this.mapRow(row);
    } catch (error) {
      throw new Error(`Failed to update goal: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  private mapRow(row: Record<string, unknown>): GoalRecord {
    return {
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      title: String(row.title ?? ''),
      description: row.description == null ? undefined : String(row.description),
      progress: Number(row.progress ?? 0),
      completed: Boolean(row.completed),
      xpReward: Number(row.xp_reward ?? 0),
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? ''),
    };
  }
}
