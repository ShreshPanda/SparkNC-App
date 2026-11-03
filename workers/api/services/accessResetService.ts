import { AccessResetRepository } from '../repositories/AccessResetRepository';
import { hashAccessPhrase, normalizeAccessPhrase, randomBase64Url, sha256Hex, validateAccessPhrase } from './enrollmentService';
import type { Caller } from './rosterService';

declare const crypto: Crypto;

const RESET_TTL_MS = 1000 * 60 * 60; // 60 minutes, single use

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

export class AccessResetService {
  constructor(private readonly resets: AccessResetRepository) {}

  // Staff-initiated reset. Permission ('students.reset_access') is enforced
  // at the route; school scope is enforced here: non-admin callers may only
  // reset students in their own school. The raw token is returned once and
  // only its SHA-256 hash is stored. The staff member never sees or sets
  // the student's new phrase.
  async initiate(targetUserId: string, caller: Caller): Promise<{ resetToken: string; expiresAt: string }> {
    const target = await this.resets.findResetTarget(targetUserId);
    if (!target || target.role !== 'student' || !target.isActive) {
      throw new Error('Reset target is not an active student');
    }
    if (caller.role !== 'admin') {
      if (!caller.schoolId || target.schoolId !== caller.schoolId) {
        throw new Error('Forbidden: outside school scope');
      }
    }

    const resetToken = randomBase64Url(32);
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString();
    await this.resets.issueRequest({
      requestId: `reset-${crypto.randomUUID()}`,
      userId: target.id,
      schoolId: target.schoolId ?? '',
      requestedBy: caller.userId,
      callerRole: caller.role ?? '',
      callerSchoolId: caller.schoolId ?? '',
      tokenHash: await sha256Hex(resetToken),
      expiresAt,
      auditId: `audit-${crypto.randomUUID()}`,
      now,
    });
    return { resetToken, expiresAt };
  }

  // Public completion: token + new access phrase. Everything (token
  // consumability, user validity, role, school, active status) is enforced
  // inside the atomic batch; failures roll back with nothing changed.
  async complete(token: string, accessPhrase: string): Promise<void> {
    if (!token || token.length > 256) throw new Error('Invalid or expired reset link');
    const normalized = normalizeAccessPhrase(accessPhrase);
    validateAccessPhrase(normalized); // throws 'Access phrase does not meet requirements'

    const tokenHash = await sha256Hex(token);
    const request = await this.resets.findRequestByTokenHash(tokenHash);
    if (!request) throw new Error('Invalid or expired reset link');

    const salt = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)));
    const passwordHash = await hashAccessPhrase(normalized, salt);
    const now = new Date().toISOString();

    try {
      await this.resets.completeReset({
        tokenHash,
        nonce: crypto.randomUUID(),
        userId: request.userId,
        schoolId: request.schoolId,
        passwordHash,
        passwordSalt: salt,
        auditId: `audit-${crypto.randomUUID()}`,
        now,
      });
    } catch {
      // Consumed/expired/revoked token or invalid target — whole batch
      // rolled back; report nothing specific.
      throw new Error('Invalid or expired reset link');
    }
  }
}
