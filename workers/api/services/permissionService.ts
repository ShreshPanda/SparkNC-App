export type SparkRole = 'student' | 'ambassador' | 'lab_leader' | 'location_manager' | 'board_member' | 'admin';

export type SparkPermission = 'read' | 'write' | 'manage' | 'admin';

const rolePermissions: Record<SparkRole, SparkPermission[]> = {
  student: ['read', 'write'],
  ambassador: ['read', 'write', 'manage'],
  lab_leader: ['read', 'write', 'manage'],
  location_manager: ['read', 'write', 'manage'],
  board_member: ['read', 'write', 'manage'],
  admin: ['read', 'write', 'manage', 'admin'],
};

export function getPermissionsForRole(role: SparkRole): SparkPermission[] {
  return rolePermissions[role] ?? rolePermissions.student;
}

export function canAccess(role: SparkRole, permission: SparkPermission): boolean {
  return getPermissionsForRole(role).includes(permission);
}

export function canManageUsers(role: SparkRole): boolean {
  return canAccess(role, 'admin') || canAccess(role, 'manage');
}
