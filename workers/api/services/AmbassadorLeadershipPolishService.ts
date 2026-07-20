import { AmbassadorRepository, type AssignedStudentRecord } from '../repositories/AmbassadorRepository';
import { StudentInsightRepository, type StudentStatsRecord } from '../repositories/StudentInsightRepository';

export interface QuickAction {
  label: string;
  type: 'message' | 'nudge' | 'recognize' | 'schedule';
  reason: string;
}

export interface PolishedAmbassadorDashboard {
  students: {
    student: AssignedStudentRecord;
    stats: StudentStatsRecord;
    status: string;
    actions: QuickAction[];
  }[];
  activitySummary: { contacted: number; celebrated: number; nudged: number };
  recognitionStats: { sent: number; received: number };
}

export class AmbassadorLeadershipPolishService {
  constructor(
    private readonly ambassadorRepository: AmbassadorRepository,
    private readonly insightRepository: StudentInsightRepository,
  ) {}

  async getPolishedDashboard(ambassadorId: string): Promise<PolishedAmbassadorDashboard> {
    const students = await this.ambassadorRepository.getAssignedStudents(ambassadorId);
    const enriched = await Promise.all(
      students.map(async (student) => {
        const stats = await this.insightRepository.getUserStats(student.id);
        const daysInactive = student.lastActive ? (Date.now() - new Date(student.lastActive).getTime()) / (1000 * 60 * 60 * 24) : Infinity;
        const actions: QuickAction[] = [];
        if (daysInactive > 7) actions.push({ label: 'Send check-in', type: 'message', reason: 'No activity for over a week' });
        else if (stats.currentStreak >= 7) actions.push({ label: 'Celebrate streak', type: 'recognize', reason: 'Reached a 7-day streak' });
        else if (stats.tasksCompleted < 3) actions.push({ label: 'Nudge a small task', type: 'nudge', reason: 'Low task completion' });
        const status = daysInactive > 7 ? 'needs_attention' : stats.currentStreak >= 7 ? 'thriving' : 'active';
        return { student, stats, status, actions };
      }),
    );
    return {
      students: enriched,
      activitySummary: { contacted: 0, celebrated: 0, nudged: 0 },
      recognitionStats: { sent: 0, received: 0 },
    };
  }
}
