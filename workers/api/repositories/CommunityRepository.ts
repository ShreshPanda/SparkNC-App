import { BaseRepository } from './baseRepository';

export interface Group {
  id: string;
  name: string;
  description?: string;
  kind: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: string;
  createdAt: string;
}

export interface GroupPost {
  id: string;
  groupId: string;
  userId: string;
  title?: string;
  body: string;
  kind: string;
  createdAt: string;
  updatedAt: string;
}

export class CommunityRepository extends BaseRepository {
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

  async createGroup(input: { name: string; description?: string; kind: string; createdBy: string }): Promise<Group> {
    const id = this.createId('group');
    const now = this.now();
    await this.db
      .prepare('INSERT INTO groups (id, name, description, kind, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.name, input.description ?? null, input.kind, input.createdBy, now, now)
      .run();
    return { id, name: input.name, description: input.description, kind: input.kind, createdBy: input.createdBy, createdAt: now, updatedAt: now };
  }

  async listGroups(): Promise<Group[]> {
    const result = await this.db
      .prepare(
        `SELECT g.id, g.name, g.description, g.kind, g.created_by, g.created_at, g.updated_at, COUNT(gm.id) as member_count
         FROM groups g
         LEFT JOIN group_members gm ON gm.group_id = g.id
         GROUP BY g.id
         ORDER BY g.created_at DESC`,
      )
      .bind()
      .all();
    return (result.results ?? []).map((row) => ({
      id: String(row.id ?? ''),
      name: String(row.name ?? ''),
      description: row.description == null ? undefined : String(row.description),
      kind: String(row.kind ?? 'general'),
      createdBy: String(row.created_by ?? ''),
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? ''),
      memberCount: Number(row.member_count ?? 0),
    }));
  }

  async addMember(input: { groupId: string; userId: string; role?: string }): Promise<GroupMember> {
    const id = this.createId('gmember');
    const now = this.now();
    await this.db
      .prepare('INSERT OR IGNORE INTO group_members (id, group_id, user_id, role, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(id, input.groupId, input.userId, input.role ?? 'member', now)
      .run();
    return { id, groupId: input.groupId, userId: input.userId, role: input.role ?? 'member', createdAt: now };
  }

  async isMember(groupId: string, userId: string): Promise<boolean> {
    const result = await this.db
      .prepare('SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? LIMIT 1')
      .bind(groupId, userId)
      .all();
    return (result.results ?? []).length > 0;
  }

  async createPost(input: { groupId: string; userId: string; title?: string; body: string; kind: string }): Promise<GroupPost> {
    const id = this.createId('gpost');
    const now = this.now();
    await this.db
      .prepare('INSERT INTO group_posts (id, group_id, user_id, title, body, kind, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.groupId, input.userId, input.title ?? null, input.body, input.kind, now, now)
      .run();
    return { id, groupId: input.groupId, userId: input.userId, title: input.title, body: input.body, kind: input.kind, createdAt: now, updatedAt: now };
  }

  async listPosts(groupId: string): Promise<GroupPost[]> {
    const result = await this.db
      .prepare('SELECT id, group_id, user_id, title, body, kind, created_at, updated_at FROM group_posts WHERE group_id = ? ORDER BY created_at DESC')
      .bind(groupId)
      .all();
    return (result.results ?? []).map((row) => ({
      id: String(row.id ?? ''),
      groupId: String(row.group_id ?? ''),
      userId: String(row.user_id ?? ''),
      title: row.title == null ? undefined : String(row.title),
      body: String(row.body ?? ''),
      kind: String(row.kind ?? 'update'),
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? ''),
    }));
  }
}
