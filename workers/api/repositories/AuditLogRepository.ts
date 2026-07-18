import { BaseRepository } from './baseRepository';

export interface AuditLogRecord {
  id: string;
  actorId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: string;
  createdAt: string;
}

export class AuditLogRepository extends BaseRepository {
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

  async log(actorId: string | undefined, action: string, entityType?: string, entityId?: string, metadata?: Record<string, unknown>): Promise<AuditLogRecord> {
    const id = this.createId('audit');
    const now = this.now();
    const meta = metadata ? JSON.stringify(metadata) : null;
    await this.db
      .prepare('INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, actorId ?? null, action, entityType ?? null, entityId ?? null, meta, now)
      .run();
    return { id, actorId, action, entityType, entityId, metadata: meta ?? undefined, createdAt: now };
  }

  async list(limit = 100): Promise<AuditLogRecord[]> {
    const result = await this.db
      .prepare('SELECT id, actor_id, action, entity_type, entity_id, metadata, created_at FROM audit_logs ORDER BY created_at DESC LIMIT ?')
      .bind(limit)
      .all();
    return (result.results ?? []).map((row) => ({
      id: String(row.id ?? ''),
      actorId: row.actor_id == null ? undefined : String(row.actor_id),
      action: String(row.action ?? ''),
      entityType: row.entity_type == null ? undefined : String(row.entity_type),
      entityId: row.entity_id == null ? undefined : String(row.entity_id),
      metadata: row.metadata == null ? undefined : String(row.metadata),
      createdAt: String(row.created_at ?? ''),
    }));
  }
}
