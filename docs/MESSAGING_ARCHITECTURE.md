# SparkNC Messaging Architecture

## Overview

SparkNC provides internal communication through a database-backed messaging system. It supports one-to-one direct messages via shared `conversations`. WebSockets and external push providers are not implemented yet, but the design is intentionally transactional and reliable.

## Data Model

### conversations

| Column    | Type   | Notes                      |
| --------- | ------ | -------------------------- |
| id        | TEXT   | Primary key                |
| created_at| TEXT   | ISO timestamp              |
| updated_at| TEXT   | ISO timestamp              |

### conversation_participants

| Column          | Type   | Notes                            |
| --------------- | ------ | -------------------------------- |
| conversation_id | TEXT   | FK to conversations(id)          |
| user_id         | TEXT   | FK to users(id)                  |
| created_at      | TEXT   | ISO timestamp                    |

### messages

| Column          | Type   | Notes                            |
| --------------- | ------ | -------------------------------- |
| id              | TEXT   | Primary key                      |
| conversation_id | TEXT   | FK to conversations(id)          |
| sender_id       | TEXT   | FK to users(id)                  |
| recipient_id    | TEXT   | FK to users(id)                  |
| body            | TEXT   | Message content                  |
| read_status     | TEXT   | `sent`, `delivered`, `read`      |
| created_at      | TEXT   | ISO timestamp                    |

## Endpoints

- `GET  /conversations`                – list user's conversations
- `GET  /conversations/:id`            – get a conversation
- `GET  /conversations/:id/messages`   – list messages in a conversation
- `POST /conversations/:id/read`       – mark conversation messages as read
- `POST /messages`                      – send a new message

## Files

- `workers/api/repositories/MessageRepository.ts`
- `workers/api/services/messageService.ts`
- `workers/api/controllers/messages.ts`
- `workers/api/routes/messages.ts`
- `workers/database/migrations/005_organization.sql`

## Future

- WebSockets for real-time delivery can be layered on top without changing the schema.
- Push notifications can be triggered from `NotificationService` when messages are created.
