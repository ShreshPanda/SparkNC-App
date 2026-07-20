import { describe, it, expect } from 'vitest';
import { retry, RetryService } from '../api/services/RetryService';

describe('RetryService', () => {
  it('succeeds on first try', async () => {
    const result = await retry(() => Promise.resolve('ok'));
    expect(result).toBe('ok');
  });

  it('retries transient failures', async () => {
    let attempts = 0;
    const result = await retry(
      () => {
        attempts += 1;
        if (attempts < 3) throw new Error('timeout');
        return Promise.resolve('ok');
      },
      { delayMs: 10, maxAttempts: 4 },
    );
    expect(result).toBe('ok');
    expect(attempts).toBe(3);
  });

  it('throws after max attempts', async () => {
    await expect(retry(() => Promise.reject(new Error('fail')), { delayMs: 5, maxAttempts: 2 })).rejects.toThrow('fail');
  });

  it('fetchWithRetry rejects non-network errors', async () => {
    const service = new RetryService();
    await expect(service.fetchWithRetry('http://localhost:99999', undefined, { delayMs: 5, maxAttempts: 2 })).rejects.toThrow();
  });
});
