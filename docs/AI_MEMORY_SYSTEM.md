# AI Memory System

The AI Memory System upgrades the AI Companion from context-aware to memory-aware by storing explicit, user-controlled facts about preferences, goals, milestones, and interaction style.

## Principles

- **No psychological profiling.** The system stores only what the user explicitly shares or actions they take.
- **No sensitive inference.** SparkNC does not classify users or infer protected attributes.
- **User control.** Users can view, delete, and disable any memory.
- **Concise.** Values are capped at 500 characters and grouped by category.

## Categories

- `preference` — user-stated preferences (e.g., "I prefer short messages").
- `goal` — long-term learning or growth goals (e.g., "I want to improve my programming skills").
- `milestone` — important achievements the user highlights.
- `interaction` — recent conversation facts the user confirmed (e.g., "I have a calculus exam next week").

## Data model

Table `ai_memories`:

- `id` — memory id
- `user_id` — owner
- `key` — semantic key (e.g., `programming_goal`)
- `value` — the memory string
- `category` — `preference`, `goal`, `milestone`, or `interaction`
- `is_disabled` — soft-delete flag controlled by the user
- `created_at` / `updated_at` — timestamps

## API

- `POST /ai/memory` — create a memory.
- `GET /ai/memory` — list active memories.
- `PATCH /ai/memory/:id/disable` — disable a memory.
- `DELETE /ai/memory/:id` — delete a memory.

## Integration

`AIMemoryService.formatForPrompt()` appends a short memory paragraph to the AI prompt context so the companion can reference past user-stated preferences without maintaining a long transcript.

## Future work

- Add memory summarization to condense many interaction memories into a weekly digest.
- Let users import onboarding profile data as initial memory entries.
- Allow memory export and deletion under a privacy dashboard.
