import { GrowthTimelineRepository, type GrowthEventRecord } from '../repositories/GrowthTimelineRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export class GrowthTimelineService {
  constructor(private readonly repository: GrowthTimelineRepository) {}

  async getTimeline(userId: string): Promise<GrowthEventRecord[]> {
    assertNonEmpty(userId, 'User id is required');
    return this.repository.listEvents(userId);
  }

  async generateTimeline(userId: string): Promise<GrowthEventRecord[]> {
    assertNonEmpty(userId, 'User id is required');
    const events: Omit<GrowthEventRecord, 'id' | 'userId'>[] = [];

    const joinedAt = await this.repository.getUserCreatedAt(userId);
    if (joinedAt) {
      events.push({
        eventType: 'joined',
        title: 'Joined SparkNC',
        description: 'Started the SparkNC journey.',
        occurredAt: joinedAt,
        metadata: JSON.stringify({}),
      });
    }

    const firstTask = await this.repository.getFirstCompletedTask(userId);
    if (firstTask) {
      events.push({
        eventType: 'first_task',
        title: 'Completed first task',
        description: firstTask.title,
        occurredAt: firstTask.createdAt,
        metadata: JSON.stringify({ taskId: firstTask.id }),
      });
    }

    const completedGoals = await this.repository.getCompletedGoals(userId);
    for (const [index, goal] of completedGoals.entries()) {
      events.push({
        eventType: 'goal_achieved',
        title: index === 0 ? 'Completed first major goal' : 'Completed a goal',
        description: goal.title,
        occurredAt: goal.createdAt,
        metadata: JSON.stringify({ goalId: goal.id }),
      });
    }

    const streakMilestones = await this.repository.getStreakMilestones(userId);
    for (const m of streakMilestones) {
      events.push({
        eventType: 'streak_milestone',
        title: `${m.streak} day streak`,
        description: `Reached a ${m.streak}-day activity streak.`,
        occurredAt: m.recordedAt,
        metadata: JSON.stringify({ streak: m.streak }),
      });
    }

    const xpMilestones = await this.repository.getXPMilestones(userId);
    for (const m of xpMilestones) {
      events.push({
        eventType: 'level_up',
        title: `Reached level ${Math.floor(m.xp / 100) + 1}`,
        description: `Earned ${m.xp} XP.`,
        occurredAt: m.recordedAt,
        metadata: JSON.stringify({ xp: m.xp }),
      });
    }

    const attendedEvents = await this.repository.getAttendedEvents(userId);
    for (const e of attendedEvents) {
      events.push({
        eventType: 'event_attended',
        title: 'Attended SparkNC event',
        description: e.title,
        occurredAt: e.startsAt,
        metadata: JSON.stringify({ eventId: e.id }),
      });
    }

    const saved: GrowthEventRecord[] = [];
    for (const event of events) {
      saved.push(await this.repository.recordEvent(userId, event));
    }
    return saved;
  }
}
