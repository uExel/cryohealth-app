import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "../auth";

/** In-memory stand-in for the phone's secure storage. */
const mockStore: Record<string, string> = {};
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async (k: string) => mockStore[k] ?? null),
  setItemAsync: jest.fn(async (k: string, v: string) => {
    mockStore[k] = v;
  }),
  deleteItemAsync: jest.fn(async (k: string) => {
    delete mockStore[k];
  }),
}));

const TOKEN_KEY = "cryohealth_token";
const IDENTITY_KEY = "cryohealth_identity";
const chw = { role: "chw" as const, name: "Amina" };

beforeEach(() => {
  for (const k of Object.keys(mockStore)) delete mockStore[k];
  useAuthStore.setState({
    status: "loading",
    token: null,
    role: null,
    name: null,
  });
});

describe("hydrate (app start, reading the saved session)", () => {
  test("nothing saved -> guest", async () => {
    await useAuthStore.getState().hydrate();
    const s = useAuthStore.getState();
    expect(s.status).toBe("guest");
    expect(s.token).toBeNull();
    expect(s.role).toBeNull();
  });

  test("saved login -> authenticated, with the same token, role and name", async () => {
    mockStore[TOKEN_KEY] = "tok-123";
    mockStore[IDENTITY_KEY] = JSON.stringify(chw);
    await useAuthStore.getState().hydrate();
    const s = useAuthStore.getState();
    expect(s.status).toBe("authenticated");
    expect(s.token).toBe("tok-123");
    expect(s.role).toBe("chw");
    expect(s.name).toBe("Amina");
  });

  test("a token with no saved identity is not treated as logged in", async () => {
    mockStore[TOKEN_KEY] = "tok-123";
    await useAuthStore.getState().hydrate();
    expect(useAuthStore.getState().status).toBe("guest");
    expect(useAuthStore.getState().token).toBeNull();
  });

  test("works with no internet: it never calls the network", async () => {
    const fetchSpy = jest.fn(() => {
      throw new Error("offline");
    });
    const realFetch = global.fetch;
    global.fetch = fetchSpy as unknown as typeof fetch;
    try {
      mockStore[TOKEN_KEY] = "tok-123";
      mockStore[IDENTITY_KEY] = JSON.stringify(chw);
      await useAuthStore.getState().hydrate();
      expect(useAuthStore.getState().status).toBe("authenticated");
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      global.fetch = realFetch;
    }
  });

  // The splash screen waits for status to leave "loading", so hydrate() must never leave
  // it there, whatever is (or is not) readable in secure storage.
  test.each([
    ["text that is not JSON", "{not valid json"],
    ["the JSON value null", "null"],
    ["an unknown role", JSON.stringify({ role: "superuser", name: "Amina" })],
    ["a missing name", JSON.stringify({ role: "chw" })],
  ])("a damaged saved identity (%s) falls back to guest, not stuck on loading", async (_label, raw) => {
    mockStore[TOKEN_KEY] = "tok-123";
    mockStore[IDENTITY_KEY] = raw;
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    await expect(useAuthStore.getState().hydrate()).resolves.toBeUndefined();
    const s = useAuthStore.getState();
    expect(s.status).toBe("guest");
    expect(s.token).toBeNull();
  });

  test("secure storage failing to read falls back to guest, not stuck on loading", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error("keystore unavailable"));
    await expect(useAuthStore.getState().hydrate()).resolves.toBeUndefined();
    expect(useAuthStore.getState().status).toBe("guest");
    expect(warn).toHaveBeenCalled();
  });
});

describe("setSession (right after a successful login)", () => {
  test("becomes authenticated and saves the token and identity", async () => {
    await useAuthStore.getState().setSession("tok-abc", chw);
    const s = useAuthStore.getState();
    expect(s.status).toBe("authenticated");
    expect(s.token).toBe("tok-abc");
    expect(s.role).toBe("chw");
    expect(s.name).toBe("Amina");
    expect(mockStore[TOKEN_KEY]).toBe("tok-abc");
    expect(JSON.parse(mockStore[IDENTITY_KEY])).toEqual(chw);
  });

  test("a login survives an app restart (save, wipe memory, hydrate)", async () => {
    await useAuthStore.getState().setSession("tok-abc", chw);
    // Simulate closing the app: memory is lost, secure storage is kept.
    useAuthStore.setState({ status: "loading", token: null, role: null, name: null });
    await useAuthStore.getState().hydrate();
    const s = useAuthStore.getState();
    expect(s.status).toBe("authenticated");
    expect(s.token).toBe("tok-abc");
    expect(s.name).toBe("Amina");
  });
});

describe("logout", () => {
  test("clears memory and the saved copy, and goes back to guest", async () => {
    await useAuthStore.getState().setSession("tok-abc", chw);
    await useAuthStore.getState().logout();
    const s = useAuthStore.getState();
    expect(s.status).toBe("guest");
    expect(s.token).toBeNull();
    expect(s.role).toBeNull();
    expect(s.name).toBeNull();
    expect(mockStore[TOKEN_KEY]).toBeUndefined();
    expect(mockStore[IDENTITY_KEY]).toBeUndefined();
  });

  test("after logout, a restart is a guest, not the old user", async () => {
    await useAuthStore.getState().setSession("tok-abc", chw);
    await useAuthStore.getState().logout();
    await useAuthStore.getState().hydrate();
    expect(useAuthStore.getState().status).toBe("guest");
  });
});
