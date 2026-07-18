export interface OrganizationScope {
  type: 'organization' | 'school' | 'location';
  id?: string;
  name: string;
}

export interface OrganizationMember {
  id: string;
  email?: string;
  name?: string;
  role: string;
  schoolId?: string;
  locationId?: string;
  createdAt?: string;
}

export interface ScopedStudents {
  scope: OrganizationScope;
  students: OrganizationMember[];
  count: number;
}

export class OrganizationService {
  constructor(private readonly db: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        run: () => Promise<unknown>;
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  }) {}

  async getScopedStudents(requesterUserId: string, requestedScope: OrganizationScope): Promise<ScopedStudents> {
    // Load the requester to determine their school/location and role.
    const requester = await this.getUserById(requesterUserId);

    // Admins and location managers can view broader scopes; students and ambassadors default to their own school.
    const effectiveScope = this.resolveEffectiveScope(requester, requestedScope);

    const { sql, param } = this.buildScopeQuery(effectiveScope);
    const result = await this.db.prepare(sql).bind(param).all();
    const students = (result.results ?? []).map((row) => this.mapMember(row));

    return { scope: effectiveScope, students, count: students.length };
  }

  async getScopesForUser(userId: string): Promise<OrganizationScope[]> {
    const user = await this.getUserById(userId);
    const scopes: OrganizationScope[] = [];

    if (user?.role === 'admin') {
      scopes.push({ type: 'organization', name: 'Entire organization' });
    }
    if (user?.schoolId) {
      scopes.push({ type: 'school', id: user.schoolId, name: `School ${user.schoolId}` });
    }
    if (user?.locationId) {
      scopes.push({ type: 'location', id: user.locationId, name: `Location ${user.locationId}` });
    }

    return scopes;
  }

  private async getUserById(userId: string): Promise<{ role: string; schoolId?: string; locationId?: string } | null> {
    const result = await this.db
      .prepare('SELECT id, role, school_id, location_id FROM users WHERE id = ? LIMIT 1')
      .bind(userId)
      .all();
    const row = result.results?.[0];
    if (!row) return null;
    return {
      role: String(row.role ?? 'student'),
      schoolId: row.school_id == null ? undefined : String(row.school_id),
      locationId: row.location_id == null ? undefined : String(row.location_id),
    };
  }

  private resolveEffectiveScope(
    requester: { role: string; schoolId?: string; locationId?: string } | null,
    requested: OrganizationScope,
  ): OrganizationScope {
    if (!requester) return requested;

    const isAdmin = requester.role === 'admin';
    const isLocationManager = requester.role === 'location_manager';

    if (requested.type === 'organization' && !isAdmin) {
      // Fall back to school scope for non-admins.
      return { type: 'school', id: requester.schoolId, name: 'My school' };
    }

    if (requested.type === 'school') {
      if (!isAdmin && requester.schoolId !== requested.id) {
        return { type: 'school', id: requester.schoolId, name: 'My school' };
      }
    }

    if (requested.type === 'location') {
      if (!isAdmin && !isLocationManager && requester.locationId !== requested.id) {
        // Ambassador/students see their location only; if none, fall back to school.
        return { type: 'location', id: requester.locationId, name: 'My location' };
      }
    }

    return requested;
  }

  private buildScopeQuery(scope: OrganizationScope): { sql: string; param: string | null } {
    const base = 'SELECT id, email, name, role, school_id, location_id, created_at FROM users WHERE role = \'student\'';
    if (scope.type === 'school') return { sql: `${base} AND school_id = ?`, param: scope.id ?? null };
    if (scope.type === 'location') return { sql: `${base} AND location_id = ?`, param: scope.id ?? null };
    return { sql: base, param: null };
  }

  private mapMember(row: Record<string, unknown>): OrganizationMember {
    return {
      id: String(row.id ?? ''),
      email: row.email == null ? undefined : String(row.email),
      name: row.name == null ? undefined : String(row.name),
      role: String(row.role ?? 'student'),
      schoolId: row.school_id == null ? undefined : String(row.school_id),
      locationId: row.location_id == null ? undefined : String(row.location_id),
      createdAt: row.created_at == null ? undefined : String(row.created_at),
    };
  }
}
