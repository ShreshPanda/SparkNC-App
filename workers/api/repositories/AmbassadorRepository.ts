import { BaseRepository } from './baseRepository';

export interface AssignedStudentRecord {
  id: string;
  name?: string;
  email?: string;
  schoolId?: string;
  lastActive?: string;
}

export class AmbassadorRepository extends BaseRepository {
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

  async getAssignedStudents(ambassadorId: string): Promise<AssignedStudentRecord[]> {
    const result = await this.db
      .prepare('SELECT u.id, u.name, u.email, u.school_id, u.last_active FROM users u JOIN ambassador_assignments a ON a.student_id = u.id WHERE a.ambassador_id = ? ORDER BY u.last_active DESC')
      .bind(ambassadorId)
      .all();
    return (result.results ?? []).map((row) => ({
      id: String(row.id ?? ''),
      name: row.name == null ? undefined : String(row.name),
      email: row.email == null ? undefined : String(row.email),
      schoolId: row.school_id == null ? undefined : String(row.school_id),
      lastActive: row.last_active == null ? undefined : String(row.last_active),
    }));
  }

  async assignStudent(ambassadorId: string, studentId: string): Promise<void> {
    const id = this.createId('assignment');
    await this.db
      .prepare('INSERT OR IGNORE INTO ambassador_assignments (id, ambassador_id, student_id, created_at) VALUES (?, ?, ?, ?)')
      .bind(id, ambassadorId, studentId, this.now())
      .run();
  }

  async unassignStudent(ambassadorId: string, studentId: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM ambassador_assignments WHERE ambassador_id = ? AND student_id = ?')
      .bind(ambassadorId, studentId)
      .run();
  }
}
