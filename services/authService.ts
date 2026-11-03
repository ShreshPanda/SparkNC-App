import { cloudflareService, isDemoMode, restoreSessionCookie, clearSessionCredentials } from './cloudflareService';
import type { User } from '../shared/types';

export interface AuthSession extends User {
  xp: number;
  streak: { current: number; longest: number };
}

// Demo identity used ONLY when EXPO_PUBLIC_DEMO_MODE === 'true' and the user
// explicitly enters demo mode. It never authenticates against the backend
// and never masks a real API failure.
const DEMO_USER: AuthSession = {
  id: 'demo_user-zrzpjllq',
  email: 'ava.demo@sparknc.org',
  name: 'Ava Demo',
  role: 'student',
  schoolId: 'school-1',
  isActive: true,
  createdAt: new Date('2026-01-15').toISOString(),
  updatedAt: new Date().toISOString(),
  xp: 1240,
  streak: { current: 12, longest: 18 },
};

let session: AuthSession | null = null;
let restored = false;

export const authService = {
  // Registration is invitation-gated per the MVP spec. The invite token flow
  // lands in S3; until then signup is held rather than publicly self-serve.
  async register(_email: string, _password: string, _name: string, _role = 'student'): Promise<void> {
    throw new Error('Registration is currently available by invitation only.');
  },

  async login(email: string, password: string): Promise<AuthSession> {
    await cloudflareService.login({ email, password });
    session = await cloudflareService.getMe();
    restored = true;
    return session;
  },

  // Explicit demo entry point. Only available in demo mode; callers must not
  // route real credentials through this path.
  async demoLogin(): Promise<AuthSession> {
    if (!isDemoMode()) {
      throw new Error('Demo mode is not enabled');
    }
    session = { ...DEMO_USER };
    restored = true;
    return session;
  },

  // Restore a persisted session on app launch. Returns null when the user is
  // unauthenticated; clears stored credentials on expired/revoked sessions.
  async restore(): Promise<AuthSession | null> {
    if (isDemoMode()) {
      restored = true;
      return session;
    }
    try {
      await restoreSessionCookie();
      session = await cloudflareService.getMe();
    } catch {
      session = null;
      await clearSessionCredentials();
    }
    restored = true;
    return session;
  },

  async getSession(): Promise<AuthSession | null> {
    if (session) return session;
    if (!restored) {
      return this.restore();
    }
    return null;
  },

  async refreshSession(): Promise<AuthSession | null> {
    try {
      session = await cloudflareService.getMe();
    } catch {
      session = null;
      await clearSessionCredentials();
    }
    return session;
  },

  async signOut(): Promise<void> {
    if (session?.id !== DEMO_USER.id) {
      try {
        await cloudflareService.logout();
      } catch {
        // Server revoke is best-effort; client credentials are cleared regardless.
      }
    }
    session = null;
    await clearSessionCredentials();
  },
};
