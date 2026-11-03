import { RosterRepository } from "../api/repositories/RosterRepository";
import { describe, it, expect, vi } from 'vitest';
import { RosterService } from '../api/services/rosterService';
import { InvitationService } from '../api/services/invitationService';
import { parseCsv } from '../api/services/csv';
import { registerController } from '../api/controllers/auth';

const lead = { userId: 'u-lead', role: 'lab_leader', schoolId: 'school-1' };
const otherLead = { userId: 'u-lead2', role: 'lab_leader', schoolId: 'school-2' };
const admin = { userId: 'u-admin', role: 'admin', schoolId: undefined };

function rosterRepo(entries: Record<string, unknown>[] = [], rosters: Record<string, unknown>[] = []) {
  return {
    getRoster: vi.fn(async (id: string) => rosters.find((r) => r.id === id) ?? null),
    getEntry: vi.fn(async (id: string) => entries.find((e) => e.id === id) ?? null),
    listRosters: vi.fn(async () => rosters),
    listEntries: vi.fn(async () => entries),
    createRoster: vi.fn(async (input: Record<string, unknown>) => ({ id: 'roster-1', createdAt: 't', ...input })),
    createEntry: vi.fn(async (input: Record<string, unknown>) => ({ id: `entry-${Math.random()}`, status: 'pending', hasClaimCode: false, createdAt: 't', ...input })),
    updateEntryName: vi.fn(async () => undefined),
    setEntryStatus: vi.fn(async () => true),
    setClaimCodeHash: vi.fn(async () => undefined),
    findEntryByClaimCodeHash: vi.fn(async () => null),
    deleteEntries: vi.fn(async () => undefined),
    createEntries: vi.fn(async (inputs: Record<string, unknown>[]) => inputs.map((i) => ({ status: 'pending', hasClaimCode: false, createdAt: 't', ...i }))),
  };
}

function inviteRepo(active: Record<string, unknown>[] = []) {
  return {
    getById: vi.fn(async (id: string) => active.find((i) => i.id === id) ?? null),
    listBySchool: vi.fn(async () => active),
    listActiveForEntry: vi.fn(async () => active),
    create: vi.fn(async (input: Record<string, unknown>) => ({ id: 'inv-1', createdAt: 't', ...input })),
    revoke: vi.fn(async () => undefined),
  };
}

describe('RosterService school scope', () => {
  const roster = { id: 'roster-1', schoolId: 'school-1', name: 'R', createdBy: 'u-lead', createdAt: 't' };

  it('creates a roster pinned to the caller school, ignoring input schoolId', async () => {
    const repo = rosterRepo();
    const service = new RosterService(repo as never, inviteRepo() as never);
    await service.createRoster({ name: 'Fall', schoolId: 'school-2' }, lead);
    expect(repo.createRoster).toHaveBeenCalledWith(expect.objectContaining({ schoolId: 'school-1', createdBy: 'u-lead' }));
  });

  it('denies a lab leader operating on another school\u2019s roster', async () => {
    const service = new RosterService(rosterRepo([], [roster]) as never, inviteRepo() as never);
    await expect(service.listEntries('roster-1', otherLead)).rejects.toThrow(/scope/i);
    await expect(service.addEntry('roster-1', { displayName: 'Ava' }, otherLead)).rejects.toThrow(/scope/i);
  });

  it('denies staff with no school assignment', async () => {
    const service = new RosterService(rosterRepo([], [roster]) as never, inviteRepo() as never);
    await expect(service.createRoster({ name: 'X' }, { userId: 'x', role: 'lab_leader' })).rejects.toThrow(/school assignment/i);
  });

  it('allows admin to target an explicit school', async () => {
    const repo = rosterRepo();
    const service = new RosterService(repo as never, inviteRepo() as never);
    await service.createRoster({ name: 'Fall', schoolId: 'school-2' }, admin);
    expect(repo.createRoster).toHaveBeenCalledWith(expect.objectContaining({ schoolId: 'school-2' }));
  });

  it('blocks updates/revokes on claimed entries', async () => {
    const claimed = { id: 'e1', rosterId: 'roster-1', schoolId: 'school-1', displayName: 'Ava', status: 'claimed' };
    const service = new RosterService(rosterRepo([claimed]) as never, inviteRepo() as never);
    await expect(service.updateEntry('e1', { displayName: 'X' }, lead)).rejects.toThrow(/pending/i);
    await expect(service.revokeEntry('e1', lead)).rejects.toThrow(/pending/i);
  });

  it('revoking a pending entry retires its active invitations', async () => {
    const entry = { id: 'e1', rosterId: 'roster-1', schoolId: 'school-1', displayName: 'Ava', status: 'pending' };
    const invites = inviteRepo([{ id: 'inv-1', rosterEntryId: 'e1', schoolId: 'school-1' }]);
    const service = new RosterService(rosterRepo([entry]) as never, invites as never);
    await service.revokeEntry('e1', lead);
    expect(invites.revoke).toHaveBeenCalledWith('inv-1');
  });
});

