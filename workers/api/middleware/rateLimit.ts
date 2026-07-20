export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: Request) => string;
  onLimitExceeded?: () => Response;
}

export class InMemoryRateLimiter {
  private windows = new Map<string, { count: number; resetAt: number }>();

  isAllowed(key: string, options: RateLimitOptions): boolean {
    const now = Date.now();
    const windowStart = now - options.windowMs;
    const record = this.windows.get(key);
    if (!record || record.resetAt < windowStart) {
      this.windows.set(key, { count: 1, resetAt: now });
      return true;
    }
    if (record.count < options.maxRequests) {
      record.count += 1;
      return true;
    }
    return false;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.windows.entries()) {
      if (record.resetAt + 3600000 < now) {
        this.windows.delete(key);
      }
    }
  }
}

const defaultKeyGenerator = (request: Request) => {
  const url = new URL(request.url);
  return `${request.headers.get('cf-connecting-ip') ?? 'unknown'}:${url.pathname}`;
};

export class RateLimitMiddleware {
  private limiter = new InMemoryRateLimiter();

  constructor(private options: Partial<RateLimitOptions> = {}) {}

  handle(request: Request): Response | undefined {
    const opts: RateLimitOptions = {
      windowMs: 60000,
      maxRequests: 60,
      keyGenerator: defaultKeyGenerator,
      ...this.options,
    };

    const key = opts.keyGenerator!(request);
    if (this.limiter.isAllowed(key, opts)) {
      this.limiter.cleanup();
      return undefined;
    }

    return opts.onLimitExceeded
      ? opts.onLimitExceeded()
      : Response.json({ success: false, error: { message: 'Rate limit exceeded', code: 'RATE_LIMIT' } }, { status: 429 });
  }
}
