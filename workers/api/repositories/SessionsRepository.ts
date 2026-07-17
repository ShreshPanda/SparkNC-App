import { BaseRepository } from './baseRepository';

export interface SessionRecord {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string | null;
}

export interface CreateSessionInput {
  userId: string;
  expiresAt: string;
}

export class SessionsRepository extends BaseRepository {
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

  async createSession(input: CreateSessionInput): Promise<SessionRecord> {
    const now = this.now();
    const sessionId = this.createId('sess');

    await this.db
      .prepare('INSERT INTO sessions (id, user_id, created_at, expires_at, revoked_at) VALUES (?, ?, ?, ?, ?)')
      .bind(sessionId, input.userId, now, input.expiresAt, null)
      .run();

    return {
      id: sessionId,
      userId: input.userId,
      createdAt: now,
      expiresAt: input.expiresAt,
      revokedAt: null,
    };
  }

  async revokeSession(sessionId: string): Promise<void> {
    const now = this.now();
    await this.db
      .prepare('UPDATE sessions SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL')
      .bind(now, sessionId)
      .run();
  }

  async getSessionById(sessionId: string): Promise<SessionRecord | null> {
    const current = await this.db
      .prepare('SELECT id, user_id, created_at, expires_at, revoked_at FROM sessions WHERE id = ?')
      .bind(sessionId)
      .all();

    const row = current.results?.[0];
    if (!row) return null;

    return {
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      createdAt: String(row.created_at ?? ''),
      expiresAt: String(row.expires_at ?? ''),
      revokedAt: row.revoked_at == null ? null : String(row.revoked_at),
    };
  }
}

