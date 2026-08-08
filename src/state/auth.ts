import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const TOKEN_KEY = 'cryohealth_token';
const IDENTITY_KEY = 'cryohealth_identity';

export type Role = 'cryohealth_admin' | 'facility_admin' | 'chw' | 'viewer';
type Identity = { role: Role; name: string };
type Status = 'loading' | 'authenticated' | 'guest';

type AuthState = {
  status: Status;
  token: string | null;
  role: Role | null;
  name: string | null;
  /** Reads any previously-saved session from SecureStore on app boot. */
  hydrate: () => Promise<void>;
  setSession: (token: string, identity: Identity) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  token: null,
  role: null,
  name: null,

  hydrate: async () => {
    const [token, identityRaw] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(IDENTITY_KEY),
    ]);
    if (token && identityRaw) {
      const identity = JSON.parse(identityRaw) as Identity;
      set({ status: 'authenticated', token, role: identity.role, name: identity.name });
    } else {
      set({ status: 'guest', token: null, role: null, name: null });
    }
  },

  setSession: async (token, identity) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(IDENTITY_KEY, JSON.stringify(identity)),
    ]);
    set({ status: 'authenticated', token, role: identity.role, name: identity.name });
  },

  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(IDENTITY_KEY),
    ]);
    set({ status: 'guest', token: null, role: null, name: null });
  },
}));
