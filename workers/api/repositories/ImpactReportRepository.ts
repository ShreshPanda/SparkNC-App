import { BaseRepository } from './baseRepository';

export interface ImpactReportRecord {
  id: string;
  scope: string;
  scopeId?: string;
  reportType: string;
  periodStart?: string;
  periodEnd?: string;
  metrics: string;
  createdBy?: string;
  createdAt: string;
}

export class ImpactReportRepository extends BaseRepository {
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

  async create(input: { scope: string; scopeId?: string; reportType: string; periodStart?: string; periodEnd?: string; metrics: Record<string, unknown>; createdBy?: string }): Promise<ImpactReportRecord> {
    const id = this.createId('impact_report');
    const now = this.now();
    const metricsJson = JSON.stringify(input.metrics);
    await this.db
      .prepare('INSERT INTO impact_reports (id, scope, scope_id, report_type, period_start, period_end, metrics, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.scope, input.scopeId ?? null, input.reportType, input.periodStart ?? null, input.periodEnd ?? null, metricsJson, input.createdBy ?? null, now)
      .run();
    return { id, scope: input.scope, scopeId: input.scopeId, reportType: input.reportType, periodStart: input.periodStart, periodEnd: input.periodEnd, metrics: metricsJson, createdBy: input.createdBy, createdAt: now };
  }

  async list(scope?: string, scopeId?: string, limit = 50): Promise<ImpactReportRecord[]> {
    let query = 'SELECT id, scope, scope_id, report_type, period_start, period_end, metrics, created_by, created_at FROM impact_reports';
    const params: unknown[] = [];
    const conditions: string[] = [];
    if (scope) {
      conditions.push('scope = ?');
      params.push(scope);
    }
    if (scopeId) {
      conditions.push('scope_id = ?');
      params.push(scopeId);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);
    const result = await this.db.prepare(query).bind(...params).all();
    return (result.results ?? []).map((row) => this.mapRecord(row));
  }

  async get(id: string): Promise<ImpactReportRecord | null> {
    const result = await this.db.prepare('SELECT * FROM impact_reports WHERE id = ? LIMIT 1').bind(id).all();
    const row = result.results?.[0];
    return row ? this.mapRecord(row) : null;
  }

  private mapRecord(row: Record<string, unknown>): ImpactReportRecord {
    return {
      id: String(row.id ?? ''),
      scope: String(row.scope ?? ''),
      scopeId: row.scope_id == null ? undefined : String(row.scope_id),
      reportType: String(row.report_type ?? ''),
      periodStart: row.period_start == null ? undefined : String(row.period_start),
      periodEnd: row.period_end == null ? undefined : String(row.period_end),
      metrics: String(row.metrics ?? '{}'),
      createdBy: row.created_by == null ? undefined : String(row.created_by),
      createdAt: String(row.created_at ?? ''),
    };
  }
}
