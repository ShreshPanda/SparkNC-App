// SparkNC Aura Gradient System
// Restrained, directional gradients. Only used for heroes and top-level backgrounds.

export const gradients = {
  discovery: ['#071A33', '#0B5FFF'] as const,
  growth: ['#071A33', '#18B96B'] as const,
  achievement: ['#0B5FFF', '#18B96B'] as const,
  celebration: ['#18B96B', '#FFD43B'] as const,
  majorHero: ['#071A33', '#0B5FFF', '#18B96B'] as const,

  // Aura variants with explicit stops for View overlays (top to bottom)
  atmospheric: ['rgba(7, 26, 51, 0.80)', 'rgba(11, 95, 255, 0.12)', 'rgba(247, 248, 250, 0)'] as const,
  atmosphericDark: ['rgba(7, 26, 51, 1.0)', 'rgba(11, 95, 255, 0.25)', 'rgba(2, 8, 15, 0)'] as const,

  immersive: ['rgba(7, 26, 51, 0.90)', 'rgba(24, 185, 107, 0.18)', 'rgba(247, 248, 250, 0)'] as const,
  immersiveDark: ['rgba(2, 8, 15, 1.0)', 'rgba(24, 185, 107, 0.22)', 'rgba(2, 8, 15, 0)'] as const,

  ambient: ['rgba(7, 26, 51, 0.65)', 'rgba(11, 95, 255, 0.12)', 'rgba(24, 185, 107, 0.08)', 'rgba(247, 248, 250, 0)'] as const,
  ambientDark: ['rgba(2, 8, 15, 1.0)', 'rgba(11, 95, 255, 0.20)', 'rgba(24, 185, 107, 0.12)', 'rgba(2, 8, 15, 0)'] as const,

  discoveryField: ['rgba(11, 95, 255, 0.14)', 'rgba(255, 212, 59, 0.10)', 'rgba(247, 248, 250, 0)'] as const,
  discoveryFieldDark: ['rgba(2, 8, 15, 1.0)', 'rgba(11, 95, 255, 0.18)', 'rgba(2, 8, 15, 0)'] as const,
} as const;

export type GradientName = keyof typeof gradients;
