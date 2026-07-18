import { NotificationPreferenceRepository, type NotificationPreferenceInput, type NotificationPreferenceRecord } from '../repositories/NotificationPreferenceRepository';
import { assertNonEmpty } from '../validators/baseValidator';

export class NotificationPreferenceService {
  constructor(private readonly repository: NotificationPreferenceRepository) {}

  async getPreferences(userId: string): Promise<NotificationPreferenceRecord> {
    assertNonEmpty(userId, 'User id is required');
    const prefs = await this.repository.getPreferences(userId);
    if (prefs) return prefs;
    return this.repository.upsertPreferences(userId, {});
  }

  async updatePreferences(userId: string, input: NotificationPreferenceInput): Promise<NotificationPreferenceRecord> {
    assertNonEmpty(userId, 'User id is required');
    return this.repository.upsertPreferences(userId, input);
  }
}
