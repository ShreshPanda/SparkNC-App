# SparkNC

SparkNC is a premium cross-platform productivity and communication platform built for students, ambassadors, lab leaders, administrators, and board members.

## Permanent documentation (source of truth)
All engineering, UX, API, and database contracts live in:
- `docs/PRODUCT_BIBLE.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/UX_PRINCIPLES.md`
- `docs/API_STANDARDS.md`
- `docs/DATABASE_GUIDE.md`
- `docs/AI_ENGINEERING_GUIDE.md`
- `docs/COMPONENT_LIBRARY.md`

The project prioritizes scalability, polished UX, and a strong engineering structure so subsequent AI agents can iterate safely.


## Vision

Create a calm, modern, and high-trust experience that feels premium rather than portal-like. The product should support collaboration, planning, communication, and governance across student communities and team operations.

## Architecture

- Expo Router for file-based navigation
- TypeScript strict mode for safe evolution
- NativeWind for utility-first styling
- React Query for async state management
- Cloudflare Workers for API delivery
- Cloudflare D1 for relational data storage
- Cloudflare R2 for object storage
- Better Auth with Cloudflare D1 for authentication
- A central theme system for light and dark mode support

## Folder structure

- app/: Expo Router screens and layout entrypoints
- components/: shared UI components
- providers/: app-wide context providers
- screens/: screen-level modules if the app grows beyond route files
- services/: frontend service boundaries for Cloudflare APIs
- workers/: Cloudflare Worker backend entrypoints and runtime modules
- shared/: shared TypeScript models for frontend and backend
- hooks/: reusable data hooks
- navigation/: route helpers and navigation constants
- constants/: route and app constants
- theme/: central design tokens
- types/: shared TypeScript models
- utils/: helpers and utilities

## Coding standards

- Prefer small, composable modules
- Keep business logic out of components when possible
- Use shared theme tokens instead of literals
- Maintain strong TypeScript typing
- Avoid hardcoded secrets or credentials

## Next steps

- Connect Cloudflare Worker and D1 environment values
- Add Better Auth flows and protected routes
- Introduce a polished design system and reusable screen patterns
- Add D1-backed data models for tasks, goals, and messages
