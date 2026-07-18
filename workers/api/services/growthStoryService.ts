import { GrowthTimelineRepository } from '../repositories/GrowthTimelineRepository';
import { StudentInsightRepository } from '../repositories/StudentInsightRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export interface GrowthStory {
  title: string;
  summary: string;
  paragraphs: string[];
  milestones: string[];
}

export class GrowthStoryService {
  constructor(
    private readonly insightRepository: StudentInsightRepository,
    private readonly timelineRepository: GrowthTimelineRepository,
  ) {}

  async generateStory(userId: string): Promise<GrowthStory> {
    assertNonEmpty(userId, 'User id is required');
    const [stats, events] = await Promise.all([
      this.insightRepository.getUserStats(userId),
      this.timelineRepository.listEvents(userId),
    ]);

    const joinedAt = events.find((e) => e.eventType === 'joined')?.occurredAt;
    const firstTask = events.find((e) => e.eventType === 'first_task');
    const firstGoal = events.find((e) => e.eventType === 'goal_achieved');
    const xp = stats.xp;
    const level = Math.floor(xp / 100) + 1;
    const streak = stats.longestStreak;
    const goals = stats.goalsCompleted;
    const eventsAttended = stats.eventsAttended;
    const tasks = stats.tasksCompleted;

    const paragraphs: string[] = [];
    const milestones: string[] = [];

    if (joinedAt) {
      paragraphs.push(`Your SparkNC journey started with building consistency. Over this time, you have grown into an active member of the community.`);
      milestones.push('Joined SparkNC');
    }

    if (tasks > 0) {
      paragraphs.push(`You have completed ${tasks} task${tasks === 1 ? '' : 's'}${firstTask ? `, starting with "${firstTask.title}"` : ''}.`);
      milestones.push(`Completed ${tasks} task${tasks === 1 ? '' : 's'}`);
    }

    if (goals > 0) {
      paragraphs.push(`You have finished ${goals} goal${goals === 1 ? '' : 's'}${firstGoal ? `, including "${firstGoal.title}"` : ''}.`);
      milestones.push(`Reached ${goals} goal${goals === 1 ? '' : 's'}`);
    }

    if (eventsAttended > 0) {
      paragraphs.push(`You have participated in ${eventsAttended} event${eventsAttended === 1 ? '' : 's'}, building connections and expanding your learning.`);
      milestones.push(`Attended ${eventsAttended} event${eventsAttended === 1 ? '' : 's'}`);
    }

    if (streak >= 7) {
      paragraphs.push(`Your longest streak reached ${streak} days, showing strong consistency.`);
      milestones.push(`${streak}-day streak`);
    }

    paragraphs.push(`Overall, you have reached level ${level} with ${xp} XP and an engagement score of ${stats.engagementScore}.`);
    paragraphs.push(`Keep building on your strongest growth area: ${this.strongestCategory(stats)}.`);

    const summary = `Level ${level} • ${xp} XP • ${goals} goal${goals === 1 ? '' : 's'} completed • ${eventsAttended} event${eventsAttended === 1 ? '' : 's'} attended`;

    return {
      title: 'Your SparkNC Growth Story',
      summary,
      paragraphs,
      milestones,
    };
  }

  private strongestCategory(stats: Awaited<ReturnType<StudentInsightRepository['getUserStats']>>): string {
    const scores = [
      { name: 'Productivity', value: stats.tasksCompleted },
      { name: 'Goal-Setting', value: stats.goalsCompleted },
      { name: 'Community', value: stats.eventsAttended + stats.messagesSent },
      { name: 'Consistency', value: stats.currentStreak },
      { name: 'Impact', value: stats.xp / 100 },
    ];
    return scores.sort((a, b) => b.value - a.value)[0]?.name ?? 'Growth';
  }
}
