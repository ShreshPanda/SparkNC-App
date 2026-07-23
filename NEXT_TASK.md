# Next Task

## Sprint 10 Part 2 — "The Spark That Stays" v1.0 (in progress)

SparkNC is feature-complete and integrated. Sprint 10 Part 2 refined the product into a seamless, demo-ready experience. Demo Mode is now functional, accessibility coverage is stronger, and the final product review doc is in place. Remaining work: portfolio evolution, ambassador command center, leadership dashboards, community refinement, emotional experience review, and full role walkthroughs.

## Immediate Sprint 10 Part 2 next steps

1. **Deployment readiness**: production origin, `ALLOWED_ORIGINS`, role permissions, staging validation per `docs/PRODUCTION_CHECKLIST.md`.

## Completed Sprint 10 work

- `dashboard.tsx` now generates personalized `TodaysSpark` insights from real tasks, goals, events, opportunities, streak, and XP.
- Time-aware greeting added to `dashboard.tsx` and `ai.tsx`.
- `growth.tsx` uses `SparkButton` for `Generate Timeline` and `Refresh Timeline` CTAs.
- `ai.tsx` greeting loads the user’s first name and uses a coach-like subtitle.
- `TodaysSpark` insights fade in smoothly for a premium feel.
- Presentation Mode hides the bottom tab bar and shows a non-intrusive "Demo mode" pill with larger headers and extra padding.
- `app/onboarding.tsx` `ActivityIndicator` color uses `colors.foreground` instead of hardcoded `#ffffff`.
- `login.tsx` and `signup.tsx` CTAs/links now include `accessibilityRole` and `accessibilityLabel`.
- `portfolio.tsx` hero, icon sections, count pills, and tag-style skills/badges.
- `ambassador.tsx` "Today's focus" summary, status pills, sorted students, richer actions.
- `analytics.tsx`, `impact.tsx`, `progress.tsx` hero KPI tiles, `SparkCard` sections, clearer trends.
- `messages.tsx` and `feedback.tsx` `SparkCard`, `SparkButton`, `Ionicons`, `FadeIn`, empty states.
- `docs/EMOTIONAL_REVIEW.md` and `docs/ROLE_WALKTHROUGH.md` created.
- Verified no `TODO`/`FIXME`/`HACK`/`XXX` markers and no native `Button` imports in `app/`.
- `CHANGELOG.md`, `PROJECT_STATUS.md`, `SPRINT_STATE.md`, and `NEXT_TASK.md` updated for Sprint 10 and Part 2.
- `docs/SPARKNC_V1_PRODUCT_REVIEW.md` and `docs/SPARKNC_V1_RELEASE_REPORT.md` created.
- `npm run typecheck`, `npm run typecheck:worker`, and `npm run test:worker` all pass.

## Blocking deployment work (unchanged)

4. **Deploy the Expo frontend to a production HTTPS origin.**
5. **Update `ALLOWED_ORIGINS`** in `wrangler.jsonc` with the exact production frontend origin, then run `npm run check:deployment` and `npm run deploy:worker`.
6. **Seed required role permissions** in the production D1 database (`pilot.*`, `community.moderate.*`, `ambassador.support.*`, `admin.executive.view`, `admin.pilot.view`).
7. **Create a staging D1 database and Worker environment** only when formal staging validation is required.
8. **Complete staging validation** per `docs/STAGING_VALIDATION.md` and load testing before opening the pilot.

## Deployment facts

- Worker URL: `https://sparknc-api.shreshpanda.workers.dev`
- D1 database: `sparknc-production` (`ac09ed8a-0ba3-4d4e-88b4-3fed3d8bca73`)
- Worker Version ID: `f3ab077e-5e91-4255-81db-1f6d3c7c0edf`
- `ALLOWED_ORIGINS` is currently local-development only: `http://localhost:19006,http://localhost:8081,http://localhost:3000`.

## Canonical documents

- `docs/CLOUDFLARE_SETUP.md`
- `docs/PRODUCTION_CHECKLIST.md`
- `docs/STAGING_VALIDATION.md`
- `docs/PRODUCTION_VERIFICATION.md`
- `docs/DEPLOYMENT_AUTOMATION.md`
- `docs/MAC_SETUP.md`
