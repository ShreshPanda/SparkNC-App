import { cloudflareService } from './cloudflareService';
import type { User } from '../shared/types';

export interface AuthSession extends User {
  xp: number;
  streak: { current: number; longest: number };
}

export const authService = {
  async register(email: string, password: string, name: string, role = 'student'): Promise<void> {
    await cloudflareService.register({ email, password, name, role });
  },

  async login(email: string, password: string): Promise<AuthSession> {
    await cloudflareService.login({ email, password });
    return cloudflareService.getMe();
  },

  async getSession(): Promise<AuthSession> {
    return cloudflareService.getMe();
  },

  async signOut(): Promise<void> {
    try {
      await cloudflareService.logout();
    } catch {
      // Ignore logout errors and clear local session anyway.
    }
  },
};
