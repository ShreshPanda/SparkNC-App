# Demo Candidate 1 (DC1) — Spark Comes Alive

## Mission
Transform SparkNC from a deployed, feature-complete backend into a polished, beautiful, emotionally engaging product ready to demonstrate to leadership. No new systems or architecture redesigns. The goal is to connect every visible screen to real backend data, populate a believable demo dataset, and polish the experience end-to-end.

## Inspection summary

### Deployed backend status
- Worker URL: `https://sparknc-api.shreshpanda.workers.dev`
- D1 database: `sparknc-production` (`ac09ed8a-0ba3-4d4e-88b4-3fed3d8bca73`)
- Health check: `status: ok`, 129 routes, auth configured.
- Secrets: `SESSION_SECRET` and `BETTER_AUTH_SECRET` are set.

### Frontend navigation
- `app/(tabs)/_layout.tsx` registers 18 tabs (dashboard, tasks, goals, calendar, messages, notifications, profile, progress, timeline, journey, portfolio, achievements, ai, ambassador, analytics, feedback, impact, showcase, admin).
- Root redirects to `/(auth)/login`.
- Auth stack: login and signup.

### Connected screens (already calling backend)
- `dashboard.tsx` → `authService.getSession`, `listTasks`, `listGoals`, `listEvents`
- `tasks.tsx` → `listTasks`, `createTask`, `completeTask`, `deleteTask`
- `goals.tsx` → `listGoals`, `createGoal`, `completeGoal`, `deleteGoal`
- `profile.tsx` → `authService.getSession`
- `messages.tsx` → `listConversations`, `getMessages`, `markConversationRead`, `sendMessage`
- `notifications.tsx` → `listNotifications`, `markNotificationRead`, `markAllNotificationsRead`
- `ai.tsx` → `cloudflareService.askAI`
- `achievements.tsx` → `listAchievements`, `checkAchievements`
- `progress.tsx` → `getStudentDashboard`, `generateStudentInsights`
- `growth.tsx` → `getGrowthTimeline`, `generateGrowthTimeline`
- `feedback.tsx` → `getMyFeedback`, `listFeatureRequests`, `submitFeedback`, `createFeatureRequest`, `voteFeatureRequest`
- `ambassador-feedback.tsx` → `getAmbassadorFeedback`, `submitAmbassadorFeedback`
- `ambassador.tsx` → `getAmbassadorDashboard`
- `analytics.tsx` → `getAnalyticsOverview`
- `impact.tsx` → `getImpactAnalytics`, `listRecommendations`, `listImpactReports`, `getDemoScenario`, `generateImpactReport`, `generateRecommendations`
- `showcase.tsx` → `getDemoScenario`
- `calendar.tsx` → `listEvents`, `registerForEvent`, `createEvent`
- `admin.tsx` → `createEvent`, `createAnnouncement` (UI only, no user list)

### Disconnected / broken screens
- `journey.tsx` calls `/api/journey` (route does not exist; correct route is `GET /journey`) and falls back to hardcoded `sampleJourney()`.
- `portfolio.tsx` calls `/api/portfolio` (route does not exist; correct route is `GET /portfolio`) and falls back to hardcoded `samplePortfolio()`.
- `settings.tsx` is a placeholder with no real functionality.

### Mocked backend controllers
- `workers/api/controllers/admin.ts`
  - `listAdminUsersController` returns `{ items: [], message: '...' }` — no real user list.
  - `createAdminEventController` returns a fake ID without persisting.
  - `createAnnouncementController` returns a fake ID without persisting.
- `workers/api/services/demoDataService.ts` generates fully synthetic data in memory; nothing is persisted to D1.

### Permission blockers
- `requirePermission` middleware wraps `/ambassador/dashboard`, `/admin/*`, `/executive/dashboard`, `/analytics/snapshot/*`, etc.
- `roles` table is empty by default; all protected routes return 403/401 unless roles are seeded.
- No role assignment is exposed in signup UI (all users default to `student`).

### Empty-state / demo-breaking issues
- Most screens show "No X yet" on first use because no demo data exists.
- Dashboard does not answer "What should I do today?" — it just lists active tasks/goals/events.
- Growth Timeline and Portfolio always render sample data until real data is created.
- Ambassador Dashboard will be empty without seeded assignments and insights.
- Admin screen has no user list; event/announcement creation does not persist.

