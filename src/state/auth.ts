import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const TOKEN_KEY = 'cryohealth_token';
const IDENTITY_KEY = 'cryohealth_identity';

const ROLES = ['cryohealth_admin', 'facility_admin', 'chw', 'viewer'] as const;
export type Role = (typeof ROLES)[number];
type Identity = { role: Role; name: string };
type Status = 'loading' | 'authenticated' | 'guest';

/** The saved identity is text read back from the phone, so it is not trusted: anything that
 *  is not JSON, not an object, has an unknown role, or has no name is treated as absent. */
function parseIdentity(raw: string): Identity | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return null;
    const { role, name } = value as Record<string, unknown>;
    if (!ROLES.includes(role as Role)) return null;
    if (typeof name !== 'string' || name.length === 0) return null;
    return { role: role as Role, name };
  } catch {
    return null;
  }
}

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

  // Never rejects and never leaves `status` on 'loading': an unreadable keystore or a damaged
  // saved login both end as a guest. Nothing is deleted, so a transient read failure does not
  // cost the user their session on the next launch.
  hydrate: async () => {
    try {
      const [token, identityRaw] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(IDENTITY_KEY),
      ]);
      const identity = token && identityRaw ? parseIdentity(identityRaw) : null;
      if (token && identity) {
        set({ status: 'authenticated', token, role: identity.role, name: identity.name });
        return;
      }
    } catch (err) {
      console.warn('Saved session could not be read; continuing as a guest', err);
    }
    set({ status: 'guest', token: null, role: null, name: null });
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
