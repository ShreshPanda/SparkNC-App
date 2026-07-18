# SparkNC Leadership Demo Guide

This document is the single source of truth for running the leadership demo of the SparkNC platform.

## Demo accounts

| Role | Email | Password hint |
| --- | --- | --- |
| Student | `demo.student@sparknc.example` | `demo-student-!secure` |
| Ambassador | `demo.ambassador@sparknc.example` | `demo-ambassador-!secure` |
| Admin | `demo.admin@sparknc.example` | `demo-admin-!secure` |

Create these accounts through the admin onboarding flow or seed them in `005_organization.sql`. Never use the example passwords in production.

## Student flow

1. **Login** → `demo.student@sparknc.example`
2. **Dashboard** → complete a demo task, watch XP and streak update.
3. **Growth Timeline** → show weekly stats and story.
4. **AI Companion** → ask "What should I focus on?" and show a personalized response.
5. **Achievements** → highlight recent unlocks.

## Ambassador flow

1. **Login** → `demo.ambassador@sparknc.example`
2. **Student Support** → show the support queue and select an inactive student.
3. **Send Message** → send an encouragement message.
4. **Impact** → show support trends and re-engagement.

## Admin flow

1. **Login** → `demo.admin@sparknc.example`
2. **Analytics** → open `GET /analytics/engagement` and explain DAU, WAU, MAU.
3. **Student Support** → show at-risk cohorts.
4. **Reports** → generate a monthly impact report.
5. **Audit** → show `AuditLogService` entries for sensitive actions, emphasizing no private data is stored.

## Operational notes

- Pre-seed demo data using the existing `/demo` endpoint.
- Use `LeadershipDemoService.getScenario(role)` to load the step list programmatically.
- `LeadershipDemoService.logDemoAccess()` records each demo session in the audit log.
- Prepare fallback responses for AI, push, and offline sync in case live services are not yet enabled.

## Timing

Aim for a 10–15 minute demo. Practice handoffs between student, ambassador, and admin roles.

## Post-demo

- Collect feedback.
- Record action items in the product backlog.
- Update this guide if the demo flow changes.
