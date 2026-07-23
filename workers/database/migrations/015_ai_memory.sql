-- Sprint 7: AI memory stores user preferences and learning context, not psychological profiles.
-- The table originates in 006_intelligence.sql; evolve it for the structured memory repository.
ALTER TABLE ai_memories ADD COLUMN key TEXT;
ALTER TABLE ai_memories ADD COLUMN value TEXT;
ALTER TABLE ai_memories ADD COLUMN category TEXT NOT NULL DEFAULT 'preference';
ALTER TABLE ai_memories ADD COLUMN is_disabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ai_memories ADD COLUMN updated_at TEXT;

CREATE INDEX IF NOT EXISTS idx_ai_memories_user_id ON ai_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_memories_key ON ai_memories(user_id, key);
CREATE INDEX IF NOT EXISTS idx_ai_memories_enabled ON ai_memories(user_id, is_disabled);
