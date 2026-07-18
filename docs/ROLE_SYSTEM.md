# SparkNC Role and Permission System

## Overview

SparkNC uses role-based access control (RBAC). The system defines a small set of organizational roles and stores per-role permissions in the D1 `roles` table. The `PermissionMiddleware` enforces permissions on routes without embedding authorization logic in controllers.

## Roles

| Role            | Description                          |
| --------------- | ------------------------------------ |
| `student`       | Core user, manages tasks and goals   |
| `ambassador`    | Peer mentor, can view and respond    |
| `location_manager` | Location lead, manages events/announcements |
| `admin`         | Full system access                   |

## Permission Examples

- `student.tasks.manage`
- `student.messages.send`
- `ambassador.students.view`
- `ambassador.messages.respond`
- `events.read`
- `events.manage`
- `announcements.manage`
- `messages.read`
- `messages.send`
- `admin.users.manage`
- `*`

## Files

- `workers/api/repositories/RoleRepository.ts` – D1 role storage
- `workers/api/services/roleService.ts` – role fetching and permission parsing
- `workers/api/services/permissionService.ts` – permission checking with wildcard support
- `workers/api/middleware/permission.ts` – `requirePermission` route wrapper
- `workers/database/migrations/005_organization.sql` – roles table and seed data

## Usage

```ts
import { requirePermission } from '../middleware/permission';

{
  method: 'POST',
  path: '/events',
  handler: requirePermission('events.manage', createEventController),
}
```

## Wildcards

The `PermissionService` supports `*` at any segment. A role with `*` has all permissions. `events.manage` matches `events.manage` exactly, and a permission like `*.manage` matches any `*.manage` request.
