# SparkNC Organization Architecture

## Goal
Support multiple organizations, each with a hierarchy of schools and locations, without hardcoding any tenant, school, or role.

## Hierarchy

```
Organization
└── School
    └── Location
        └── Students
```

- **Organization**: Top-level account. Admins see everything.
- **School**: A school within the organization. School admins see their school.
- **Location**: A physical or virtual site (club, cohort, campus). Location managers see their location.
- **Students**: Belong to a location and school.

## Scoping rules

| Role | Organization | School | Location |
|------|--------------|--------|----------|
| Admin | read/write | read/write | read/write |
| Location Manager | read | read | read/write |
| School Admin | read | read/write | read |
| Ambassador | - | - | read (assigned students) |
| Student | - | - | - (own data) |

## Database scoping
- `users.school_id` filters by school.
- `users.location_id` filters by location.
- No queries may omit the scoping predicate unless the actor is an admin and explicitly requests the organization view.

## Service: `OrganizationService`
- `getScopedStudents(userId, scope)` returns students the caller is allowed to see.
- `getScopesForUser(userId)` returns the list of scopes the caller may select.
- Falls back to the caller's own school/location if they request data outside their permissions.

## Future extensions
- `organizations`, `schools`, and `locations` tables for names and metadata.
- `organization_memberships` table for multi-organization users.
- Row-level filtering with `school_id` injected automatically by a middleware layer.
- Federation across D1 databases for very large organizations.
