# Portfolio System

The Portfolio System gives students a professional, export-ready record of their SparkNC growth.

## Purpose

- Showcase real projects, completed goals, achievements, events, and skills.
- Provide leadership and certificate tracking.
- Be resume- and interview-ready.

## Data model

- `portfolio` table
  - `user_id`, `type`, `id`, `title`, `description`, `date`, `metadata`
  - Types: `project`, `goal`, `achievement`, `event`, `skill`, `certificate`, `community`

## Backend

- `PortfolioRepository.ts` — query and mutate portfolio records.
- `PortfolioService.ts` — assembles a full portfolio summary by type.
- `GET /portfolio` returns the summary.

## Frontend

- `app/(tabs)/portfolio.tsx` — grouped sections (Projects, Goals, Achievements, Events, Skills, Certificates, Leadership, Community).
- Stats header with XP and streak.

## Privacy

- Portfolio is user-owned by default.
- Students choose what to share with mentors, admissions, or employers.

## Future improvements

- PDF export.
- Public profile link with permission controls.
- Resume bullet generation from records.
