# SparkNC Demo Mode

## Purpose
Demo Mode gives leadership a self-contained, synthetic view of the platform without mixing data with production users.

## Component
- `DemoDataService` — generates deterministic, realistic demo data.
- `GET /demo` — returns a demo scenario.

## Demo Data
- **Students**: four personas with XP, streaks, goals, tasks, and AI-style insights.
- **Ambassador View**: status indicators (`thriving`, `active`, `at_risk`, `needs_attention`) and recommendations.
- **Admin Metrics**: total students, active users, engagement, satisfaction, XP trend, feedback themes, and improvement recommendations.

## Architecture
No D1 writes are required. The demo is generated in memory and served as JSON. The `Impact` frontend screen falls back to demo data when live metrics are unavailable.

## Future Work
- Add `POST /demo/seed` to create a sandbox demo organization with demo users in a separate `is_demo` namespace.
- Add `POST /demo/clear` to remove sandbox demo data.
