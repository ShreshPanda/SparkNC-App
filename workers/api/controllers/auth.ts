import { AuthService, buildClearedSessionCookie, buildSessionCookie, getSessionCookieName, parseCookieHeader } from '../services/authService';
import { XPService } from '../services/xpService';
import { StreakService } from '../services/streakService';
import { assertNonEmpty } from '../validators/baseValidator';
import { clientIp, D1RateLimiter, rateLimitedResponse } from '../services/rateLimitService';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface LoginInput {
  email?: string;
  password?: string;
  publicId?: string;
  accessPhrase?: string;
}

export async function registerController(_input: RegisterInput, _context?: { env?: unknown; userId?: string }) {
  // Registration is invitation-gated per the MVP spec. S3 implements the
  // invite-token flow; until then no public or admin self-provisioning.
  return Response.json(
    { ok: false, error: { code: 'INVITE_REQUIRED', message: 'Registration is currently available by invitation only' } },
    { status: 403 },
  );
}

export async function loginController(input: LoginInput, context?: { env?: unknown; userId?: string; request?: Request; headers?: Headers }) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };

  const service = new AuthService(db);
  const isSecure = env?.COOKIE_SECURE === 'true';
  const invalid = () =>
    Response.json({ ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } }, { status: 401 });

  // Student path: public_id + access phrase. Staff path: email + password.
  // Both produce the same session behavior and generic failure response.
  if (input.publicId !== undefined || input.accessPhrase !== undefined) {
    try {
      // Durable multi-key limit: per-account and per-IP both increment
      // before any reject decision.
      const decision = await new D1RateLimiter(db).check([
        { scope: 'auth:login:acct', subject: String(input.publicId ?? 'missing'), max: 5, windowMs: 600_000 },
        { scope: 'auth:login:ip', subject: clientIp(context?.headers), max: 20, windowMs: 600_000 },
      ]);
      if (!decision.allowed) return rateLimitedResponse(decision.retryAfterMs);
      assertNonEmpty(input.publicId, 'Credentials are required');
      assertNonEmpty(input.accessPhrase, 'Credentials are required');
      const result = await service.loginStudent(input.publicId!, input.accessPhrase!);
      return {
        ok: true,
        data: { userId: result.userId, role: result.role, publicId: result.publicId },
        setCookie: buildSessionCookie(result.sessionId, result.expiresAt, isSecure),
      };
    } catch {
      return invalid();
    }
  }

  try {
    assertNonEmpty(input.email, 'Email is required');
    assertNonEmpty(input.password, 'Password is required');
    const result = await service.login(input.email!, input.password!);
    return {
      ok: true,
      data: {
        userId: result.userId,
        role: result.role,
      },
      setCookie: buildSessionCookie(result.sessionId, result.expiresAt, isSecure),
    };
  } catch {
    return invalid();
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
      id: user.id,
      userId: user.userId,
      email: user.email,
      publicId: user.publicId,
      name: user.name,
      role: user.role,
      schoolId: user.schoolId,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      lastSeenAt: user.lastSeenAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      xp: xpTotal,
      streak,
    },
  };
}

