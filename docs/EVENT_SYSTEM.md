# SparkNC Event System

## Overview

The Event system lets students view upcoming events, register (RSVP), and lets location managers or admins create and manage events. Events support attendees, scopes by school, and an enriched API response that includes `isRegistered` and `attendeeCount`.

## Database

### events

| Column       | Type    | Notes                     |
| ------------ | ------- | ------------------------- |
| id           | TEXT    | Primary key               |
| title        | TEXT    | Required                  |
| description  | TEXT    | Optional                  |
| location     | TEXT    | Optional                  |
| starts_at    | TEXT    | ISO timestamp             |
| ends_at      | TEXT    | ISO timestamp             |
| created_by   | TEXT    | FK to users(id)           |
| school_id    | TEXT    | Optional scope            |
| created_at   | TEXT    | ISO timestamp             |
| updated_at   | TEXT    | ISO timestamp             |

### event_attendees

| Column    | Type   | Notes                        |
| --------- | ------ | ---------------------------- |
| event_id  | TEXT   | FK to events(id)             |
| user_id   | TEXT   | FK to users(id)              |
| created_at| TEXT   | ISO timestamp                |

## Endpoints

- `GET    /events`               – list all upcoming events
- `GET    /events/:id`          – get event details
- `POST   /events`              – create event (requires `events.manage`)
- `PUT    /events/:id`          – update event (requires `events.manage`)
- `DELETE /events/:id`          – delete event (requires `events.manage`)
- `POST   /events/:id/register` – RSVP to an event
- `GET    /events/:id/attendees`– list attendees (requires `events.manage`)

## Files

- `workers/api/repositories/EventRepository.ts`
- `workers/api/services/eventService.ts`
- `workers/api/controllers/events.ts`
- `workers/api/routes/events.ts`
- `workers/database/migrations/005_organization.sql`

## Frontend

The `Calendar` tab (`app/(tabs)/calendar.tsx`) lists events, allows RSVP, and provides an event creation form.
