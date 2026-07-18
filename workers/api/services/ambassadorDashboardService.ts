import { AmbassadorRepository, type AssignedStudentRecord } from '../repositories/AmbassadorRepository';
import { StudentInsightRepository, type StudentStatsRecord } from '../repositories/StudentInsightRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface StudentSupportIndicator {
  student: AssignedStudentRecord;
  stats: StudentStatsRecord;
  status: 'thriving' | 'active' | 'at_risk' | 'needs_attention';
  reason: string;
  suggestedAction: string;
}

export class AmbassadorDashboardService {
  constructor(
    private readonly ambassadorRepository: AmbassadorRepository,
    private readonly insightRepository: StudentInsightRepository,
  ) {}

  async getDashboard(ambassadorId: string): Promise<StudentSupportIndicator[]> {
    assertNonEmpty(ambassadorId, 'Ambassador id is required');
    const students = await this.ambassadorRepository.getAssignedStudents(ambassadorId);
    const enriched: StudentSupportIndicator[] = [];
    for (const student of students) {
      const stats = await this.insightRepository.getUserStats(student.id);
      const { status, reason, suggestedAction } = this.assess(student, stats);
      enriched.push({ student, stats, status, reason, suggestedAction });
    }
    return enriched;
  }

  private assess(student: AssignedStudentRecord, stats: StudentStatsRecord) {
    const daysSinceActive = student.lastActive
      ? (Date.now() - new Date(student.lastActive).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;

    if (daysSinceActive > 7 || stats.currentStreak === 0 && stats.tasksCompleted > 0) {
      return {
        status: 'needs_attention' as const,
        reason: daysSinceActive > 7 ? 'No activity for 7 days' : 'Streak has ended despite past activity',
        suggestedAction: `Reach out to ${student.name ?? student.id} with an encouraging message.`,
      };
    }
    if (stats.tasksCompleted < 3 || stats.engagementScore < 50) {
      return {
        status: 'at_risk' as const,
        reason: 'Low engagement or few completed tasks',
        suggestedAction: 'Suggest a small, achievable first step.',
      };
    }
    if (stats.currentStreak >= 7 || stats.goalsCompleted > 0) {
      return {
        status: 'thriving' as const,
        reason: 'Consistent activity and goal completion',
        suggestedAction: 'Acknowledge their progress.',
      };
    }
    return {
      status: 'active' as const,
      reason: 'Active but not yet reaching milestones',
      suggestedAction: 'Check in on their current goals.',
    };
  }
}
