import {
  markBatteryPromptSeen,
  oemBatteryHint,
  openBatteryOptimizationSettings,
  shouldShowBatteryPrompt,
} from "../battery-settings";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async (k: string) => mockStore[k] ?? null),
  setItemAsync: jest.fn(async (k: string, v: string) => {
    mockStore[k] = v;
  }),
}));
jest.mock("expo-device", () => ({
  get manufacturer() {
    return mockDevice.manufacturer;
  },
}));
jest.mock("react-native", () => ({
  get Platform() {
    return mockPlatform;
  },
  get Linking() {
    return mockLinking;
  },
}));

const mockStore: Record<string, string> = {};
const mockDevice = { manufacturer: "Google" as string | null };
const mockPlatform = { OS: "android" as "android" | "ios" };
const mockLinking = {
  sendIntent: jest.fn(async () => undefined),
  openSettings: jest.fn(async () => undefined),
};

beforeEach(() => {
  for (const k of Object.keys(mockStore)) delete mockStore[k];
  mockPlatform.OS = "android";
  mockDevice.manufacturer = "Google";
  mockLinking.sendIntent.mockClear();
  mockLinking.openSettings.mockClear();
});

describe("shouldShowBatteryPrompt", () => {
  it("shows on the first launch on Android", async () => {
    await expect(shouldShowBatteryPrompt()).resolves.toBe(true);
  });

  it("stops showing once it has been seen", async () => {
    await markBatteryPromptSeen();
    await expect(shouldShowBatteryPrompt()).resolves.toBe(false);
  });

  it("never shows on iOS", async () => {
    mockPlatform.OS = "ios";
    await expect(shouldShowBatteryPrompt()).resolves.toBe(false);
  });
});

describe("openBatteryOptimizationSettings", () => {
  it("opens the battery exemption list", async () => {
    await openBatteryOptimizationSettings();
    expect(mockLinking.sendIntent).toHaveBeenCalledWith(
      "android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS",
    );
    expect(mockLinking.openSettings).not.toHaveBeenCalled();
  });

  it("falls back to the app info page when the intent is not resolved", async () => {
    mockLinking.sendIntent.mockRejectedValueOnce(new Error("no activity"));
    await openBatteryOptimizationSettings();
    expect(mockLinking.openSettings).toHaveBeenCalledTimes(1);
  });
});

describe("oemBatteryHint", () => {
  it.each([
    ["OnePlus", /Intelligent Control/],
    ["OPPO", /Intelligent Control/],
    ["vivo", /Auto-start/],
    ["Xiaomi", /Autostart/],
    ["HUAWEI", /Launch and Run/],
  ])("gives the extra step for %s", (maker, pattern) => {
    mockDevice.manufacturer = maker;
    expect(oemBatteryHint()).toMatch(pattern);
  });

  it("gives no extra step on a stock Google phone", () => {
    expect(oemBatteryHint()).toBeUndefined();
  });
});
