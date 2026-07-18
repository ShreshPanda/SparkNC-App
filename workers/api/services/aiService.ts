import { MemoryService } from './memoryService';
import { PromptService } from './promptService';
import { StudentContextBuilder } from './studentContextBuilder';
import { assertNonEmpty } from '../validators/baseValidator';

export interface AIChatInput {
  message: string;
}

export interface AIChatOutput {
  reply: string;
  memories: { role: string; content: string }[];
}

export class AIService {
  constructor(
    private readonly contextBuilder: StudentContextBuilder,
    private readonly promptService: PromptService,
    private readonly memoryService: MemoryService,
  ) {}

  async chat(userId: string, input: AIChatInput): Promise<AIChatOutput> {
    assertNonEmpty(input.message, 'Message is required');

    const context = await this.contextBuilder.build(userId);
    const system = this.promptService.buildSystemPrompt(context as any);
    const userPrompt = this.promptService.buildUserPrompt(context as any, input.message);

    const memory = await this.memoryService.getRecentContext(userId);
    const relevantMemory = memory.filter((m) => m.role === 'assistant' || m.role === 'user').slice(-5);

    // Deterministic, helpful response built from context without calling an external LLM.
    const reply = this.generateResponse(context, input.message);

    await this.memoryService.remember(userId, 'user', input.message);
    await this.memoryService.remember(userId, 'assistant', reply, JSON.stringify({ prompt: userPrompt, system }));

    return {
      reply,
      memories: [
        { role: 'system', content: system },
        ...relevantMemory.map((m) => ({ role: m.role, content: m.content })),
      ],
    };
  }

  private generateResponse(context: Awaited<ReturnType<StudentContextBuilder['build']>>, message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('how am i doing') || lower.includes('doing')) {
      return `You have completed ${context.tasksCompleted} tasks and ${context.goalsCompleted} goals, earned ${context.xp} XP, and your current streak is ${context.currentStreak} days. ${context.insights.length > 0 ? context.insights[0].description : ''}`;
    }
    if (lower.includes('overwhelm') || lower.includes('stressed')) {
      const small = context.pendingTasks[0];
      const suggestion = small ? `Starting with "${small.title}" could help rebuild momentum.` : 'Take a short break and come back to one small goal.';
      return `You have ${context.pendingTasks.length} pending task${context.pendingTasks.length === 1 ? '' : 's'}. ${suggestion}`;
    }
    if (lower.includes('streak')) {
      return `Your streak is ${context.currentStreak} days. Keep completing one task per day to keep it growing!`;
    }
    return "I'm here to help. You can ask me about your progress, goals, streak, or what to do next.";
  }
}
