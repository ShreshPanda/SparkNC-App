import { AdminCommandCenterRepository, type AdminStudentSupportRecord, type ProgramAnalyticsRecord } from '../repositories/AdminCommandCenterRepository';
import { AnalyticsRepository, type AggregatedMetrics } from '../repositories/AnalyticsRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface AdminOverview {
  metrics: AggregatedMetrics;
}

export interface StudentSupportInsights {
  inactive: AdminStudentSupportRecord[];
  needSupport: AdminStudentSupportRecord[];
  highlyEngaged: AdminStudentSupportRecord[];
}

export interface AdminCommandCenterReport {
  overview: AdminOverview;
  support: StudentSupportInsights;
  programAnalytics: ProgramAnalyticsRecord;
}

export class AdminCommandCenterService {
  constructor(
    private readonly adminRepository: AdminCommandCenterRepository,
    private readonly analyticsRepository: AnalyticsRepository,
  ) {}

  async getOrganizationOverview(): Promise<AdminOverview> {
    const metrics = await this.analyticsRepository.getOverview();
    return { metrics };
  }

  async getStudentSupportInsights(): Promise<StudentSupportInsights> {
    const students = await this.adminRepository.listStudentsForSupport();
    const now = Date.now();
    const inactive = students.filter((s) => !s.lastActive || now - new Date(s.lastActive).getTime() > 7 * 24 * 60 * 60 * 1000);
    const needSupport = students.filter((s) => s.currentStreak === 0 || s.incompleteTasks > 5 || (!s.lastActive || now - new Date(s.lastActive).getTime() > 3 * 24 * 60 * 60 * 1000));
    const highlyEngaged = students.filter((s) => s.xp > 500 && s.currentStreak >= 7 && s.incompleteTasks <= 2);
    return { inactive, needSupport, highlyEngaged };
  }

  async getProgramAnalytics(): Promise<ProgramAnalyticsRecord> {
    return this.adminRepository.getProgramAnalytics();
  }

  async getFullReport(): Promise<AdminCommandCenterReport> {
    const [overview, support, programAnalytics] = await Promise.all([
      this.getOrganizationOverview(),
      this.getStudentSupportInsights(),
      this.getProgramAnalytics(),
    ]);
    return { overview, support, programAnalytics };
  }
}
