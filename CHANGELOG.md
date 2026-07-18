# Changelog

## [2.1.0] - 2026-07-26
### Added
- Sprint 7 Launch, Validation & Real-World Adoption features:
  - Production Runbook: `docs/PRODUCTION_RUNBOOK.md` with deployment, migration, secret, rollback, and troubleshooting steps.
  - Pilot System: `PilotRepository`, `PilotService`, `pilot.ts` controller/routes, `013_pilot.sql`, and `docs/PILOT_SYSTEM.md`.
  - First-Time User Experience: `OnboardingRepository`, `OnboardingService`, `014_onboarding.sql`, `app/onboarding.tsx`, and `docs/ONBOARDING_FLOW.md`.
  - AI Memory System: `AIMemoryRepository`, `AIMemoryService`, `015_ai_memory.sql`, `aiMemory.ts` routes, and `docs/AI_MEMORY_SYSTEM.md`.
  - Real Push Delivery: `ExpoPushProvider` for iOS, Android, and web via Expo Push API and `docs/PUSH_NOTIFICATIONS.md`.
  - Engagement Analytics: `EngagementAnalyticsRepository`, `EngagementAnalyticsService`, `GET /analytics/engagement|retention|features`, and `docs/ENGAGEMENT_ANALYTICS.md`.
  - Ambassador Student Support: `StudentSupportRepository`, `StudentSupportService`, `GET/POST /ambassador/student-support`, and `docs/AMBASSADOR_OPERATIONS.md`.
  - Community Moderation: `CommunityModerationService`, `016_moderation.sql`, `/community/reports` and `/community/moderate/*` routes, and `docs/COMMUNITY_MODERATION.md`.
  - Performance Validation: `docs/LOAD_TESTING.md` with 100/500/1000-user load targets and optimization checklist.
  - Leadership Demo Experience: `LeadershipDemoService` and `docs/SPARKNC_LEADERSHIP_DEMO.md`.

### Changed
- `workers/api/routes/index.ts` now registers all new Sprint 7 routes: pilot, onboarding, AI memory, engagement analytics, ambassador support, and community moderation.

### Security
- No secrets are committed to source; `EXPO_ACCESS_TOKEN` is read from Wrangler secrets.
- Onboarding and AI memory data are user-owned, never used for classification or psychological profiling.


## [2.0.0] - 2026-07-25
### Added
- Sprint 6 Scale, Reliability, AI features:
  - Complete Security & Audit System: `AuditLogRepository`, `AuditLogService`, `AuditLogMiddleware` with metadata redaction, `009_audit_logs.sql`, and centralized audit logging for all sensitive operations in `workers/index.ts`.
  - Real Testing Infrastructure: Vitest config, `TEST_COVERAGE.md`, and starter unit tests for `AuditLogService` and `AuthService` using fake D1 repositories.
  - Push Notification Infrastructure: `PushTokenRepository`, `PushNotificationService`, `NotificationProvider` interface, `NoopNotificationProvider`, and `010_push_notifications.sql`.
  - Advanced AI Personalization: `StudentProfileIntelligenceService` for productivity insights without sensitive profiling.
  - Multi-School Organization Scaling: `OrganizationService` and `docs/ORGANIZATION_ARCHITECTURE.md` for hierarchical scoping.
  - Community Collaboration System: `CommunityRepository`, `CommunityService`, `community` controller and routes, `011_community.sql` for groups, memberships, and posts.
  - AI-Powered Growth Narrative: `PersonalGrowthNarrativeService` combining growth events, achievements, tasks, goals, and streaks.
  - Performance Optimization: `012_performance_indexes.sql`, `PerformanceMonitoringService`, and `docs/PERFORMANCE_GUIDE.md`.
  - Offline Support & Sync: `services/syncService.ts` with storage-agnostic queue and retry handling.
  - Accessibility & Inclusion: `docs/ACCESSIBILITY_GUIDE.md` with screen reader, keyboard, font scaling, and inclusive language guidelines.
  - Leadership Package: updated `docs/SPARKNC_PLATFORM_PROPOSAL.md` and new `docs/SPARKNC_DEMO_SCRIPT.md`.

### Changed
- `workers/index.ts` now records an audit log for every sensitive request using the new `AuditLogService`.
- `AuditLogService` now redacts sensitive keys before persisting metadata.

### Security
- No passwords, tokens, or private student data are written to audit logs.
- Sensitive metadata fields are redacted recursively before any persistence.


