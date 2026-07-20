# Spark Journey

Spark Journey turns a student's entire SparkNC history into a chronological, story-driven experience.

## Purpose

- Celebrate progress over time.
- Make growth visible and shareable.
- Provide a narrative view rather than a spreadsheet.

## Data model

- `journey_events` table
  - `id`, `user_id`, `date`, `title`, `description`, `category`, `badge`
  - Categories: `milestone`, `goal`, `achievement`, `event`, `community`, `reflection`

## Backend

- `JourneyRepository.ts` — load and write journey events.
- `SparkJourneyService.ts` — groups events by month, supports year/semester/category filters.
- `GET /journey` with optional `year`, `semester`, `category` filters.

## Frontend

- `app/(tabs)/journey.tsx` — timeline UI with month cards and dot timeline.
- Filtering by semester and year can be added as dropdowns.

## Privacy

- Journey data is user-owned and visible only to that student, ambassadors, and authorized admins.
- No sensitive events are stored.

## Future improvements

- Export as shareable graphic/PDF.
- Highlight annual recap.
- Add "year in review" animation.
