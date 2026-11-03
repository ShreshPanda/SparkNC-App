import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'sparknc_session';

// Web sessions live exclusively in the browser-managed HttpOnly cookie,
// so all operations are no-ops there. Native persists the opaque session
// token in the platform keychain/keystore.
export const sessionStorage = {
  async get(): Promise<string | null> {
    if (Platform.OS === 'web') return null;
    try {
      return await SecureStore.getItemAsync(SESSION_KEY);
    } catch {
      return null;
    }
  },

  async set(token: string): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await SecureStore.setItemAsync(SESSION_KEY, token);
    } catch {
      // Persistence failure is non-fatal; the in-memory session still works.
    }
  },

  async clear(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await SecureStore.deleteItemAsync(SESSION_KEY);
    } catch {
      // Nothing to clear.
    }
  },
};