## [1.9.0] - 2026-07-23
### Added
- Sprint 5 Launch Quality & Scale Platform features:
  - Production deployment health endpoints: `GET /health`, `GET /version`, `GET /status` with full environment, auth, and migration reporting.
  - `docs/PRODUCTION_DEPLOYMENT.md` covering local development, deployment, rollback, monitoring, and security checklist.
  - Smart Notification Engine 2.0 with `notification_preferences`, `NotificationEngineService`, `NotificationSchedulerService`, and routes `/notifications/preferences`, `/notifications/generate`, `/notifications/schedule`.
  - Student Growth Timeline 2.0 with `GrowthStatisticsService`, `GrowthStoryService`, and routes `/growth-timeline/stats`, `/growth-timeline/story`.
  - SparkNC AI Companion expansion with `AICompanionService`, intent detection, reflection, planning, recommendations, and growth analysis (`/ai/reflect`, `/ai/plan`, `/ai/recommend`, `/ai/growth`).
  - Advanced Admin Command Center with organization overview, student support insights, and program analytics (`/admin/overview`, `/admin/student-support`, `/admin/program-analytics`).
  - Ambassador Command Center with student overview, support buckets, and participation trends (`/ambassador/command-center`).
  - SparkNC Impact Recognition System via `ImpactRecognitionService` and `/achievements/recognition`.
  - Permission middleware enforcement on admin, ambassador, and achievement routes.
  - `docs/TESTING_GUIDE.md`, `docs/APP_RELEASE_GUIDE.md`, and `docs/SPARKNC_PLATFORM_PROPOSAL.md`.
  - Premium UI/UX components: `SparkCard`, `Skeleton`, `EmptyState`, `AnimatedWrapper`, and `app/(tabs)/showcase.tsx` leadership showcase.
- `workers/database/migrations/008_launch.sql` adding the `notification_preferences` table.

### Changed
- `app.json` version bumped to `1.5.0` to align with Worker `APP_VERSION`.
- `workers/index.ts` and `workers/api/controllers/health.ts` extended for production status reporting.
- `services/cloudflareService.ts` and `shared/types.ts` updated with Sprint 5 endpoints and models.

## [1.8.0] - 2026-07-22
### Added
- Sprint 4.5 Evolution & Continuous Improvement Platform features:
  - Student Feedback System (`StudentFeedbackRepository`, `StudentFeedbackService`, `/feedback`).
  - Sentiment Analysis (`FeedbackAnalysisService`, `feedback_insights`).
  - Ambassador Insight System (`AmbassadorFeedbackRepository`, `/ambassador/feedback`).
  - Leadership Impact Dashboard (`ImpactAnalyticsService`, `GET /impact-analytics`).
  - Feature Request Board (`FeatureRequestRepository`, `/feature-requests`, voting, status workflow).
  - Demo Mode (`DemoDataService`, `GET /demo`).
  - Impact Report Generator (`ImpactReportService`, `/impact-reports`).
  - Continuous Improvement Engine (`ImprovementRecommendationService`, `/recommendations`).
- `workers/database/migrations/007_feedback.sql` adding `student_feedback`, `ambassador_feedback`, `feature_requests`, `feedback_insights`, `impact_reports`, and `improvement_recommendations`.
- Frontend screens `app/(tabs)/feedback.tsx`, `app/(tabs)/ambassador-feedback.tsx`, `app/(tabs)/impact.tsx`.
- `shared/types.ts` extended with `StudentFeedback`, `AmbassadorFeedback`, `FeatureRequest`, `FeedbackInsight`, `ImpactReport`, `ImprovementRecommendation`, `ImpactAnalytics`, and `DemoScenario`.
- `services/cloudflareService.ts` extended with Sprint 4.5 API helpers.

### Security
- All new endpoints require an authenticated `userId` in the request context.
- Students only access their own feedback; ambassadors only access their own observations.
- Admin/leadership routes rely on authenticated context and documented `AuditLogService` integration points.

## [1.7.0] - 2026-07-21
### Added
- Sprint 4 Spark Intelligence & Impact Platform features:
  - Student Intelligence Engine (`StudentInsightRepository`, `StudentInsightService`, `/insights` endpoints).
  - Student Progress Dashboard (`app/(tabs)/progress.tsx`).
  - Growth Timeline (`GrowthTimelineRepository`, `GrowthTimelineService`, `/growth-timeline` endpoints, `app/(tabs)/growth.tsx`).
  - Smart Notification Engine (`NotificationOptimizationService`) analyzing productivity, deadlines, and streak risk.
  - SparkNC AI Companion (`AIService`, `PromptService`, `StudentContextBuilder`, `MemoryService`, `POST /ai/chat`, `app/(tabs)/ai.tsx`).
  - Achievements & Personal Records (`AchievementsRepository`, `AchievementsService`, `/achievements`, `app/(tabs)/achievements.tsx`).
  - Ambassador Intelligence Dashboard (`AmbassadorRepository`, `AmbassadorDashboardService`, `/ambassador/dashboard`, `app/(tabs)/ambassador.tsx`).
  - Admin Impact Analytics (`AnalyticsRepository`, `AnalyticsService`, `/analytics`, `app/(tabs)/analytics.tsx`).
  - Audit logging (`AuditLogRepository`, `AuditLogService`, `/audit`).
- `workers/database/migrations/006_intelligence.sql` adding `student_insights`, `growth_events`, `achievements`, `user_achievements`, `personal_records`, `analytics_snapshots`, `ai_memories`, `audit_logs`, and `ambassador_assignments`.
- `workers/tsconfig.json` with `target: ES2022` to resolve Worker typecheck warnings.

