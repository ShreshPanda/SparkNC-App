import { cloudflareService } from './cloudflareService';
import type { ClaimEnrollmentPayload, ResolveInvitationPayload, VerifyClaimCodePayload } from './cloudflareService';

// Client-side mirror of the server access-phrase policy (12–128 chars,
// at least 3 word-like segments, not all digits). The server still
// validates authoritatively — this only short-circuits obvious failures.
const PHRASE_MIN = 12;
const PHRASE_MAX = 128;

export interface PhraseCheck {
  valid: boolean;
  message?: string;
}

export function normalizePhrase(raw: string): string {
  return raw.normalize('NFKC').trim().replace(/\s+/g, ' ');
}

export function checkAccessPhrase(raw: string): PhraseCheck {
  const normalized = normalizePhrase(raw);
  if (normalized.length < PHRASE_MIN) {
    return { valid: false, message: 'Access phrase must be at least 12 characters' };
  }
  if (normalized.length > PHRASE_MAX) {
    return { valid: false, message: 'Access phrase must be at most 128 characters' };
  }
  if (normalized.split(' ').length < 3) {
    return { valid: false, message: 'Use at least three words for your access phrase' };
  }
  if (/^\d+$/.test(normalized.replace(/\s/g, ''))) {
    return { valid: false, message: 'Access phrase cannot be only numbers' };
  }
  return { valid: true };
}

export function mapEnrollmentError(err: unknown, fallback: string): string {
  const code = (err as { code?: string }).code;
  switch (code) {
    case 'INVALID_INVITATION':
      return 'This invitation link is invalid, expired, or already used. Ask your lab leader for a new one.';
    case 'INVALID_CODE':
      return 'That claim code does not match this invitation. Check the code and try again.';
    case 'CLAIM_FAILED':
      return 'Enrollment could not be completed. Your invitation may have been used or revoked.';
    case 'CAP_EXCEEDED':
      return 'Too many enrollment attempts are in progress. Try again in a minute.';
    case 'RETRY_LATER':
    case 'RATE_LIMIT':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'PHRASE_POLICY':
      return 'That access phrase does not meet the requirements. Use at least 12 characters and 3 words.';
    case 'INVALID_RESET':
      return 'This reset link is invalid, expired, or already used. Ask your lab leader for a new reset.';
    case 'INVALID_CREDENTIALS':
      return 'Invalid student ID or access phrase';
    default:
      return err instanceof Error && !(err as { code?: string }).code ? fallback : fallback;
  }
}

export const enrollmentService = {
  async resolveInvitation(token: string): Promise<ResolveInvitationPayload> {
    return cloudflareService.resolveInvitation(token.trim());
  },

  async verifyClaimCode(token: string, claimCode: string): Promise<VerifyClaimCodePayload> {
    return cloudflareService.verifyClaimCode(token.trim(), claimCode.trim());
  },

  async claim(grantToken: string, accessPhrase: string): Promise<ClaimEnrollmentPayload> {
    return cloudflareService.claimEnrollment(grantToken, normalizePhrase(accessPhrase));
  },

  async completeReset(resetToken: string, accessPhrase: string): Promise<void> {
    await cloudflareService.completeAccessReset(resetToken.trim(), normalizePhrase(accessPhrase));
  },
};