### Visual polish gaps
- Many screens rely on `Button` and basic cards; no charts, no progress rings in use outside `showcase.tsx`.
- Empty states are plain text only.
- No presentation mode.
- No celebration/delight overlays wired into normal flows.

## DC1 execution plan

### Phase 1 — Connect Everything
1. Fix `journey.tsx` to use `cloudflareService.getJourney()` against `GET /journey`.
2. Fix `portfolio.tsx` to use `cloudflareService.getPortfolio()` against `GET /portfolio`.
3. Build `settings.tsx` with real notification preferences and theme-aware controls.
4. Wire `admin.tsx` user list to a real `/admin/users` endpoint and make event/announcement creation persist.
5. Add a role selector during signup (student / ambassador / admin) for demo purposes, with backend permission seeding.

### Phase 2 — Demo Dataset
1. Create a D1 seed script (`scripts/seed-demo-data.mjs`) that inserts:
   - schools, students, ambassadors, admins
   - tasks, goals, events, announcements
   - conversations, messages, notifications
   - achievements, streaks, XP history
   - growth events, Spark Moments, reflections, AI memories
   - feedback, feature requests, impact reports, recommendations
   - role permissions
2. Expose a safe, permission-gated `/demo/seed` Worker endpoint for one-click repopulation.
3. Make `seed-demo-data.mjs` idempotent and runnable via `npm run seed:demo`.

### Phase 3 — Dashboard Experience
1. Redesign `dashboard.tsx` to show:
   - Today's top action
   - Active tasks with one-tap complete
   - Active goals with progress
   - Upcoming events
   - Recent achievements / celebrations
   - XP, streak, level stats
2. Add friendly empty states and quick-action buttons.

### Phase 4 — Growth Timeline
1. Keep `growth.tsx` for statistics (XP, streak, tasks, goals, events, community, participation).
2. Enhance `journey.tsx` as the chronological story view with milestone cards.
3. Add `GET /growth-timeline/stats` and `GET /growth-timeline/story` usage.

### Phase 5 — Ambassador Experience
1. Polish `ambassador.tsx` to surface support buckets and quick actions.
2. Seed ambassador-student assignments so the dashboard is not empty.

### Phase 6 — Leadership Experience
1. Polish `impact.tsx` and `analytics.tsx` with executive-level summary cards.
2. Wire `/executive/dashboard` and ensure demo data populates it.
3. Add simple bar/line trend visuals using the existing theme tokens.

### Phase 7 — Visual Polish
1. Replace raw `Button` usage with themed `SparkButton` / `Pressable` styled components.
2. Use `SparkCard`, `Skeleton`, `EmptyState`, `AnimatedWrapper` consistently.
3. Unify spacing, border radius, and typography across all screens.
4. Improve responsive layout for web demos.

### Phase 8 — Delight
1. Wire `CelebrationOverlay` into task/goal completion and achievement unlock.
2. Add success toasts and friendly empty-state illustrations.

### Phase 9 — Presentation Mode
1. Add a `PresentationProvider` and a toggle in `settings.tsx`.
2. Increase typography scale, reduce tab clutter, and hide non-essential UI when presenting.

### Phase 10 — Demo Validation
1. Walk through every flow as student, ambassador, admin.
2. Fix critical demo-breaking issues.
3. Document remaining known limitations in this report.

## Files requiring changes

### Frontend
- `app/(tabs)/journey.tsx`
- `app/(tabs)/portfolio.tsx`
- `app/(tabs)/settings.tsx`
- `app/(tabs)/admin.tsx`
- `app/(tabs)/dashboard.tsx`
- `app/(tabs)/analytics.tsx`
- `app/(tabs)/impact.tsx`
- `app/(tabs)/ambassador.tsx`
- `app/(auth)/signup.tsx`
- `services/cloudflareService.ts`
- `shared/types.ts` (if new endpoints need types)

### Backend
- `workers/api/controllers/admin.ts`
- `workers/api/routes/admin.ts` (if user list route missing)
- `workers/api/controllers/demo.ts` (seed endpoint)
- `workers/api/routes/demo.ts` (seed route)
- `workers/api/services/roleService.ts` or seed helper

### Tooling / docs
- `scripts/seed-demo-data.mjs`
- `package.json` (seed script)
- `docs/DC1_REPORT.md` (this file)
- `PROJECT_STATUS.md`, `SPRINT_STATE.md`, `NEXT_TASK.md`, `CHANGELOG.md`
