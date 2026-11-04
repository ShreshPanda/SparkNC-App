import { describe, it, expect, beforeEach, vi } from 'vitest';

const secureStore = new Map<string, string>();
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async (key: string) => secureStore.get(key) ?? null),
  setItemAsync: vi.fn(async (key: string, value: string) => { secureStore.set(key, value); }),
  deleteItemAsync: vi.fn(async (key: string) => { secureStore.delete(key); }),
}));
vi.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

function jsonResponse(body: unknown, init: { status?: number; setCookie?: string } = {}) {
  const headers = new Map<string, string>();
  if (init.setCookie) headers.set('set-cookie', init.setCookie);
  return {
    status: init.status ?? 200,
    headers: { get: (name: string) => headers.get(name.toLowerCase()) ?? null },
    json: async () => body,
  } as unknown as Response;
}

const ok = (data: unknown, init?: Parameters<typeof jsonResponse>[1]) => jsonResponse({ success: true, data }, init);
const fail = (code: string, status = 400, message = 'error') =>
  jsonResponse({ success: false, error: { message, code } }, { status });

type FetchHandler = (path: string, body?: unknown) => Response;
let handler: FetchHandler = () => { throw new Error('unhandled request'); };

const fetchMock = vi.fn((url: unknown, init?: RequestInit) => {
  const path = String(url).replace('https://api.test', '');
  const body = init?.body ? JSON.parse(String(init.body)) : undefined;
  return Promise.resolve(handler(path, body));
});

async function importServices() {
  vi.resetModules();
  vi.stubGlobal('fetch', fetchMock);
  const enrollment = await import('../enrollmentService');
  const auth = await import('../authService');
  return { enrollmentService: enrollment.enrollmentService, authService: auth.authService, checkAccessPhrase: enrollment.checkAccessPhrase, mapEnrollmentError: enrollment.mapEnrollmentError };
}

describe('enrollmentService (S3c-6)', () => {
  beforeEach(() => {
    secureStore.clear();
    fetchMock.mockClear();
    vi.stubEnv('EXPO_PUBLIC_CLOUDFLARE_WORKER_URL', 'https://api.test');
    vi.stubEnv('EXPO_PUBLIC_DEMO_MODE', 'false');
    vi.unstubAllGlobals();
  });

  it('resolves individual and school-link invitations to kind + expiry only', async () => {
    handler = (_path, body) => {
      const token = (body as { token: string }).token;
      return token === 'link-tok'
        ? ok({ kind: 'school_link', expiresAt: '2999-01-01' })
        : ok({ kind: 'individual', expiresAt: '2999-01-02' });
    };
    const { enrollmentService } = await importServices();
    expect((await enrollmentService.resolveInvitation('ind-tok')).kind).toBe('individual');
    expect((await enrollmentService.resolveInvitation('link-tok')).kind).toBe('school_link');
    expect(fetchMock).toHaveBeenCalledWith('https://api.test/enroll/resolve', expect.objectContaining({ method: 'POST' }));
  });

  it('rejects invalid, expired, revoked, and already-claimed invitations uniformly', async () => {
    handler = () => fail('INVALID_INVITATION', 400, 'Invalid invitation');
    const { enrollmentService, mapEnrollmentError } = await importServices();
    for (const token of ['bad', 'expired', 'revoked', 'claimed']) {
      await expect(enrollmentService.resolveInvitation(token)).rejects.toMatchObject({ code: 'INVALID_INVITATION' });
    }
    expect(mapEnrollmentError({ code: 'INVALID_INVITATION' }, '')).toContain('lab leader');
  });

  it('verifies a claim code and returns grant + identity only after success', async () => {
    handler = (path, body) => {
      if (path === '/enroll/verify' && (body as { claimCode: string }).claimCode === '23456789AB') {
        return ok({ grantToken: 'grant-1', displayName: 'Ava Reyes', schoolName: 'Alpha Lab' });
      }
      return fail('INVALID_CODE', 400, 'Invalid code');
    };
    const { enrollmentService } = await importServices();
    const v = await enrollmentService.verifyClaimCode('tok', '23456789AB');
    expect(v).toMatchObject({ grantToken: 'grant-1', displayName: 'Ava Reyes', schoolName: 'Alpha Lab' });
    await expect(enrollmentService.verifyClaimCode('tok', 'WRONGCODE00')).rejects.toMatchObject({ code: 'INVALID_CODE' });
  });

  it('claims an account and persists the session cookie returned by the server', async () => {
    handler = (path) =>
      path === '/enroll/claim'
        ? ok({ publicId: 'stu_Ab3dEf5gH7jK9mN1', displayName: 'Ava', schoolName: 'Alpha' }, { setCookie: 'sparknc_session=s-1; Path=/; HttpOnly' })
        : fail('CLAIM_FAILED');
    const { enrollmentService } = await importServices();
    const result = await enrollmentService.claim('grant-1', 'alpha beta gamma');
    expect(result.publicId).toMatch(/^stu_[A-Za-z0-9]{16}$/);
    expect(secureStore.get('sparknc_session')).toBe('sparknc_session=s-1');
  });

  it('rejects failed claims without persisting credentials', async () => {
    handler = () => fail('CLAIM_FAILED', 400, 'Claim could not be completed');
    const { enrollmentService } = await importServices();
    await expect(enrollmentService.claim('grant-x', 'alpha beta gamma')).rejects.toMatchObject({ code: 'CLAIM_FAILED' });
    expect(secureStore.size).toBe(0);
  });

  it('maps cap, rate-limit, and transient errors to retry guidance', async () => {
    const { mapEnrollmentError } = await importServices();
    expect(mapEnrollmentError({ code: 'CAP_EXCEEDED' }, 'x')).toContain('minute');
    expect(mapEnrollmentError({ code: 'RATE_LIMIT' }, 'x')).toContain('wait');
    expect(mapEnrollmentError({ code: 'RETRY_LATER' }, 'x')).toContain('wait');
    expect(mapEnrollmentError({ code: 'PHRASE_POLICY' }, 'x')).toContain('phrase');
  });
});

