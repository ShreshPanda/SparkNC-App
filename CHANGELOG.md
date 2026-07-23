# Changelog

## [Unreleased] - Sprint 10 — "The Complete Spark" (v1.0 Experience Completion)
### Added
- Personalized `TodaysSpark` insights on `dashboard.tsx` driven by real tasks, goals, events, opportunities, and XP.
- Time-aware greeting on `dashboard.tsx` and `ai.tsx`.
- `TodaysSpark` insight message fade-in rotation for a premium feel.

### Changed
- `growth.tsx` now uses `SparkButton` for `Generate Timeline` and `Refresh Timeline` CTAs.
- `ai.tsx` greeting loads the user’s first name and uses a more coach-like subtitle.
- Added `accessibilityRole` and `accessibilityLabel` to `ai.tsx` insight cards and send button.

## [Unreleased] - Sprint 10 Part 2 — "The Spark That Stays"
### Added
- Presentation Mode now hides the bottom tab bar in `app/(tabs)/_layout.tsx` for cleaner demo navigation.
- `components/AppShell.tsx` shows a subtle "Demo mode" pill and increases padding/title size when presenting.
- `docs/SPARKNC_V1_PRODUCT_REVIEW.md` created.

### Changed
- `app/onboarding.tsx` `ActivityIndicator` color uses `colors.foreground` instead of hardcoded `#ffffff`.
- `app/(auth)/login.tsx` and `app/(auth)/signup.tsx` CTAs and links now include `accessibilityRole` and `accessibilityLabel`.

### Completed (later in Part 2)
- **Portfolio Evolution**: `portfolio.tsx` hero "Your growth story", icon sections with counts, tag-style skills/badges.
- **Ambassador Experience**: `ambassador.tsx` "Today's focus" summary, status pills, sorted students, richer quick actions.
- **Leadership Command Center**: `analytics.tsx`, `impact.tsx`, `progress.tsx` hero KPI tiles, `SparkCard` sections, clearer trends.
- **Community Refinement**: `messages.tsx` and `feedback.tsx` now use `SparkCard`, `SparkButton`, `Ionicons`, `FadeIn`, and clearer empty states.
- **Emotional Experience Review**: `docs/EMOTIONAL_REVIEW.md` created; intended feelings mapped for all major screens.
- **Full Role Walkthrough Validation**: `docs/ROLE_WALKTHROUGH.md` created; student, ambassador, admin, and leadership journeys verified.
- `docs/EMOTIONAL_REVIEW.md` and `docs/ROLE_WALKTHROUGH.md` created.

### Verified
- No `TODO`/`FIXME`/`HACK`/`XXX` markers in `app/`, `components/`, or `services/`.
- No native `Button` imports remain in `app/`.
- `npm run typecheck`, `npm run typecheck:worker`, and `npm run test:worker` pass.

## [Unreleased] - Launch Pass 1 (Ready for the Stage)
### Added
- `info` and `creative` base color tokens in `theme/colors.ts`.
- `docs/LP1_REPORT.md` and `docs/RELEASE_READINESS_REPORT.md`.

### Changed
- Replaced hardcoded hex colors in `EmptyState`, `ProgressRing`, `SparkCard`, `ai.tsx`, `admin.tsx`, `calendar.tsx`, `dashboard.tsx`, `goals.tsx`, `growth.tsx`, `login.tsx`, `signup.tsx`, `messages.tsx`, `notifications.tsx`, `onboarding.tsx`, and `settings.tsx` with theme tokens.
- Created `components/SparkButton.tsx` and replaced all native `Button` usages across tab screens with the consistent theme-aware CTA.
- Added tactile press scale animation to `SparkButton`.
- Fixed invisible `EmptyState` action button text.
- Standardized `AppShell` titles across `ambassador.tsx`, `analytics.tsx`, and `signup.tsx`.
- Polished `EmptyState` copy in `dashboard.tsx`, `growth.tsx`, `journey.tsx`, `portfolio.tsx`, and `admin.tsx`.
- Polished `TextInput` placeholders across `admin.tsx`, `calendar.tsx`, `tasks.tsx`, `goals.tsx`, `messages.tsx`, `feedback.tsx`, and `ambassador-feedback.tsx`.
- Added `accessibilityRole` and `accessibilityLabel` to primary actions in `notifications.tsx`, `calendar.tsx`, `admin.tsx`, `tasks.tsx`, `goals.tsx`, and `ambassador.tsx`.
- Added screen-reader props to `SparkButton` and `EmptyState`.
- Removed unused `services/syncService.ts`.

