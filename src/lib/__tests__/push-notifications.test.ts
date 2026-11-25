import type { NotificationResponse } from "expo-notifications";
import {
  alertIdFromResponse,
  alertTierFromResponse,
  disablePushNotifications,
  enablePushNotifications,
  syncPushRegistration,
} from "../push-notifications";
import { registerPushDevice, unregisterPushDevice } from "../cryohealth-api";

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
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  AndroidImportance: { MAX: 5 },
  deleteNotificationChannelAsync: jest.fn(async () => undefined),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  getPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  requestPermissionsAsync: jest.fn(async () => ({ status: "granted" })),
  getDevicePushTokenAsync: jest.fn(async () => ({ data: "fcm-token-1" })),
}));
jest.mock("expo-device", () => ({ isDevice: true }));
jest.mock("../db", () => ({ database: {} }));
jest.mock("../cryohealth-api", () => ({
  fetchAlert: jest.fn(),
  registerPushDevice: jest.fn(),
  unregisterPushDevice: jest.fn(),
}));

const unregister = unregisterPushDevice as jest.Mock;
const register = registerPushDevice as jest.Mock;
const respond = (data: Record<string, unknown>) =>
  ({ notification: { request: { content: { data } } } }) as unknown as NotificationResponse;

beforeEach(() => {
  for (const k of Object.keys(mockStore)) delete mockStore[k];
  unregister.mockReset();
  register.mockReset();
});

describe("alertIdFromResponse", () => {
  it("accepts a UUID", () => {
    const id = "123e4567-e89b-12d3-a456-426614174000";
    expect(alertIdFromResponse(respond({ alertId: id }))).toBe(id);
  });
  it("rejects anything that is not a UUID (it becomes a route and an API path)", () => {
    expect(alertIdFromResponse(respond({ alertId: "../admin" }))).toBeUndefined();
    expect(alertIdFromResponse(respond({}))).toBeUndefined();
  });
});

describe("alertTierFromResponse", () => {
  it("reads the tier string", () => {
    expect(alertTierFromResponse(respond({ tier: "critical" }))).toBe("critical");
    expect(alertTierFromResponse(respond({ tier: 3 }))).toBeUndefined();
  });
});

describe("disablePushNotifications while offline", () => {
  it("still opts out and keeps the token pending", async () => {
    mockStore.cryohealth_push_token = "tok";
    unregister.mockRejectedValue(new Error("Network request failed"));
    await expect(disablePushNotifications()).resolves.toBeUndefined();
    expect(mockStore.cryohealth_push_enabled).toBe("false");
    expect(mockStore.cryohealth_push_token).toBe("tok");
  });

  it("the next sync retries the unregister and clears the token", async () => {
    mockStore.cryohealth_push_enabled = "false";
    mockStore.cryohealth_push_token = "tok";
    unregister.mockResolvedValue({ unregistered: true });
    await syncPushRegistration();
    expect(unregister).toHaveBeenCalledWith("tok");
    expect(mockStore.cryohealth_push_token).toBeUndefined();
  });
});

describe("enablePushNotifications while offline", () => {
  it("opts in and succeeds even though the token cannot be registered yet", async () => {
    register.mockRejectedValue(new Error("network down"));
    await expect(enablePushNotifications()).resolves.toBe(true);
    expect(mockStore.cryohealth_push_enabled).toBe("true");
    expect(mockStore.cryohealth_push_token).toBeUndefined();
  });

  it("the next sync registers the token and stores it", async () => {
    register.mockRejectedValueOnce(new Error("network down"));
    await enablePushNotifications();
    register.mockResolvedValue(undefined);
    await syncPushRegistration();
    expect(register).toHaveBeenLastCalledWith("fcm-token-1", "android");
    expect(mockStore.cryohealth_push_token).toBe("fcm-token-1");
  });
});
