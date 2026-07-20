export class InputValidationService {
  static sanitizeString(input: unknown): string {
    if (typeof input !== 'string') return '';
    return input.trim();
  }

  static sanitizeHtml(input: unknown): string {
    const s = this.sanitizeString(input);
    return s
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  static isValidEmail(email: unknown): boolean {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  static isNonEmptyString(input: unknown): boolean {
    return typeof input === 'string' && input.trim().length > 0;
  }

  static clampNumber(input: unknown, min: number, max: number): number {
    const n = typeof input === 'number' ? input : Number(input);
    if (Number.isNaN(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  static validateUUID(input: unknown): string | null {
    if (typeof input !== 'string') return null;
    const uuid = input.trim();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid) ? uuid : null;
  }

  static pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) result[key] = obj[key];
    }
    return result;
  }
}
