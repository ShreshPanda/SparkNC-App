// Shared animation presets for SparkNC.
// All durations and easings are centralized here and consumed by AnimationProvider.

export const motion = {
  timing: {
    micro: 150,
    nav: 250,
    sheet: 300,
    celebration: 1200,
  },
  easing: {
    ease: 'ease',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

export interface MotionConfig {
  duration?: number;
  delay?: number;
  easing?: string;
}

export function fadeIn(config?: MotionConfig) {
  return {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: config?.duration ?? motion.timing.nav,
    delay: config?.delay ?? 0,
    easing: config?.easing ?? motion.easing.ease,
  };
}

export function slideUp(config?: MotionConfig) {
  return {
    from: { opacity: 0, transform: [{ translateY: 16 }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
    duration: config?.duration ?? motion.timing.nav,
    delay: config?.delay ?? 0,
    easing: config?.easing ?? motion.easing.spring,
  };
}

export function slideDown(config?: MotionConfig) {
  return {
    from: { opacity: 0, transform: [{ translateY: -16 }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
    duration: config?.duration ?? motion.timing.nav,
    delay: config?.delay ?? 0,
    easing: config?.easing ?? motion.easing.spring,
  };
}

export function scaleIn(config?: MotionConfig) {
  return {
    from: { opacity: 0, transform: [{ scale: 0.92 }] },
    to: { opacity: 1, transform: [{ scale: 1 }] },
    duration: config?.duration ?? motion.timing.sheet,
    delay: config?.delay ?? 0,
    easing: config?.easing ?? motion.easing.spring,
  };
}

export function pulse(config?: MotionConfig) {
  return {
    0: { transform: [{ scale: 1 }] },
    50: { transform: [{ scale: 1.05 }] },
    100: { transform: [{ scale: 1 }] },
    duration: config?.duration ?? motion.timing.micro,
    delay: config?.delay ?? 0,
    easing: config?.easing ?? motion.easing.ease,
  };
}

export function stagger(delays: number[] = [], base = 0) {
  return delays.map((d, i) => base + d * i);
}
