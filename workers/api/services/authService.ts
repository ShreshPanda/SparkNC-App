
import { SessionsRepository } from '../repositories/SessionsRepository';

declare const crypto: Crypto; // Cloudflare Workers global

import { assertNonEmpty, assertValidEmail } from '../validators/baseValidator';

const SESSION_COOKIE_NAME = 'sparknc_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function toIso(ms: number): string {
  return new Date(ms).toISOString();
}

async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  const base64 = btoa(binary);
  return base64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

export interface UserAuthRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  password_hash: string;
  password_salt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface PasswordRecord {
  passwordHash: string;
  passwordSalt: string;
}

export function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
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

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}

export function createSessionExpiresAt(now = Date.now()): string {
  return toIso(now + SESSION_TTL_MS);
}

export interface CreateSessionResult {
  sessionId: string;
  expiresAt: string;
}

export class AuthService {
  constructor(
    private readonly db: {
      prepare: (query: string) => {
        bind: (...values: unknown[]) => {
          run: () => Promise<unknown>;
          all: () => Promise<{ results: Record<string, unknown>[] }>;
        };
      };
    },
  ) {}

  private async hashPassword(password: string, salt: string): Promise<string> {
    // NOTE: Without a native password-hashing dependency in this repo,
    // we use an SHA-256(salt + password) construction.
    // This is a placeholder-grade scheme and must be upgraded to a real KDF
    // (bcrypt/argon2/scrypt) once dependencies are available.
    return sha256Base64Url(`${salt}:${password}`);
  }

  async register(input: CreateUserInput): Promise<{ userId: string; sessionId: string; expiresAt: string; role: string }> {
    assertNonEmpty(input.email, 'Email is required');
    assertValidEmail(input.email);
    assertNonEmpty(input.password, 'Password is required');
    assertNonEmpty(input.name, 'Name is required');

    const role = input.role ?? 'student';
    assertNonEmpty(role, 'Role is required');

    const salt = crypto.randomUUID();

    const passwordHash = await this.hashPassword(input.password, salt);

    // Create user only if not exists
    const userId = `user-${crypto.randomUUID()}`;


    await this.db
      .prepare(
        'INSERT INTO users (id, email, name, role, created_at, updated_at, password_hash, password_salt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(userId, input.email.toLowerCase(), input.name, role, new Date().toISOString(), new Date().toISOString(), passwordHash, salt)
      .run();

    const sessionsRepo = new SessionsRepository(this.db);
    const expiresAt = createSessionExpiresAt();
    const session = await sessionsRepo.createSession({ userId, expiresAt });

    return { userId, sessionId: session.id, expiresAt, role };
  }

  async login(email: string, password: string): Promise<{ userId: string; sessionId: string; expiresAt: string; role: string }> {
    assertNonEmpty(email, 'Email is required');
    assertValidEmail(email);
    assertNonEmpty(password, 'Password is required');

    const current = await this.db
      .prepare('SELECT id, email, name, role, password_hash, password_salt FROM users WHERE email = ? LIMIT 1')
      .bind(email.toLowerCase())
      .all();

    const row = current.results?.[0];
    if (!row) {
      throw new Error('Invalid credentials');
    }

    const salt = String(row.password_salt ?? '');
    const expectedHash = String(row.password_hash ?? '');
    const actualHash = await this.hashPassword(password, salt);

    if (!actualHash || actualHash !== expectedHash) {
      throw new Error('Invalid credentials');
    }

    const sessionsRepo = new SessionsRepository(this.db);
    const expiresAt = createSessionExpiresAt();
    const session = await sessionsRepo.createSession({ userId: String(row.id ?? ''), expiresAt });

    return { userId: session.userId, sessionId: session.id, expiresAt, role: String(row.role ?? 'student') };
  }

  async logout(sessionId: string | undefined): Promise<void> {
    if (!sessionId) return;
    const sessionsRepo = new SessionsRepository(this.db);
    await sessionsRepo.revokeSession(sessionId);
  }

  async validateSession(sessionId: string | undefined): Promise<{ userId: string; role: string; email: string; name: string } | null> {
    if (!sessionId) return null;

    const sessionsRepo = new SessionsRepository(this.db);
    const session = await sessionsRepo.getSessionById(sessionId);
    if (!session) return null;

    if (session.revokedAt) return null;

    const now = Date.now();
    const exp = new Date(session.expiresAt).getTime();
    if (Number.isNaN(exp) || exp < now) return null;

    const user = await this.db
      .prepare('SELECT id, email, name, role FROM users WHERE id = ? LIMIT 1')
      .bind(session.userId)
      .all();

    const row = user.results?.[0];
    if (!row) return null;

    return {
      userId: String(row.id ?? ''),
      email: String(row.email ?? ''),
      name: String(row.name ?? ''),
      role: String(row.role ?? 'student'),
    };
  }
}

export function buildSessionCookie(sessionId: string, expiresAt: string, requestSecure: boolean): string {
  const secure = requestSecure;
  const httpOnly = true;
  const sameSite = 'Strict';
  const path = '/';

  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}; HttpOnly=${httpOnly ? 'true' : 'false'}; Path=${path}; SameSite=${sameSite}; Max-Age=${Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)};${secure ? ' Secure' : ''}`;
}

export function buildClearedSessionCookie(): string {
  // Clear by setting Max-Age=0
  return `${SESSION_COOKIE_NAME}=; HttpOnly=true; Path=/; Max-Age=0; SameSite=Strict`;
}

