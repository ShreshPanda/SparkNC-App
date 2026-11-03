
import { SessionsRepository } from '../repositories/SessionsRepository';

declare const crypto: Crypto; // Cloudflare Workers global

import { assertLength, assertNonEmpty, assertValidEmail } from '../validators/baseValidator';
import { normalizeAccessPhrase, STUDENT_EMAIL_DOMAIN } from './enrollmentService';

const PUBLIC_ID_PATTERN = /^stu_[A-Za-z0-9]{16}$/;

const SESSION_COOKIE_NAME = 'sparknc_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

function toIso(ms: number): string {
  return new Date(ms).toISOString();
}

function textToBuffer(text: string): ArrayBuffer {
  const bytes = new TextEncoder().encode(text);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
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

function bytesToBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
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
    { name: 'PBKDF2', salt: bytesToBuffer(base64UrlToBytes(salt)), iterations, hash: 'SHA-256' },
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
    assertLength(input.password, 'Password', 8, 256);
    assertNonEmpty(input.name, 'Name is required');

    const role = 'student';
    const normalizedEmail = input.email.toLowerCase();

    const existing = await this.db
      .prepare('SELECT 1 FROM users WHERE email = ? LIMIT 1')
      .bind(normalizedEmail)
      .all();
    if (existing.results?.[0]) {
      throw new Error('An account with that email already exists');
    }

    const salt = randomSalt();
    const passwordHash = await this.hashPassword(input.password, salt);

    const userId = `user-${crypto.randomUUID()}`;

    await this.db
      .prepare(
        'INSERT INTO users (id, email, name, role, created_at, updated_at, password_hash, password_salt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(userId, normalizedEmail, input.name, role, new Date().toISOString(), new Date().toISOString(), passwordHash, salt)
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

  // Student login: public_id + access phrase. The phrase is normalized
  // exactly as at claim time before verification against the existing
  // PBKDF2 hash format. All failures raise the same generic error.
  async loginStudent(publicId: string, accessPhrase: string): Promise<{ userId: string; sessionId: string; expiresAt: string; role: string; publicId: string }> {
    assertNonEmpty(publicId, 'Credentials are required');
    assertNonEmpty(accessPhrase, 'Credentials are required');
    if (!PUBLIC_ID_PATTERN.test(publicId)) {
      throw new Error('Invalid credentials');
    }
    const normalized = normalizeAccessPhrase(accessPhrase);

    const current = await this.db
      .prepare(
        `SELECT u.id, u.role, u.password_hash, u.password_salt, u.is_active, p.public_id
           FROM student_public_ids p
           JOIN users u ON u.id = p.user_id
          WHERE p.public_id = ? AND u.role = 'student' LIMIT 1`,
      )
      .bind(publicId)
      .all();

    const row = current.results?.[0];
    if (!row || !Number(row.is_active)) {
      throw new Error('Invalid credentials');
    }

    const parsed = parsePasswordHash(String(row.password_hash ?? ''));
    if (!parsed) {
      throw new Error('Invalid credentials');
    }
    const actualBits = await deriveKey(normalized, String(row.password_salt ?? ''), parsed.iterations);
    if (!timingSafeEqual(new Uint8Array(actualBits), parsed.hashBytes)) {
      throw new Error('Invalid credentials');
    }

    const sessionsRepo = new SessionsRepository(this.db);
    const expiresAt = createSessionExpiresAt();
    const session = await sessionsRepo.createSession({ userId: String(row.id ?? ''), expiresAt });

    return { userId: session.userId, sessionId: session.id, expiresAt, role: 'student', publicId };
  }

  async logout(sessionId: string | undefined): Promise<void> {
    if (!sessionId) return;
    const sessionsRepo = new SessionsRepository(this.db);
    await sessionsRepo.revokeSession(sessionId);
  }

  async validateSession(sessionId: string | undefined): Promise<{ userId: string; id: string; role: string; email?: string; name: string; schoolId?: string; avatarUrl?: string; isActive: boolean; lastSeenAt?: string; createdAt: string; updatedAt: string; publicId?: string } | null> {
    if (!sessionId) return null;

    const sessionsRepo = new SessionsRepository(this.db);
    const session = await sessionsRepo.getSessionById(sessionId);
    if (!session) return null;

    if (session.revokedAt) return null;

    const now = Date.now();
    const exp = new Date(session.expiresAt).getTime();
    if (Number.isNaN(exp) || exp < now) return null;

    // LEFT JOIN picks up the student's public id when migration 024 is
    // applied; on pre-migration databases the join fails and we fall back
    // to the plain users query so existing sessions keep working.
    let row: Record<string, unknown> | undefined;
    try {
      const user = await this.db
        .prepare(
          'SELECT u.id, u.email, u.name, u.role, u.school_id, u.avatar_url, u.is_active, u.last_seen_at, u.created_at, u.updated_at, p.public_id AS public_id FROM users u LEFT JOIN student_public_ids p ON p.user_id = u.id WHERE u.id = ? LIMIT 1',
        )
        .bind(session.userId)
        .all();
      row = user.results?.[0];
    } catch {
      row = undefined;
    }
    if (!row) {
      // Fallback for databases without student_public_ids (pre-024) and
      // for missing users — the plain query preserves legacy behavior.
      const user = await this.db
        .prepare('SELECT id, email, name, role, school_id, avatar_url, is_active, last_seen_at, created_at, updated_at FROM users WHERE id = ? LIMIT 1')
        .bind(session.userId)
        .all();
      row = user.results?.[0];
    }
    if (!row) return null;

    // Synthetic student emails are internal identifiers and are never
    // exposed through session/user serialization.
    const email = String(row.email ?? '');
    const isSynthetic = email.endsWith(`@${STUDENT_EMAIL_DOMAIN}`);

    return {
      userId: String(row.id ?? ''),
      id: String(row.id ?? ''),
      email: isSynthetic ? undefined : email,
      name: String(row.name ?? ''),
      role: String(row.role ?? 'student'),
      schoolId: row.school_id == null ? undefined : String(row.school_id),
      avatarUrl: row.avatar_url == null ? undefined : String(row.avatar_url),
      isActive: Boolean(row.is_active ?? 1),
      lastSeenAt: row.last_seen_at == null ? undefined : String(row.last_seen_at),
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? ''),
      publicId: row.public_id == null ? undefined : String(row.public_id),
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

