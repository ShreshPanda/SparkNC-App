import { parseCookieHeader, getSessionCookieName } from '../services/authService';
import { AuthContext } from './types';
import { AuthService } from '../services/authService';
import { SessionsRepository } from '../repositories/SessionsRepository';

export async function createAuthContext(
  headers: Headers,
  db: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        run: () => Promise<unknown>;
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  },
): Promise<AuthContext> {
  const cookieHeader = headers.get('Cookie');
  const cookies = parseCookieHeader(cookieHeader);
  const sessionId = cookies[getSessionCookieName()];

  // Reuse AuthService session validation so auth rules remain centralized.
  const service = new AuthService(db);
  const user = await service.validateSession(sessionId);

  if (!user) return { isAuthenticated: false };

  return {
    isAuthenticated: true,
    userId: user.userId,
    email: user.email,
    name: user.name,
    role: user.role,
    schoolId: user.schoolId,
  };
}


export function requireAuth(): { ok: false; status: 401; message: string } {
  return {
    ok: false,
    status: 401,
    message: 'Unauthorized',
  };
}




