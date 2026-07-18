export interface HourlyPattern { hour: number; completions: number; }

export interface DailyPattern { weekday: string; count: number; }

export interface ProductivityInsights {
  preferredWorkingTimes: HourlyPattern[];
  completionPatterns: DailyPattern[];
  learningPreferences: {
    organizationPreference: string;
    planningPreference: string;
  };
  growthRecommendations: string[];
  strongestArea: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export class StudentProfileIntelligenceService {
  constructor(private readonly db: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        run: () => Promise<unknown>;
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  }) {}

  async analyze(userId: string): Promise<ProductivityInsights> {
    const events = await this.getCompletionEvents(userId);
    const hourly: Record<number, number> = {};
    const daily: Record<string, number> = {};
    const taskEvents: typeof events = [];
    const goalEvents: typeof events = [];

    for (const event of events) {
      const date = new Date(event.occurredAt);
      if (Number.isNaN(date.getTime())) continue;
      const hour = date.getHours();
      const weekday = WEEKDAYS[date.getDay()];
      hourly[hour] = (hourly[hour] ?? 0) + 1;
      daily[weekday] = (daily[weekday] ?? 0) + 1;
      if (event.eventType === 'task_completed') taskEvents.push(event);
      if (event.eventType === 'goal_completed') goalEvents.push(event);
    }

    const taskCount = taskEvents.length;
    const goalCount = goalEvents.length;

    const strongestArea = this.computeStrongestArea(taskCount, goalCount, daily);

    return {
      preferredWorkingTimes: Object.entries(hourly)
        .map(([hour, completions]) => ({ hour: Number(hour), completions }))
        .sort((a, b) => b.completions - a.completions)
        .slice(0, 5),
      completionPatterns: WEEKDAYS.map((day) => ({ weekday: day, count: daily[day] ?? 0 })),
      learningPreferences: this.deriveLearningPreferences(taskCount, goalCount),
      growthRecommendations: this.buildRecommendations(taskCount, goalCount, hourly, daily, strongestArea),
      strongestArea,
    };
  }

  private async getCompletionEvents(userId: string): Promise<{ eventType: string; occurredAt: string }[]> {
    const result = await this.db
      .prepare('SELECT event_type, occurred_at FROM growth_events WHERE user_id = ? AND event_type IN (?, ?) ORDER BY occurred_at DESC')
      .bind(userId, 'task_completed', 'goal_completed')
      .all();
    return (result.results ?? []).map((row) => ({
      eventType: String(row.event_type ?? ''),
      occurredAt: String(row.occurred_at ?? ''),
    }));
  }

  private deriveLearningPreferences(taskCount: number, goalCount: number): ProductivityInsights['learningPreferences'] {
    if (taskCount > goalCount * 2) {
      return {
        organizationPreference: 'You move best through small, concrete tasks.',
        planningPreference: 'Break larger goals into daily tasks for momentum.',
      };
    }
    if (goalCount > taskCount) {
      return {
        organizationPreference: 'You think in outcomes and milestones.',
        planningPreference: 'Set weekly goals and schedule focused work blocks.',
      };
    }
    return {
      organizationPreference: 'You balance tasks and goals well.',
      planningPreference: 'Keep a short daily task list tied to weekly goals.',
    };
  }

  private computeStrongestArea(taskCount: number, goalCount: number, daily: Record<string, number>): string {
    if (taskCount > goalCount) return 'Consistency with daily tasks';
    if (goalCount > taskCount) return 'Long-term goal completion';
    const maxDay = Object.entries(daily).sort((a, b) => b[1] - a[1])[0];
    if (maxDay && maxDay[1] > 0) return `Most productive on ${maxDay[0]}s`;
    return 'Getting started';
  }

  private buildRecommendations(
    taskCount: number,
    goalCount: number,
    hourly: Record<number, number>,
    daily: Record<string, number>,
    strongestArea: string,
  ): string[] {
    const recommendations: string[] = [];

    if (taskCount + goalCount > 0) {
      const topHours = Object.entries(hourly)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([h]) => h);
      if (topHours.length > 0) {
        recommendations.push(`You complete more work around ${topHours.join(' and ')}:00. Schedule important goals then.`);
      }
    }

    if (goalCount > 0 && taskCount / goalCount < 1.5) {
      recommendations.push('You complete more goals when planning ahead.');
    }

    if (strongestArea.includes('tasks')) {
      recommendations.push('Your strongest improvement area is consistency.');
    }

    const totalDaily = Object.values(daily).reduce((sum, c) => sum + c, 0);
    if (totalDaily > 0) {
      const zeroDays = WEEKDAYS.filter((d) => !daily[d]);
      if (zeroDays.length >= 2) {
        recommendations.push(`Light activity on ${zeroDays.slice(0, 2).join(' and ')}. A short review there could build a stronger streak.`);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Keep logging tasks and goals. Patterns will emerge as you go.');
    }

    return recommendations.slice(0, 3);
  }
}
