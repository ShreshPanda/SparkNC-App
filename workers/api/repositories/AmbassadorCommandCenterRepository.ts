import { BaseRepository } from './baseRepository';

export interface AmbassadorStudentRecord {
  id: string;
  name?: string;
  email?: string;
  xp: number;
  currentStreak: number;
  goalsCompleted: number;
  tasksCompleted: number;
  lastActive?: string;
}

export class AmbassadorCommandCenterRepository extends BaseRepository {
  constructor(private readonly db: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        run: () => Promise<unknown>;
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  }) {
    super();
  }

  async listStudents(schoolId: string, ambassadorId: string): Promise<AmbassadorStudentRecord[]> {
    const result = await this.db
      .prepare(`SELECT u.id, u.name, u.email, u.xp_total as xp, u.current_streak as streak_current, u.last_activity_at as last_active,
        (SELECT COUNT(*) FROM goals WHERE goals.user_id = u.id AND completed = 1) as goals_completed,
        (SELECT COUNT(*) FROM tasks WHERE tasks.user_id = u.id AND completed = 1) as tasks_completed
       FROM users u
       LEFT JOIN ambassador_assignments a ON a.student_id = u.id AND a.ambassador_id = ?
       WHERE u.school_id = ? OR a.ambassador_id = ?
       ORDER BY u.last_activity_at DESC`)
      .bind(ambassadorId, schoolId, ambassadorId)
      .all();
    return (result.results ?? []).map((row) => ({
      id: String(row.id ?? ''),
      name: row.name == null ? undefined : String(row.name),
      email: row.email == null ? undefined : String(row.email),
      xp: Number(row.xp ?? 0),
      currentStreak: Number(row.streak_current ?? 0),
      goalsCompleted: Number(row.goals_completed ?? 0),
      tasksCompleted: Number(row.tasks_completed ?? 0),
      lastActive: row.last_active == null ? undefined : String(row.last_active),
    }));
  }
}