describe('CSV import', () => {
  it('parses headers, quoted fields, and trims cells', () => {
    const parsed = parseCsv('name\n" Ava  L. "\nBob\n');
    expect(parsed.error).toBeUndefined();
    expect(parsed.rows.map((r) => r.cells[0])).toEqual(['Ava L.', 'Bob']);
  });

  it('rejects missing required column', async () => {
    const roster = { id: 'roster-1', schoolId: 'school-1', name: 'R', createdBy: 'u', createdAt: 't' };
    const service = new RosterService(rosterRepo([], [roster]) as never, inviteRepo() as never);
    const preview = await service.previewImport('roster-1', 'age,grade\n9,4\n', lead);
    expect(preview.fatalError).toMatch(/name/i);
  });

  it('flags duplicates without blocking them', async () => {
    const roster = { id: 'roster-1', schoolId: 'school-1', name: 'R', createdBy: 'u', createdAt: 't' };
    const existing = { id: 'e0', rosterId: 'roster-1', schoolId: 'school-1', displayName: 'Ava L', status: 'pending' };
    const service = new RosterService(rosterRepo([existing], [roster]) as never, inviteRepo() as never);
    const preview = await service.previewImport('roster-1', 'name\nAva L\nava   l\nSam\n', lead);
    expect(preview.errors).toHaveLength(0);
    expect(preview.counts.duplicates).toBe(2);
    // duplicates are legal — commit proceeds
    const repo = rosterRepo([], [roster]);
    const svc = new RosterService(repo as never, inviteRepo() as never);
    const { importId } = await svc.previewImport('roster-1', 'name\nAva L\nava l\nSam\n', lead);
    const result = await svc.commitImport('roster-1', { csv: 'name\nAva L\nava l\nSam\n', importId: importId! }, lead);
    expect(result.imported).toBe(3);
  });

  it('aborts the whole import on any row error (no partial imports)', async () => {
    const roster = { id: 'roster-1', schoolId: 'school-1', name: 'R', createdBy: 'u', createdAt: 't' };
    const repo = rosterRepo([], [roster]);
    const service = new RosterService(repo as never, inviteRepo() as never);
    await expect(service.commitImport('roster-1', { csv: 'name\nAva\n,\n', importId: 'import-1' }, lead)).rejects.toThrow(/aborted|invalid|conflict/i);
  });
});

