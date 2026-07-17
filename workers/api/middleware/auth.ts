import { parseCookieHeader, getSessionCookieName } from '../services/authService';
import { AuthContext } from './types';

export function createAuthContext(_headers: Headers): AuthContext {
  // Middleware authentication will be completed once the request->context pipeline
  // provides DB access for session validation.
  // For now, do not authenticate requests here.
  return { isAuthenticated: false };
}


export function requireAuth(): { ok: false; status: 401; message: string } {
  return {
    ok: false,
    status: 401,
    message: 'Unauthorized',
  };
}


