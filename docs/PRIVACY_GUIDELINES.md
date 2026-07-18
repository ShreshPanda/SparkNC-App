# SparkNC Privacy & Security Guidelines

## Data Access Principles
- Students see only their own tasks, goals, insights, growth events, achievements, and AI memories.
- Ambassadors see only students assigned to them via `ambassador_assignments`.
- Admins and location managers can view aggregated analytics but should not unnecessarily access individual student detail.

## Role Enforcement
- Authentication middleware sets `userId`, `role`, and `schoolId` on the request context.
- Permission middleware (`requirePermission`) wraps administrative routes.
- New Sprint 4 routes authenticate the caller via the session before returning any data.

## Audit Logging
- `AuditLogService` and `AuditLogRepository` record sensitive actions (`action`, `entity_type`, `entity_id`, actor, metadata) to `audit_logs`.
- Log entries are append-only and include a `created_at` timestamp.
- Audit logs support future compliance review and incident investigation.

## AI Data Handling
- `ai_memories` is per-user and tied to `user_id`.
- The AI system prompt instructs the assistant not to answer test questions or make decisions for the student.
- No student data is sent to an external LLM in the current foundation.

## Retention
- Insights expire via `student_insights.expires_at` so stale recommendations are removed or refreshed.
- Audit logs can be capped by query limit in the admin interface; retention policy should be documented per school requirements.

## FERPA / School Alignment
- Aggregate reporting is used for program health; individual records are only shown to the owner and authorized mentors.
- PII is limited to `email` and `name` required for login and display.
- Future work: add explicit data-export and deletion flows per user.

## Files
- `workers/api/services/auditLogService.ts`
- `workers/api/repositories/AuditLogRepository.ts`
- `workers/api/controllers/audit.ts`
- `workers/api/routes/audit.ts`