### Verified
- Expo typecheck passes.
- Worker typecheck passes.
- Worker tests pass (5 tests).

## [Unreleased] - Design Pass 2 (The Living Platform)
### Added
- `OpportunityService`, `OpportunityController`, `/opportunities` route, and `OpportunityRecommendation` type.
- Rule-based opportunity scoring from user stats and onboarding interests (no ML).
- Adaptive `PriorityCard` on Dashboard that highlights overdue tasks, today's events, streak recovery, and next goals.
- `GrowthStatistics.observations` generated from actual user stats with context-aware statements.
- Dashboard `Opportunities for You` card showing scored, explainable recommendations.
- Smart Goal Suggestions on `app/(tabs)/goals.tsx` generated from `GrowthStatistics` with accept/dismiss actions.
- AI Growth Coach card on `app/(tabs)/ai.tsx` that proactively loads weekly reflection and planning suggestions.
- Mentor Workspace quick actions on `app/(tabs)/ambassador.tsx` to recommend goals/events, celebrate milestones, and flag follow-ups via messaging.
- Accessibility labels added to Dashboard `PriorityCard` and task completion rows.
- Portfolio data model expanded with `volunteer`, `badge`, and `reflection` record types and rendered sections on `app/(tabs)/portfolio.tsx`.
- School Identity support: `SchoolIdentity` type, `GET /schools/:id` route, `OrganizationService.getSchoolById`, and `cloudflareService.getSchool`.
- Dashboard header displays school name and mascot when a `schoolId` is present.

### Changed
- `app/(tabs)/dashboard.tsx` now prioritizes urgent items at the top and surfaces personalized opportunities.
- `app/(tabs)/growth.tsx` displays data-backed Growth Intelligence observations.
- `app/(tabs)/goals.tsx` fetches growth statistics and suggests context-aware goals.
- `app/(tabs)/ai.tsx` now opens with a `Growth Coach` card and celebration/reflection/planning insight cards.
- `workers/api/services/growthStatisticsService.ts` derives observations from `StudentStatsRecord` and `GrowthCategory` data.
- `shared/types.ts` extended with `GrowthStatistics.observations` and `OpportunityRecommendation`.

### Verified
- Expo typecheck passes.
- Worker typecheck passes.

## [Unreleased] - Design Pass 1 (The Spark Comes Alive)
### Added
- `AnimatedNumber` component for count-up statistics.
- `ProgressRing` component (SVG data URI based) for level progress.
- `TodaysSpark` component with rotating daily insights.
- Proactive insight cards on the Spark AI screen.
- Fade-in animation wrappers and micro-interactions on Dashboard, Growth, and AI.
- Onboarding progress bar, theme tokens, and clearer support style selection.
- Greeting-aware Spark AI header and polished chat bubbles.

### Changed
- `dashboard.tsx` redesigned with animated stats, Today's Spark, XP progress ring, and press feedback on tasks.
- `growth.tsx` redesigned with Growth Statistics, Growth Story, and a visual milestone timeline.
- `ai.tsx` rebuilt around proactive insight cards with chat as a secondary, calmer interaction.
- `login.tsx` polished with centered hero, logo pill, and tagline.
- `onboarding.tsx` converted to theme tokens with progress bar and animated step transitions.
- `EmptyState.tsx` now supports an optional action button and has a friendly icon pill.

### Verified
- Expo typecheck passes.
- Worker typecheck passes.

