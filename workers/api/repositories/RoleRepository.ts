import { BaseRepository } from './baseRepository';

export interface RoleRecord {
  id: string;
  name: string;
  permissions: string;
  createdAt: string;
  updatedAt: string;
}

export class RoleRepository extends BaseRepository {
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

  async getRoleByName(name: string): Promise<RoleRecord | null> {
    const result = await this.db
      .prepare('SELECT id, name, permissions, created_at, updated_at FROM roles WHERE name = ? LIMIT 1')
      .bind(name)
      .all();

    const row = result.results?.[0];
    if (!row) return null;

    return {
      id: String(row.id ?? ''),
      name: String(row.name ?? ''),
      permissions: String(row.permissions ?? '[]'),
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? ''),
    };
  }

  async createRole(input: { id: string; name: string; permissions: string; createdAt: string; updatedAt: string }): Promise<void> {
    await this.db
      .prepare('INSERT INTO roles (id, name, permissions, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
      .bind(input.id, input.name, input.permissions, input.createdAt, input.updatedAt)
      .run();
  }
}
