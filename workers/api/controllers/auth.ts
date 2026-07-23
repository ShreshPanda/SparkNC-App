import { AuthService, buildClearedSessionCookie, buildSessionCookie, getSessionCookieName, parseCookieHeader } from '../services/authService';
import { XPService } from '../services/xpService';
import { StreakService } from '../services/streakService';
import { assertNonEmpty } from '../validators/baseValidator';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function registerController(input: RegisterInput, context?: { env?: unknown; userId?: string }) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };

  const service = new AuthService(db);
  assertNonEmpty(input.email, 'Email is required');
  assertNonEmpty(input.password, 'Password is required');
  assertNonEmpty(input.name, 'Name is required');

  const isSecure = env?.COOKIE_SECURE === 'true';

  try {
    const result = await service.register(input);

    return {
      ok: true,
      data: {
        userId: result.userId,
        role: result.role,
      },
      setCookie: buildSessionCookie(result.sessionId, result.expiresAt, isSecure),
    };
  } catch (err) {
    return Response.json({ ok: false, error: { code: 'AUTH_ERROR', message: err instanceof Error ? err.message : 'Failed to register' } }, { status: 400 });
  }
}

export async function loginController(input: LoginInput, context?: { env?: unknown; userId?: string; request?: Request }) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };

  const service = new AuthService(db);

  assertNonEmpty(input.email, 'Email is required');
  assertNonEmpty(input.password, 'Password is required');

  const isSecure = env?.COOKIE_SECURE === 'true';

  try {
    const result = await service.login(input.email, input.password);

    return {
      ok: true,
      data: {
        userId: result.userId,
        role: result.role,
      },
      setCookie: buildSessionCookie(result.sessionId, result.expiresAt, isSecure),
    };
  } catch {
    return Response.json({ ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } }, { status: 401 });
  }
}

export async function logoutController(_input: unknown, context?: { env?: unknown; request?: Request; headers?: Headers }) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  const service = new AuthService(db);

  const headers = context?.headers;
  const cookieHeader = headers?.get('Cookie') ?? null;
  const cookies = parseCookieHeader(cookieHeader);
  const sessionId = cookies[getSessionCookieName()];

  await service.logout(sessionId);

  return {
    ok: true,
    data: { message: 'Logged out' },
    setCookie: buildClearedSessionCookie(env?.COOKIE_SECURE === 'true'),
  };
}

export async function meController(_input: unknown, context?: { env?: unknown; headers?: Headers }) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  const service = new AuthService(db);

  const headers = context?.headers;
  const cookieHeader = headers?.get('Cookie') ?? null;
  const cookies = parseCookieHeader(cookieHeader);
  const sessionId = cookies[getSessionCookieName()];

  const user = await service.validateSession(sessionId);
  if (!user) {
    return Response.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
  }

  const xpService = new XPService(db);
  const streakService = new StreakService(db);
  const [xpTotal, streak] = await Promise.all([
    xpService.getUserXp(user.userId),
    streakService.getStreak(user.userId),
  ]);

  return {
    ok: true,
    data: {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      xp: xpTotal,
      streak,
    },
  };
}

