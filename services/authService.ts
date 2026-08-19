import { cloudflareService } from './cloudflareService';
import type { User } from '../shared/types';

export interface AuthSession extends User {
  xp: number;
  streak: { current: number; longest: number };
}

// DEMO MODE: any credentials work. Returns a fake session for presentation purposes.
const DEMO_USER: AuthSession = {
  id: 'demo_user-zrzpjllq',
  email: 'ava.demo@sparknc.org',
  name: 'Ava Demo',
  role: 'student',
  schoolId: 'school-1',
  isActive: true,
  createdAt: new Date('2026-01-15').toISOString(),
  updatedAt: new Date().toISOString(),
  xp: 1240,
  streak: { current: 12, longest: 18 },
};

let demoSession: AuthSession | null = null;

export const authService = {
  async register(email: string, password: string, name: string, role = 'student'): Promise<void> {
    // Demo mode: accept any credentials, create a local session.
    demoSession = {
      ...DEMO_USER,
      email: email.trim() || DEMO_USER.email,
      name: name.trim() || DEMO_USER.name,
      role: role as User['role'],
    };
  },

  async login(email: string, password: string): Promise<AuthSession> {
    // Demo mode: accept any credentials, create a local session.
    demoSession = {
      ...DEMO_USER,
      email: email.trim() || DEMO_USER.email,
    };
    return demoSession;
  },

  async getSession(): Promise<AuthSession> {
    if (!demoSession) {
      // Return a default demo session even if not explicitly logged in,
      // so screens that call getSession() don't break during presentation.
      demoSession = { ...DEMO_USER };
    }
    return demoSession;
  },

  async signOut(): Promise<void> {
    demoSession = null;
  },
};
