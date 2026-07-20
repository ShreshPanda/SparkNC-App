import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../api/services/authService';

function createFakeDB(rows: Record<string, unknown>[] = []) {
  return {
    prepare: () => ({
      bind: () => ({
        run: async () => ({ success: true }),
        all: async () => ({ results: rows }),
      }),
    }),
  };
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(createFakeDB() as any);
  });

  it('rejects empty email', async () => {
    await expect(service.register('', 'password', 'Test')).rejects.toThrow('email');
  });

  it('rejects weak password', async () => {
    await expect(service.register('test@example.com', '123', 'Test')).rejects.toThrow('password');
  });
});
