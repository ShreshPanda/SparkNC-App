import { EnrollmentService } from '../services/enrollmentService';
import { EnrollmentRepository } from '../repositories/EnrollmentRepository';
import { buildSessionCookie } from '../services/authService';
import { clientIp, D1RateLimiter, rateLimitedResponse } from '../services/rateLimitService';
import { assertNonEmpty } from '../validators/baseValidator';

type Db = ConstructorParameters<typeof EnrollmentRepository>[0];

interface Ctx {
  env?: unknown;
  headers?: Headers;
}

function service(context?: Ctx): { service: EnrollmentService; db: Db; env: Record<string, unknown> } {
  const env = (context?.env ?? {}) as Record<string, unknown>;
  const db = env.DB as Db;
  return { service: new EnrollmentService(new EnrollmentRepository(db)), db, env };
}

// Limiter failures fail closed to a safe retry response — never leak
// internals and never silently allow brute force on limiter outage.
async function guard(db: Db, specs: Parameters<D1RateLimiter['check']>[0]): Promise<Response | undefined> {
  try {
    const decision = await new D1RateLimiter(db).check(specs);
    return decision.allowed ? undefined : rateLimitedResponse(decision.retryAfterMs);
  } catch {
    return rateLimitedResponse(60_000);
  }
}

function badRequest(message: string, code = 'INVALID_REQUEST'): Response {
  return Response.json({ ok: false, error: { code, message } }, { status: 400 });
}

export async function resolveInvitationController(input: { token?: string }, context?: Ctx) {
  const { service: svc, db } = service(context);
  const limited = await guard(db, [{ scope: 'enroll:resolve:ip', subject: clientIp(context?.headers), max: 30, windowMs: 600_000 }]);
  if (limited) return limited;
  try {
    assertNonEmpty(input?.token, 'Token is required');
    const resolved = await svc.resolveInvitation(input.token!);
    return { ok: true, data: resolved };
  } catch {
    return badRequest('Invalid invitation', 'INVALID_INVITATION');
  }
}

export async function verifyClaimCodeController(input: { token?: string; claimCode?: string }, context?: Ctx) {
  const { service: svc, db } = service(context);
  const token = input?.token ?? '';
  // Both keys increment before any reject decision — invitation rotation
  // cannot bypass the aggregate IP limit and vice versa.
  const limited = await guard(db, [
    { scope: 'enroll:verify:inv', subject: token || 'missing', max: 5, windowMs: 600_000 },
    { scope: 'enroll:verify:ip', subject: clientIp(context?.headers), max: 20, windowMs: 600_000 },
  ]);
  if (limited) return limited;
  try {
    assertNonEmpty(input?.token, 'Token is required');
    assertNonEmpty(input?.claimCode, 'Claim code is required');
    const identity = await svc.verifyClaimCode(input.token!, input.claimCode!);
    return { ok: true, data: identity };
  } catch {
    // Identity data is disclosed only on success; failures are uniform.
    return badRequest('Invalid code', 'INVALID_CODE');
  }
}

export async function claimEnrollmentController(input: { grantToken?: string; accessPhrase?: string }, context?: Ctx) {
  const { service: svc, db, env } = service(context);
  const limited = await guard(db, [
    { scope: 'enroll:claim:grant', subject: input?.grantToken || 'missing', max: 5, windowMs: 600_000 },
    { scope: 'enroll:claim:ip', subject: clientIp(context?.headers), max: 20, windowMs: 600_000 },
  ]);
  if (limited) return limited;
  try {
    assertNonEmpty(input?.grantToken, 'Grant token is required');
    assertNonEmpty(input?.accessPhrase, 'Access phrase is required');
    const result = await svc.claim(input.grantToken!, input.accessPhrase!);
    return {
      ok: true,
      data: { publicId: result.publicId, displayName: result.displayName, schoolName: result.schoolName },
      setCookie: buildSessionCookie(result.sessionId, result.sessionExpiresAt, env?.COOKIE_SECURE === 'true'),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('requirements')) {
      return badRequest('Access phrase does not meet requirements', 'PHRASE_POLICY');
    }
    return badRequest('Claim could not be completed', 'CLAIM_FAILED');
  }
}
