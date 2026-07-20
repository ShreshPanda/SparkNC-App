import { BaseRepository } from './baseRepository';

export interface MetricRecord {
  id: string;
  request_id: string | null;
  method: string | null;
  path: string | null;
  status_code: number | null;
  duration_ms: number | null;
  user_id: string | null;
  created_at: string;
}

export interface ErrorRecord {
  id: string;
  request_id: string | null;
  path: string | null;
  method: string | null;
  message: string;
  created_at: string;
}

export class MetricsRepository extends BaseRepository {
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

  async recordRequest(metric: MetricRecord) {
    return this.db
      .prepare(
        'INSERT INTO request_metrics (id, request_id, method, path, status_code, duration_ms, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(
        metric.id,
        metric.request_id,
        metric.method,
        metric.path,
        metric.status_code,
        metric.duration_ms,
        metric.user_id,
        metric.created_at,
      )
      .run();
  }

  async recordError(error: ErrorRecord) {
    return this.db
      .prepare('INSERT INTO error_logs (id, request_id, path, method, message, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(error.id, error.request_id, error.path, error.method, error.message, error.created_at)
      .run();
  }

  async getSummary(since: string) {
    const requests = await this.db
      .prepare('SELECT COUNT(*) as total, AVG(duration_ms) as avg_duration, MAX(duration_ms) as max_duration FROM request_metrics WHERE created_at > ?')
      .bind(since)
      .all();
    const errors = await this.db
      .prepare('SELECT COUNT(*) as total FROM error_logs WHERE created_at > ?')
      .bind(since)
      .all();
    const slowQueries = await this.db
      .prepare('SELECT COUNT(*) as total FROM slow_queries WHERE created_at > ?')
      .bind(since)
      .all();

    const requestRow = requests.results[0] ?? {};
    const errorRow = errors.results[0] ?? {};
    const slowRow = slowQueries.results[0] ?? {};

    return {
      requests: Number(requestRow.total ?? 0),
      averageDurationMs: Math.round(Number(requestRow.avg_duration ?? 0)),
      maxDurationMs: Number(requestRow.max_duration ?? 0),
      errors: Number(errorRow.total ?? 0),
      slowQueries: Number(slowRow.total ?? 0),
    };
  }

  async getTopSlowQueries(since: string, limit = 20) {
    const { results } = await this.db
      .prepare('SELECT operation, query, duration_ms, request_id, created_at FROM slow_queries WHERE created_at > ? ORDER BY duration_ms DESC LIMIT ?')
      .bind(since, limit)
      .all();
    return results ?? [];
  }

  async getErrorBreakdown(since: string, limit = 20) {
    const { results } = await this.db
      .prepare('SELECT path, method, message, request_id, created_at FROM error_logs WHERE created_at > ? ORDER BY created_at DESC LIMIT ?')
      .bind(since, limit)
      .all();
    return results ?? [];
  }
}
