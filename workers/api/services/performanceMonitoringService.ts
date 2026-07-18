export interface TimingMetric {
  operation: string;
  durationMs: number;
  timestamp: string;
  status: 'ok' | 'slow' | 'error';
  requestId?: string;
}

export class PerformanceMonitoringService {
  private slowThresholdMs = 300;
  private metrics: TimingMetric[] = [];

  setSlowThreshold(ms: number) {
    this.slowThresholdMs = ms;
  }

  async measure<T>(operation: string, promise: Promise<T>, requestId?: string): Promise<T> {
    const start = Date.now();
    try {
      const result = await promise;
      const duration = Date.now() - start;
      this.record({ operation, durationMs: duration, timestamp: new Date().toISOString(), status: duration > this.slowThresholdMs ? 'slow' : 'ok', requestId });
      return result;
    } catch (err) {
      const duration = Date.now() - start;
      this.record({ operation, durationMs: duration, timestamp: new Date().toISOString(), status: 'error', requestId });
      throw err;
    }
  }

  record(metric: TimingMetric) {
    this.metrics.push(metric);
    // In production this would ship to Cloudflare Analytics or a logging endpoint.
    if (metric.status === 'slow' || metric.status === 'error') {
      console.warn(`[perf] ${metric.operation} ${metric.status} in ${metric.durationMs}ms`);
    }
  }

  getRecentMetrics(limit = 100): TimingMetric[] {
    return this.metrics.slice(-limit);
  }

  wrapDbCall<T>(operation: string, run: () => Promise<T>, requestId?: string): Promise<T> {
    return this.measure(operation, run(), requestId);
  }
}
