# Master Context

## Project overview
SparkNC is a cross-platform productivity and communication platform for students, ambassadors, lab leaders, administrators, and board members.

### Source-of-truth documentation
This repository contains permanent contracts under `docs/`:
- Product constitution: `docs/PRODUCT_BIBLE.md`
- UX language: `docs/UX_PRINCIPLES.md`
- UI tokens/components: `docs/DESIGN_SYSTEM.md`, `docs/COMPONENT_LIBRARY.md`
- API contracts: `docs/API_STANDARDS.md`
- Data contracts: `docs/DATABASE_GUIDE.md`
- Agent/engineering rules: `docs/AI_ENGINEERING_GUIDE.md`

The app is structured to feel premium and modern from the start.


## Current implementation state
- Expo project scaffolded with TypeScript
- Expo Router-based navigation foundation added
- NativeWind and Tailwind configuration created
- Light/dark theme provider with central tokens introduced
- Cloudflare Worker backend foundation implemented with route/controller/service/middleware/validator structure
- D1 migrations created for schools, users, roles, goals, tasks, events, messages, activity logs, and notifications
- Shared TypeScript models introduced for users, roles, tasks, goals, events, messages, activities, and notifications
- Placeholder screens for authentication, dashboard, tasks, goals, calendar, messages, notifications, settings, and admin
- D1-backed persistence added for Tasks and Goals through repositories, services, and validated route handlers

## Backend architecture
- Runtime: Cloudflare Workers with TypeScript
- Database: Cloudflare D1 SQLite
- Storage: Cloudflare R2 and KV prepared for future use
- Auth: Better Auth scaffolded for future integration
- API shape: modular route modules under workers/api with controllers, services, repositories, middleware, and validators

## Database architecture
The D1 schema is organized around relational tables for schools, users, roles, goals, tasks, events, messages, activity logs, and notifications. The design uses foreign keys, timestamps, and indexes to make future scaling and reporting straightforward.

### Task and goal persistence
- Tasks now persist through TaskRepository and TaskService using the existing tasks table.
- Goals now persist through GoalRepository and GoalService using the existing goals table.
- The current implementation uses the request context for a future authenticated user id while keeping the database layer isolated from direct request trust.
- Completion and XP fields are prepared for future gamification and streak handling.

## Permission model
Supported roles are student, ambassador, lab_leader, location_manager, board_member, and admin. Permissions are centralized in workers/api/services/permissionService.ts and are designed to be reused by future route guards.

## Engineering rules for future agents
- Keep the architecture modular and composable
- Prefer shared components and design tokens over ad hoc styling
- Preserve strict TypeScript typing
- Document new features in this file and the status files
- Avoid hardcoded secrets or credentials
- Verify changes with the relevant Expo/TypeScript checks before claiming completion
