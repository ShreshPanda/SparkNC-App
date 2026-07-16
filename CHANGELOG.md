# Changelog

## [1.2.0] - 2026-07-16
### Added
- Permanent, production-quality project documentation under `docs/`:
  - `docs/PRODUCT_BIBLE.md`
  - `docs/DESIGN_SYSTEM.md`
  - `docs/API_STANDARDS.md`
  - `docs/DATABASE_GUIDE.md`
  - `docs/AI_ENGINEERING_GUIDE.md`
  - `docs/COMPONENT_LIBRARY.md`
  - `docs/UX_PRINCIPLES.md`
- Updated top-level documentation entrypoints to reference the new source-of-truth docs.

## [1.1.0] - 2026-07-15
### Added

- Cloudflare Worker backend foundation with route/controller/service/repository/middleware/validator organization
- D1 migration schema for schools, users, roles, goals, tasks, events, messages, activity logs, and notifications
- Shared domain TypeScript models for users, roles, tasks, goals, events, messages, activities, and notifications
- Role and permission service for student, ambassador, lab_leader, location_manager, board_member, and admin access
- Structured API route modules for auth, users, tasks, goals, events, messages, activity, and admin endpoints
- D1-backed TaskRepository and GoalRepository implementations for CRUD flows
- TaskService and GoalService with Zod validation and XP/streak hooks prepared for future integration
- Verified TypeScript compilation and Expo web export

## [1.0.0] - 2026-07-15
### Added
- Expo React Native + TypeScript foundation
- Expo Router navigation shell with authentication and tab routes
- Central theme system for colors, spacing, and typography
- NativeWind and Tailwind configuration
- Cloudflare Worker backend scaffold with D1 schema and Better Auth scaffolding
- Shared TypeScript models in shared/types.ts
- Documentation files for architecture and handoff
- Verified Expo web export and TypeScript compilation
