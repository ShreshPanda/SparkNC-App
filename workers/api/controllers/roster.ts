import { RosterService, type Caller } from '../services/rosterService';
import { InvitationService } from '../services/invitationService';
import { RosterRepository } from '../repositories/RosterRepository';
import { InvitationRepository } from '../repositories/InvitationRepository';
import { AuditLogService } from '../services/auditLogService';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { assertNonEmpty } from '../validators/baseValidator';

type Db = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      run: () => Promise<unknown>;
      all: () => Promise<{ results: Record<string, unknown>[] }>;
    };
  };
};

export interface EnrollmentControllerContext {
  env?: unknown;
  userId?: string;
  role?: string;
  schoolId?: string;
}

function dbOf(context?: EnrollmentControllerContext): Db {
  const env = context?.env as Record<string, unknown> | undefined;
  return env?.DB as Db;
}

function callerOf(context?: EnrollmentControllerContext): Caller {
  return { userId: context?.userId ?? '', role: context?.role, schoolId: context?.schoolId };
}

function rosterService(context?: EnrollmentControllerContext): RosterService {
  const db = dbOf(context);
  return new RosterService(new RosterRepository(db), new InvitationRepository(db), new AuditLogService(new AuditLogRepository(db as never)));
}

function invitationService(context?: EnrollmentControllerContext): InvitationService {
  const db = dbOf(context);
  return new InvitationService(new InvitationRepository(db), new RosterRepository(db), new AuditLogService(new AuditLogRepository(db as never)));
}

function unauthorized() {
  return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
}

export async function createRosterController(input: { name: string; schoolId?: string }, context?: EnrollmentControllerContext) {
  if (!context?.userId) return unauthorized();
  return rosterService(context).createRoster(input, callerOf(context));
}

export async function listRostersController(context?: EnrollmentControllerContext) {
  if (!context?.userId) return unauthorized();
  return rosterService(context).listRosters(callerOf(context));
}

export async function listEntriesController(rosterId: string, context?: EnrollmentControllerContext) {
  if (!context?.userId) return unauthorized();
  assertNonEmpty(rosterId, 'Roster id is required');
  return rosterService(context).listEntries(rosterId, callerOf(context));
}

export async function addEntryController(rosterId: string, input: { displayName: string }, context?: EnrollmentControllerContext) {
  if (!context?.userId) return unauthorized();
  assertNonEmpty(rosterId, 'Roster id is required');
  return rosterService(context).addEntry(rosterId, input, callerOf(context));
}

export async function updateEntryController(entryId: string, input: { displayName?: string }, context?: EnrollmentControllerContext) {
  if (!context?.userId) return unauthorized();
  assertNonEmpty(entryId, 'Entry id is required');
  return rosterService(context).updateEntry(entryId, input, callerOf(context));
}

export async function revokeEntryController(entryId: string, context?: EnrollmentControllerContext) {
  if (!context?.userId) return unauthorized();
  assertNonEmpty(entryId, 'Entry id is required');
  await rosterService(context).revokeEntry(entryId, callerOf(context));
  return { revoked: true };
}

export async function importPreviewController(rosterId: string, input: { csv: string }, context?: EnrollmentControllerContext) {
  if (!context?.userId) return unauthorized();
  assertNonEmpty(rosterId, 'Roster id is required');
  assertNonEmpty(input?.csv, 'CSV content is required');
  return rosterService(context).previewImport(rosterId, input.csv, callerOf(context));
}

export async function importCommitController(rosterId: string, input: { csv: string; importId: string }, context?: EnrollmentControllerContext) {
  if (!context?.userId) return unauthorized();
  assertNonEmpty(rosterId, 'Roster id is required');
  assertNonEmpty(input?.csv, 'CSV content is required');
  return rosterService(context).commitImport(rosterId, { csv: input.csv, importId: input.importId }, callerOf(context));
}

export async function issueInvitationController(input: { rosterEntryId: string; expiresInDays?: number }, context?: EnrollmentControllerContext) {
  if (!context?.userId) return unauthorized();
  assertNonEmpty(input?.rosterEntryId, 'Roster entry id is required');
  return invitationService(context).issueIndividual(input.rosterEntryId, callerOf(context), input.expiresInDays);
}

export async function issueSchoolLinkController(input: { schoolId?: string; expiresInDays?: number }, context?: EnrollmentControllerContext) {
  if (!context?.userId) return unauthorized();
  return invitationService(context).issueSchoolLink(callerOf(context), input?.schoolId, input?.expiresInDays);
}

export async function issueClaimCodeController(input: { rosterEntryId: string }, context?: EnrollmentControllerContext) {
  if (!context?.userId) return unauthorized();
  assertNonEmpty(input?.rosterEntryId, 'Roster entry id is required');
  return invitationService(context).issueClaimCode(input.rosterEntryId, callerOf(context));
}

export async function revokeInvitationController(invitationId: string, context?: EnrollmentControllerContext) {
  if (!context?.userId) return unauthorized();
  assertNonEmpty(invitationId, 'Invitation id is required');
  await invitationService(context).revoke(invitationId, callerOf(context));
  return { revoked: true };
}

export async function listInvitationsController(context?: EnrollmentControllerContext) {
  if (!context?.userId) return unauthorized();
  return invitationService(context).list(callerOf(context));
}