## [Unreleased] - DC1 Demo Candidate 1 (Spark Comes Alive)
### Added
- `DemoSeedService`, `POST /demo/seed`, and `npm run seed:demo` script for a repeatable, protected demo dataset.
- Production `DEMO_SEED_SECRET` for secure demo seed endpoint.
- `cloudflareService` methods: `listAdminUsers`, `createAdminEvent`, `createAdminAnnouncement`.
- Functional Settings screen with notification preference toggles and sign-out action.
- Functional Admin screen with user list, event creation, and announcement creation.

### Changed
- `journey.tsx` and `portfolio.tsx` now fetch real data via `cloudflareService`; hardcoded sample data removed.
- `impact.tsx` no longer falls back to synthetic demo data.
- `SparkJourneyService` no longer relies on `toLocaleString` and validates dates for Worker compatibility.
- Admin users, events, and announcements controllers now query/persist to D1.
- Fixed repository column mappings for `users` (`xp_total`, `current_streak`, `last_activity_at`) in ambassador and admin command centers.
- Fixed `EngagementAnalyticsRepository` to use `growth_events.occurred_at` and `event_type` columns.
- Fixed `getJourneyController` and `getExecutiveDashboardController` to handle undefined GET request bodies.

### Verified
- Expo and Worker typechecks pass.
- Demo dataset seeded to production D1 (7 demo accounts, 20 tasks, 20 goals, events, messages, notifications, achievements, journey, portfolio, growth, feedback, impact reports).
- Key API endpoints verified: `/tasks`, `/goals`, `/journey`, `/portfolio`, `/notifications/preferences`, `/admin/users`, `/admin/events`, `/admin/announcements`, `/ambassador/dashboard`, `/executive/dashboard`, `/analytics/overview`, `/impact-analytics`.

## [Unreleased] - RC2 First Cloudflare Deployment
### Added
- Isolated `staging` Worker configuration with independent D1 placeholders and generated `worker-configuration.d.ts` bindings.
- Deployment readiness, health-check, and rollback scripts plus staging deployment commands.
- Canonical Cloudflare setup, macOS setup, and production verification documentation.

### Changed
- Production `wrangler.jsonc` now binds the existing `sparknc-production` D1 database to `env.DB`.
- Production `BETTER_AUTH_URL` set to `https://sparknc-api.shreshpanda.workers.dev`.
- `ALLOWED_ORIGINS` set to local development origins while no production frontend URL is deployed.
- Removed duplicate `env.sparknc_production` D1 binding.
- Production deployment scripts now use the top-level production configuration; staging uses `--env staging`.
- Frontend Worker URL is normalized and browser requests include credentials for session cookies.
- Deployment checklists, README, project status, and next-task handoff now reflect the deployed production state.

### Verified
- Expo and Worker typechecks pass.
- Worker test suite passes: 2 files, 5 tests.
- Wrangler generated types are current.
- Deployment preflight finds 20 ordered migrations, environment validation, DB bindings, staging configuration, and health endpoints.

## [Unreleased] - RC1 Production Audit
### Fixed
- Removed unresolved README merge-conflict markers.
- Registered community and student-feedback route factories.
- Fixed root/frontend component imports, onboarding endpoint wiring, strict sync API types, and semantic status tokens.
- Corrected Worker type errors and updated stale unit-test contracts.
- Corrected migration and repository references to canonical D1 columns.
- Moved Wrangler D1 migrations configuration into the database binding.

### Added
- RC1 repository, dependency, database, API, frontend, security, performance, documentation, test, and release-readiness audits.

### Verified
- Expo TypeScript check passes.
- Worker TypeScript check passes.
- Worker Vitest suite passes: 2 files, 5 tests.