describe('InvitationService', () => {
  const entry = { id: 'e1', rosterId: 'r1', schoolId: 'school-1', displayName: 'Ava', status: 'pending' };

  it('issues individual invitations with hash-only storage and one-time raw token', async () => {
    const invites = inviteRepo();
    const service = new InvitationService(invites as never, rosterRepo([entry]) as never);
    const { token } = await service.issueIndividual('e1', lead);
    expect(token.length).toBeGreaterThan(30);
    const created = invites.create.mock.calls[0][0] as { tokenHash: string; kind: string; rosterEntryId: string };
    expect(created.kind).toBe('individual');
    expect(created.rosterEntryId).toBe('e1');
    expect(created.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(created.tokenHash).not.toBe(token);
  });

  it('generates unique tokens across issuances', async () => {
    const service = new InvitationService(inviteRepo() as never, rosterRepo([entry]) as never);
    const a = await service.issueIndividual('e1', lead);
    const b = await service.issueIndividual('e1', lead);
    expect(a.token).not.toBe(b.token);
  });

  it('retires prior active invitations on reissue', async () => {
    const invites = inviteRepo([{ id: 'inv-old', rosterEntryId: 'e1', schoolId: 'school-1' }]);
    const service = new InvitationService(invites as never, rosterRepo([entry]) as never);
    await service.issueIndividual('e1', lead);
    expect(invites.revoke).toHaveBeenCalledWith('inv-old');
  });

  it('denies invitations for claimed entries or foreign schools', async () => {
    const service = new InvitationService(inviteRepo() as never, rosterRepo([{ ...entry, status: 'claimed' }]) as never);
    await expect(service.issueIndividual('e1', lead)).rejects.toThrow(/pending/i);
    const service2 = new InvitationService(inviteRepo() as never, rosterRepo([entry]) as never);
    await expect(service2.issueIndividual('e1', otherLead)).rejects.toThrow(/scope/i);
  });

  it('issues school links bound to caller school with no entry binding', async () => {
    const invites = inviteRepo();
    const service = new InvitationService(invites as never, rosterRepo() as never);
    const { token } = await service.issueSchoolLink(lead);
    expect(token.length).toBeGreaterThan(30);
    const created = invites.create.mock.calls[0][0] as { kind: string; schoolId: string; rosterEntryId?: string };
    expect(created.kind).toBe('school_link');
    expect(created.schoolId).toBe('school-1');
    expect(created.rosterEntryId).toBeUndefined();
  });

  it('issues claim codes with hash-only storage', async () => {
    const rosters = rosterRepo([entry]);
    const service = new InvitationService(inviteRepo() as never, rosters as never);
    const { claimCode } = await service.issueClaimCode('e1', lead);
    expect(claimCode).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{10}$/);
    const stored = String((rosters.setClaimCodeHash.mock.calls[0] as unknown[])[1]);
    expect(stored).toMatch(/^[0-9a-f]{64}$/);
    expect(stored).not.toBe(claimCode);
  });

  it('denies revoking a foreign-school invitation', async () => {
    const invites = inviteRepo([{ id: 'inv-9', schoolId: 'school-1' }]);
    const service = new InvitationService(invites as never, rosterRepo() as never);
    await expect(service.revoke('inv-9', otherLead)).rejects.toThrow(/scope/i);
  });
});

describe('audit trail', () => {
  it('logs actions without secrets', async () => {
    const audit = { log: vi.fn(async () => undefined) };
    const entry = { id: 'e1', rosterId: 'r1', schoolId: 'school-1', displayName: 'Ava', status: 'pending' };
    const service = new InvitationService(inviteRepo() as never, rosterRepo([entry]) as never, audit as never);
    const { token } = await service.issueIndividual('e1', lead);
    for (const call of audit.log.mock.calls) {
      expect(JSON.stringify(call)).not.toContain(token);
    }
    expect(audit.log).toHaveBeenCalledWith('u-lead', 'invitation.issue', 'invitation', 'inv-1', expect.anything());
  });
});

describe('registration remains disabled', () => {
  it('POST /auth/register still returns 403 INVITE_REQUIRED', async () => {
    const res = await registerController({ email: 'a@b.co', password: 'password123', name: 'N' }, { env: { DB: {} } });
    expect((res as Response).status).toBe(403);
  });
});

