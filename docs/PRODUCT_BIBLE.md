# SparkNC Product Bible

> **Source of truth for all future engineers and AI coding agents.**
>
> This document defines the constitution of SparkNC: what we are building, why we build it, how we make decisions, and how we measure success.

---

## Vision
Create a calm, modern, premium experience that supports collaboration, planning, communication, and governance across student communities and team operations.

SparkNC should feel like:
- premium, fast, minimal
- student-friendly
- fun without becoming childish
- professional and trustworthy for governance and leadership

---

## Mission
Deliver an end-to-end platform that helps SparkNC students and leaders organize work, communicate clearly, and track progress—through a unified scheduling and engagement experience.

---

## Long-term goals
1. **Trusted operations at scale**: support multiple orgs, roles, and governance workflows without confusion.
2. **Unified engagement system**: goals, tasks, events, messages, and activity form a coherent system—not a set of disconnected screens.
3. **Delight through performance**: interactions feel instantaneous and resilient.
4. **Extensible platform**: new modules can be added without breaking existing contracts, UX patterns, or data integrity.

---

## Core principles
1. **High-trust UX**: UI choices should reduce uncertainty.
2. **Clarity over cleverness**: prefer obvious actions and predictable navigation.
3. **Safety for mutation**: create/update actions are validated and authorized.
4. **Shared language**: a consistent vocabulary across app screens, API, data model, and notifications.
5. **Performance is a feature**: low latency, predictable loading, and resilient offline-tolerant UI patterns.
6. **Design system first**: all UI uses the design tokens and components.

---

## Target audience
- SparkNC students
- Ambassadors
- Lab leaders
- Location managers
- Board members
- Administrators

---

## User personas
### Student (Planner)
- Needs: tasks, goals, schedules, reminders, and progress visibility.
- Priorities: speed, clarity, motivational feedback (XP/streak), minimal friction.

### Ambassador (Coordinator)
- Needs: coordinate groups, manage engagement cadence, communicate updates.
- Priorities: reusable workflows, clear status, quick search.

### Lab Leader (Operations)
- Needs: plan and track lab initiatives, coordinate across cohorts.
- Priorities: permissions, reporting-ready data, reliable scheduling.

### Location Manager (Governance)
- Needs: oversee multi-team operations and ensure adherence to process.
- Priorities: role clarity, auditability, admin tools.

### Board Member (Steward)
- Needs: visibility, governance workflows, and dependable reporting.
- Priorities: trustworthy information architecture and consistent navigation.

### Admin (Platform Operator)
- Needs: user/role management, support tools, and system health.
- Priorities: robust admin UI patterns and stable API contracts.

---

## User roles
- `student`
- `ambassador`
- `lab_leader`
- `location_manager`
- `board_member`
- `admin`

Roles are enforced via the permission model at the API boundary and reflected in UI affordances.

---

## Feature philosophy
- **Every feature must reduce operational ambiguity**: “who does what, when, and what’s the current status?”
- **Avoid one-off UI**: if a capability repeats, it becomes a reusable component and/or pattern.
- **Progressively disclose complexity**: advanced settings exist, but normal users never face admin-level clutter.
- **Gamification is supportive**: XP/streak are motivational signals, not the core truth.

---

## Navigation philosophy
- **Predictable routes**: file-based navigation (Expo Router) mirrors product structure.
- **Bottom navigation for primary areas** (mobile): tasks, goals, calendar, messages, notifications, settings/admin as appropriate.
- **Top bars for context** (web/tablet patterns): show titles, search, and action entry points.
- **Stable information hierarchy**: consistent placement of primary actions, status chips, and progress widgets.

---

## Product roadmap (high-level)
### Phase 1 — Foundation (current)
- Premium app shell and navigation
- Theme tokenization + design system direction
- Worker + modular API scaffolding
- D1 schema and persistence for tasks/goals

### Phase 2 — Authentication & authorization completeness
- Real signed-in request context
- Protected routes with role/permission enforcement
- Expanded persistence coverage (events, messages)

### Phase 3 — Engagement suite
- Notifications, activity feeds, and admin reporting
- XP/streak integration and progression UX

### Phase 4 — Platform scale
- Multi-org support patterns (if applicable)
- Auditing and improved moderation/governance flows
- Performance tuning and observability

---

## Definition of Done (DoD)
A change is “Done” only if all apply:
1. **Docs updated**: product/UX/API/database standards reflect the change.
2. **Validation + authorization**: API input validation and role checks are implemented.
3. **Design system compliance**: uses tokens/components from DESIGN_SYSTEM + COMPONENT_LIBRARY.
4. **Performance**: no avoidable re-renders, controlled loading states, bounded payload sizes.
5. **Resilience**: error states are explicit and user-friendly.
6. **Security**: no secrets in code; correct auth boundaries.
7. **Test expectations met**: relevant unit/integration tests updated or added.

---

## Coding philosophy
- **Small modules**: compose features from small, testable units.
- **Strong typing**: TypeScript strict mode and shared types.
- **Boundary discipline**:
  - UI: presentation + orchestration
  - services: API boundary
  - backend:
    - controllers: request/response orchestration
    - services: business rules
    - repositories: persistence
    - validators: payload validation
- **No parallel systems**: if an abstraction exists, extend it instead of building a new one.

---

## Performance goals
- UI interactions should feel immediate; avoid blocking rendering on slow operations.
- API should:
  - validate early
  - use indexed queries
  - return minimal, well-shaped payloads
- Loading states must be deterministic and fast.

---

## Accessibility goals
- Keyboard/screen-reader support where applicable (web).
- Color contrast meets accessibility targets.
- Motion respects reduced-motion preferences.
- Focus management for dialogs/bottom sheets.

---

## Security goals
- Authorization enforced on server for every protected action.
- Never trust client claims for user identity or role.
- Validate all inputs at the boundary.
- Keep secrets in environment bindings only.

---

## Quality standards
- Deterministic UI states: loading/success/empty/error.
- Consistent naming across UI, API, and database.
- Stable API contracts and versioning policy.
- Production-ready documentation (this set).

---

## Future scalability
- Database designed for relational growth with indexes.
- API structure supports modular feature growth.
- Design system tokens allow theme scaling.
- Architecture supports both mobile and web UI patterns.

---

## Design philosophy
- Premium minimalism with consistent spacing and typographic hierarchy.
- Delight through micro-interactions, not complexity.
- Fun is expressed via motion, friendly copy, and playful widgets—never via inconsistent UI.

---

## Development workflow
1. Read applicable standards/docs.
2. Implement change in the correct layer boundary.
3. Add/adjust tests.
4. Update docs and changelog.
5. Validate type checking and linting.

---

## Architecture overview
### Frontend
- Expo Router for navigation
- Central theme tokens + design system components
- React Query for async data and caching
- NativeWind + theme tokens for styling

### Backend
- Cloudflare Workers (TypeScript)
- API modularization:
  - routes → controllers → services → repositories
  - middleware + validators enforce boundaries
- Cloudflare D1 persistence

---

## How AI agents should contribute
AI agents must:
- follow docs-first rules (this repository documentation is the contract)
- add new abstractions only when existing ones do not exist
- update docs when they add/alter behavior or contracts
- never silently fork logic into duplicate systems
- include tests and update doc references

AI agents are judged by:
- correctness, safety, and consistency
- documentation quality and completeness
- maintaining stable contracts

