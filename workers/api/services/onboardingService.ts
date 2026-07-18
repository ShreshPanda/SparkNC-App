import { OnboardingInput, OnboardingProfile, OnboardingRepository } from '../repositories/OnboardingRepository';

export class OnboardingService {
  constructor(private readonly repository: OnboardingRepository) {}

  async saveProfile(input: OnboardingInput): Promise<OnboardingProfile> {
    const normalized: OnboardingInput = {
      ...input,
      goals: this.normalizeList(input.goals),
      interests: this.normalizeList(input.interests),
      growthAreas: this.normalizeList(input.growthAreas),
      supportStyle: this.normalizeStyle(input.supportStyle),
    };
    return this.repository.upsert(normalized);
  }

  async getProfile(userId: string): Promise<OnboardingProfile | null> {
    return this.repository.findByUserId(userId);
  }

  async isOnboardingComplete(userId: string): Promise<boolean> {
    const profile = await this.getProfile(userId);
    return !!profile?.completedAt;
  }

  async personalizePrompt(userId: string, prompt: string): Promise<{ goals: string[]; growthAreas: string[]; style: string }> {
    const profile = await this.getProfile(userId);
    return {
      goals: profile?.goals ?? [],
      growthAreas: profile?.growthAreas ?? [],
      style: profile?.supportStyle ?? 'gentle',
    };
  }

  private normalizeList(value?: string[] | string | null): string[] | undefined {
    if (value == null) return undefined;
    if (Array.isArray(value)) return value.filter((v) => typeof v === 'string' && v.length > 0);
    if (typeof value === 'string') return value.split(',').map((s) => s.trim()).filter(Boolean);
    return undefined;
  }

  private normalizeStyle(value?: string): string | undefined {
    if (!value) return undefined;
    const lower = value.toLowerCase();
    if (lower === 'direct' || lower === 'gentle' || lower === 'structured' || lower === 'casual') return lower;
    return 'gentle';
  }
}
