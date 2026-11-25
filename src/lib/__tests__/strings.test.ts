import { en, translate, ur, StringKey } from "../strings";

const keys = Object.keys(en) as StringKey[];
const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const withoutPlaceholders = (text: string) => text.replace(/\{\w+\}/g, "");
const ARABIC_SCRIPT = /[؀-ۿ]/;

/** Urdu strings that deliberately keep Latin letters: SOS is the universal word, and the two
 *  Android settings names must match the labels on a phone that may be set to English. */
const KEEPS_LATIN = new Set<StringKey>(["a11y.sos", "battery.steps", "settings.keepWorkingBody"]);

describe("the strings table", () => {
  test("every English key has an Urdu one and the reverse", () => {
    expect(Object.keys(ur).sort()).toEqual([...keys].sort());
  });

  test("no string is empty", () => {
    for (const key of keys) {
      expect(en[key].trim()).not.toBe("");
      expect(ur[key].trim()).not.toBe("");
    }
  });

  test("English and Urdu fill the same {placeholders}", () => {
    for (const key of keys) {
      expect({ key, vars: placeholders(ur[key]) }).toEqual({ key, vars: placeholders(en[key]) });
    }
  });

  test("every Urdu string is written in Arabic script", () => {
    const wrong = keys.filter((k) => !ARABIC_SCRIPT.test(ur[k]));
    expect(wrong).toEqual([]);
  });

  test("Latin letters appear in Urdu only where they are meant to", () => {
    const stray = keys.filter((k) => !KEEPS_LATIN.has(k) && /[A-Za-z]/.test(withoutPlaceholders(ur[k])));
    expect(stray).toEqual([]);
  });

  test("Urdu strings write numbers in Urdu digits, never 0-9", () => {
    const ascii = keys.filter((k) => /[0-9]/.test(withoutPlaceholders(ur[k])));
    expect(ascii).toEqual([]);
  });

  test("no dosing or diagnosis units: that text never comes from this table", () => {
    // PRD §9 R5: dosing and diagnosis come from reviewed lookup tables only. If one of these
    // matches, the string belongs in protocol content, not in interface text.
    const clinical = /\b(mg|mcg|ml|dose|dosage|tablet|antibiotic)\b|ملی گرام|ملی لیٹر|خوراک|گولی/i;
    const hits = keys.filter((k) => clinical.test(en[k]) || clinical.test(ur[k]));
    expect(hits).toEqual([]);
  });
});

describe("translate", () => {
  test("returns the English or Urdu text for a key", () => {
    expect(translate("en", "tab.home")).toBe("HOME");
    expect(translate("ur", "tab.home")).toBe("ہوم");
  });

  test("a number placeholder is written in the language's own digits and grouped", () => {
    expect(translate("en", "settings.synced", { n: 6 })).toBe("6 synced");
    expect(translate("ur", "settings.synced", { n: 6 })).toBe("۶ سنک ہو چکے");
    expect(translate("en", "settings.synced", { n: 2750 })).toBe("2,750 synced");
    expect(translate("ur", "settings.synced", { n: 2750 })).toBe("۲٬۷۵۰ سنک ہو چکے");
  });

  test("a string placeholder is inserted as is, so a phone number is not grouped", () => {
    expect(translate("en", "sos.call", { n: "1122" })).toBe("Call rescue 1122");
    expect(translate("ur", "sos.call", { n: "۱۱۲۲" })).toBe("ریسکیو ۱۱۲۲ کو کال کریں");
  });

  test("a placeholder with no value is left visible, not dropped", () => {
    expect(translate("en", "alerts.fresh")).toBe("Feed updated {time}");
    expect(translate("en", "alerts.fresh", {})).toBe("Feed updated {time}");
  });

  test("an unknown key falls back to the key itself, so the screen never shows nothing", () => {
    expect(translate("ur", "no.such.key" as StringKey)).toBe("no.such.key");
  });
});
