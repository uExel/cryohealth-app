import { relativeTime, tierLabel } from "../format";

const NOW = Date.parse("2026-11-25T12:00:00Z");
const ago = (ms: number) => new Date(NOW - ms).toISOString();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

beforeEach(() => {
  jest.spyOn(Date, "now").mockReturnValue(NOW);
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe("relativeTime in English (unchanged from before Urdu)", () => {
  test.each([
    [30_000, "Just now"],
    [MIN, "1m ago"],
    [59 * MIN, "59m ago"],
    [HOUR, "1h ago"],
    [23 * HOUR, "23h ago"],
    [DAY, "1d ago"],
    [3 * DAY, "3d ago"],
  ])("%d ms ago reads %j", (ms, text) => {
    expect(relativeTime(ago(ms))).toBe(text);
    expect(relativeTime(ago(ms), "en")).toBe(text);
  });
});

describe("relativeTime in Urdu", () => {
  test.each([
    [30_000, "ابھی"],
    [5 * MIN, "۵ منٹ پہلے"],
    [2 * HOUR, "۲ گھنٹے پہلے"],
    [3 * DAY, "۳ دن پہلے"],
    [12 * DAY, "۱۲ دن پہلے"],
  ])("%d ms ago reads %j", (ms, text) => {
    expect(relativeTime(ago(ms), "ur")).toBe(text);
  });
});

describe("tierLabel", () => {
  test("English capitals", () => {
    expect(tierLabel("critical", "en")).toBe("CRITICAL");
    expect(tierLabel("normal", "en")).toBe("NORMAL");
  });

  test("Urdu words, all four tiers present and different", () => {
    const words = (["normal", "watch", "high", "critical"] as const).map((t) => tierLabel(t, "ur"));
    expect(words.every((w) => /[؀-ۿ]/.test(w))).toBe(true);
    expect(new Set(words).size).toBe(4);
  });
});
