import { AIMemoryService, type MemorySummary } from './AIMemoryService';
import { PersonalGrowthNarrativeService, type GrowthNarrative } from './personalGrowthNarrativeService';

export interface AIContext {
  userId: string;
  memories: MemorySummary;
  weeklySummary: string;
  monthlyReflection: string;
  semesterRecap: string;
  opportunities: string[];
  strongestArea: string;
  nextStep: string;
}

export class AIExperienceService {
  constructor(
    private readonly memory: AIMemoryService,
    private readonly narrative: PersonalGrowthNarrativeService,
  ) {}

  async buildContext(userId: string): Promise<AIContext> {
    const memories = await this.memory.getMemoryContext(userId);
    const [weekly, monthly, semester] = await Promise.all([
      this.narrative.generate(userId, 'week'),
      this.narrative.generate(userId, 'month'),
      this.narrative.generate(userId, 'semester'),
    ]);
    return {
      userId,
      memories,
      weeklySummary: weekly.headline,
      monthlyReflection: monthly.headline,
      semesterRecap: semester.headline,
      opportunities: this.deriveOpportunities(monthly),
      strongestArea: monthly.strongestArea,
      nextStep: monthly.nextStep,
    };
  }

  weeklySummary(userId: string): Promise<string> {
    return this.narrative.generate(userId, 'week').then((s) => s.headline);
  }

  monthlyReflection(userId: string): Promise<string> {
    return this.narrative.generate(userId, 'month').then((s) => s.headline);
  }

  semesterRecap(userId: string): Promise<string> {
    return this.narrative.generate(userId, 'semester').then((s) => s.headline);
  }

  recommendOpportunities(userId: string): Promise<string[]> {
    return this.narrative.generate(userId, 'month').then((s) => this.deriveOpportunities(s));
  }

  private deriveOpportunities(narrative: GrowthNarrative): string[] {
    const opts: string[] = [];
    if (narrative.stats.goalsCompleted === 0) opts.push('Set one small goal this week to build momentum.');
    if (narrative.stats.eventsAttended === 0) opts.push('Join a community event to connect your progress with peers.');
    if (narrative.stats.tasksCompleted === 0) opts.push('Complete one task within 24 hours to restart consistency.');
    if (opts.length === 0) opts.push('Keep the current rhythm and try one stretch skill.');
    return opts;
  }
}
