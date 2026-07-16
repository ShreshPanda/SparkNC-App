import { canAccess, SparkPermission, SparkRole } from '../services/permissionService';

export function requirePermission(role: SparkRole, permission: SparkPermission) {
  if (!canAccess(role, permission)) {
    throw new Error(`Role ${role} does not have ${permission} permission`);
  }

  return true;
}
