# SparkNC Platform Proposal

## Problem
Students need more than a task tracker. They need a sense of progress, belonging, and guidance. Organizations need visibility into student growth, engagement, and program impact without creating surveillance or competition.

## Solution
SparkNC is a single platform that combines:
- **Student growth tools** — tasks, goals, streaks, XP, and a personal growth timeline.
- **AI companion** — helpful, private coaching that never makes decisions for students.
- **Ambassador support** — peer mentors see only authorized students and receive actionable insights.
- **Admin command center** — organization overview, support insights, and program analytics.
- **Feedback & continuous improvement** — student and ambassador feedback feeds into analytics and recommendations.

## Impact
- Students feel supported and can see their own growth.
- Ambassadors spend time on students who need help.
- Administrators make data-informed decisions while protecting privacy.
- Programs improve through structured feedback and recommendation loops.

## Current Capabilities (Sprint 6)
- Cloudflare Worker + D1 backend with `Route → Controller → Service → Repository` architecture.
- Expo React Native frontend with NativeWind and SparkNC design tokens.
- Production health endpoints (`/health`, `/version`, `/status`).
- **Complete Security & Audit System**: redacting `AuditLogService`, `AuditLogMiddleware`, `009_audit_logs.sql`, and centralized logging of every sensitive operation.
- **Real Testing Infrastructure**: Vitest config, `TEST_COVERAGE.md`, and starter unit tests for `AuthService` and `AuditLogService`.
- **Push Notification Infrastructure**: `PushTokenRepository`, `PushNotificationService`, extensible `NotificationProvider` interface, and `010_push_notifications.sql`.
- **Advanced AI Personalization**: `StudentProfileIntelligenceService` for productivity insights without sensitive profiling.
- **Multi-School Organization Scaling**: `OrganizationService` and hierarchical scoping architecture.
- **Community Collaboration**: groups, memberships, posts, and `/community/*` routes with `011_community.sql`.
- **AI-Powered Growth Narrative**: `PersonalGrowthNarrativeService` combining growth events, achievements, tasks, and streaks.
- **Performance & Monitoring**: `012_performance_indexes.sql`, `PerformanceMonitoringService`, and a documented performance guide.
- **Offline Support**: `services/syncService.ts` with storage-agnostic queued sync and retry handling.
- **Accessibility & Inclusion**: documented screen-reader, keyboard, font-scaling, and inclusive-language guidelines.
- Smart notifications with preferences, scheduling, and quiet hours.
- Growth Timeline 2.0 with statistics and story.
- AI companion with reflection, planning, recommendations, and growth analysis.
- Advanced admin and ambassador command centers.
- Impact recognition via achievements and `ImpactRecognitionService`.
- Permission middleware, role-based access, and audit logging.
- Demo mode and showcase screen for leadership presentations.

## Future Roadmap
- Real iOS/Android/web push provider implementations wired into notification scheduling.
- Integration with external LLM (Workers AI) for AI companion.
- PDF/dashboard export from impact reports.
- Native mobile app store releases.
- Real-time event reminders and attendance optimization.
- Durable Object-based crons and multi-organization federation.
- Expanded Vitest suite and end-to-end React Native Testing Library coverage.

## Why SparkNC
SparkNC is designed to feel premium, fast, and human. It treats students as individuals, respects privacy, and gives organizations the insight they need to improve — without surveillance.
