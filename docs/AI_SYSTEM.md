# SparkNC AI Companion System

## Purpose
Spark is a context-aware, privacy-first AI companion for students. It answers questions about the student's own progress and suggests small next steps. It does not make decisions for the student or expose data beyond what the authenticated user is allowed to see.

## Components
- `StudentContextBuilder` — gathers the user's current tasks, goals, stats, and recent insights from existing D1 tables.
- `PromptService` — builds a system prompt and a per-message user prompt from the context.
- `MemoryService` / `MemoryRepository` — stores short-term conversation history in `ai_memories`.
- `AIService` — orchestrates context, prompt, memory, and returns a deterministic, helpful response.
- `AIController` — exposes `POST /ai/chat`.

## Data Flow
1. Student sends `POST /ai/chat` with `{ message }`.
2. `AIController` verifies the session.
3. `StudentContextBuilder` reads tasks, goals, stats, and insights (limited to the requesting user).
4. `PromptService` creates prompts that include context but no PII beyond the user's own data.
5. `AIService` generates a reply based on intent keywords (progress, streak, overwhelm, etc.).
6. `MemoryService` stores the user and assistant messages.

## Safety Guardrails
- No external LLM API is called in this foundation; replies are deterministic and do not leak proprietary logic.
- The system refuses to provide test answers or complete assignments.
- Context is scoped to the authenticated `user_id`.
- All memories are written to `ai_memories` for audit and future improvement.

## Files
- `workers/api/services/aiService.ts`
- `workers/api/services/promptService.ts`
- `workers/api/services/studentContextBuilder.ts`
- `workers/api/services/memoryService.ts`
- `workers/api/repositories/MemoryRepository.ts`
- `workers/api/controllers/ai.ts`
- `workers/api/routes/ai.ts`
- `app/(tabs)/ai.tsx`

## Future Work
- Replace `generateResponse` with a call to Workers AI or an external LLM when a model/key is approved.
- Add retrieval of long-term memory summaries from `ai_memories`.
- Support multi-turn context window limits.
