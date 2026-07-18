export interface GrowthNarrative {
  period: 'semester' | 'month' | 'week';
  headline: string;
  paragraphs: string[];
  stats: {
    consistencyStart: number;
    consistencyEnd: number;
    goalsCompleted: number;
    tasksCompleted: number;
    eventsAttended: number;
    achievementsUnlocked: number;
  };
  strongestArea: string;
  nextStep: string;
}

export interface RawGrowthData {
  goalsCompleted: number;
  tasksCompleted: number;
  eventsAttended: number;
  achievementsUnlocked: number;
  xpGained: number;
  earlyTaskCount: number;
  lateTaskCount: number;
  streakEvents: { streak: number; date: string }[];
}

const WEEK = 7 * 24 * 60 * 60 * 1000;
const MONTH = 30 * 24 * 60 * 60 * 1000;
const SEMESTER = 120 * 24 * 60 * 60 * 1000;

export class PersonalGrowthNarrativeService {
  constructor(private readonly db: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        run: () => Promise<unknown>;
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  }) {}

  async generate(userId: string, period: 'semester' | 'month' | 'week' = 'semester'): Promise<GrowthNarrative> {
    const since = this.computeSince(period);
    const raw = await this.fetchData(userId, since);
    return this.buildNarrative(period, raw);
  }

  private computeSince(period: 'semester' | 'month' | 'week'): string {
    const durations = { semester: SEMESTER, month: MONTH, week: WEEK };
    return new Date(Date.now() - durations[period]).toISOString();
  }

  private async fetchData(userId: string, since: string): Promise<RawGrowthData> {
    const eventsResult = await this.db
      .prepare('SELECT event_type, COUNT(*) as total FROM growth_events WHERE user_id = ? AND occurred_at >= ? GROUP BY event_type')
      .bind(userId, since)
      .all();
    const events = (eventsResult.results ?? []) as Record<string, unknown>[];

    const achievementsResult = await this.db
      .prepare('SELECT COUNT(*) as total FROM user_achievements WHERE user_id = ? AND unlocked_at >= ?')
      .bind(userId, since)
      .all();
    const achievementsUnlocked = Number((achievementsResult.results?.[0] as any)?.total ?? 0);

    const xpResult = await this.db
      .prepare('SELECT COALESCE(SUM(xp_delta), 0) as total FROM xp_history WHERE user_id = ? AND created_at >= ?')
      .bind(userId, since)
      .all();
    const xpGained = Number((xpResult.results?.[0] as any)?.total ?? 0);

    const timingResult = await this.db
      .prepare(`SELECT 
        COUNT(CASE WHEN completed_at <= due_at THEN 1 END) as on_time,
        COUNT(CASE WHEN completed_at > due_at THEN 1 END) as late
      FROM tasks WHERE user_id = ? AND completed_at >= ?`)
      .bind(userId, since)
      .all();
    const onTime = Number((timingResult.results?.[0] as any)?.on_time ?? 0);
    const late = Number((timingResult.results?.[0] as any)?.late ?? 0);

    const streakResult = await this.db
      .prepare('SELECT streak, recorded_at FROM personal_records WHERE user_id = ? AND record_type = ? AND recorded_at >= ? ORDER BY recorded_at ASC')
      .bind(userId, 'longest_streak', since)
      .all();
    const streakEvents = (streakResult.results ?? []).map((row: any) => ({
      streak: Number(row.streak ?? 0),
      date: String(row.recorded_at ?? ''),
    }));

    const data: RawGrowthData = {
      goalsCompleted: 0,
      tasksCompleted: 0,
      eventsAttended: 0,
      achievementsUnlocked,
      xpGained,
      earlyTaskCount: onTime,
      lateTaskCount: late,
      streakEvents,
    };

    for (const row of events) {
      const type = String(row.event_type ?? '');
      const total = Number(row.total ?? 0);
      if (type === 'task_completed') data.tasksCompleted = total;
      if (type === 'goal_completed') data.goalsCompleted = total;
      if (type === 'event_attended') data.eventsAttended = total;
    }

    return data;
  }

  private buildNarrative(period: 'semester' | 'month' | 'week', raw: RawGrowthData): GrowthNarrative {
    const startConsistency = this.computeStartConsistency(raw);
    const endConsistency = this.computeEndConsistency(raw);
    const labels: Record<typeof period, string> = { semester: 'this semester', month: 'this month', week: 'this week' };
    const periodLabel = labels[period];

    const paragraphs: string[] = [];

    if (raw.goalsCompleted > 0 || raw.tasksCompleted > 0) {
      paragraphs.push(`Over ${periodLabel}, you completed ${raw.goalsCompleted} goals and ${raw.tasksCompleted} tasks. Each one built the next — the small wins kept the bigger ones moving.`);
    }

    if (raw.eventsAttended > 0) {
      paragraphs.push(`You showed up ${raw.eventsAttended} times — workshops, meetups, and community events that connected your work to people.`);
    }

    if (raw.achievementsUnlocked > 0) {
      paragraphs.push(`That effort unlocked ${raw.achievementsUnlocked} achievements. They are milestones, not just badges, because they track real progress.`);
    }

    if (raw.xpGained > 0) {
      paragraphs.push(`You earned ${raw.xpGained} XP through consistent action — proof that growth is already happening.`);
    }

    if (raw.streakEvents.length > 1) {
      const first = raw.streakEvents[0].streak;
      const last = raw.streakEvents[raw.streakEvents.length - 1].streak;
      if (last >= first) {
        paragraphs.push(`Your streak consistency grew from ${first} to ${last} days. That's the pattern behind real momentum.`);
      }
    }

    const strongestArea = this.strongestArea(raw);
    paragraphs.push(`Your strongest growth area right now is ${strongestArea.toLowerCase()}.`);

    if (endConsistency > startConsistency) {
      paragraphs.push(`Your consistency improved from ${Math.round(startConsistency)}% to ${Math.round(endConsistency)}%. The trend matters more than any single day.`);
    }

    const nextStep = this.nextStep(raw);
    paragraphs.push(`Next step: ${nextStep}`);

    const headline = this.headline(periodLabel, raw);

    return {
      period,
      headline,
      paragraphs,
      stats: {
        consistencyStart: startConsistency,
        consistencyEnd: endConsistency,
        goalsCompleted: raw.goalsCompleted,
        tasksCompleted: raw.tasksCompleted,
        eventsAttended: raw.eventsAttended,
        achievementsUnlocked: raw.achievementsUnlocked,
      },
      strongestArea,
      nextStep,
    };
  }

  private computeStartConsistency(raw: RawGrowthData): number {
    if (raw.streakEvents.length === 0) return 40;
    return Math.min(100, Math.max(0, raw.streakEvents[0].streak * 5));
  }

  private computeEndConsistency(raw: RawGrowthData): number {
    const total = raw.earlyTaskCount + raw.lateTaskCount;
    if (total === 0 && raw.streakEvents.length === 0) return 40;
    if (total === 0) {
      const last = raw.streakEvents[raw.streakEvents.length - 1]?.streak ?? 0;
      return Math.min(100, Math.max(0, last * 5));
    }
    return Math.round((raw.earlyTaskCount / total) * 100);
  }

  private strongestArea(raw: RawGrowthData): string {
    const scores = [
      { label: 'Goal Completion', score: raw.goalsCompleted },
      { label: 'Task Consistency', score: raw.tasksCompleted },
      { label: 'Community Engagement', score: raw.eventsAttended },
      { label: 'Skill Building', score: raw.achievementsUnlocked },
    ];
    const top = scores.reduce((a, b) => (b.score > a.score ? b : a));
    return top.score > 0 ? top.label : 'Getting started';
  }

  private nextStep(raw: RawGrowthData): string {
    if (raw.lateTaskCount > raw.earlyTaskCount) return 'set due dates a little earlier so finishing on time feels easier';
    if (raw.goalsCompleted === 0 && raw.tasksCompleted > 0) return 'tie a few tasks together into one weekly goal';
    if (raw.eventsAttended === 0) return 'join one community event this week to connect your progress with others';
    return 'keep the rhythm and pick one new skill to practice';
  }

  private headline(periodLabel: string, raw: RawGrowthData): string {
    if (raw.achievementsUnlocked > 0) return `Great ${periodLabel}: ${raw.achievementsUnlocked} milestones reached`;
    if (raw.tasksCompleted > 0) return `You kept moving this ${periodLabel}`;
    return `Your ${periodLabel} growth story`;
  }
}
