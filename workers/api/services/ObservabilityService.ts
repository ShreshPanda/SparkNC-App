import { MetricsRepository } from '../repositories/MetricsRepository';

export interface RequestMetric {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  userId?: string;
}

export class ObservabilityService {
  private readonly slowThresholdMs: number;

  constructor(private readonly metrics: MetricsRepository, slowThresholdMs = 300) {
    this.slowThresholdMs = slowThresholdMs;
  }

  async logRequest(metric: RequestMetric) {
    const createdAt = new Date().toISOString();
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await this.metrics.recordRequest({
      id,
      request_id: metric.requestId,
      method: metric.method,
      path: metric.path,
      status_code: metric.statusCode,
      duration_ms: metric.durationMs,
      user_id: metric.userId ?? null,
      created_at: createdAt,
    });

    if (metric.durationMs > this.slowThresholdMs) {
      await this.metrics.recordSlowQuery({
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        operation: `HTTP ${metric.method}`,
        query: metric.path,
        duration_ms: metric.durationMs,
        request_id: metric.requestId,
        created_at: createdAt,
      });
    }
  }

  async logError(requestId: string, method: string, path: string, message: string) {
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return this.metrics.recordError({
      id,
      request_id: requestId,
      method,
      path,
      message: message.substring(0, 500),
      created_at: new Date().toISOString(),
    });
  }

  async getDashboard(sinceHours = 24) {
    const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString();
    const summary = await this.metrics.getSummary(since);
    const slowQueries = await this.metrics.getTopSlowQueries(since);
    const recentErrors = await this.metrics.getErrorBreakdown(since);

    return {
      sinceHours,
      summary,
      slowQueries,
      recentErrors,
      slowThresholdMs: this.slowThresholdMs,
    };
  }
}
