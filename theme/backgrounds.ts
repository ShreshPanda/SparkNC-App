// SparkNC Background System
// Background-mode definitions used by SparkBackground and screen shells.

import { gradients } from './gradients';

export type BackgroundMode =
  | 'clean'
  | 'atmospheric'
  | 'immersive'
  | 'editorial'
  | 'discovery'
  | 'ambient'
  | 'data';

export const backgroundColors = {
  light: {
    base: '#F7F8FA',
    clean: '#F7F8FA',
    atmospheric: '#F7F8FA',
    immersive: '#F7F8FA',
    editorial: '#FAFBFC',
    discovery: '#F7F8FA',
    ambient: '#02080F',
    data: '#F7F8FA',
    surface: '#FFFFFF',
    surfaceSubtle: '#F2F4F7',
    tint: '#F2F4F7', // navy 5%
    sectionA: '#FFFFFF',
    sectionB: '#F2F4F7',
  },
  dark: {
    base: '#02080F',
    clean: '#02080F',
    atmospheric: '#02080F',
    immersive: '#02080F',
    editorial: '#071A33',
    discovery: '#02080F',
    ambient: '#02080F',
    data: '#02080F',
    surface: '#0E1D33',
    surfaceSubtle: '#132944',
    tint: '#0E1D33', // navy 800
    sectionA: '#071A33',
    sectionB: '#0E1D33',
  },
} as const;

export const backgroundGradients: Record<BackgroundMode, { light: readonly string[]; dark: readonly string[] }> = {
  clean: { light: [], dark: [] },
  atmospheric: { light: gradients.atmospheric, dark: gradients.atmosphericDark },
  immersive: { light: gradients.immersive, dark: gradients.immersiveDark },
  editorial: { light: [], dark: [] },
  discovery: { light: gradients.discoveryField, dark: gradients.discoveryFieldDark },
  ambient: { light: gradients.ambient, dark: gradients.ambientDark },
  data: { light: [], dark: [] },
} as const;

export const backgroundGlows: Record<BackgroundMode, { light?: { color: string; size: number; top: number; left: number }[]; dark?: { color: string; size: number; top: number; left: number }[] }> = {
  clean: { light: [], dark: [] },
  atmospheric: {
    light: [],
    dark: [{ color: 'rgba(11, 95, 255, 0.18)', size: 300, top: 0.05, left: 0.8 }],
  },
  immersive: {
    light: [{ color: 'rgba(24, 185, 107, 0.14)', size: 320, top: 0.15, left: 0.35 }],
    dark: [{ color: 'rgba(24, 185, 107, 0.20)', size: 340, top: 0.2, left: 0.3 }],
  },
  editorial: { light: [], dark: [] },
  discovery: {
    light: [{ color: 'rgba(11, 95, 255, 0.12)', size: 400, top: 0.05, left: 0.65 }],
    dark: [{ color: 'rgba(11, 95, 255, 0.14)', size: 400, top: 0.05, left: 0.65 }],
  },
  ambient: {
    light: [
      { color: 'rgba(11, 95, 255, 0.10)', size: 280, top: 0.25, left: 0.65 },
      { color: 'rgba(24, 185, 107, 0.08)', size: 260, top: 0.5, left: 0.25 },
    ],
    dark: [
      { color: 'rgba(11, 95, 255, 0.16)', size: 300, top: 0.25, left: 0.65 },
      { color: 'rgba(24, 185, 107, 0.12)', size: 280, top: 0.5, left: 0.25 },
    ],
  },
  data: { light: [], dark: [] },
} as const;

export const backgroundModeScreenMap: Record<string, BackgroundMode | undefined> = {
  dashboard: 'atmospheric',
  onboarding: 'atmospheric',
  growth: 'immersive',
  goals: 'editorial',
  journey: 'editorial',
  portfolio: 'editorial',
  ai: 'ambient',
  opportunities: 'discovery',
  calendar: 'clean',
  messages: 'clean',
  notifications: 'clean',
  settings: 'clean',
  feedback: 'clean',
  profile: 'editorial',
  achievements: 'immersive',
  ambassador: 'editorial',
  'ambassador-feedback': 'clean',
  analytics: 'data',
  impact: 'data',
  progress: 'immersive',
  showcase: 'data',
  admin: 'clean',
  more: 'clean',
};
