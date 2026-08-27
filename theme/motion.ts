// Spark NC Motion System
// Consistent durations, easings, and spring presets for the iOS-first experience.

export const durations = {
  fast: 150,
  medium: 300,
  slow: 500,
} as const;

export const easings = {
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  linear: 'linear',
} as const;

export const springs = {
  default: {
    friction: 6,
    tension: 120,
  },
  soft: {
    friction: 8,
    tension: 100,
  },
  bouncy: {
    friction: 5,
    tension: 140,
  },
} as const;
