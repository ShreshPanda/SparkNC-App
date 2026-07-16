export interface AuthSession {
  userId: string;
  email: string;
  role: string;
}

export const authService = {
  async signIn(_email: string, _password: string): Promise<AuthSession> {
    return {
      userId: 'demo-admin',
      email: 'admin@sparknc.app',
      role: 'admin',
    };
  },

  async signOut(): Promise<void> {
    return;
  },
};
