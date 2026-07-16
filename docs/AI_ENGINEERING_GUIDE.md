# AI Engineering Guide (Agents + Engineers)

> **Source of truth for how AI coding agents should work in SparkNC.**
>
> This exists to prevent drift, duplicated systems, and unsafe changes.

---

## 1) Project architecture
### Frontend
- Expo Router for navigation
- React + TypeScript strict mode
- Theme tokens (colors/spacing/typography)
- React Query for data fetching/state
- NativeWind/Tailwind for styling

### Backend
- Cloudflare Workers with TypeScript
- Route → Controller → Service → Repository
- Middleware and validators enforce boundaries
- Cloudflare D1 for relational persistence
- (Auth) Better Auth scaffolded

---

## 2) Folder structure and ownership
These are the “where code belongs” rules.

### Frontend
- `app/`: routing + screen composition
- `components/`: shared UI primitives and composites
- `providers/`: app-wide context providers (theme, query)
- `screens/`: only if the app grows beyond route files; route entry should still live in `app/`
- `services/`: API client wrappers (Cloudflare endpoints)
- `hooks/`: data hooks that wrap React Query calls
- `navigation/`: route helpers/constants
- `constants/`: route constants, enum-like constants
- `theme/`: tokens and typography definitions
- `types/`: shared UI/domain types
- `shared/`: shared models between frontend and backend
- `utils/`: small pure utilities

### Backend
- `workers/api/routes/`: endpoint wiring (method + path)
- `workers/api/controllers/`: request/response orchestration
- `workers/api/services/`: business logic + permission checks
- `workers/api/repositories/`: D1 persistence + mapping
- `workers/api/middleware/`: auth/authz/headers/request context
- `workers/api/validators/`: Zod payload validation
- `workers/api/tests/`: unit/integration tests

---

## 3) Naming conventions
- Prefer descriptive names that match domain language.
- Use suffixes:
  - `Service`, `Repository`, `Validator`, `Controller`
  - `handleXxx` for controller handlers
- Keep route names consistent with existing `workers/api/routes`.

---

## 4) Testing expectations
- For persistence changes: add/extend tests in `workers/api/tests/*`.
- For API contract changes: add tests for:
  - validation failure responses
  - authz denial behavior
  - successful payload shape
- For pure utilities: add unit tests where feasible.

Test philosophy:
- Validate boundaries and contracts.
- Avoid snapshot tests for large UI—prefer behavior checks.

---

## 5) Documentation expectations
Every change must update relevant docs:
- API changes → `docs/API_STANDARDS.md` + endpoint docs (inside)
- DB changes → `docs/DATABASE_GUIDE.md`
- UI changes → `docs/DESIGN_SYSTEM.md`, `docs/UX_PRINCIPLES.md`, `docs/COMPONENT_LIBRARY.md`
- Architectural changes → `docs/AI_ENGINEERING_GUIDE.md` and/or PRODUCT BIBLE.

---

## 6) Coding standards
- TypeScript strict: avoid `any`.
- Prefer pure functions for utilities.
- Use semantic tokens over literals.
- Keep business logic out of components.

---

## 7) Rules for modifying existing code
1. **No silent breaking changes**: if contracts change, bump versioning policy.
2. **Extend abstractions**: if a service/repository exists, reuse it.
3. **Keep boundaries clean**:
   - controllers do orchestration only
   - services do business rules
   - repositories do persistence only
4. **Update validations** before calling services.
5. **Update permission checks** for any protected endpoint.
6. **Avoid duplicate systems**: before adding a new helper, search existing `services/` `utils/`.

---

## 8) How to avoid duplicate systems
Before creating a new module, perform these checks:
- Search for an existing component/service/repository.
- If the pattern exists but is incomplete, extend it.
- Only create a new module if:
  - responsibilities are clearly different, AND
  - no existing module can be safely extended.

---

## 9) AI contribution workflow
Recommended agent workflow:
1. Read relevant standards docs.
2. Locate the boundary layer (UI vs API vs DB).
3. Make minimal change set.
4. Add tests if behavior changes.
5. Update docs.
6. Run typecheck/tests.

---

## 10) Safety rules
- Never introduce secrets in code.
- Never bypass authz.
- Never trust client identity.

---

## 11) Definition of completion for agents
A PR/agent task is complete only when:
- Tests pass (or are updated with documented reasoning)
- Docs are updated
- No lint/type regressions
- Changes align with the design system and API standards

