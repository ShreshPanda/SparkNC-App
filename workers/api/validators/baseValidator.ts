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
