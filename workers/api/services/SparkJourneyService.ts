import { JourneyRepository, type JourneyEvent } from '../repositories/JourneyRepository';

export interface SparkJourneyOptions {
  year?: number;
  semester?: 'fall' | 'spring' | 'summer';
  category?: JourneyEvent['category'];
}

export interface SparkJourneyMonth {
  month: string;
  year: number;
  events: JourneyEvent[];
}

export class SparkJourneyService {
  constructor(private readonly journeyRepository: JourneyRepository) {}

  async getJourney(userId: string, options: SparkJourneyOptions = {}): Promise<SparkJourneyMonth[]> {
    const events = await this.journeyRepository.listEvents(userId);
    const filtered = events.filter((e) => {
      const date = new Date(e.date);
      const eventYear = date.getFullYear();
      const eventMonth = date.getMonth() + 1;
      if (options.year && eventYear !== options.year) return false;
      if (options.category && e.category !== options.category) return false;
      if (options.semester) {
        const semesterMonths: Record<string, number[]> = { fall: [9, 10, 11, 12], spring: [1, 2, 3, 4, 5], summer: [6, 7, 8] };
        if (!semesterMonths[options.semester].includes(eventMonth)) return false;
      }
      return true;
    });

    const groups = new Map<string, JourneyEvent[]>();
    for (const event of filtered) {
      const date = new Date(event.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const list = groups.get(key) ?? [];
      list.push(event);
      groups.set(key, list);
    }

    const months: SparkJourneyMonth[] = [];
    const orderedKeys = Array.from(groups.keys()).sort((a, b) => b.localeCompare(a));
    for (const key of orderedKeys) {
      const [year, month] = key.split('-');
      const label = new Date(Number(year), Number(month) - 1, 1).toLocaleString('default', { month: 'long' });
      months.push({ month: `${label} ${year}`, year: Number(year), events: groups.get(key) ?? [] });
    }
    return months;
  }

  async recordMilestone(userId: string, title: string, description: string, badge?: string): Promise<JourneyEvent> {
    const now = new Date().toISOString();
    return this.journeyRepository.addEvent({ userId, date: now, title, description, category: 'milestone', badge });
  }
}
