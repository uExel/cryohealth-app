import * as SecureStore from "expo-secure-store";
import { LANG_KEY, loadLang, saveLang } from "../lang-store";

/** In-memory stand-in for the phone's secure storage. */
const mockStore: Record<string, string> = {};
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async (k: string) => mockStore[k] ?? null),
  setItemAsync: jest.fn(async (k: string, v: string) => {
    mockStore[k] = v;
  }),
}));

const getItem = SecureStore.getItemAsync as jest.Mock;
const setItem = SecureStore.setItemAsync as jest.Mock;

beforeEach(() => {
  for (const k of Object.keys(mockStore)) delete mockStore[k];
  getItem.mockClear();
  setItem.mockClear();
  jest.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe("loadLang (app start)", () => {
  test("a saved choice wins over the phone language", async () => {
    mockStore[LANG_KEY] = "ur";
    expect(await loadLang("en-US")).toBe("ur");
    mockStore[LANG_KEY] = "en";
    expect(await loadLang("ur-PK")).toBe("en");
  });

  test("first launch on an Urdu phone starts in Urdu, on any other phone in English", async () => {
    expect(await loadLang("ur-PK")).toBe("ur");
    expect(await loadLang("en-US")).toBe("en");
    expect(await loadLang(undefined)).toBe("en");
  });

  test("a damaged saved value is ignored", async () => {
    mockStore[LANG_KEY] = "klingon";
    expect(await loadLang("ur-PK")).toBe("ur");
  });

  test("storage that cannot be read still gives a language and never throws, so launch cannot hang", async () => {
    getItem.mockRejectedValueOnce(new Error("keystore unavailable"));
    await expect(loadLang("ur-PK")).resolves.toBe("ur");
    expect(console.warn).toHaveBeenCalled();
  });
});

describe("saveLang", () => {
  test("remembers the choice for the next launch", async () => {
    await saveLang("ur");
    expect(mockStore[LANG_KEY]).toBe("ur");
    expect(await loadLang("en-US")).toBe("ur");
    await saveLang("en");
    expect(await loadLang("ur-PK")).toBe("en");
  });

  test("a storage failure is swallowed: the language still changes on screen, it just is not remembered", async () => {
    setItem.mockRejectedValueOnce(new Error("disk full"));
    await expect(saveLang("ur")).resolves.toBeUndefined();
    expect(console.warn).toHaveBeenCalled();
  });

  test("never writes something that is not a language", async () => {
    await saveLang("fr" as never);
    expect(setItem).not.toHaveBeenCalled();
  });
});
