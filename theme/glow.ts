// SparkNC Glow System
// Soft, luminous color halos. Use as backgroundColor on large translucent circles.

export const glow = {
  primary: 'rgba(11, 95, 255, 0.22)',
  primarySoft: 'rgba(11, 95, 255, 0.10)',
  success: 'rgba(24, 185, 107, 0.22)',
  successSoft: 'rgba(24, 185, 107, 0.10)',
  highlight: 'rgba(255, 212, 59, 0.28)',
  highlightSoft: 'rgba(255, 212, 59, 0.12)',
  navy: 'rgba(7, 26, 51, 0.35)',
  navySoft: 'rgba(7, 26, 51, 0.15)',
} as const;

export type GlowName = keyof typeof glow;
