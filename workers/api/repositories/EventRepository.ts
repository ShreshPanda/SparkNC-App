import { BaseRepository } from './baseRepository';

export interface EventRecord {
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
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt?: string;
  schoolId?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  location?: string;
  startsAt?: string;
  endsAt?: string;
  schoolId?: string;
}

export class EventRepository extends BaseRepository {
  constructor(private readonly db: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => {
        run: () => Promise<unknown>;
        all: () => Promise<{ results: Record<string, unknown>[] }>;
      };
    };
  }) {
    super();
  }

  async listEvents(): Promise<EventRecord[]> {
    try {
      const result = await this.db
        .prepare('SELECT id, title, description, location, starts_at, ends_at, created_by, school_id, created_at, updated_at FROM events ORDER BY starts_at ASC')
        .all();
      return (result.results ?? []).map((row) => this.mapRow(row));
    } catch (error) {
      throw new Error(`Failed to list events: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async listEventsForUser(userId: string): Promise<EventRecord[]> {
    try {
      const result = await this.db
        .prepare('SELECT id, title, description, location, starts_at, ends_at, created_by, school_id, created_at, updated_at FROM events WHERE created_by = ? ORDER BY starts_at ASC')
        .bind(userId)
        .all();
      return (result.results ?? []).map((row) => this.mapRow(row));
    } catch (error) {
      throw new Error(`Failed to list events for user: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async getEvent(eventId: string): Promise<EventRecord | null> {
    try {
      const result = await this.db
        .prepare('SELECT id, title, description, location, starts_at, ends_at, created_by, school_id, created_at, updated_at FROM events WHERE id = ?')
        .bind(eventId)
        .all();
      const row = result.results?.[0];
      return row ? this.mapRow(row) : null;
    } catch (error) {
      throw new Error(`Failed to get event: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async createEvent(input: CreateEventInput, createdBy: string): Promise<EventRecord> {
    const now = this.now();
    const eventId = this.createId('event');

    try {
      await this.db
        .prepare('INSERT INTO events (id, title, description, location, starts_at, ends_at, created_by, school_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(
          eventId,
          input.title,
          input.description ?? null,
          input.location ?? null,
          input.startsAt,
          input.endsAt ?? null,
          createdBy,
          input.schoolId ?? null,
          now,
          now,
        )
        .run();

      return {
        id: eventId,
        title: input.title,
        description: input.description,
        location: input.location,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        createdBy,
        schoolId: input.schoolId,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      throw new Error(`Failed to create event: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async updateEvent(eventId: string, input: UpdateEventInput): Promise<EventRecord | null> {
    const now = this.now();
    const fields: { column: string; value: unknown }[] = [];

    if (input.title !== undefined) fields.push({ column: 'title', value: input.title });
    if (input.description !== undefined) fields.push({ column: 'description', value: input.description ?? null });
    if (input.location !== undefined) fields.push({ column: 'location', value: input.location ?? null });
    if (input.startsAt !== undefined) fields.push({ column: 'starts_at', value: input.startsAt });
    if (input.endsAt !== undefined) fields.push({ column: 'ends_at', value: input.endsAt ?? null });
    if (input.schoolId !== undefined) fields.push({ column: 'school_id', value: input.schoolId ?? null });

    if (fields.length === 0) {
      return this.getEvent(eventId);
    }

    const setClause = fields.map((f) => `${f.column} = ?`).join(', ');
    const values = fields.map((f) => f.value);

    try {
      await this.db
        .prepare(`UPDATE events SET ${setClause}, updated_at = ? WHERE id = ?`)
        .bind(...values, now, eventId)
        .run();
      return this.getEvent(eventId);
    } catch (error) {
      throw new Error(`Failed to update event: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      await this.db.prepare('DELETE FROM events WHERE id = ?').bind(eventId).run();
      return true;
    } catch (error) {
      throw new Error(`Failed to delete event: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  // Attendee helpers
  async isRegistered(eventId: string, userId: string): Promise<boolean> {
    try {
      const result = await this.db
        .prepare('SELECT 1 FROM event_attendees WHERE event_id = ? AND user_id = ? LIMIT 1')
        .bind(eventId, userId)
        .all();
      return (result.results ?? []).length > 0;
    } catch (error) {
      throw new Error(`Failed to check registration: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async listAttendees(eventId: string): Promise<string[]> {
    try {
      const result = await this.db
        .prepare('SELECT user_id FROM event_attendees WHERE event_id = ?')
        .bind(eventId)
        .all();
      return (result.results ?? []).map((row) => String(row.user_id ?? ''));
    } catch (error) {
      throw new Error(`Failed to list attendees: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async registerAttendee(eventId: string, userId: string): Promise<void> {
    try {
      await this.db
        .prepare('INSERT OR REPLACE INTO event_attendees (event_id, user_id, created_at) VALUES (?, ?, ?)')
        .bind(eventId, userId, this.now())
        .run();
    } catch (error) {
      throw new Error(`Failed to register attendee: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  async unregisterAttendee(eventId: string, userId: string): Promise<void> {
    try {
      await this.db.prepare('DELETE FROM event_attendees WHERE event_id = ? AND user_id = ?').bind(eventId, userId).run();
    } catch (error) {
      throw new Error(`Failed to unregister attendee: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  private mapRow(row: Record<string, unknown>): EventRecord {
    return {
      id: String(row.id ?? ''),
      title: String(row.title ?? ''),
      description: row.description == null ? undefined : String(row.description),
      location: row.location == null ? undefined : String(row.location),
      startsAt: String(row.starts_at ?? ''),
      endsAt: row.ends_at == null ? undefined : String(row.ends_at),
      createdBy: String(row.created_by ?? ''),
      schoolId: row.school_id == null ? undefined : String(row.school_id),
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? ''),
    };
  }
}
