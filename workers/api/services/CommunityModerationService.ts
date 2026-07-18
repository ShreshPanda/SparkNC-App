import { CommunityRepository } from '../repositories/CommunityRepository';

export interface ReportInput {
  postId: string;
  reporterId: string;
  reason: string;
  details?: string;
}

export interface ModerationActionInput {
  targetType: 'post' | 'group';
  targetId: string;
  action: 'remove' | 'warn' | 'lock';
  moderatorId: string;
  reason?: string;
}

export class CommunityModerationService {
  constructor(
    private readonly db: {
      prepare: (query: string) => {
        bind: (...values: unknown[]) => {
          run: () => Promise<unknown>;
          all: () => Promise<{ results: Record<string, unknown>[] }>;
        };
      };
    },
    private readonly communityRepository?: CommunityRepository,
  ) {}

  async reportPost(input: ReportInput): Promise<{ reportId: string; status: string }> {
    const id = this.createId('report');
    const now = this.now();
    await this.db
      .prepare('INSERT INTO group_post_reports (id, post_id, reporter_id, reason, details, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.postId, input.reporterId, input.reason, input.details ?? null, 'open', now, now)
      .run();
    return { reportId: id, status: 'open' };
  }

  async listReports(status?: 'open' | 'resolved' | 'dismissed'): Promise<Record<string, unknown>[]> {
    const base = 'SELECT id, post_id, reporter_id, reason, details, status, reviewed_by, resolution, created_at, updated_at FROM group_post_reports';
    const query = status ? `${base} WHERE status = ? ORDER BY created_at DESC` : `${base} ORDER BY created_at DESC`;
    const stmt = this.db.prepare(query);
    const result = status ? await stmt.bind(status).all() : await stmt.bind().all();
    return result.results ?? [];
  }

  async reviewReport(reportId: string, moderatorId: string, status: 'resolved' | 'dismissed', resolution?: string): Promise<void> {
    await this.db
      .prepare('UPDATE group_post_reports SET status = ?, reviewed_by = ?, resolution = ?, updated_at = ? WHERE id = ?')
      .bind(status, moderatorId, resolution ?? null, this.now(), reportId)
      .run();
  }

  async takeAction(input: ModerationActionInput): Promise<void> {
    const id = this.createId('mod');
    await this.db
      .prepare('INSERT INTO moderation_actions (id, target_type, target_id, action, moderator_id, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.targetType, input.targetId, input.action, input.moderatorId, input.reason ?? null, this.now())
      .run();

    if (input.action === 'remove' && input.targetType === 'post') {
      await this.db.prepare('DELETE FROM group_posts WHERE id = ?').bind(input.targetId).run();
    }
  }

  async removeGroup(groupId: string, moderatorId: string, reason?: string): Promise<void> {
    const id = this.createId('mod');
    await this.db
      .prepare('INSERT INTO moderation_actions (id, target_type, target_id, action, moderator_id, reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, 'group', groupId, 'remove', moderatorId, reason ?? null, this.now())
      .run();
    await this.db.prepare('DELETE FROM group_posts WHERE group_id = ?').bind(groupId).run();
    await this.db.prepare('DELETE FROM group_members WHERE group_id = ?').bind(groupId).run();
    await this.db.prepare('DELETE FROM groups WHERE id = ?').bind(groupId).run();
  }

  private createId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private now(): string {
    return new Date().toISOString();
  }
}
