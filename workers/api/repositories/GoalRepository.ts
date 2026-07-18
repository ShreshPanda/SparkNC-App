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

  async getGoal(goalId: string, userId: string): Promise<GoalRecord | null> {
    try {
      const result = await this.db
        .prepare('SELECT id, user_id, title, description, progress, completed, xp_reward, created_at, updated_at FROM goals WHERE id = ? AND user_id = ?')
        .bind(goalId, userId)
        .all();
      const row = result.results?.[0];
      return row ? this.mapRow(row) : null;
    } catch (error) {
      throw new Error(`Failed to get goal: ${error instanceof Error ? error.message : 'unknown error'}`);
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
    const fields: { column: string; value: unknown }[] = [];

    if (input.title !== undefined) fields.push({ column: 'title', value: input.title });
    if (input.description !== undefined) fields.push({ column: 'description', value: input.description ?? null });
    if (input.progress !== undefined) fields.push({ column: 'progress', value: input.progress });
    if (input.completed !== undefined) fields.push({ column: 'completed', value: input.completed ? 1 : 0 });
    if (input.xpReward !== undefined) fields.push({ column: 'xp_reward', value: input.xpReward });

    if (fields.length === 0) {
      return this.getGoal(goalId, userId);
    }

    const setClause = fields.map((f) => `${f.column} = ?`).join(', ');
    const values = fields.map((f) => f.value);

    try {
      await this.db
        .prepare(`UPDATE goals SET ${setClause}, updated_at = ? WHERE id = ? AND user_id = ?`)
        .bind(...values, now, goalId, userId)
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

  async deleteGoal(goalId: string, userId: string): Promise<boolean> {
    try {
      await this.db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').bind(goalId, userId).run();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete goal: ${error instanceof Error ? error.message : 'unknown error'}`);
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