## [2.3.0] - 2026-07-27 (v1.0 RC1)
### Added
- Sprint 9 Launch Candidate, Production & Pilot Readiness features:
  - Production environment docs: `docs/PRODUCTION_ENVIRONMENT.md`, `docs/DEPLOYMENT_VALIDATION.md`.
  - Performance optimization indexes in `018_sprint9_performance_indexes.sql` and `docs/PERFORMANCE_OPTIMIZATION.md`.
  - Reliability utilities: `RetryService.ts`, `app/lib/retry.ts`, `app/lib/requestQueue.ts`, and `docs/RELIABILITY.md`.
  - Security audit: `docs/SECURITY_AUDIT.md`, `workers/api/middleware/rateLimit.ts`, `workers/api/services/InputValidationService.ts`.
  - Expanded tests: `workers/tests/authService.test.ts`, `taskService.test.ts`, `retryService.test.ts`, and `docs/TEST_REPORT.md`.
  - Observability: `MetricsRepository.ts`, `ObservabilityService.ts`, `GET /metrics`, `docs/OBSERVABILITY.md`, and `019_observability.sql`.
  - Pilot Operations Dashboard: `PilotOperationsRepository.ts`, `PilotOperationsDashboardService.ts`, `GET /pilot/operations`, and `docs/PILOT_OPERATIONS_DASHBOARD.md`.
  - Spark Moments: `SparkMomentsRepository.ts`, `SparkMomentsService.ts`, `GET/POST /spark-moments/*`, and `docs/SPARK_MOMENTS.md` with `020_spark_moments.sql`.
  - First-time experience review: `docs/FIRST_TIME_EXPERIENCE.md`.
  - Final product review: `docs/FINAL_REVIEW.md`.
  - Release package: `docs/VERSION_1_RELEASE_NOTES.md`, `docs/PILOT_ADMIN_GUIDE.md`, `docs/PILOT_STUDENT_GUIDE.md`, `docs/PILOT_AMBASSADOR_GUIDE.md`, `docs/LEADERSHIP_PRESENTATION.md`, `docs/RELEASE_CHECKLIST.md`.

### Changed
- `workers/api/routes/index.ts` now registers metrics, pilot operations, and spark moments routes.

### Security
- Added rate-limit middleware and input-sanitization utilities.
- Documented remaining security gaps and remediation steps before pilot.

## [2.2.0] - 2026-07-27
### Added
- Sprint 8 Experience, Delight & Product Excellence features:
  - Premium UI/UX polish: updated `docs/DESIGN_SYSTEM.md`, `docs/COMPONENT_LIBRARY.md`, and `docs/UX_PRINCIPLES.md` with motion, accessibility, and delight guidelines.
  - Premium motion system: `app/lib/motion.ts` presets, `app/providers/AnimationProvider.tsx` with reduced-motion support.
  - Beautiful growth dashboard widgets: `ProgressRing`, `StatsWidget`, `HeatmapWidget`, `AchievementCarousel`, and `GrowthDashboard`.
  - Spark Journey: `JourneyRepository`, `SparkJourneyService`, `GET /journey`, and `app/(tabs)/journey.tsx`.
  - Student portfolio: `PortfolioRepository`, `PortfolioService`, `GET /portfolio`, and `app/(tabs)/portfolio.tsx`.
  - Executive Dashboard 2.0: `ExecutiveDashboardService`, `GET /executive/dashboard`, and `docs/EXECUTIVE_DASHBOARD.md`.
  - AI experience refinement: `AIExperienceService` for weekly, monthly, and semester summaries, opportunities, and memory-aware context.
  - Student delight features: `DelightService` for birthdays, XP/streak milestones, welcome back, and `CelebrationOverlay`.
  - Ambassador & leadership polish: `AmbassadorLeadershipPolishService` with quick actions and activity/recognition summaries.
  - Product review: `docs/PRODUCT_REVIEW.md` and new docs `docs/SPARK_JOURNEY.md`, `docs/PORTFOLIO_SYSTEM.md`.
  - D1 migration `017_experience_and_delight.sql` for `journey_events`, `portfolio`, and `delight_events`.

### Changed
- `app/(tabs)/_layout.tsx` now includes `journey` and `portfolio` tabs.
- `workers/api/routes/index.ts` now registers journey, portfolio, executive dashboard, and delight routes.

### Security
- Executive dashboard endpoint is protected by `admin.executive.view` permission.
- No secrets are introduced.


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
