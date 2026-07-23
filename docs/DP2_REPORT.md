# Design Pass 2 Report — "The Living Platform"

## Overview
Design Pass 2 focuses on making every existing system in SparkNC work together intelligently. It is not about adding isolated features, but about surfacing context-aware recommendations, adaptive dashboards, and data-backed observations so the platform feels like it understands the student.

## Scope
- No new frameworks.
- No ML models.
- Reuse existing repositories, services, and routes.
- Prioritize explainable, rule-based intelligence.

## Phases and outcomes

### PHASE 1 — Adaptive Dashboard
- Added `PriorityCard` to the top of `app/(tabs)/dashboard.tsx`.
- `computePriority` ranks urgent items using existing task, goal, event, and streak data.
- Top priority is shown with icon, title, message, and action.
- The rest of the dashboard remains available below.

### PHASE 2 — Opportunity Engine
- New `workers/api/services/opportunityService.ts` with rule-based scoring.
- New `workers/api/controllers/opportunities.ts` and `workers/api/routes/opportunities.ts`.
- `/opportunities` endpoint registered in `workers/api/routes/index.ts`.
- `cloudflareService.getOpportunities()` added for the frontend.
- Dashboard `Opportunities for You` card displays scored recommendations with reasons.
- Scoring considers tasks completed, goals completed, events attended, streak, XP, and onboarding interests.

### PHASE 3 — Smart Goal Suggestions
- `app/(tabs)/goals.tsx` generates suggestions from `GrowthStatistics` and existing goals.
- Rules avoid duplicating existing goal titles.
- Students can accept (creates a real goal) or dismiss suggestions.

### PHASE 4 — Growth Intelligence
- Extended `GrowthStatistics` with `observations: string[]`.
- `GrowthStatisticsService.buildObservations` derives statements from real `StudentStatsRecord` and `GrowthCategory` data.
- Examples:
  - Streak status and momentum.
  - Task/goal/attendance milestones.
  - Strongest growth category.
  - Encouragement for recovery when longest streak exceeds current streak.
- `app/(tabs)/growth.tsx` renders the observations list.

### PHASE 5 — Mentor Workspace
- `app/(tabs)/ambassador.tsx` (renamed title to "Ambassador Workspace") shows per-student quick actions.
- Actions: recommend goal, recommend event, celebrate milestone, flag follow-up.
- Each action sends a message through the existing `cloudflareService.sendMessage` endpoint.

### PHASE 6 — School Identity
- Added `SchoolIdentity` to `shared/types.ts`.
- `OrganizationService.getSchoolById` reads from the `schools` table and returns branding fields.
- New `workers/api/controllers/schools.ts` and `workers/api/routes/schools.ts` provide `GET /schools/:id`.
- `cloudflareService.getSchool` calls the new endpoint.
- `app/(tabs)/dashboard.tsx` displays the school name and mascot in the header card when the user has a `schoolId`.

### PHASE 7 — Portfolio Evolution
- `PortfolioRecord` type extended to include `volunteer`, `badge`, and `reflection`.
- `PortfolioService.getPortfolio` aggregates these new sections.
- `app/(tabs)/portfolio.tsx` renders `Volunteer Work`, `Badges`, and `Reflections` sections.
- `cloudflareService.ts` `PortfolioSummary` type and fallback updated to match.
- Lays groundwork for future PDF export without adding PDF libraries.

### PHASE 8 — AI Growth Coach
- `app/(tabs)/ai.tsx` opens with a `Growth Coach` card.
- Proactively loads `getAIReflection` and `getAIPlan` on mount.
- Insight grid renamed to include Celebrate, Reflection, Goal check-in, and Plan.

### PHASE 9 — Accessibility & Performance
- Added `accessibilityLabel` and `accessibilityRole` to Dashboard `PriorityCard` and task completion `Pressable` rows.

### PHASE 11 — System Integration
- `TaskService` and `GoalService` now write `growth_events` on completion.
- `GrowthTimelineRepository` is injected into both services.
- This ensures task/goal completions feed the support queue, growth timeline, analytics, and achievement checks.

## Files created
- `workers/api/services/opportunityService.ts`
- `workers/api/controllers/opportunities.ts`
- `workers/api/routes/opportunities.ts`
- `workers/api/controllers/schools.ts`
- `workers/api/routes/schools.ts`
- `docs/DP2_REPORT.md`

## Files modified
- `app/(tabs)/dashboard.tsx`
- `app/(tabs)/growth.tsx`
- `app/(tabs)/goals.tsx`
- `app/(tabs)/ai.tsx`
- `app/(tabs)/ambassador.tsx`
- `app/(tabs)/portfolio.tsx`
- `services/cloudflareService.ts`
- `shared/types.ts`
- `workers/api/services/growthStatisticsService.ts`
- `workers/api/services/organizationService.ts`
- `workers/api/services/PortfolioService.ts`
- `workers/api/repositories/PortfolioRepository.ts`
- `workers/api/services/taskService.ts`
- `workers/api/services/goalService.ts`
- `workers/api/controllers/tasks.ts`
- `workers/api/controllers/goals.ts`
- `workers/api/routes/index.ts`
- `workers/tests/taskService.test.ts`
- `CHANGELOG.md`
- `PROJECT_STATUS.md`
- `NEXT_TASK.md`

## Verification
- `npm run typecheck` passes.
- `npm run typecheck:worker` passes.
- `npm run test:worker` passes (5 tests).

## Deferred phases
- PHASE 10 — Full Product Consistency audit across all screens
- PHASE 12 — End-to-end Demo Quality Review with role accounts

## Next recommended work
1. Complete Product Consistency audit (PHASE 10) across tab screens and admin views.
2. Run end-to-end demo walkthrough (PHASE 12) with student, ambassador, admin, and leadership accounts.
