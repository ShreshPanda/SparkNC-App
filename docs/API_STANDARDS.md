# SparkNC API Standards

> **Source of truth for backend API contracts (Cloudflare Workers).**
>
> These rules ensure stable integrations, predictable errors, and safe evolution.

---

## 1) REST conventions
- Endpoints are grouped by resource and placed under `workers/api/routes/*`.
- Use nouns for resources (e.g., `/tasks`, `/goals`).
- Use HTTP methods:
  - `GET` read
  - `POST` create
  - `PUT` full replace (use sparingly)
  - `PATCH` partial update
  - `DELETE` delete
- Filtering/pagination (when applicable):
  - Query params: `?limit=20&cursor=...` or `?page=1`

---

## 2) Naming
- Routes: lowercase with hyphen only if necessary; prefer `/snake_case` or `/kebab-case` consistently (current codebase should define the convention—match existing patterns in `workers/api/routes`).
- Controller functions: `handleXxx`.
- Services: verbs and domain names (e.g., `taskService`, `goalService`).
- Repositories: `TaskRepository`, `GoalRepository`.
- Validators: `XxxValidator`.

---

## 3) Response format
Every successful response uses a stable envelope:

```json
{
  "ok": true,
  "data": { /* resource or payload */ },
  "meta": { /* optional pagination, counts */ }
}
```

For list endpoints, `data` should be:
```json
{
  "items": [...],
  "cursor": "..." // optional
}
```

---

## 4) Error format
Every error response uses a stable envelope:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human friendly message",
    "details": [
      { "path": "title", "message": "Title is required" }
    ],
    "requestId": "..."
  }
}
```

Guidelines:
- `code` is stable and machine-usable.
- `message` is safe to display.
- `details` is present for validation errors.

---

## 5) Authentication
- Auth boundary is enforced by middleware (`workers/api/middleware/auth.ts`).
- Never trust client-supplied user IDs.
- Request context must provide an authenticated `userId` (or an explicit “anonymous/unauthorized” state).

---

## 6) Validation
- Validate request payloads at the boundary using Zod validators in `workers/api/validators/*`.
- Validators define:
  - required fields
  - min/max lengths
  - enum restrictions
  - type coercion rules (if any)

---

## 7) Versioning
- Prefer additive evolution over breaking changes.
- If breaking:
  - introduce a versioned route namespace (e.g., `/v2/tasks`) OR
  - version in headers (if already established—match codebase convention).

---

## 8) Repository pattern
- Repositories isolate persistence concerns:
  - SQL/D1 queries
  - mapping rows to typed domain objects
- Repositories should not implement business rules like XP calculation.

---

## 9) Controller pattern
- Controllers are orchestration:
  - read request params/body
  - call validator
  - call service
  - format response envelope

---

## 10) Service pattern
- Services contain business rules:
  - authorization checks (or call permission service)
  - XP/streak hooks
  - orchestration between repositories

---

## 11) Security checklist (API)
- Validate all inputs.
- Enforce authorization for any mutation.
- Prevent information leaks: do not reveal existence of resources if unauthorized.
- Use parameterized queries for SQL.

---

## 12) Implementation alignment
Existing folders:
- `workers/api/routes/*`
- `workers/api/controllers/*`
- `workers/api/services/*`
- `workers/api/repositories/*`
- `workers/api/middleware/*`
- `workers/api/validators/*`

New endpoints must follow this structure.

