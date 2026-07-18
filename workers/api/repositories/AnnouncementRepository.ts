import { BaseRepository } from './baseRepository';

export interface AnnouncementRecord {
  id: string;
  title: string;
  body: string;
  scope: 'global' | 'school' | 'location';
  schoolId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementReadRecord {
  announcementId: string;
  userId: string;
  readAt: string;
}

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  scope: 'global' | 'school' | 'location';
  schoolId?: string;
}

export interface UpdateAnnouncementInput {
  title?: string;
  body?: string;
  scope?: 'global' | 'school' | 'location';
  schoolId?: string;
}

export class AnnouncementRepository extends BaseRepository {
  constructor(private readonly db: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        run: () => Promise<unknown>;
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  }) {
    super();
  }

  async listAnnouncements(): Promise<AnnouncementRecord[]> {
    try {
      const result = await this.db
        .prepare('SELECT id, title, body, scope, school_id, created_by, created_at, updated_at FROM announcements ORDER BY created_at DESC')
        .all();
      return (result.results ?? []).map((row) => this.mapRow(row));
    } catch (error) {
      throw new Error(`Failed to list announcements: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async getAnnouncement(announcementId: string): Promise<AnnouncementRecord | null> {
    try {
      const result = await this.db
        .prepare('SELECT id, title, body, scope, school_id, created_by, created_at, updated_at FROM announcements WHERE id = ?')
        .bind(announcementId)
        .all();
      const row = result.results?.[0];
      return row ? this.mapRow(row) : null;
    } catch (error) {
      throw new Error(`Failed to get announcement: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async createAnnouncement(input: CreateAnnouncementInput, createdBy: string): Promise<AnnouncementRecord> {
    const now = this.now();
    const announcementId = this.createId('announce');

    try {
      await this.db
        .prepare('INSERT INTO announcements (id, title, body, scope, school_id, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(announcementId, input.title, input.body, input.scope, input.schoolId ?? null, createdBy, now, now)
        .run();
      return {
        id: announcementId,
        title: input.title,
        body: input.body,
        scope: input.scope,
        schoolId: input.schoolId,
        createdBy,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      throw new Error(`Failed to create announcement: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async updateAnnouncement(announcementId: string, input: UpdateAnnouncementInput): Promise<AnnouncementRecord | null> {
    const now = this.now();
    const fields: { column: string; value: unknown }[] = [];

    if (input.title !== undefined) fields.push({ column: 'title', value: input.title });
    if (input.body !== undefined) fields.push({ column: 'body', value: input.body });
    if (input.scope !== undefined) fields.push({ column: 'scope', value: input.scope });
    if (input.schoolId !== undefined) fields.push({ column: 'school_id', value: input.schoolId ?? null });

    if (fields.length === 0) {
      return this.getAnnouncement(announcementId);
    }

    const setClause = fields.map((f) => `${f.column} = ?`).join(', ');
    const values = fields.map((f) => f.value);

    try {
      await this.db.prepare(`UPDATE announcements SET ${setClause}, updated_at = ? WHERE id = ?`).bind(...values, now, announcementId).run();
      return this.getAnnouncement(announcementId);
    } catch (error) {
      throw new Error(`Failed to update announcement: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async deleteAnnouncement(announcementId: string): Promise<boolean> {
    try {
      await this.db.prepare('DELETE FROM announcements WHERE id = ?').bind(announcementId).run();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete announcement: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async markRead(announcementId: string, userId: string): Promise<void> {
    const now = this.now();
    try {
      await this.db
        .prepare('INSERT OR REPLACE INTO announcement_reads (announcement_id, user_id, read_at) VALUES (?, ?, ?)')
        .bind(announcementId, userId, now)
        .run();
    } catch (error) {
      throw new Error(`Failed to mark announcement read: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async listReads(announcementId: string): Promise<AnnouncementReadRecord[]> {
    try {
      const result = await this.db
        .prepare('SELECT announcement_id, user_id, read_at FROM announcement_reads WHERE announcement_id = ?')
        .bind(announcementId)
        .all();
      return (result.results ?? []).map((row) => ({
        announcementId: String(row.announcement_id ?? ''),
        userId: String(row.user_id ?? ''),
        readAt: String(row.read_at ?? ''),
      }));
    } catch (error) {
      throw new Error(`Failed to list announcement reads: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  private mapRow(row: Record<string, unknown>): AnnouncementRecord {
    return {
      id: String(row.id ?? ''),
      title: String(row.title ?? ''),
      body: String(row.body ?? ''),
      scope: String(row.scope ?? 'global') as AnnouncementRecord['scope'],
      schoolId: row.school_id == null ? undefined : String(row.school_id),
      createdBy: String(row.created_by ?? ''),
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? ''),
    };
  }
}
