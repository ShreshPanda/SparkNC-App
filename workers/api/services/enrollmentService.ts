import { EnrollmentRepository, EnrollmentFailure, isTransientD1Error } from '../repositories/EnrollmentRepository';

declare const crypto: Crypto; // Cloudflare Workers global

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days — matches authService
const GRANT_TTL_MS = 1000 * 60 * 10; // 10 minutes, single use

const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

const PUBLIC_ID_PREFIX = 'stu_';
const PUBLIC_ID_LENGTH = 16; // base62 → ~95 bits of entropy
const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const STUDENT_EMAIL_DOMAIN = 'students.sparknc.internal';

const CLAIM_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const CLAIM_CODE_PATTERN = new RegExp(`^[${CLAIM_CODE_ALPHABET}]{10}$`);

const PHRASE_MIN_LENGTH = 12;
const PHRASE_MAX_LENGTH = 128;
const PHRASE_MIN_SEGMENTS = 3;

function textToBuffer(text: string): ArrayBuffer {
  const bytes = new TextEncoder().encode(text);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', textToBuffer(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function randomBase64Url(byteLength: number): string {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

// Unbiased base62: reject bytes >= 62*4 so modulo does not skew.
function generatePublicId(): string {
  const limit = 62 * 4;
  let out = '';
  while (out.length < PUBLIC_ID_LENGTH) {
    const bytes = crypto.getRandomValues(new Uint8Array(PUBLIC_ID_LENGTH * 2));
    for (const b of bytes) {
      if (b < limit) out += BASE62[b % 62];
      if (out.length === PUBLIC_ID_LENGTH) break;
    }
  }
  return `${PUBLIC_ID_PREFIX}${out}`;
}

// Internal-only synthetic email satisfying users.email NOT NULL UNIQUE.
// Never returned to students; all student-facing surfaces use public_id.
function syntheticEmail(publicId: string): string {
  return `${publicId}@${STUDENT_EMAIL_DOMAIN}`;
}

// Canonical claim-code form: uppercase, whitespace/hyphens stripped.
function normalizeClaimCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s-]/g, '');
}

// Access-phrase normalization: Unicode NFKC, trim, collapse all internal
// whitespace to single spaces. The normalized form is what gets hashed.
export function normalizeAccessPhrase(raw: string): string {
  return raw.normalize('NFKC').trim().replace(/\s+/g, ' ');
}

export function validateAccessPhrase(phrase: string): void {
  if (phrase.length < PHRASE_MIN_LENGTH || phrase.length > PHRASE_MAX_LENGTH) {
    throw new Error('Access phrase does not meet requirements');
  }
  if (phrase.split(' ').length < PHRASE_MIN_SEGMENTS) {
    throw new Error('Access phrase does not meet requirements');
  }
  if (/^\d+$/.test(phrase.replace(/\s/g, ''))) {
    throw new Error('Access phrase does not meet requirements');
  }
}

export async function hashAccessPhrase(normalized: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', textToBuffer(normalized), { name: 'PBKDF2' }, false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: bytesToBuffer(base64UrlToBytes(salt)), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    KEY_BITS,
  );
  return `pbkdf2:${PBKDF2_ITERATIONS}:${bytesToBase64Url(new Uint8Array(bits))}`;
}

export interface ResolvedInvitation {
  kind: 'individual' | 'school_link';
  expiresAt: string;
}

export interface VerifiedIdentity {
  grantToken: string;
  displayName: string;
  schoolName: string;
}

export interface ClaimResult {
  publicId: string;
  displayName: string;
  schoolName: string;
  sessionId: string;
  sessionExpiresAt: string;
}

export class EnrollmentService {
  constructor(private readonly enrollment: EnrollmentRepository) {}

  // Step 1 — resolve only. Returns the claim mechanism, never identity data.
  async resolveInvitation(token: string): Promise<ResolvedInvitation> {
    if (!token || token.length > 256) throw new Error('Invalid invitation');
    const now = new Date().toISOString();
    const invite = await this.enrollment.findActiveInvitationByTokenHash(await sha256Hex(token), now);
    if (!invite) throw new Error('Invalid invitation');
    return { kind: invite.kind, expiresAt: invite.expiresAt };
  }

