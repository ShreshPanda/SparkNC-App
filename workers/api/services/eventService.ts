import { z } from 'zod';
import { EventRepository, type CreateEventInput, type UpdateEventInput, type EventRecord } from '../repositories/EventRepository';
import { assertNonEmpty } from '../validators/baseValidator';
import { NotificationService } from './notificationService';

export const createEventSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  startsAt: z.string().min(1, 'Event start time is required'),
  endsAt: z.string().optional(),
  schoolId: z.string().optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  schoolId: z.string().optional(),
});

export interface EnrichedEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt?: string;
  createdBy: string;
  schoolId?: string;
  createdAt: string;
  updatedAt: string;
  isRegistered: boolean;
  attendeeCount: number;
}

export class EventService {
  constructor(
    private readonly repository: EventRepository,
    private readonly notificationService?: NotificationService,
  ) {}

  async listEvents(userId: string): Promise<EnrichedEvent[]> {
    assertNonEmpty(userId, 'User id is required');
    const events = await this.repository.listEvents();
    return this.enrichEvents(events, userId);
  }

  async getEvent(eventId: string, userId: string): Promise<EnrichedEvent | null> {
    assertNonEmpty(eventId, 'Event id is required');
    assertNonEmpty(userId, 'User id is required');
    const event = await this.repository.getEvent(eventId);
    if (!event) return null;
    return this.enrichEvent(event, userId);
  }

  async createEvent(input: unknown, createdBy: string): Promise<EnrichedEvent> {
    assertNonEmpty(createdBy, 'User id is required');
    const parsed = createEventSchema.parse(input);
    const payload: CreateEventInput = {
      title: parsed.title,
      description: parsed.description,
      location: parsed.location,
      startsAt: parsed.startsAt,
      endsAt: parsed.endsAt,
      schoolId: parsed.schoolId,
    };
    const event = await this.repository.createEvent(payload, createdBy);
    return this.enrichEvent(event, createdBy);
  }

  async updateEvent(eventId: string, input: unknown, updatedBy: string): Promise<EnrichedEvent | null> {
    assertNonEmpty(eventId, 'Event id is required');
    assertNonEmpty(updatedBy, 'User id is required');
    const parsed = updateEventSchema.parse(input);
    const payload: UpdateEventInput = {
      title: parsed.title,
      description: parsed.description,
      location: parsed.location,
      startsAt: parsed.startsAt,
      endsAt: parsed.endsAt,
      schoolId: parsed.schoolId,
    };
    const event = await this.repository.updateEvent(eventId, payload);
    if (!event) {
      return null;
    }
    return this.enrichEvent(event, updatedBy);
  }

  async deleteEvent(eventId: string, _deletedBy: string): Promise<boolean> {
    assertNonEmpty(eventId, 'Event id is required');
    return this.repository.deleteEvent(eventId);
  }

  async registerForEvent(eventId: string, userId: string): Promise<EnrichedEvent> {
    assertNonEmpty(eventId, 'Event id is required');
    assertNonEmpty(userId, 'User id is required');

    const event = await this.repository.getEvent(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    await this.repository.registerAttendee(eventId, userId);

    if (this.notificationService) {
      await this.notificationService.createNotification({
        userId,
        title: 'Event RSVP confirmed',
        body: `You're registered for "${event.title}".`,
        kind: 'success',
        entityType: 'event',
        entityId: event.id,
      });
    }

    return this.enrichEvent(event, userId, true);
  }

  async unregisterFromEvent(eventId: string, userId: string): Promise<EnrichedEvent> {
    assertNonEmpty(eventId, 'Event id is required');
    assertNonEmpty(userId, 'User id is required');

    const event = await this.repository.getEvent(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    await this.repository.unregisterAttendee(eventId, userId);
    return this.enrichEvent(event, userId, false);
  }

  async listAttendees(eventId: string): Promise<string[]> {
    assertNonEmpty(eventId, 'Event id is required');
    return this.repository.listAttendees(eventId);
  }

  private async enrichEvents(events: EventRecord[], userId: string): Promise<EnrichedEvent[]> {
    const result: EnrichedEvent[] = [];
    for (const event of events) {
      result.push(await this.enrichEvent(event, userId));
    }
    return result;
  }

  private async enrichEvent(event: EventRecord, userId: string, registered?: boolean): Promise<EnrichedEvent> {
    const isRegistered = registered ?? (await this.repository.isRegistered(event.id, userId));
    const attendeeCount = (await this.repository.listAttendees(event.id)).length;
    return {
      ...event,
      isRegistered,
      attendeeCount,
    };
  }
}
