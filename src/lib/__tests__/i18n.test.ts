import {
  deviceLocale,
  formatNumber,
  isRtl,
  langFromLocale,
  localizeDigits,
  parseLang,
  pickInitialLang,
  toUrduDigits,
} from "../i18n";

describe("langFromLocale (what the phone is set to)", () => {
  test.each(["ur", "ur-PK", "ur_PK", "UR-pk", " ur ", "urd"])("%j means Urdu", (locale) => {
    expect(langFromLocale(locale)).toBe("ur");
  });

  test.each(["en-US", "en", "ar-SA", "fa-IR", "uk-UA", "hi-IN", "", undefined, null])(
    "%j means English",
    (locale) => {
      expect(langFromLocale(locale)).toBe("en");
    },
  );
});

describe("pickInitialLang (saved choice first, then the phone)", () => {
  test("a saved choice wins over the phone language, both ways", () => {
    expect(pickInitialLang("ur", "en-US")).toBe("ur");
    expect(pickInitialLang("en", "ur-PK")).toBe("en");
  });

  test("with nothing saved, follow the phone", () => {
    expect(pickInitialLang(null, "ur-PK")).toBe("ur");
    expect(pickInitialLang(null, "en-GB")).toBe("en");
    expect(pickInitialLang(null, undefined)).toBe("en");
  });

  test("a saved value that is not a language is ignored", () => {
    expect(pickInitialLang("fr", "ur-PK")).toBe("ur");
    expect(pickInitialLang("", "en-US")).toBe("en");
    expect(pickInitialLang(42, "ur")).toBe("ur");
  });
});

describe("parseLang / isRtl", () => {
  test("only en and ur are languages", () => {
    expect(parseLang("en")).toBe("en");
    expect(parseLang("ur")).toBe("ur");
    expect(parseLang("UR")).toBeNull();
    expect(parseLang(undefined)).toBeNull();
  });

  test("Urdu reads right-to-left and English does not", () => {
    expect(isRtl("ur")).toBe(true);
    expect(isRtl("en")).toBe(false);
  });
});

describe("Urdu digits", () => {
  test("0-9 become ۰-۹", () => {
    expect(toUrduDigits("0123456789")).toBe("۰۱۲۳۴۵۶۷۸۹");
  });

  test("only digits change", () => {
    expect(toUrduDigits("Tier 2 at 14:05")).toBe("Tier ۲ at ۱۴:۰۵");
  });

  test("English text is left alone", () => {
    expect(localizeDigits("1122", "en")).toBe("1122");
    expect(localizeDigits("1122", "ur")).toBe("۱۱۲۲");
  });

  test("formatNumber groups thousands in either script", () => {
    expect(formatNumber(2750, "en")).toBe("2,750");
    expect(formatNumber(2750, "ur")).toBe("۲٬۷۵۰");
    expect(formatNumber(1234.5, "en")).toBe("1,234.5");
    expect(formatNumber(1234.5, "ur")).toBe("۱٬۲۳۴٫۵");
    expect(formatNumber(0, "ur")).toBe("۰");
  });
});

describe("deviceLocale", () => {
  test("gives a language tag, or undefined, and never throws", () => {
    const locale = deviceLocale();
    expect(locale === undefined || typeof locale === "string").toBe(true);
  });

  test("returns undefined when the runtime has no Intl", () => {
    const spy = jest.spyOn(Intl, "DateTimeFormat").mockImplementation(() => {
      throw new Error("no Intl on this runtime");
    });
    try {
      expect(deviceLocale()).toBeUndefined();
    } finally {
      spy.mockRestore();
    }
  });
});
