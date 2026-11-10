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

const ROLES: Role[] = ['cryohealth_admin', 'facility_admin', 'chw', 'viewer'];

/** The saved identity text, or null if it is damaged or not the shape we wrote. */
function parseIdentity(raw: string): Identity | null {
  try {
    const v = JSON.parse(raw) as Partial<Identity> | null;
    if (v && typeof v.name === 'string' && ROLES.includes(v.role as Role)) {
      return { role: v.role as Role, name: v.name };
    }
  } catch {
    // damaged text
  }
  return null;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  token: null,
  role: null,
  name: null,

  hydrate: async () => {
    // Must always leave "loading": the splash screen waits on it and would otherwise sit
    // there forever. Anything unreadable or damaged means "no usable saved session".
    let saved: { token: string; identity: Identity } | null = null;
    try {
      const [token, identityRaw] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(IDENTITY_KEY),
      ]);
      const identity = identityRaw ? parseIdentity(identityRaw) : null;
      if (token && identity) saved = { token, identity };
    } catch (err) {
      console.warn('Could not read the saved session, starting as guest', err);
    }
    if (saved) {
      set({
        status: 'authenticated',
        token: saved.token,
        role: saved.identity.role,
        name: saved.identity.name,
      });
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
