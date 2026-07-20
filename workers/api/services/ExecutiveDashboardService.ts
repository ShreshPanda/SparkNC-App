import { EngagementAnalyticsService, type EngagementSummary } from './EngagementAnalyticsService';
import { AnalyticsRepository, type AggregatedMetrics } from '../repositories/AnalyticsRepository';

export interface KPICard {
  label: string;
  value: string | number;
  trend?: number;
}

export interface ExecutiveDashboard {
  kpis: KPICard[];
  engagement: EngagementSummary;
  retention: { cohortSize: number; retained: number; rate: number };
  schoolComparison: { schoolId: string; active: number; total: number }[];
  locationComparison: { locationId: string; active: number; total: number }[];
  growth: { period: string; xp: number; completed: number }[];
}

export class ExecutiveDashboardService {
  constructor(
    private readonly engagement: EngagementAnalyticsService,
    private readonly analytics: AnalyticsRepository,
  ) {}

  async buildDashboard(organizationId?: string, days = 30): Promise<ExecutiveDashboard> {
    const [engagement, retention] = await Promise.all([
      this.engagement.getEngagementSummary(),
      this.engagement.getRetentionCohort(days),
    ]);
    const kpis: KPICard[] = [
      { label: 'DAU', value: engagement.dau, trend: 0 },
      { label: 'WAU', value: engagement.wau, trend: 0 },
      { label: 'MAU', value: engagement.mau, trend: 0 },
      { label: 'Tasks', value: engagement.taskCompletions.month, trend: 0 },
      { label: 'Goals', value: engagement.goalCompletions.month, trend: 0 },
      { label: 'Posts', value: engagement.communityPosts.month, trend: 0 },
    ];

    const schoolComparison: ExecutiveDashboard['schoolComparison'] = [];
    const locationComparison: ExecutiveDashboard['locationComparison'] = [];
    const growth: ExecutiveDashboard['growth'] = [];

    return { kpis, engagement, retention, schoolComparison, locationComparison, growth };
  }
}
