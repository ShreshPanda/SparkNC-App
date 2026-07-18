import { AnalyticsRepository, type AggregatedMetrics } from '../repositories/AnalyticsRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export class AnalyticsService {
  constructor(private readonly repository: AnalyticsRepository) {}

  async getOrganizationOverview(): Promise<AggregatedMetrics> {
    return this.repository.getOverview();
  }

  async getSchoolMetrics(schoolId: string): Promise<AggregatedMetrics> {
    assertNonEmpty(schoolId, 'School id is required');
    return this.repository.getSchoolMetrics(schoolId);
  }

  async snapshotOrganization(): Promise<{ scope: string; snapshotType: string; metrics: Record<string, unknown> }> {
    const metrics = await this.repository.getOverview();
    const serialized: Record<string, unknown> = JSON.parse(JSON.stringify(metrics));
    await this.repository.saveSnapshot('organization', 'daily', serialized);
    return { scope: 'organization', snapshotType: 'daily', metrics: serialized };
  }

  async snapshotSchool(schoolId: string): Promise<{ scope: string; scopeId: string; snapshotType: string; metrics: Record<string, unknown> }> {
    assertNonEmpty(schoolId, 'School id is required');
    const metrics = await this.repository.getSchoolMetrics(schoolId);
    const serialized: Record<string, unknown> = JSON.parse(JSON.stringify(metrics));
    await this.repository.saveSnapshot('school', 'daily', serialized, schoolId);
    return { scope: 'school', scopeId: schoolId, snapshotType: 'daily', metrics: serialized };
  }
}
