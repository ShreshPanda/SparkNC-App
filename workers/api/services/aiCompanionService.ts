import { StudentContextBuilder, type StudentContext } from './studentContextBuilder';
import { MemoryService } from './memoryService';
import { PromptService } from './promptService';
import { assertNonEmpty } from '../validators/baseValidator';

export interface AICompanionInput {
  message: string;
  intent?: 'chat' | 'reflect' | 'plan' | 'recommend' | 'growth';
}

export interface AICompanionOutput {
  reply: string;
  intent: AICompanionInput['intent'];
  memories: { role: string; content: string }[];
}

export class AICompanionService {
  constructor(
    private readonly contextBuilder: StudentContextBuilder,
    private readonly promptService: PromptService,
    private readonly memoryService: MemoryService,
  ) {}

  async interact(userId: string, input: AICompanionInput): Promise<AICompanionOutput> {
    assertNonEmpty(input.message, 'Message is required');
    const intent = input.intent ?? this.detectIntent(input.message);
    const context = await this.contextBuilder.build(userId);
    const memory = await this.memoryService.getRecentContext(userId);
    const relevantMemory = memory.filter((m) => m.role === 'assistant' || m.role === 'user').slice(-5);

    let reply: string;
    switch (intent) {
      case 'reflect':
        reply = this.weeklyReflection(context);
        break;
      case 'plan':
        reply = this.planning(context);
        break;
      case 'recommend':
        reply = this.recommendations(context);
        break;
      case 'growth':
        reply = this.growthAnalysis(context);
        break;
      default:
        reply = this.generalChat(context, input.message);
    }

    await this.memoryService.remember(userId, 'user', input.message);
    await this.memoryService.remember(userId, 'assistant', reply, JSON.stringify({ intent, context }));

    return {
      reply,
      intent,
      memories: [
        { role: 'system', content: this.promptService.buildSystemPrompt(context as any) },
        ...relevantMemory.map((m) => ({ role: m.role, content: m.content })),
      ],
    };
  }

  private detectIntent(message: string): AICompanionInput['intent'] {
    const lower = message.toLowerCase();
    if (lower.includes('reflection') || lower.includes('week') || lower.includes('this week')) return 'reflect';
    if (lower.includes('plan') || lower.includes('priorities') || lower.includes('organize')) return 'plan';
    if (lower.includes('recommend') || lower.includes('opportunit') || lower.includes('suggest')) return 'recommend';
    if (lower.includes('growth') || lower.includes('doing') || lower.includes('analysis')) return 'growth';
    return 'chat';
  }

  private weeklyReflection(context: StudentContext): string {
    return [
      `Here's your SparkNC reflection:`,
      `You've completed ${context.tasksCompleted} task${context.tasksCompleted === 1 ? '' : 's'} and ${context.goalsCompleted} goal${context.goalsCompleted === 1 ? '' : 's'}.`,
      `Your current streak is ${context.currentStreak} day${context.currentStreak === 1 ? '' : 's'}, and you've earned ${context.xp} XP (level ${context.level}).`,
      context.pendingTasks.length > 0
        ? `A great next step is "${context.pendingTasks[0].title}".`
        : 'Nothing is pending — celebrate the momentum!',
    ].join(' ');
  }

  private planning(context: StudentContext): string {
    const suggestions: string[] = [];
    if (context.pendingTasks.length > 0) {
      suggestions.push(`Start with "${context.pendingTasks[0].title}" to build quick momentum.`);
    }
    if (context.activeGoals.length > 0) {
      const top = context.activeGoals.sort((a, b) => b.progress - a.progress)[0];
      suggestions.push(`Your closest goal is "${top.title}" at ${top.progress}%.`);
    }
    if (context.insights.length > 0) {
      suggestions.push(`Consider this insight: ${context.insights[0].description}`);
    }
    if (suggestions.length === 0) return 'You have a clear slate. Set one small goal to keep moving forward.';
    return `Here's a focused plan: ${suggestions.join(' ')}`;
  }

  private recommendations(context: StudentContext): string {
    const ideas: string[] = [];
    if (context.eventsAttended < 3) ideas.push('attending an upcoming SparkNC event to meet peers');
    if (context.activeGoals.length > 0 && context.activeGoals.some((g) => g.progress < 50)) {
      ideas.push('scheduling focused time for your active goals');
    }
    if (context.pendingTasks.length > 0) ideas.push('completing one pending task today to protect your streak');
    if (context.insights.length > 0) ideas.push(`following up on: ${context.insights[0].description}`);
    if (ideas.length === 0) return 'Keep doing what you are doing. You are consistently engaged.';
    return `Opportunities that match your goals: ${ideas.join(', ')}.`;
  }

  private growthAnalysis(context: StudentContext): string {
    const scores = [
      { name: 'Productivity', value: context.tasksCompleted },
      { name: 'Goal-Setting', value: context.goalsCompleted },
      { name: 'Community', value: context.eventsAttended + context.messagesSent },
      { name: 'Consistency', value: context.currentStreak },
      { name: 'Impact', value: context.xp / 100 },
    ];
    const strongest = scores.sort((a, b) => b.value - a.value)[0];
    return `Your strongest growth area is ${strongest.name.toLowerCase()} with a score of ${Math.round(strongest.value)}. Overall level ${context.level} • ${context.xp} XP • ${context.currentStreak}-day streak. Keep investing time in your active goals to see the biggest gains.`;
  }

  private generalChat(context: StudentContext, message: string): string {
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
