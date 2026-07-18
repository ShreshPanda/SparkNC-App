import { AIMemoryInput, AIMemoryRecord, AIMemoryRepository } from '../repositories/AIMemoryRepository';

export interface MemorySummary {
  preferences: string[];
  goals: string[];
  milestones: string[];
  interactions: string[];
}

export class AIMemoryService {
  constructor(private readonly repository: AIMemoryRepository) {}

  async remember(input: AIMemoryInput): Promise<AIMemoryRecord> {
    const safeValue = this.sanitize(input.value);
    return this.repository.create({ ...input, value: safeValue });
  }

  async getMemoryContext(userId: string, limitPerCategory = 3): Promise<MemorySummary> {
    const [preferences, goals, milestones, interactions] = await Promise.all([
      this.repository.listActive(userId, 'preference'),
      this.repository.listActive(userId, 'goal'),
      this.repository.listActive(userId, 'milestone'),
      this.repository.listActive(userId, 'interaction'),
    ]);

    return {
      preferences: this.lastValues(preferences, limitPerCategory),
      goals: this.lastValues(goals, limitPerCategory),
      milestones: this.lastValues(milestones, limitPerCategory),
      interactions: this.lastValues(interactions, limitPerCategory),
    };
  }

  async formatForPrompt(userId: string): Promise<string> {
    const summary = await this.getMemoryContext(userId);
    const parts: string[] = [];
    if (summary.preferences.length) parts.push(`Preferences: ${summary.preferences.join('; ')}.`);
    if (summary.goals.length) parts.push(`Goals: ${summary.goals.join('; ')}.`);
    if (summary.milestones.length) parts.push(`Milestones: ${summary.milestones.join('; ')}.`);
    if (summary.interactions.length) parts.push(`Recent interactions: ${summary.interactions.join('; ')}.`);
    return parts.join(' ');
  }

  async disableMemory(id: string): Promise<void> {
    return this.repository.disable(id);
  }

  async disableMemoryByKey(userId: string, key: string): Promise<void> {
    return this.repository.disableByKey(userId, key);
  }

  async deleteMemory(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  private lastValues(records: AIMemoryRecord[], limit: number): string[] {
    return records.slice(0, limit).map((r) => r.value);
  }

  private sanitize(value: string): string {
    // Do not store long freeform text; keep memories concise.
    return value.length > 500 ? value.slice(0, 500) : value;
  }
}