### Changed
- `shared/types.ts` extended with `StudentStats`, `StudentInsight`, `GrowthEvent`, `Achievement`, `AnalyticsOverview`, `AIChatResponse`, and `AmbassadorStudentSupport` types.
- `services/cloudflareService.ts` extended with Sprint 4 API helpers.
- `app/(tabs)/_layout.tsx` now includes `progress`, `growth`, `achievements`, `ai`, `ambassador`, and `analytics` tabs.
- Notification lifecycle hooks wired into task, goal, message, event, and announcement services.

### Security
- Privacy guidelines and audit logging added; students own their data, ambassadors only see assigned students, and analytics are aggregated.

## [1.6.0] - 2026-07-20
### Added
- Sprint 3 connected ecosystem features:
  - Role and permission system (`RoleRepository`, `RoleService`, `PermissionService`, `PermissionMiddleware`).
  - Event system with attendees, RSVP, and `event_attendees` table.
  - Messaging system with conversations, participants, and messages (no WebSockets).
  - Announcement system with global/school/location scopes and read receipts.
  - Notification system infrastructure with list/mark-read endpoints.
- `workers/database/migrations/005_organization.sql` with new tables, indexes, foreign keys, and role seed data.
- `docs/ROLE_SYSTEM.md`, `docs/EVENT_SYSTEM.md`, `docs/MESSAGING_ARCHITECTURE.md`.
- Functional `Calendar`, `Messages`, `Notifications`, and `Admin` frontend screens wired to `cloudflareService`.
- `schoolId` added to `AuthContext` for scoped events and announcements.

### Changed
- `shared/types.ts` extended with `attendeeCount`, `unreadCount`, and refined ecosystem types.
- `services/cloudflareService.ts` expanded with events, conversations, messages, announcements, and notifications helpers.
- `app/(tabs)/_layout.tsx` already supports the ecosystem tabs; `AppShell` links updated to profile.

## [1.5.0] - 2026-07-19
### Added
- `wrangler.jsonc` Cloudflare Worker configuration with D1 binding placeholders and compatibility date.
- `.dev.vars.example` and updated `.env.example` with documented environment variable placeholders.
- `docs/DEPLOYMENT.md` step-by-step guide for Wrangler, D1, Worker deploy, and Expo web deploy.
- `docs/PRODUCTION_CHECKLIST.md` deployment verification checklist.
- `docs/ARCHITECTURE_AUDIT.md` with repository review, safe fixes, and recommendations.
- `workers/api/services/logger.ts` centralized logging utility with dev/prod modes and secret redaction.
- Worker startup validation for `DB` D1 binding and `SESSION_SECRET`.
- Standardized API envelope `{ success, data, error, timestamp, requestId }` in `workers/index.ts`.
- Enhanced `GET /health` endpoint that pings D1 and returns `status`, `database`, `version`, `timestamp`.

### Changed
- `services/cloudflareService.ts` now parses the new `success`/`data` Worker response envelope.
- `.gitignore` updated to ignore `.dev.vars` and `wrangler.toml`.

### Fixed
- `workers/database/migrations/001_initial.sql` index `idx_tasks_status` corrected to `idx_tasks_completed`.
- `workers/database/migrations/004_gamification.sql` made idempotent with `ADD COLUMN IF NOT EXISTS`.

## [1.4.0] - 2026-07-19
### Added
- Complete Task CRUD (`getTask`, `updateTask`, `completeTask`, `deleteTask`) with ownership validation and `POST /tasks/:id/complete` reward hook.
- Complete Goal CRUD (`getGoal`, `updateGoal`, `completeGoal`, `deleteGoal`) with progress tracking and `POST /goals/:id/complete` reward hook.
- Centralized `XPService` and `UserStatsRepository` for awarding XP on task completion, goal completion, and daily activity.
- Centralized `StreakService` for current/longest streak tracking with `last_activity_at` date logic.
- `workers/database/migrations/004_gamification.sql` adding `xp_total`, `current_streak`, `longest_streak`, `last_activity_at` to `users` and `completed`/`xp_reward` to `tasks`/`goals`.
- Frontend Dashboard, Tasks, Goals, and Profile screens plus wired Login/Signup forms.
- `services/cloudflareService.ts` with session-cookie management, response envelope parsing, and backend API integration.
- `GET /auth/me` now returns authenticated user details including XP and streak totals.

## [1.3.0] - 2026-07-18
### Added
- Web Crypto PBKDF2 password hashing in `AuthService` with random per-user salt and constant-time comparison.
- `workers/database/migrations/003_passwords.sql` and updated `users.sql` schema for `password_hash` and `password_salt` columns.
- Correct `HttpOnly`, `Secure`, `SameSite`, `Path`, and `Max-Age` cookie formatting in `AuthService`.
- Worker response passthrough for controller-returned `Response` objects and `Set-Cookie` propagation.
- Expanded `AuthContext` to expose `email`, `name`, and `role` alongside `userId`.

### Fixed
- Removed non-standard `HttpOnly=true` cookie attribute.
- `Response` objects from auth controllers are no longer wrapped in the success envelope.

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
