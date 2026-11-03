import { InvitationRepository, type InvitationRecord } from '../repositories/InvitationRepository';
import { RosterRepository } from '../repositories/RosterRepository';
import { AuditLogService } from './auditLogService';
import type { Caller } from './rosterService';

declare const crypto: Crypto;

const DEFAULT_INDIVIDUAL_DAYS = 7;
const DEFAULT_LINK_DAYS = 30;
const MAX_DAYS = 90;
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // no ambiguous chars

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function randomToken(): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

function randomClaimCode(length = 10): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = '';
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return out;
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text) as unknown as ArrayBuffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function expiry(days: number): string {
  const bounded = Math.min(Math.max(1, days), MAX_DAYS);
  return new Date(Date.now() + bounded * 86400000).toISOString();
}

export class InvitationService {
  constructor(
    private readonly invitations: InvitationRepository,
    private readonly rosters: RosterRepository,
    private readonly audit?: AuditLogService,
  ) {}

  private callerSchool(caller: Caller): string {
    if (caller.role === 'admin') return caller.schoolId ?? '';
    if (!caller.schoolId) throw new Error('Forbidden: school assignment required');
    return caller.schoolId;
  }

  private async scopedInvitation(id: string, caller: Caller): Promise<InvitationRecord> {
    const invite = await this.invitations.getById(id);
    if (!invite) throw new Error('Invitation not found');
    if (caller.role !== 'admin' && invite.schoolId !== this.callerSchool(caller)) {
      throw new Error('Forbidden: outside school scope');
    }
    return invite;
  }

  // Issue an individual invitation bound to one pending roster entry.
  // Any prior active invitations for the entry are retired first; the raw
  // token is returned once and never stored.
  async issueIndividual(entryId: string, caller: Caller, expiresInDays = DEFAULT_INDIVIDUAL_DAYS): Promise<{ token: string; expiresAt: string }> {
    const entry = await this.rosters.getEntry(entryId);
    if (!entry) throw new Error('Roster entry not found');
    if (caller.role !== 'admin' && entry.schoolId !== this.callerSchool(caller)) {
      throw new Error('Forbidden: outside school scope');
    }
    if (entry.status !== 'pending') {
      throw new Error('Only pending entries can receive invitations');
    }

    const active = await this.invitations.listActiveForEntry(entry.id);
    for (const invite of active) {
      await this.invitations.revoke(invite.id);
      await this.audit?.log(caller.userId, 'invitation.retire', 'invitation', invite.id, { reason: 'reissue' });
    }

    const token = randomToken();
    const record = await this.invitations.create({
      rosterEntryId: entry.id,
      schoolId: entry.schoolId,
      kind: 'individual',
      tokenHash: await sha256Hex(token),
      createdBy: caller.userId,
      expiresAt: expiry(expiresInDays),
    });
    await this.audit?.log(caller.userId, 'invitation.issue', 'invitation', record.id, { kind: 'individual', retired: active.length });
    return { token, expiresAt: record.expiresAt };
  }

  // Issue a school-wide link: a revocable, expiring gateway only — it never
  // identifies or authorizes a student; an individual roster claim code is
  // still required at claim time.
  async issueSchoolLink(caller: Caller, schoolId?: string, expiresInDays = DEFAULT_LINK_DAYS): Promise<{ token: string; expiresAt: string }> {
    const targetSchool = caller.role === 'admin' && schoolId ? schoolId : this.callerSchool(caller);
    const token = randomToken();
    const record = await this.invitations.create({
      schoolId: targetSchool,
      kind: 'school_link',
      tokenHash: await sha256Hex(token),
      createdBy: caller.userId,
      expiresAt: expiry(expiresInDays),
    });
    await this.audit?.log(caller.userId, 'invitation.issue', 'invitation', record.id, { kind: 'school_link' });
    return { token, expiresAt: record.expiresAt };
  }

  // Issue a human-readable roster claim code for one entry. Hash-only
  // storage; the raw code is returned once.
  async issueClaimCode(entryId: string, caller: Caller): Promise<{ claimCode: string }> {
    const entry = await this.rosters.getEntry(entryId);
    if (!entry) throw new Error('Roster entry not found');
    if (caller.role !== 'admin' && entry.schoolId !== this.callerSchool(caller)) {
      throw new Error('Forbidden: outside school scope');
    }
    if (entry.status !== 'pending') {
      throw new Error('Only pending entries can receive claim codes');
    }
    const claimCode = randomClaimCode();
    await this.rosters.setClaimCodeHash(entry.id, await sha256Hex(claimCode));
    await this.audit?.log(caller.userId, 'entry.claim_code.issue', 'roster_entry', entry.id, {});
    return { claimCode };
  }

  async revoke(id: string, caller: Caller): Promise<void> {
    const invite = await this.scopedInvitation(id, caller);
    if (invite.claimedAt || invite.revokedAt) return;
    await this.invitations.revoke(invite.id);
    await this.audit?.log(caller.userId, 'invitation.revoke', 'invitation', invite.id, { kind: invite.kind });
  }

  async list(caller: Caller): Promise<InvitationRecord[]> {
    const schoolId = caller.role === 'admin' && !caller.schoolId ? undefined : this.callerSchool(caller);
    if (!schoolId) return this.invitations.listBySchool('');
    return this.invitations.listBySchool(schoolId);
  }
}
