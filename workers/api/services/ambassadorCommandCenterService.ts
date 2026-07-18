import { AmbassadorCommandCenterRepository, type AmbassadorStudentRecord } from '../repositories/AmbassadorCommandCenterRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface StudentOverview {
  engaged: AmbassadorStudentRecord[];
  atRisk: AmbassadorStudentRecord[];
  thriving: AmbassadorStudentRecord[];
  participationTrend: { label: string; count: number }[];
}

export class AmbassadorCommandCenterService {
  constructor(private readonly repository: AmbassadorCommandCenterRepository) {}

  async getStudentOverview(schoolId: string, ambassadorId: string): Promise<StudentOverview> {
    assertNonEmpty(schoolId, 'School id is required');
    assertNonEmpty(ambassadorId, 'Ambassador id is required');
    const students = await this.repository.listStudents(schoolId, ambassadorId);
    const now = Date.now();

    const engaged = students.filter((s) => s.currentStreak >= 3 && s.tasksCompleted > 0);
    const atRisk = students.filter((s) => s.currentStreak === 0 || !s.lastActive || now - new Date(s.lastActive).getTime() > 7 * 24 * 60 * 60 * 1000);
    const thriving = students.filter((s) => s.xp > 500 && s.currentStreak >= 7 && s.goalsCompleted >= 3);

    const participationTrend: { label: string; count: number }[] = [
      { label: 'This week', count: students.filter((s) => s.lastActive && now - new Date(s.lastActive).getTime() <= 7 * 24 * 60 * 60 * 1000).length },
      { label: 'Last week', count: students.filter((s) => s.lastActive && now - new Date(s.lastActive).getTime() > 7 * 24 * 60 * 60 * 1000 && now - new Date(s.lastActive).getTime() <= 14 * 24 * 60 * 60 * 1000).length },
      { label: 'Earlier', count: students.filter((s) => !s.lastActive || now - new Date(s.lastActive).getTime() > 14 * 24 * 60 * 60 * 1000).length },
    ];

    return { engaged, atRisk, thriving, participationTrend };
  }
}
