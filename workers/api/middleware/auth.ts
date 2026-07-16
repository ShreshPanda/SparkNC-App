import { createBetterAuthService } from '../../auth/betterAuth';

export interface AuthContext {
  userId?: string;
  isAuthenticated: boolean;
}

function parseCookie(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, part) => {
      const idx = part.indexOf('=');
      if (idx === -1) return acc;
      const key = decodeURIComponent(part.slice(0, idx).trim());
      const value = decodeURIComponent(part.slice(idx + 1).trim());
      acc[key] = value;
      return acc;
    }, {});
}

// Better Auth cookie/session validation is not yet implemented in workers/auth/betterAuth.ts.
// For now we only remove unsafe identity fallback and require a real session cookie.
export function createAuthContext(headers: Headers): AuthContext {
  const auth = createBetterAuthService();
  if (!auth.isConfigured) {
    return { isAuthenticated: false };
  }

  const cookies = parseCookie(headers.get('Cookie'));

  // TODO: Replace this cookie name + validation logic with the official Better Auth session cookie contract.
  // We intentionally do NOT fall back to any demo user.
  const session = cookies['better-auth-session'] ?? cookies['betterauth_session'] ?? undefined;
  if (!session) {
    return { isAuthenticated: false };
  }

  // TODO: Validate session token and derive the authenticated userId.
  // Without Better Auth validation wiring, we cannot securely map session -> user.
  return { isAuthenticated: false };
}

export function requireAuth(): { ok: false; status: 401; message: string } {
  return {
    ok: false,
    status: 401,
    message: 'Unauthorized',
  };
}

