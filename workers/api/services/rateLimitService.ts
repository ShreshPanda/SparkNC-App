import { sha256Hex } from './enrollmentService';

type Db = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      run: () => Promise<unknown>;
      all: () => Promise<{ results: Record<string, unknown>[] }>;
    };
  };
};

export interface LimitSpec {
  scope: string; // e.g. 'enroll:verify:inv'
  subject: string; // un-hashed identifier — hashed into the stored key
  max: number;
  windowMs: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterMs: number;
}

// Durable fixed-window limiter backed by the rate_limits table — shared
// across all Worker isolates, unlike the per-isolate InMemoryRateLimiter
// middleware. Every applicable key is incremented BEFORE the reject
// decision is made; a rejected request still keeps its increments.
export class D1RateLimiter {
  constructor(private readonly db: Db) {}

  private async key(scope: string, subject: string): Promise<string> {
    // Subjects are hashed so keys are bounded-length and never contain raw
    // tokens, public ids, or addresses.
    return `rl:${scope}:${(await sha256Hex(subject)).slice(0, 32)}`;
  }

  async check(specs: LimitSpec[], now = Date.now()): Promise<RateLimitDecision> {
    let allowed = true;
    let retryAfterMs = 0;
    let oldestWindowStart = Number.POSITIVE_INFINITY;

    for (const spec of specs) {
      const windowStart = Math.floor(now / spec.windowMs);
      oldestWindowStart = Math.min(oldestWindowStart, windowStart);
      const key = await this.key(spec.scope, spec.subject);
      const result = await this.db
        .prepare(
          'INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1) ON CONFLICT(key, window_start) DO UPDATE SET count = count + 1 RETURNING count',
        )
        .bind(key, windowStart)
        .all();
      const count = Number(result.results?.[0]?.count ?? 1);
      if (count > spec.max) {
        allowed = false;
        retryAfterMs = Math.max(retryAfterMs, (windowStart + 1) * spec.windowMs - now);
      }
    }

    // Lazy cleanup: only strictly-past windows — never the active window.
    if (Math.random() < 0.01 && Number.isFinite(oldestWindowStart)) {
      await this.db.prepare('DELETE FROM rate_limits WHERE window_start < ?').bind(oldestWindowStart).run();
    }

    return { allowed, retryAfterMs };
  }
}

// Trusted client IP: Cloudflare-populated header only. X-Forwarded-For and
// other client-controlled headers are never consulted.
export function clientIp(headers: Headers | undefined): string {
  return headers?.get('cf-connecting-ip') ?? 'unknown';
}

export function rateLimitedResponse(retryAfterMs: number): Response {
  return Response.json(
    { ok: false, error: { code: 'RATE_LIMIT', message: 'Too many attempts. Try again later.' } },
    { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil(retryAfterMs / 1000))) } },
  );
}
