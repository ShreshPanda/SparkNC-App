export const colors = {
  navy: '#0f172a',
  white: '#ffffff',
  spark: '#22c55e',
  gold: '#fbbf24',
  slate: '#e2e8f0',
  mist: '#f8fafc',
  dark: '#020617',
  muted: '#64748b',
  info: '#3b82f6',
  creative: '#a855f7',
} as const;

export const lightColors = {
  background: colors.mist,
  foreground: colors.navy,
  card: colors.white,
  border: colors.slate,
  primary: colors.navy,
  accent: colors.spark,
  highlight: colors.gold,
  muted: colors.muted,
  success: colors.spark,
  error: '#dc2626',
};

export const darkColors = {
  background: colors.dark,
  foreground: colors.mist,
  card: '#111827',
  border: '#334155',
  primary: colors.white,
  accent: colors.spark,
  highlight: colors.gold,
  muted: colors.slate,
  success: colors.spark,
  error: '#f87171',
};
