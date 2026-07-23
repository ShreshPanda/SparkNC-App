import { BaseRepository } from './baseRepository';

export interface AdminStudentSupportRecord {
  id: string;
  name?: string;
  email?: string;
  xp: number;
  currentStreak: number;
  lastActive?: string;
  incompleteTasks: number;
}

export interface ProgramAnalyticsRecord {
  totalEvents: number;
  averageEventAttendance: number;
  ambassadorObservations: number;
  featureRequestsSubmitted: number;
  feedbackSubmissions: number;
}

export class AdminCommandCenterRepository extends BaseRepository {
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

  async listStudentsForSupport(): Promise<AdminStudentSupportRecord[]> {
    const result = await this.db
      .prepare(`SELECT id, name, email, xp_total as xp, current_streak as streak_current, last_activity_at as last_active,
        (SELECT COUNT(*) FROM tasks WHERE tasks.user_id = users.id AND completed = 0) as incomplete_tasks
       FROM users ORDER BY last_activity_at ASC`)
      .bind()
      .all();
    return (result.results ?? []).map((row) => ({
      id: String(row.id ?? ''),
      name: row.name == null ? undefined : String(row.name),
      email: row.email == null ? undefined : String(row.email),
      xp: Number(row.xp ?? 0),
      currentStreak: Number(row.streak_current ?? 0),
      lastActive: row.last_active == null ? undefined : String(row.last_active),
      incompleteTasks: Number(row.incomplete_tasks ?? 0),
    }));
  }

  async getProgramAnalytics(): Promise<ProgramAnalyticsRecord> {
    const [events, attendance, observations, features, feedback] = await Promise.all([
      this.db.prepare('SELECT COUNT(*) as count FROM events').bind().all(),
      this.db.prepare('SELECT COUNT(DISTINCT event_id) as events, COUNT(*) as attendees FROM event_attendees').bind().all(),
      this.db.prepare('SELECT COUNT(*) as count FROM ambassador_feedback').bind().all(),
      this.db.prepare('SELECT COUNT(*) as count FROM feature_requests').bind().all(),
      this.db.prepare('SELECT COUNT(*) as count FROM student_feedback').bind().all(),
    ]);
    const eventRow = (events.results?.[0] as { count?: number }) ?? {};
    const attendanceRow = (attendance.results?.[0] as { events?: number; attendees?: number }) ?? {};
    const totalEvents = Number(eventRow.count ?? 0);
    const totalAttendees = Number(attendanceRow.attendees ?? 0);
    const distinctEvents = Number(attendanceRow.events ?? 0);
    const averageAttendance = distinctEvents > 0 ? Math.round(totalAttendees / distinctEvents) : 0;

    return {
      totalEvents,
      averageEventAttendance: averageAttendance,
      ambassadorObservations: Number((observations.results?.[0] as { count?: number })?.count ?? 0),
      featureRequestsSubmitted: Number((features.results?.[0] as { count?: number })?.count ?? 0),
      feedbackSubmissions: Number((feedback.results?.[0] as { count?: number })?.count ?? 0),
    };
  }
}
