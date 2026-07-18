
import { SessionsRepository } from '../repositories/SessionsRepository';

declare const crypto: Crypto; // Cloudflare Workers global

import { assertNonEmpty, assertValidEmail } from '../validators/baseValidator';

const SESSION_COOKIE_NAME = 'sparknc_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

function toIso(ms: number): string {
  return new Date(ms).toISOString();
}

function textToBuffer(text: string): ArrayBuffer {
  return new TextEncoder().encode(text);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  const base64 = btoa(binary);
  return base64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function randomSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  return bytesToBase64Url(bytes);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

async function deriveKey(password: string, salt: string, iterations: number): Promise<ArrayBuffer> {
  const passwordKey = await crypto.subtle.importKey('raw', textToBuffer(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: base64UrlToBytes(salt), iterations, hash: 'SHA-256' },
    passwordKey,
    KEY_BITS,
  );
}

function encodePasswordHash(hashBits: ArrayBuffer): string {
  return `pbkdf2:${PBKDF2_ITERATIONS}:${bytesToBase64Url(new Uint8Array(hashBits))}`;
}

function parsePasswordHash(encoded: string): { iterations: number; hashBytes: Uint8Array } | null {
  const parts = encoded.split(':');
  if (parts.length !== 3 || parts[0] !== 'pbkdf2') return null;
  const iterations = Number.parseInt(parts[1], 10);
  if (Number.isNaN(iterations) || iterations <= 0) return null;
  try {
    return { iterations, hashBytes: base64UrlToBytes(parts[2]) };
  } catch {
    return null;
  }
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
    const bits = await deriveKey(password, salt, PBKDF2_ITERATIONS);
    return encodePasswordHash(bits);
  }

  async register(input: CreateUserInput): Promise<{ userId: string; sessionId: string; expiresAt: string; role: string }> {
    assertNonEmpty(input.email, 'Email is required');
    assertValidEmail(input.email);
    assertNonEmpty(input.password, 'Password is required');
    assertNonEmpty(input.name, 'Name is required');

    const role = input.role ?? 'student';
    assertNonEmpty(role, 'Role is required');

    const salt = randomSalt();

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
    const encodedHash = String(row.password_hash ?? '');

    const parsed = parsePasswordHash(encodedHash);
    if (!parsed) {
      throw new Error('Invalid credentials');
    }

    const actualBits = await deriveKey(password, salt, parsed.iterations);
    if (!timingSafeEqual(new Uint8Array(actualBits), parsed.hashBytes)) {
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

  async validateSession(sessionId: string | undefined): Promise<{ userId: string; role: string; email: string; name: string; schoolId?: string } | null> {
    if (!sessionId) return null;

    const sessionsRepo = new SessionsRepository(this.db);
    const session = await sessionsRepo.getSessionById(sessionId);
    if (!session) return null;

    if (session.revokedAt) return null;

    const now = Date.now();
    const exp = new Date(session.expiresAt).getTime();
    if (Number.isNaN(exp) || exp < now) return null;

    const user = await this.db
      .prepare('SELECT id, email, name, role, school_id FROM users WHERE id = ? LIMIT 1')
      .bind(session.userId)
      .all();

    const row = user.results?.[0];
    if (!row) return null;

    return {
      userId: String(row.id ?? ''),
      email: String(row.email ?? ''),
      name: String(row.name ?? ''),
      role: String(row.role ?? 'student'),
      schoolId: row.school_id == null ? undefined : String(row.school_id),
    };
  }
}

export function buildSessionCookie(sessionId: string, expiresAt: string, requestSecure: boolean): string {
  const maxAge = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
  const attributes = ['Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAge}`];
  if (requestSecure) attributes.push('Secure');
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}; ${attributes.join('; ')}`;
}

export function buildClearedSessionCookie(requestSecure = true): string {
  const attributes = ['Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0'];
  if (requestSecure) attributes.push('Secure');
  return `${SESSION_COOKIE_NAME}=; ${attributes.join('; ')}`;
}

