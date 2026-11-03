import { describe, it, expect, beforeEach, vi } from 'vitest';

// In-memory SecureStore stand-in; lets us assert native credential persistence.
const secureStore = new Map<string, string>();
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async (key: string) => secureStore.get(key) ?? null),
  setItemAsync: vi.fn(async (key: string, value: string) => {
    secureStore.set(key, value);
  }),
  deleteItemAsync: vi.fn(async (key: string) => {
    secureStore.delete(key);
  }),
}));

// Native platform so sessionStorage exercises the SecureStore path.
vi.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

const SESSION_COOKIE = 'sparknc_session=session-abc';

function jsonResponse(body: unknown, init: { status?: number; setCookie?: string } = {}) {
  const headers = new Map<string, string>();
  if (init.setCookie) headers.set('set-cookie', init.setCookie);
  return {
    status: init.status ?? 200,
    headers: { get: (name: string) => headers.get(name.toLowerCase()) ?? null },
    json: async () => body,
  } as unknown as Response;
}

// /auth/me returns the controller payload { ok, data } inside the API
// envelope { success, data }, so the mock mirrors that double wrap.
const meBody = {
  success: true,
  data: {
    ok: true,
    data: {
      id: 'user-1',
    email: 'ava@sparknc.org',
    name: 'Ava',
    role: 'student',
    schoolId: 'school-1',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
      xp: 120,
      streak: { current: 3, longest: 7 },
    },
  },
};

type FetchHandler = (path: string, init?: RequestInit) => Response;
let handler: FetchHandler = () => { throw new Error('unhandled request'); };

const fetchMock = vi.fn((url: unknown, init?: RequestInit) => {
  const path = String(url).replace('https://api.test', '');
  return Promise.resolve(handler(path, init));
});

async function importService() {
  vi.resetModules();
  vi.stubGlobal('fetch', fetchMock);
  const mod = await import('../authService');
  return mod.authService;
}

describe('authService (real backend auth)', () => {
  beforeEach(() => {
    secureStore.clear();
    fetchMock.mockClear();
    vi.stubEnv('EXPO_PUBLIC_CLOUDFLARE_WORKER_URL', 'https://api.test');
    vi.stubEnv('EXPO_PUBLIC_DEMO_MODE', 'false');
    vi.unstubAllGlobals();
  });

  it('logs in with valid credentials and persists the session token natively', async () => {
    handler = (path) =>
      path === '/auth/login'
        ? jsonResponse({ success: true, data: { userId: 'user-1', role: 'student' } }, { setCookie: `${SESSION_COOKIE}; Path=/; HttpOnly` })
        : jsonResponse(meBody);

    const authService = await importService();
    const session = await authService.login('ava@sparknc.org', 'correct-password');

    expect(session?.email).toBe('ava@sparknc.org');
    expect(session?.xp).toBe(120);
    expect(secureStore.get('sparknc_session')).toBe(SESSION_COOKIE);
  });

  it('rejects invalid credentials and stores nothing', async () => {
    handler = () =>
      jsonResponse(
        { success: false, error: { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' } },
        { status: 401 },
      );

    const authService = await importService();
    await expect(authService.login('ava@sparknc.org', 'wrong')).rejects.toThrow(/invalid/i);
    expect(secureStore.size).toBe(0);
    expect(await authService.getSession()).toBeNull();
  });

  it('restores a persisted session on launch', async () => {
    secureStore.set('sparknc_session', SESSION_COOKIE);
    handler = (path, init) => {
      expect(init?.headers).toMatchObject({ Cookie: SESSION_COOKIE });
      return jsonResponse(meBody);
    };

    const authService = await importService();
    const session = await authService.restore();

    expect(session?.id).toBe('user-1');
    expect((await authService.getSession())?.email).toBe('ava@sparknc.org');
  });

  it('clears stored credentials when the session is expired or revoked', async () => {
    secureStore.set('sparknc_session', SESSION_COOKIE);
    handler = () =>
      jsonResponse(
        { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 },
      );

    const authService = await importService();
    expect(await authService.restore()).toBeNull();
    expect(secureStore.size).toBe(0);
  });

  it('revokes the server session and clears credentials on logout', async () => {
    const calls: string[] = [];
    handler = (path) => {
      calls.push(path);
      if (path === '/auth/login') {
        return jsonResponse({ success: true, data: { userId: 'user-1', role: 'student' } }, { setCookie: `${SESSION_COOKIE}; Path=/` });
      }
      if (path === '/auth/logout') {
        return jsonResponse({ success: true, data: { message: 'Logged out' } }, { setCookie: 'sparknc_session=; Path=/; Max-Age=0' });
      }
      return jsonResponse(meBody);
    };

    const authService = await importService();
    await authService.login('ava@sparknc.org', 'correct-password');
    await authService.signOut();

    expect(calls).toContain('/auth/logout');
    expect(secureStore.size).toBe(0);
    expect(await authService.getSession()).toBeNull();
  });

  it('surfaces backend failures instead of fabricating a session', async () => {
    handler = () => {
      throw new Error('network unreachable');
    };

    const authService = await importService();
    await expect(authService.login('ava@sparknc.org', 'pw')).rejects.toThrow();
    expect(await authService.getSession()).toBeNull();
    expect(secureStore.size).toBe(0);
  });

  it('keeps registration restricted to invitation-only', async () => {
    const authService = await importService();
    await expect(authService.register('a@b.co', 'password123', 'Name')).rejects.toThrow(/invitation/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('authService (demo mode isolation)', () => {
  beforeEach(() => {
    secureStore.clear();
    vi.stubEnv('EXPO_PUBLIC_CLOUDFLARE_WORKER_URL', 'https://api.test');
    vi.stubEnv('EXPO_PUBLIC_DEMO_MODE', 'true');
    vi.unstubAllGlobals();
  });

  it('allows an explicit demo login when the flag is enabled', async () => {
    const authService = await importService();
    const session = await authService.demoLogin();

    expect(session?.email).toBe('ava.demo@sparknc.org');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses demo login when the flag is disabled', async () => {
    vi.stubEnv('EXPO_PUBLIC_DEMO_MODE', 'false');
    const authService = await importService();
    await expect(authService.demoLogin()).rejects.toThrow(/not enabled/i);
  });

  it('never fabricates auth when the backend fails, even in demo mode', async () => {
    handler = () =>
      jsonResponse(
        { success: false, error: { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' } },
        { status: 401 },
      );

    const authService = await importService();
    await expect(authService.login('ava@sparknc.org', 'wrong')).rejects.toThrow(/invalid/i);
  });
});
