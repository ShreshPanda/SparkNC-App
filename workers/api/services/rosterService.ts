import { RosterRepository, type RosterRecord, type RosterEntryRecord } from '../repositories/RosterRepository';
import { InvitationRepository } from '../repositories/InvitationRepository';
import { AuditLogService } from './auditLogService';
import { parseCsv } from './csv';
import { assertNonEmpty, assertLength } from '../validators/baseValidator';

declare const crypto: Crypto;

export interface Caller {
  userId: string;
  role?: string;
  schoolId?: string;
}

export interface ImportRow {
  line: number;
  displayName: string;
  flags: string[];
  error?: string;
}

export interface ImportPreview {
  headers: string[];
  rows: ImportRow[];
  errors: { line: number; message: string }[];
  fatalError?: string;
  importId?: string;
  counts: { total: number; valid: number; duplicates: number; errors: number };
}

const NAME_HEADER = 'name';
const MAX_NAME = 120;

function normalize(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

// Stateless, server-verifiable import token: a SHA-256 hash over the exact
// validated payload plus roster, school, and caller identity. A commit is
// only idempotent when the recomputed hash matches — reusing the id with a
// modified CSV or different scope/person fails and writes nothing.
async function importDigest(input: { rosterId: string; schoolId: string; callerId: string; rows: { line: number; displayName: string }[] }): Promise<string> {
  const canonical = JSON.stringify({
    rosterId: input.rosterId,
    schoolId: input.schoolId,
    callerId: input.callerId,
    rows: input.rows.map((r) => [r.line, normalize(r.displayName)]),
  });
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical) as unknown as ArrayBuffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export class RosterService {
  constructor(
    private readonly rosters: RosterRepository,
    private readonly invitations: InvitationRepository,
    private readonly audit?: AuditLogService,
  ) {}

  // School scope: non-admin callers operate only inside their own school.
  // Caller-supplied schoolId is never trusted.
  private callerSchool(caller: Caller): string {
    if (caller.role === 'admin') {
      return caller.schoolId ?? '';
    }
    if (!caller.schoolId) {
      throw new Error('Forbidden: school assignment required');
    }
    return caller.schoolId;
  }

  private async scopedRoster(rosterId: string, caller: Caller): Promise<RosterRecord> {
    const roster = await this.rosters.getRoster(rosterId);
    if (!roster) throw new Error('Roster not found');
    if (caller.role !== 'admin' && roster.schoolId !== this.callerSchool(caller)) {
      throw new Error('Forbidden: outside school scope');
    }
    return roster;
  }

  private async scopedEntry(entryId: string, caller: Caller): Promise<RosterEntryRecord> {
    const entry = await this.rosters.getEntry(entryId);
    if (!entry) throw new Error('Roster entry not found');
    if (caller.role !== 'admin' && entry.schoolId !== this.callerSchool(caller)) {
      throw new Error('Forbidden: outside school scope');
    }
    return entry;
  }

  async createRoster(input: { name: string; schoolId?: string }, caller: Caller): Promise<RosterRecord> {
    assertNonEmpty(input.name, 'Roster name is required');
    assertLength(input.name, 'Roster name', 1, 120);
    // Admins may target an explicit school; everyone else is pinned to their own.
    const schoolId = caller.role === 'admin' && input.schoolId ? input.schoolId : this.callerSchool(caller);
    const roster = await this.rosters.createRoster({ schoolId, name: input.name.trim(), createdBy: caller.userId });
    await this.audit?.log(caller.userId, 'roster.create', 'roster', roster.id, { schoolId });
    return roster;
  }

  async listRosters(caller: Caller): Promise<RosterRecord[]> {
    const schoolId = caller.role === 'admin' && !caller.schoolId ? undefined : this.callerSchool(caller);
    return this.rosters.listRosters(schoolId || undefined);
  }

  async listEntries(rosterId: string, caller: Caller): Promise<RosterEntryRecord[]> {
    await this.scopedRoster(rosterId, caller);
    return this.rosters.listEntries(rosterId);
  }

  async addEntry(rosterId: string, input: { displayName: string }, caller: Caller): Promise<RosterEntryRecord> {
    const roster = await this.scopedRoster(rosterId, caller);
    const name = this.validateName(input.displayName);
    const entry = await this.rosters.createEntry({ rosterId: roster.id, schoolId: roster.schoolId, displayName: name });
    await this.audit?.log(caller.userId, 'roster.entry.create', 'roster_entry', entry.id, { rosterId: roster.id });
    return entry;
  }

  async updateEntry(entryId: string, input: { displayName?: string }, caller: Caller): Promise<RosterEntryRecord> {
    const entry = await this.scopedEntry(entryId, caller);
    if (entry.status !== 'pending') {
      throw new Error('Only pending entries can be modified');
    }
    if (input.displayName !== undefined) {
      const name = this.validateName(input.displayName);
      await this.rosters.updateEntryName(entry.id, name);
      await this.audit?.log(caller.userId, 'roster.entry.update', 'roster_entry', entry.id, {});
    }
    return { ...entry, displayName: input.displayName?.trim() ?? entry.displayName };
  }

  async revokeEntry(entryId: string, caller: Caller): Promise<void> {
    const entry = await this.scopedEntry(entryId, caller);
    if (entry.status !== 'pending') {
      throw new Error('Only pending entries can be revoked');
    }
    await this.rosters.setEntryStatus(entry.id, 'pending', 'revoked');
    const active = await this.invitations.listActiveForEntry(entry.id);
    for (const invite of active) {
      await this.invitations.revoke(invite.id);
    }
    await this.audit?.log(caller.userId, 'roster.entry.revoke', 'roster_entry', entry.id, { retiredInvitations: active.length });
  }

  private validateName(raw: string): string {
    const name = raw.trim().replace(/\s+/g, ' ');
    assertNonEmpty(name, 'Display name is required');
    assertLength(name, 'Display name', 1, MAX_NAME);
    return name;
  }

  // Preview only — nothing is written. Errors are fatal for the import;
  // duplicate names are flagged but legal (students may share names).
  async previewImport(rosterId: string, csvText: string, caller: Caller): Promise<ImportPreview> {
    const roster = await this.scopedRoster(rosterId, caller);
    const parsed = parseCsv(csvText);
    if (parsed.error) {
      return { headers: [], rows: [], errors: [], fatalError: parsed.error, counts: { total: 0, valid: 0, duplicates: 0, errors: 0 } };
    }

    const nameIdx = parsed.headers.findIndex((h) => h === NAME_HEADER || h === 'display_name' || h === 'student_name' || h === 'student');
    if (nameIdx === -1) {
      return {
        headers: parsed.headers,
        rows: [],
        errors: [],
        fatalError: 'Missing required column: name',
        counts: { total: 0, valid: 0, duplicates: 0, errors: 0 },
      };
    }

    const existing = new Set((await this.rosters.listEntries(rosterId)).filter((e) => e.status === 'pending').map((e) => normalize(e.displayName)));
    const seen = new Map<string, number>();
    const rows: ImportRow[] = [];
    const errors: { line: number; message: string }[] = [];

    for (const row of parsed.rows) {
      const raw = row.cells[nameIdx] ?? '';
      const flags: string[] = [];
      let error: string | undefined;
      let displayName = '';
      try {
        displayName = this.validateName(raw);
      } catch (err) {
        error = err instanceof Error ? err.message : 'Invalid name';
      }
      if (!error) {
        const key = normalize(displayName);
        if (seen.has(key)) {
          flags.push(`duplicate of row ${seen.get(key)}`);
        }
        if (existing.has(key)) {
          flags.push('matches an existing roster entry');
        }
        seen.set(key, row.line);
      }
      if (error) errors.push({ line: row.line, message: error });
      rows.push({ line: row.line, displayName, flags, error });
    }

    const duplicates = rows.filter((r) => r.flags.length > 0).length;
    return {
      headers: parsed.headers,
      rows,
      errors,
      // Server-verifiable import token: binds this exact validated payload
      // to roster, school, and caller. Echoed back on commit.
      importId: `import-${await importDigest({ rosterId: roster.id, schoolId: roster.schoolId, callerId: caller.userId, rows })}`,
      counts: { total: rows.length, valid: rows.length - errors.length, duplicates, errors: errors.length },
    };
  }

  // Atomic import: revalidates the full CSV at commit time (secure
  // revalidation — a stale preview can never inject rows), aborts on any
  // row error, then writes all entries in one D1 batch. Entry ids are
  // deterministic per importId so repeated commits cannot duplicate rows.
  // The audit event is written only after the batch succeeds.
  async commitImport(rosterId: string, input: { csv: string; importId: string }, caller: Caller): Promise<{ imported: number; duplicates: number }> {
    const roster = await this.scopedRoster(rosterId, caller);
    assertNonEmpty(input.importId, 'importId is required');
    assertLength(input.importId, 'importId', 1, 80);

    const preview = await this.previewImport(rosterId, input.csv, caller);
    if (preview.fatalError) throw new Error(preview.fatalError);
    if (preview.errors.length > 0) {
      throw new Error(`Import aborted: ${preview.errors.length} invalid row(s)`);
    }
    if (preview.rows.length === 0) {
      throw new Error('Import aborted: no rows to import');
    }
    // The supplied id must equal the digest of this exact payload for this
    // caller/roster — anything else is a conflict and writes nothing.
    if (input.importId !== preview.importId) {
      throw new Error('Import conflict: importId does not match the validated preview for this payload and scope');
    }

    const safeImportId = input.importId.slice(0, 90);
    const inputs = preview.rows.map((row) => ({
      id: `entry-${roster.id}-${safeImportId}-${row.line}`,
      rosterId: roster.id,
      schoolId: roster.schoolId,
      displayName: row.displayName,
    }));

    await this.rosters.createEntries(inputs);

    await this.audit?.log(caller.userId, 'roster.import', 'roster', roster.id, {
      imported: inputs.length,
      duplicates: preview.counts.duplicates,
    });
    return { imported: inputs.length, duplicates: preview.counts.duplicates };
  }
}
