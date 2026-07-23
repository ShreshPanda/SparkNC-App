import type { SparkPermission, SparkRole } from '../services/permissionService';

export function requirePermission(role: SparkRole, permission: SparkPermission) {
  if (role !== 'admin') {
    throw new Error(`Role ${role} does not have ${permission} permission`);
  }

  return true;
}
