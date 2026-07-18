import { BaseRepository } from './baseRepository';

export interface OnboardingProfile {
  id: string;
  userId: string;
  goals: string[];
  interests: string[];
  growthAreas: string[];
  supportStyle: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingInput {
  userId: string;
  goals?: string[];
  interests?: string[];
  growthAreas?: string[];
  supportStyle?: string;
  completed?: boolean;
}

export class OnboardingRepository extends BaseRepository {
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

  private json(value: unknown): string | null {
    return value == null ? null : JSON.stringify(value);
  }

  async upsert(input: OnboardingInput): Promise<OnboardingProfile> {
    const existing = await this.findByUserId(input.userId);
    const now = this.now();
    const completedAt = input.completed ? now : existing?.completedAt;
    if (existing) {
      await this.db
        .prepare('UPDATE onboarding_profiles SET goals = ?, interests = ?, growth_areas = ?, support_style = ?, completed_at = ?, updated_at = ? WHERE user_id = ?')
        .bind(
          this.json(input.goals ?? existing.goals),
          this.json(input.interests ?? existing.interests),
          this.json(input.growthAreas ?? existing.growthAreas),
          input.supportStyle ?? existing.supportStyle,
          completedAt ?? null,
          now,
          input.userId,
        )
        .run();
      return {
        ...existing,
        goals: input.goals ?? existing.goals,
        interests: input.interests ?? existing.interests,
        growthAreas: input.growthAreas ?? existing.growthAreas,
        supportStyle: input.supportStyle ?? existing.supportStyle,
        completedAt: completedAt ?? existing.completedAt,
        updatedAt: now,
      };
    }

    const id = this.createId('onb');
    await this.db
      .prepare('INSERT INTO onboarding_profiles (id, user_id, goals, interests, growth_areas, support_style, completed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(
        id,
        input.userId,
        this.json(input.goals ?? []),
        this.json(input.interests ?? []),
        this.json(input.growthAreas ?? []),
        input.supportStyle ?? '',
        completedAt ?? null,
        now,
        now,
      )
      .run();
    return {
      id,
      userId: input.userId,
      goals: input.goals ?? [],
      interests: input.interests ?? [],
      growthAreas: input.growthAreas ?? [],
      supportStyle: input.supportStyle ?? '',
      completedAt,
      createdAt: now,
      updatedAt: now,
    };
  }

  async findByUserId(userId: string): Promise<OnboardingProfile | null> {
    const result = await this.db
      .prepare('SELECT id, user_id, goals, interests, growth_areas, support_style, completed_at, created_at, updated_at FROM onboarding_profiles WHERE user_id = ? LIMIT 1')
      .bind(userId)
      .all();
    const row = result.results?.[0];
    if (!row) return null;
    return {
      id: String(row.id ?? ''),
      userId: String(row.user_id ?? ''),
      goals: this.parseJson(row.goals),
      interests: this.parseJson(row.interests),
      growthAreas: this.parseJson(row.growth_areas),
      supportStyle: String(row.support_style ?? ''),
      completedAt: row.completed_at == null ? undefined : String(row.completed_at),
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? ''),
    };
  }

  private parseJson(value: unknown): string[] {
    if (value == null) return [];
    try {
      const parsed = JSON.parse(String(value));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
