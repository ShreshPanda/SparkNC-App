import { RoleRepository, type RoleRecord } from '../repositories/RoleRepository';

export type SparkRole = 'student' | 'ambassador' | 'lab_leader' | 'location_manager' | 'board_member' | 'admin';
export type SparkPermission = string;

export interface Role {
  id: string;
  name: SparkRole;
  permissions: SparkPermission[];
  createdAt: string;
  updatedAt: string;
}

export class RoleService {
  constructor(private readonly repository: RoleRepository) {}

  async getRole(name: SparkRole): Promise<Role | null> {
    const record = await this.repository.getRoleByName(name);
    if (!record) return null;
    return this.mapRecord(record);
  }

  async getPermissions(name: SparkRole): Promise<SparkPermission[]> {
    const role = await this.getRole(name);
    return role?.permissions ?? [];
  }

  private mapRecord(record: RoleRecord): Role {
    let permissions: SparkPermission[] = [];
    try {
      const parsed = JSON.parse(record.permissions);
      if (Array.isArray(parsed)) {
        permissions = parsed.map((p) => String(p));
      }
    } catch {
      permissions = [];
    }

    return {
      id: record.id,
      name: record.name as SparkRole,
      permissions,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
