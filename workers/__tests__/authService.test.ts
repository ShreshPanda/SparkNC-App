import { describe, it, expect } from 'vitest';
import { AuthService } from '../api/services/authService';

function createFakeDb(results: Record<string, Record<string, unknown>[]> = {}) {
  return {
    prepare: (query: string) => ({
      bind: (...values: unknown[]) => ({
        all: async () => {
          const key = `${query}|${JSON.stringify(values)}`;
          return { results: results[key] ?? [] };
        },
        run: async () => ({ results: [] }),
      }),
    }),
  };
}

describe('AuthService', () => {
  it('returns null for an invalid session', async () => {
    const db = createFakeDb({
      ['SELECT id, user_id, created_at, expires_at, revoked_at FROM sessions WHERE id = ?|["missing"]']: [],
    });
    const service = new AuthService(db as any);
    const result = await service.validateSession('missing');
    expect(result).toBeNull();
  });

  it('returns null for an expired session', async () => {
    const past = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
    const db = createFakeDb({
      ['SELECT id, user_id, created_at, expires_at, revoked_at FROM sessions WHERE id = ?|["expired"]']: [
        { id: 'expired', user_id: 'user-1', created_at: new Date().toISOString(), expires_at: past, revoked_at: null },
      ],
    });
    const service = new AuthService(db as any);
    const result = await service.validateSession('expired');
    expect(result).toBeNull();
  });

  it('returns the authenticated user for a valid session', async () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
    const sessionsKey = 'SELECT id, user_id, created_at, expires_at, revoked_at FROM sessions WHERE id = ?|["valid-session"]';
    const usersKey = 'SELECT id, email, name, role, school_id, avatar_url, is_active, last_seen_at, created_at, updated_at FROM users WHERE id = ? LIMIT 1|["user-1"]';
    const db = createFakeDb({
      [sessionsKey]: [{ id: 'valid-session', user_id: 'user-1', created_at: new Date().toISOString(), expires_at: future, revoked_at: null }],
      [usersKey]: [{ id: 'user-1', email: 'test@sparknc.app', name: 'Test User', role: 'student', school_id: 'school-1', avatar_url: null, is_active: 1, last_seen_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }],
    });
    const service = new AuthService(db as any);
    const result = await service.validateSession('valid-session');
    expect(result).not.toBeNull();
    expect(result?.userId).toBe('user-1');
    expect(result?.email).toBe('test@sparknc.app');
    expect(result?.role).toBe('student');
    expect(result?.schoolId).toBe('school-1');
  });

  it('rejects registration for an email that already exists', async () => {
    const existingKey = 'SELECT 1 FROM users WHERE email = ? LIMIT 1|["taken@sparknc.app"]';
    const db = createFakeDb({
      [existingKey]: [{ 1: 1 }],
    });
    const service = new AuthService(db as any);
    await expect(service.register({
      email: 'taken@sparknc.app',
      password: 'validpassword123',
      name: 'Taken',
    })).rejects.toThrow('An account with that email already exists');
  });
});
