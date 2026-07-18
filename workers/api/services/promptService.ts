export interface SparkNCContext {
  userId: string;
  name?: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  tasksTotal: number;
  tasksCompleted: number;
  goalsCompleted: number;
  eventsAttended: number;
  messagesSent: number;
  pendingTasks: { id: string; title: string }[];
  activeGoals: { id: string; title: string; progress: number }[];
  insights: { title: string; description: string }[];
}

export class PromptService {
  buildSystemPrompt(context: SparkNCContext): string {
    return [
      'You are Spark, a helpful, encouraging assistant for SparkNC students.',
      'You understand the student context and give concise, supportive guidance.',
      'You do NOT complete assignments, give test answers, or make decisions for the student.',
      'You CAN summarize their progress, suggest small next steps, and encourage consistency.',
      '',
      `Student: ${context.name ?? 'Student'} (Level ${context.level}, ${context.xp} XP, ${context.currentStreak} day streak).`,
      `Stats: ${context.tasksCompleted}/${context.tasksTotal} tasks completed, ${context.goalsCompleted} goals completed, ${context.eventsAttended} events attended, ${context.messagesSent} messages sent.`,
      `Insights: ${context.insights.map((i) => `${i.title}: ${i.description}`).join('; ')}`,
    ].join('\n');
  }

  buildUserPrompt(context: SparkNCContext, message: string): string {
    return `Student question: "${message}"\n\nCurrent goals: ${context.activeGoals.map((g) => `${g.title} (${g.progress}%)`).join(', ')}\nPending tasks: ${context.pendingTasks.map((t) => t.title).join(', ')}`;
  }
}