describe('atomic D1 batch import', () => {
  const roster = { id: 'roster-1', schoolId: 'school-1', name: 'R', createdBy: 'u', createdAt: 't' };

  function fakeDb(batchImpl?: (stmts: unknown[]) => Promise<unknown>) {
    const bound: { sql: string; params: unknown[]; run: () => Promise<unknown>; all: () => Promise<unknown> }[] = [];
    const db = {
      prepare: (sql: string) => ({
        bind: (...params: unknown[]) => {
          const stmt = { sql, params, run: async () => ({ meta: { changes: 1 } }), all: async () => ({ results: [] }) };
          bound.push(stmt);
          return stmt;
        },
      }),
      batch: batchImpl ?? vi.fn(async () => []),
    };
    return { db, bound };
  }

  it('inserts all entries in one atomic batch', async () => {
    const { db, bound } = fakeDb();
    const repo = new RosterRepository(db as never);
    const inputs = [
      { id: 'entry-r-i-2', rosterId: 'roster-1', schoolId: 'school-1', displayName: 'A' },
      { id: 'entry-r-i-3', rosterId: 'roster-1', schoolId: 'school-1', displayName: 'B' },
    ];
    await repo.createEntries(inputs);
    expect(db.batch).toHaveBeenCalledTimes(1);
    expect((db.batch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toHaveLength(2);
    expect(bound.every((s) => s.sql.startsWith('INSERT OR IGNORE'))).toBe(true);
  });

  it('fails the whole import when the batch throws — nothing written', async () => {
    const { db } = fakeDb(vi.fn(async () => { throw new Error('batch failed'); }));
    const repo = new RosterRepository(db as never);
    await expect(
      repo.createEntries([{ id: 'e1', rosterId: 'roster-1', schoolId: 'school-1', displayName: 'A' }]),
    ).rejects.toThrow(/batch failed/i);
    // no statement was ever executed outside the failed batch
    expect(db.batch).toHaveBeenCalledTimes(1);
  });

  it('produces deterministic entry ids so a retried commit cannot duplicate', async () => {
    const rosters = {
      getRoster: vi.fn(async () => roster),
      listEntries: vi.fn(async () => []),
      createEntries: vi.fn(async (inputs: { id: string }[]) => inputs),
    };
    const service = new RosterService(rosters as never, inviteRepo() as never);
    const csv = 'name\nAva\nSam\n';
    const { importId } = await service.previewImport('roster-1', csv, lead);
    await service.commitImport('roster-1', { csv, importId: importId! }, lead);
    const firstIds = (rosters.createEntries.mock.calls[0][0] as { id: string }[]).map((r) => r.id);
    await service.commitImport('roster-1', { csv, importId: importId! }, lead);
    const secondIds = (rosters.createEntries.mock.calls[1][0] as { id: string }[]).map((r) => r.id);
    expect(secondIds).toEqual(firstIds);
  });

  it('rejects the same importId with a modified payload and writes nothing', async () => {
    const rosters = {
      getRoster: vi.fn(async () => roster),
      listEntries: vi.fn(async () => []),
      createEntries: vi.fn(async (inputs: { id: string }[]) => inputs),
    };
    const service = new RosterService(rosters as never, inviteRepo() as never);
    const { importId } = await service.previewImport('roster-1', 'name\nAva\n', lead);
    await expect(service.commitImport('roster-1', { csv: 'name\nEve\n', importId: importId! }, lead)).rejects.toThrow(/conflict|match/i);
    expect(rosters.createEntries).not.toHaveBeenCalled();
  });

  it('rejects an importId bound to a different roster', async () => {
    const rosters = {
      getRoster: vi.fn(async (id: string) => ({ ...roster, id })),
      listEntries: vi.fn(async () => []),
      createEntries: vi.fn(async (inputs: { id: string }[]) => inputs),
    };
    const service = new RosterService(rosters as never, inviteRepo() as never);
    const { importId } = await service.previewImport('roster-1', 'name\nAva\n', lead);
    await expect(service.commitImport('roster-2', { csv: 'name\nAva\n', importId: importId! }, lead)).rejects.toThrow(/conflict|match/i);
    expect(rosters.createEntries).not.toHaveBeenCalled();
  });

  it('rejects an importId issued to a different caller', async () => {
    const rosters = {
      getRoster: vi.fn(async () => roster),
      listEntries: vi.fn(async () => []),
      createEntries: vi.fn(async (inputs: { id: string }[]) => inputs),
    };
    const service = new RosterService(rosters as never, inviteRepo() as never);
    const { importId } = await service.previewImport('roster-1', 'name\nAva\n', lead);
    const otherCaller = { userId: 'u-lead2', role: 'lab_leader', schoolId: 'school-1' };
    await expect(service.commitImport('roster-1', { csv: 'name\nAva\n', importId: importId! }, otherCaller)).rejects.toThrow(/conflict|match/i);
    expect(rosters.createEntries).not.toHaveBeenCalled();
  });

  it('a fresh preview for a different payload yields a valid new import', async () => {
    const rosters = {
      getRoster: vi.fn(async () => roster),
      listEntries: vi.fn(async () => []),
      createEntries: vi.fn(async (inputs: { id: string }[]) => inputs),
    };
    const service = new RosterService(rosters as never, inviteRepo() as never);
    const { importId } = await service.previewImport('roster-1', 'name\nBeth\n', lead);
    await service.commitImport('roster-1', { csv: 'name\nBeth\n', importId: importId! }, lead);
    expect(rosters.createEntries).toHaveBeenCalledTimes(1);
  });

  it('fails closed when the database has no atomic batch support', async () => {
    const db = {
      prepare: () => ({ bind: () => ({ run: async () => ({}), all: async () => ({ results: [] }) }) }),
    };
    const repo = new RosterRepository(db as never);
    await expect(
      repo.createEntries([{ id: 'e1', rosterId: 'roster-1', schoolId: 'school-1', displayName: 'A' }]),
    ).rejects.toThrow(/batch/i);
  });

  it('writes the audit event only after the batch succeeds', async () => {
    const order: string[] = [];
    const rosters = {
      getRoster: vi.fn(async () => roster),
      listEntries: vi.fn(async () => []),
      createEntries: vi.fn(async () => { order.push('batch'); return []; }),
    };
    const audit = { log: vi.fn(async () => { order.push('audit'); }) };
    const service = new RosterService(rosters as never, inviteRepo() as never, audit as never);
    const { importId } = await service.previewImport('roster-1', 'name\nAva\n', lead);
    await service.commitImport('roster-1', { csv: 'name\nAva\n', importId: importId! }, lead);
    expect(order).toEqual(['batch', 'audit']);

    const failing = {
      getRoster: vi.fn(async () => roster),
      listEntries: vi.fn(async () => []),
      createEntries: vi.fn(async () => { throw new Error('batch failed'); }),
    };
    const audit2 = { log: vi.fn(async () => undefined) };
    const service2 = new RosterService(failing as never, inviteRepo() as never, audit2 as never);
    const { importId: iid2 } = await service2.previewImport('roster-1', 'name\nAva\n', lead);
    await expect(service2.commitImport('roster-1', { csv: 'name\nAva\n', importId: iid2! }, lead)).rejects.toThrow();
    expect(audit2.log).not.toHaveBeenCalled();
  });
});

describe('import fingerprint across schools', () => {
  const roster = { id: 'roster-1', schoolId: 'school-1', name: 'R', createdBy: 'u', createdAt: 't' };

  it('rejects an importId issued in another school context — zero writes, zero audit', async () => {
    const rosters = {
      getRoster: vi.fn(async (id: string) => (id === 'roster-1' ? roster : { ...roster, id, schoolId: 'school-2' })),
      listEntries: vi.fn(async () => []),
      createEntries: vi.fn(async (inputs: { id: string }[]) => inputs),
    };
    const audit = { log: vi.fn(async () => undefined) };
    const service = new RosterService(rosters as never, inviteRepo() as never, audit as never);

    // Fingerprint legitimately issued to school-1's lead for roster-1's payload.
    const { importId } = await service.previewImport('roster-1', 'name\nAva\n', lead);

    // Reuse attempt by a different school caller — scope check rejects first.
    await expect(service.commitImport('roster-1', { csv: 'name\nAva\n', importId: importId! }, otherLead)).rejects.toThrow();
    // Same payload on a same-named foreign roster — digest binds caller+school.
    const foreignRosterLead = { userId: 'u-lead3', role: 'lab_leader', schoolId: 'school-2' };
    await expect(service.commitImport('roster-2', { csv: 'name\nAva\n', importId: importId! }, foreignRosterLead)).rejects.toThrow(/conflict|match|scope/i);

    expect(rosters.createEntries).not.toHaveBeenCalled();
    expect(audit.log).not.toHaveBeenCalledWith(expect.anything(), 'roster.import', expect.anything(), expect.anything(), expect.anything());
  });
});
