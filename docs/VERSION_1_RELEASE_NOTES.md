# SparkNC v1.0 Release Candidate (RC1)

## Overview

SparkNC v1.0 RC1 is a cross-platform productivity and communication platform for students, ambassadors, lab leaders, administrators, and board members.

## What is included

- Expo mobile/web frontend with NativeWind and theming
- Cloudflare Worker backend with D1 database
- Authentication, tasks, goals, events, messages, notifications
- Gamification: XP, streaks, achievements
- AI companion with memory, weekly/monthly/semester recaps, and opportunities
- Community groups, posts, and moderation
- Ambassador support and leadership dashboards
- Pilot management and analytics
- Spark Journey and Student Portfolio
- Executive Dashboard 2.0
- Spark Moments celebrations
- Observability, rate limiting, retry, and offline resilience utilities

## Key files

- `wrangler.jsonc`
- `workers/index.ts`
- `workers/database/migrations/` (001–020)
- `app/(tabs)/` screens
- `docs/` comprehensive runbooks and guides

## Deployment

See `docs/DEPLOYMENT.md` and `docs/PRODUCTION_DEPLOYMENT.md`.

## Known limitations

- `npm install` and full typecheck are required before building.
- Some frontend screens use sample data until `cloudflareService` methods are fully wired.
- Load testing should be run in a dedicated staging environment.

## Support

For operational questions, see `docs/PRODUCTION_RUNBOOK.md`.
