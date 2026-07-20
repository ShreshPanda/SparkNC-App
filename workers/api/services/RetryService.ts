export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  retryableError?: (error: Error) => boolean;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  delayMs: 200,
  backoffMultiplier: 2,
  maxDelayMs: 5000,
  retryableError: () => true,
};

export async function retry<T>(fn: (attempt: number) => Promise<T>, options: Partial<RetryOptions> = {}): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === opts.maxAttempts) break;
      if (opts.retryableError && !opts.retryableError(lastError)) break;

      const delay = Math.min(
        opts.delayMs * Math.pow(opts.backoffMultiplier ?? 2, attempt - 1),
        opts.maxDelayMs ?? 5000,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError ?? new Error('Retry failed');
}

export class RetryService {
  async run<T>(operation: string, fn: () => Promise<T>, options?: Partial<RetryOptions>): Promise<T> {
    return retry(fn, options);
  }

  async fetchWithRetry(input: RequestInfo, init?: RequestInit, options?: Partial<RetryOptions>): Promise<Response> {
    return retry(() => fetch(input, init), {
      ...options,
      retryableError: (error) => {
        const message = error.message.toLowerCase();
        return message.includes('network') || message.includes('timeout') || message.includes('econnrefused');
      },
    });
  }
}
