import { RoleRepository } from '../repositories/RoleRepository';
import { RoleService, type SparkRole, type SparkPermission } from './roleService';

export type { SparkRole, SparkPermission };

export class PermissionService {
  constructor(private readonly roleService: RoleService) {}

  async getPermissions(role: SparkRole): Promise<SparkPermission[]> {
    return this.roleService.getPermissions(role);
  }

  async hasPermission(role: SparkRole, permission: SparkPermission): Promise<boolean> {
    const permissions = await this.getPermissions(role);
    return matchesPermission(permission, permissions);
  }
}

export function createPermissionService(db: {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      run: () => Promise<unknown>;
      all: () => Promise<{ results: Record<string, unknown>[] }>;
    };
  };
}): PermissionService {
  return new PermissionService(new RoleService(new RoleRepository(db)));
}

function matchesPermission(requested: SparkPermission, allowed: SparkPermission[]): boolean {
  if (allowed.includes('*')) return true;

  const requestedParts = requested.split('.');
  for (const allowedPermission of allowed) {
    if (allowedPermission === requested) return true;

    const allowedParts = allowedPermission.split('.');
    if (allowedParts.length > requestedParts.length) continue;

    let match = true;
    for (let i = 0; i < allowedParts.length; i += 1) {
      if (allowedParts[i] !== '*' && allowedParts[i] !== requestedParts[i]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }

  return false;
}
