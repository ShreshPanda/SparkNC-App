export function assertNonEmpty(value: string | undefined, message: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error(message);
  }
}

export function assertValidEmail(value: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new Error('Invalid email address');
  }
}

export function assertLength(value: string | undefined, field: string, min: number, max: number): void {
  if (!value) return;
  if (value.length < min) {
    throw new Error(`${field} must be at least ${min} characters`);
  }
  if (value.length > max) {
    throw new Error(`${field} must be at most ${max} characters`);
  }
}
