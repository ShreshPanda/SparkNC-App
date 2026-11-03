import { describe, it, expect } from 'vitest';
import worker from '../index';

function env(overrides: Record<string, unknown> = {}) {
  return {
    ENVIRONMENT: 'production',
    SESSION_SECRET: 'x'.repeat(32),
    COOKIE_SECURE: 'true',
    ALLOWED_ORIGINS: 'https://app.example.com',
    DB: { prepare: () => ({ bind: () => ({ run: async () => ({}), all: async () => ({ results: [] }) }) }) },
    ...overrides,
  };
}

const ctx = { waitUntil: () => undefined } as never;

async function statusBody(e: Record<string, unknown>) {
  const res = await worker.fetch(new Request('https://api.test/status'), e as never, ctx);
  return (await res.json()) as { data: { status: string } };
}

describe('environment validation after Better Auth removal (S3c-11)', () => {
  it('production env without BETTER_AUTH_* secrets is fully valid', async () => {
    const body = await statusBody(env());
    expect(body.data.status).toBe('ok');
  });

  it.each([
    ['SESSION_SECRET', { SESSION_SECRET: undefined }, 'degraded'],
    ['DB binding', { DB: undefined }, 'error'],
    ['COOKIE_SECURE', { COOKIE_SECURE: 'false' }, 'degraded'],
    ['ALLOWED_ORIGINS', { ALLOWED_ORIGINS: undefined }, 'degraded'],
  ])('still enforces %s in production', async (_label, override, expected) => {
    const body = await statusBody(env(override));
    expect(body.data.status).toBe(expected);
  });

  it('/health reports authConfigured from real auth dependencies', async () => {
    const ready = await worker.fetch(new Request('https://api.test/health'), env() as never, ctx);
    expect(((await ready.json()) as { data: { authConfigured: boolean } }).data.authConfigured).toBe(true);
    const unready = await worker.fetch(new Request('https://api.test/health'), env({ SESSION_SECRET: 'short' }) as never, ctx);
    expect(((await unready.json()) as { data: { authConfigured: boolean } }).data.authConfigured).toBe(false);
  });
});