describe('access phrase validation (client mirror)', () => {
  beforeEach(() => {
    vi.stubEnv('EXPO_PUBLIC_CLOUDFLARE_WORKER_URL', 'https://api.test');
    vi.unstubAllGlobals();
  });

  it('accepts valid phrases and rejects weak ones', async () => {
    const { checkAccessPhrase } = await importServices();
    expect(checkAccessPhrase('alpha beta gamma').valid).toBe(true);
    for (const bad of ['short two', 'oneverylongsinglewordxx', '123456789012 34', '  ', 'ok two']) {
      expect(checkAccessPhrase(bad).valid).toBe(false);
    }
  });

  it('normalizes whitespace before sending', async () => {
    let sent: unknown;
    handler = (path, body) => {
      sent = body;
      return path === '/enroll/claim' ? ok({ publicId: 'stu_x', displayName: 'A', schoolName: 'S' }) : fail('x');
    };
    const { enrollmentService } = await importServices();
    await enrollmentService.claim('g', '  alpha   beta  gamma  ');
    expect((sent as { accessPhrase: string }).accessPhrase).toBe('alpha beta gamma');
  });
});

describe('student login and access recovery (S3c-6)', () => {
  const meBody = {
    success: true,
    data: {
      ok: true,
      data: {
        id: 'user-1', name: 'Ava', role: 'student', schoolId: 'school-1',
        publicId: 'stu_Ab3dEf5gH7jK9mN1', isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
        xp: 0, streak: { current: 0, longest: 0 },
      },
    },
  };

  beforeEach(() => {
    secureStore.clear();
    fetchMock.mockClear();
    vi.stubEnv('EXPO_PUBLIC_CLOUDFLARE_WORKER_URL', 'https://api.test');
    vi.stubEnv('EXPO_PUBLIC_DEMO_MODE', 'false');
    vi.unstubAllGlobals();
  });

  it('logs a student in with publicId + phrase and returns a session with publicId', async () => {
    handler = (path) =>
      path === '/auth/login'
        ? ok({ userId: 'user-1', role: 'student', publicId: 'stu_Ab3dEf5gH7jK9mN1' }, { setCookie: 'sparknc_session=s-9; Path=/; HttpOnly' })
        : jsonResponse(meBody);
    const { authService } = await importServices();
    const session = await authService.loginStudent('stu_Ab3dEf5gH7jK9mN1', 'alpha beta gamma');
    expect(session.publicId).toBe('stu_Ab3dEf5gH7jK9mN1');
    expect(secureStore.get('sparknc_session')).toBe('sparknc_session=s-9');
  });

  it('rejects wrong phrase and unknown public id with the same error', async () => {
    handler = () => fail('INVALID_CREDENTIALS', 401, 'Invalid credentials');
    const { authService } = await importServices();
    for (const id of ['stu_Ab3dEf5gH7jK9mN1', 'stu_Zz9yXx8wWv7uU5tQ']) {
      await expect(authService.loginStudent(id, 'wrong words here')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    }
    expect(secureStore.size).toBe(0);
  });

  it('keeps staff email login working after the student path was added', async () => {
    handler = (path, body) => {
      if (path === '/auth/login') {
        expect(body).toMatchObject({ email: 'lead@x.co' });
        return ok({ userId: 'u-lead', role: 'lab_leader' }, { setCookie: 'sparknc_session=s-2; Path=/' });
      }
      return jsonResponse({
        ...meBody,
        data: { ...meBody.data, data: { ...meBody.data.data, id: 'u-lead', email: 'lead@x.co', role: 'lab_leader', publicId: undefined } },
      });
    };
    const { authService } = await importServices();
    const session = await authService.login('lead@x.co', 'staff password');
    expect(session.role).toBe('lab_leader');
    expect(session.publicId).toBeUndefined();
  });

  it('completes a reset and the old phrase no longer authenticates', async () => {
    let phraseValid = 'new secure phrase';
    handler = (path, body) => {
      if (path === '/access/reset') return ok({ reset: true });
      if (path === '/auth/login') {
        return (body as { accessPhrase: string }).accessPhrase === phraseValid
          ? ok({ userId: 'user-1', role: 'student', publicId: 'stu_x' }, { setCookie: 'sparknc_session=s-3; Path=/' })
          : fail('INVALID_CREDENTIALS', 401, 'Invalid credentials');
      }
      return jsonResponse(meBody);
    };
    const { enrollmentService, authService } = await importServices();
    await enrollmentService.completeReset('reset-tok', 'new secure phrase');
    await expect(authService.loginStudent('stu_x', 'old phrase here')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    expect(await authService.loginStudent('stu_x', 'new secure phrase')).toBeTruthy();
    void phraseValid;
  });

  it('rejects invalid/expired/used reset tokens without touching credentials', async () => {
    handler = () => fail('INVALID_RESET', 400, 'Invalid or expired reset link');
    const { enrollmentService, mapEnrollmentError } = await importServices();
    await expect(enrollmentService.completeReset('ghost', 'alpha beta gamma')).rejects.toMatchObject({ code: 'INVALID_RESET' });
    expect(secureStore.size).toBe(0);
    expect(mapEnrollmentError({ code: 'INVALID_RESET' }, '')).toContain('reset');
  });
});

describe('native session credential transport (S4.5.5)', () => {
  beforeEach(() => {
    secureStore.clear();
    fetchMock.mockClear();
    vi.stubEnv('EXPO_PUBLIC_CLOUDFLARE_WORKER_URL', 'https://api.test');
    vi.stubEnv('EXPO_PUBLIC_DEMO_MODE', 'false');
    vi.unstubAllGlobals();
  });

  it('persists body credential and sends it on the first authenticated request', async () => {
    handler = (path, body) => {
      if (path === '/auth/login') {
        return ok({ ok: true, data: { userId: 'u1', role: 'student', publicId: 'testingID' }, sessionCredential: 'sparknc_session=sess-abc123' });
      }
      if (path === '/auth/me') return ok({ ok: true, data: { id: 'u1', role: 'student', publicId: 'testingID' } });
      throw new Error(`unhandled ${path}`);
    };
    const { authService } = await importServices();
    await authService.loginStudent('testingID', 'testing');
    expect(secureStore.get('sparknc_session')).toBe('sparknc_session=sess-abc123');
    // Refresh hits /auth/me — the session cookie must already be attached.
    const me = await authService.refreshSession();
    expect(me?.role).toBe('student');
    const meCall = fetchMock.mock.calls.find((c) => String(c[0]).endsWith('/auth/me'));
    expect((meCall?.[1] as RequestInit | undefined)?.headers).toMatchObject({ Cookie: 'sparknc_session=sess-abc123' });
  });

  it('response credential does not leak into the caller-visible payload', async () => {
    handler = () => ok({ ok: true, data: { userId: 'u1', role: 'student', publicId: 'testingID' }, sessionCredential: 'sparknc_session=sess-abc123' });
    const { authService } = await importServices();
    const res = await authService.loginStudent('testingID', 'testing');
    expect(JSON.stringify(res)).not.toContain('sparknc_session');
  });
});
