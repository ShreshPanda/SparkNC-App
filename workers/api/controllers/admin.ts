import { AdminCommandCenterService } from '../services/adminCommandCenterService';
import { AdminCommandCenterRepository } from '../repositories/AdminCommandCenterRepository';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import { assertNonEmpty } from '../validators/baseValidator';

function getDb(context?: AdminControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  return env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } } | undefined;
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listAdminUsersController(context?: AdminControllerContext) {
  const db = getDb(context);
  if (!db) {
    return { ok: false, code: 'SERVER_ERROR', message: 'Database unavailable' };
  }

  const result = await db
    .prepare('SELECT id, email, name, role, school_id, is_active, xp_total, current_streak, created_at FROM users ORDER BY created_at DESC')
    .bind()
    .all();

  const items = (result.results ?? []).map((row) => ({
    id: String(row.id ?? ''),
    email: String(row.email ?? ''),
    name: String(row.name ?? ''),
    role: String(row.role ?? 'student'),
    schoolId: row.school_id == null ? undefined : String(row.school_id),
    isActive: Boolean(row.is_active ?? 1),
    xp: Number(row.xp_total ?? 0),
    streak: Number(row.current_streak ?? 0),
    createdAt: String(row.created_at ?? ''),
  }));

  return { ok: true, items };
}

export async function createAdminEventController(input: { title: string; description?: string; startsAt: string; endsAt?: string; location?: string }, context?: AdminControllerContext) {
  assertNonEmpty(input.title, 'Event title is required');
  assertNonEmpty(input.startsAt, 'Event start time is required');

  const db = getDb(context);
  const userId = context?.userId;
  if (!db || !userId) {
    return { ok: false, code: 'SERVER_ERROR', message: 'Database or user unavailable' };
  }

  const user = await db.prepare('SELECT school_id FROM users WHERE id = ? LIMIT 1').bind(userId).all();
  const schoolId = (user.results?.[0] as { school_id?: string | null } | undefined)?.school_id;
  const id = createId('event');
  const now = new Date().toISOString();

  await db
    .prepare(
      'INSERT INTO events (id, title, description, starts_at, ends_at, location, created_by, school_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(id, input.title, input.description ?? null, input.startsAt, input.endsAt ?? null, input.location ?? null, userId, schoolId ?? null, now, now)
    .run();

  return {
    ok: true,
    item: { id, title: input.title, startsAt: input.startsAt, endsAt: input.endsAt, location: input.location },
  };
}

export interface AdminControllerContext {
  env?: unknown;
  userId?: string;
}

function createAdminCommandCenterService(context?: AdminControllerContext) {
  const env = context?.env as Record<string, unknown> | undefined;
  const db = env?.DB as { prepare: (query: string) => { bind: (...values: unknown[]) => { run: () => Promise<unknown>; all: () => Promise<{ results: Record<string, unknown>[] }> } } };
  return new AdminCommandCenterService(
    new AdminCommandCenterRepository(db),
    new AnalyticsRepository(db),
  );
}

export async function getAdminOverviewController(context?: AdminControllerContext) {
  const service = createAdminCommandCenterService(context);
  return service.getOrganizationOverview();
}

export async function getAdminStudentSupportController(context?: AdminControllerContext) {
  const service = createAdminCommandCenterService(context);
  return service.getStudentSupportInsights();
}

export async function getAdminProgramAnalyticsController(context?: AdminControllerContext) {
  const service = createAdminCommandCenterService(context);
  return service.getProgramAnalytics();
}

export async function createAnnouncementController(input: { title: string; body: string; scope?: string }, context?: AdminControllerContext) {
  assertNonEmpty(input.title, 'Announcement title is required');
  assertNonEmpty(input.body, 'Announcement body is required');

  const db = getDb(context);
  const userId = context?.userId;
  if (!db || !userId) {
    return { ok: false, code: 'SERVER_ERROR', message: 'Database or user unavailable' };
  }

  const user = await db.prepare('SELECT school_id FROM users WHERE id = ? LIMIT 1').bind(userId).all();
  const schoolId = (user.results?.[0] as { school_id?: string | null } | undefined)?.school_id;
  const id = createId('announcement');
  const now = new Date().toISOString();

  await db
    .prepare('INSERT INTO announcements (id, title, body, scope, created_by, school_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, input.title, input.body, input.scope ?? 'global', userId, schoolId ?? null, now, now)
    .run();

  return {
    ok: true,
    item: { id, title: input.title, body: input.body, scope: input.scope ?? 'global' },
  };
}
