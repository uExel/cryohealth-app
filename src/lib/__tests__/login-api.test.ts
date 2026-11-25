import { ApiError, apiFetch } from "../api-client";
import { login } from "../cryohealth-api";
import { useAuthStore } from "../../state/auth";

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

const realFetch = global.fetch;
const fetchMock = jest.fn();

function reply(status: number, body: unknown): Response {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    text: async () => text,
    json: async () => JSON.parse(text),
  } as unknown as Response;
}

beforeEach(() => {
  for (const k of Object.keys(mockStore)) delete mockStore[k];
  useAuthStore.setState({ status: "guest", token: null, role: null, name: null });
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
});

afterAll(() => {
  global.fetch = realFetch;
});

describe("login() against the API", () => {
  test("sends the identifier and password to /auth/login with no token", async () => {
    fetchMock.mockResolvedValue(reply(200, { accessToken: "t", role: "chw", name: "Amina" }));
    await login("amina", "1234");

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/auth\/login$/);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ identifier: "amina", password: "1234" });
    expect(init.headers.Authorization).toBeUndefined();
  });

  test("returns the token, role and name on success", async () => {
    fetchMock.mockResolvedValue(reply(200, { accessToken: "tok-1", role: "chw", name: "Amina" }));
    await expect(login("amina", "1234")).resolves.toEqual({
      accessToken: "tok-1",
      role: "chw",
      name: "Amina",
    });
  });

  test("wrong password: throws the server's message and does not touch a saved session", async () => {
    // A saved session from earlier must survive a wrong-password attempt (tokenless 401).
    await useAuthStore.getState().setSession("old-token", { role: "chw", name: "Amina" });
    fetchMock.mockResolvedValue(reply(401, { message: "Invalid credentials", statusCode: 401 }));

    const err = await login("amina", "wrong").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
    expect(err.message).toBe("Invalid credentials");
    expect(useAuthStore.getState().status).toBe("authenticated");
    expect(useAuthStore.getState().token).toBe("old-token");
    expect(mockStore["cryohealth_token"]).toBe("old-token");
  });

  test("no internet: throws, and a saved session is kept", async () => {
    await useAuthStore.getState().setSession("old-token", { role: "chw", name: "Amina" });
    fetchMock.mockRejectedValue(new TypeError("Network request failed"));

    await expect(login("amina", "1234")).rejects.toThrow("Network request failed");
    expect(useAuthStore.getState().token).toBe("old-token");
  });

  test("server error (500) is reported with its status", async () => {
    fetchMock.mockResolvedValue(reply(500, "boom"));
    const err = await login("amina", "1234").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(500);
  });

  test("a stalled server times out after 30 seconds instead of hanging forever", async () => {
    jest.useFakeTimers();
    try {
      fetchMock.mockImplementation(
        (_url: string, init: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            init.signal.addEventListener("abort", () => reject(new Error("aborted")));
          }),
      );
      const pending = login("amina", "1234").catch((e) => e);
      await jest.advanceTimersByTimeAsync(30_000);
      const err = await pending;
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(0);
      expect(err.message).toBe("Request timed out");
    } finally {
      jest.useRealTimers();
    }
  });
});

describe("an expired session on a normal request", () => {
  test("401 on a request that carried a token logs the user out", async () => {
    await useAuthStore.getState().setSession("old-token", { role: "chw", name: "Amina" });
    fetchMock.mockResolvedValue(reply(401, { message: "Unauthorized" }));

    const err = await apiFetch("/cases").catch((e: unknown) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).message).toBe("Session expired");
    expect(useAuthStore.getState().status).toBe("guest");
    expect(mockStore["cryohealth_token"]).toBeUndefined();
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer old-token");
  });
});