  // Step 2 — verify the claim code and issue a bound verification grant.
  // All checks (invitation validity, pending entry, code hash, school
  // equality, kind binding, ≤20 active-grant cap) run inside the SQL of a
  // single batch; the roster name is disclosed only after success.
  async verifyClaimCode(token: string, claimCode: string): Promise<VerifiedIdentity> {
    const now = new Date().toISOString();
    const tokenHash = await sha256Hex(token);
    const invite = await this.enrollment.findActiveInvitationByTokenHash(tokenHash, now);
    if (!invite) throw new Error('Invalid code');

    const normalized = normalizeClaimCode(claimCode);
    if (!CLAIM_CODE_PATTERN.test(normalized)) throw new Error('Invalid code');
    const claimCodeHash = await sha256Hex(normalized);
    return this.issueGrant(invite.id, claimCodeHash, now);
  }

  // The candidate entry is resolved inside the issuance SQL: the join
  // matches claim_code_hash, and for individual invitations the binding
  // i.roster_entry_id = e.id additionally pins it to the bound entry.
  private async issueGrant(invitationId: string, claimCodeHash: string, now: string): Promise<VerifiedIdentity> {
    const grantToken = randomBase64Url(32);
    const grantId = `grant-${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + GRANT_TTL_MS).toISOString();
    try {
      await this.enrollment.issueVerificationGrant({
        grantId,
        tokenHash: await sha256Hex(grantToken),
        invitationId,
        claimCodeHash,
        expiresAt,
        now,
      });
    } catch (error) {
      if (error instanceof EnrollmentFailure) throw error;
      if (isTransientD1Error(error)) throw new EnrollmentFailure('RETRY_LATER');
      // Batch aborted: invalid code/state or cap reached — uniform error.
      throw new Error('Invalid code');
    }
    const identity = await this.enrollment.findGrantIdentity(grantId);
    if (!identity) throw new Error('Invalid code');
    return { grantToken, displayName: identity.displayName, schoolName: identity.schoolName };
  }

  // Step 3 — confirm identity and atomically claim. The opaque grant token
  // is the only client input; entry/user/school all come from the grant.
  async claim(grantToken: string, accessPhrase: string): Promise<ClaimResult> {
    if (!grantToken || grantToken.length > 256) throw new Error('Invalid grant');
    const normalized = normalizeAccessPhrase(accessPhrase);
    validateAccessPhrase(normalized);

    const grant = await this.enrollment.findGrantIdentityByTokenHash(await sha256Hex(grantToken));
    const now = new Date().toISOString();
    if (!grant || grant.usedAt || grant.expiresAt <= now) throw new Error('Invalid grant');

    const publicId = generatePublicId();
    const salt = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(SALT_BYTES)));
    const passwordHash = await hashAccessPhrase(normalized, salt);
    const sessionExpiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    const sessionId = `sess-${crypto.randomUUID()}`;

    try {
      await this.enrollment.claim({
        grantId: grant.id,
        attemptNonce: crypto.randomUUID(),
        entryId: grant.rosterEntryId,
        invitationId: grant.invitationId,
        userId: `user-${crypto.randomUUID()}`,
        publicId,
        syntheticEmail: syntheticEmail(publicId),
        displayName: grant.displayName,
        schoolId: grant.schoolId,
        passwordHash,
        passwordSalt: salt,
        sessionId,
        sessionExpiresAt,
        auditId: `audit-${crypto.randomUUID()}`,
        auditMetadata: JSON.stringify({ schoolId: grant.schoolId }),
        now,
      });
    } catch (error) {
      if (isTransientD1Error(error)) throw new EnrollmentFailure('RETRY_LATER');
      // Any batch failure (replay, claimed entry, expired invitation,
      // collision) rolls back everything — no user, session, or audit.
      throw new Error('Claim could not be completed');
    }

    return { publicId, displayName: grant.displayName, schoolName: grant.schoolName, sessionId, sessionExpiresAt };
  }
}
