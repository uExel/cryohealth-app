import fs from "fs";
import path from "path";
import { makeStyles } from "../styles";
import { themeFor, themes, ThemeName } from "../theme";

const NAMES: ThemeName[] = ["light", "dark"];

describe("the Urdu theme", () => {
  test("English is the untouched design theme", () => {
    for (const name of NAMES) {
      expect(themeFor(name)).toBe(themes[name]);
      expect(themeFor(name, "en")).toBe(themes[name]);
    }
  });

  test("the theme object is stable, so styles memoised on it are not rebuilt every render", () => {
    expect(themeFor("light", "ur")).toBe(themeFor("light", "ur"));
    expect(themeFor("dark", "ur")).not.toBe(themeFor("light", "ur"));
  });

  test("Urdu keeps the colours, spacing and sizes of the same theme", () => {
    for (const name of NAMES) {
      const en = themeFor(name, "en");
      const ur = themeFor(name, "ur");
      expect(ur.color).toBe(en.color);
      expect(ur.space).toBe(en.space);
      expect(ur.size).toBe(en.size);
      expect(ur.name).toBe(name);
    }
  });

  test("every text role uses Nastaliq with about double the leading and a right-to-left paragraph", () => {
    const en = themeFor("light", "en").type;
    const ur = themeFor("light", "ur").type;
    expect(Object.keys(ur).sort()).toEqual(Object.keys(en).sort());
    for (const [role, style] of Object.entries(ur)) {
      expect({ role, family: style.fontFamily }).toEqual({ role, family: "NotoNastaliqUrdu" });
      expect(style.lineHeight! / style.fontSize!).toBeGreaterThanOrEqual(1.85);
      expect(style.writingDirection).toBe("rtl");
    }
  });

  test("no tracking and no uppercase in Urdu: tracking breaks the joins between letters", () => {
    for (const [role, style] of Object.entries(themeFor("light", "ur").type)) {
      expect({ role, letterSpacing: style.letterSpacing }).toEqual({ role, letterSpacing: undefined });
      expect({ role, textTransform: style.textTransform }).toEqual({ role, textTransform: undefined });
    }
  });

  test("the design's own four Urdu sizes are kept", () => {
    const ur = themeFor("light", "ur");
    for (const role of ["title1", "title3", "body"] as const) {
      expect(ur.type[role].fontSize).toBe(ur.typeUrdu[role].fontSize);
      expect(ur.type[role].lineHeight).toBe(ur.typeUrdu[role].lineHeight);
    }
  });
});

/** A style is direction-safe if it names no physical side. A full-screen fill (left and right
 *  both 0) is symmetric and allowed. */
function physicalProps(style: Record<string, unknown>): string[] {
  const found: string[] = [];
  for (const [key, value] of Object.entries(style)) {
    if (/^(margin|padding)(Left|Right)$/.test(key)) found.push(key);
    if (/^border(Left|Right)(Width|Color)$/.test(key)) found.push(key);
    if (key === "textAlign" && (value === "left" || value === "right")) found.push(`textAlign:${String(value)}`);
  }
  const { left, right } = style as { left?: unknown; right?: unknown };
  const symmetricFill = left === 0 && right === 0;
  if (!symmetricFill) {
    if (left !== undefined) found.push("left");
    if (right !== undefined) found.push("right");
  }
  return found;
}

describe("the shared style sheet mirrors in right-to-left", () => {
  test.each(NAMES.flatMap((n) => (["en", "ur"] as const).map((l) => [n, l] as const)))(
    "no physical left/right in %s/%s styles",
    (name, lang) => {
      const sheet = makeStyles(themeFor(name, lang)) as unknown as Record<string, Record<string, unknown>>;
      const offenders = Object.entries(sheet)
        .map(([style, def]) => ({ style, props: physicalProps(def) }))
        .filter((o) => o.props.length > 0);
      expect(offenders).toEqual([]);
    },
  );

  test("button labels align with the text direction, not to a fixed side", () => {
    const sheet = makeStyles(themeFor("light", "ur")) as unknown as Record<string, { textAlign?: string }>;
    for (const label of ["btnPrimaryLabel", "btnSecondaryLabel", "btnTextLabel"]) {
      expect({ label, align: sheet[label].textAlign }).toEqual({ label, align: "auto" });
    }
  });
});

/** Every screen and component, not just the shared sheet. If this fails, use the logical
 *  property named in the message: it is identical in English and flips in Urdu. */
const FIX: [RegExp, string][] = [
  [/\bmarginLeft\b/, "marginStart"],
  [/\bmarginRight\b/, "marginEnd"],
  [/\bpaddingLeft\b/, "paddingStart"],
  [/\bpaddingRight\b/, "paddingEnd"],
  [/\bborderLeft(Width|Color)\b/, "borderStart$1"],
  [/\bborderRight(Width|Color)\b/, "borderEnd$1"],
  [/textAlign:\s*['"]left['"]/, "textAlign: 'auto'"],
  [/\bleft:\s*[^0\s}][^,}]*/, "start: …"],
  [/\bright:\s*[^0\s}][^,}]*/, "end: …"],
];

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "__tests__" ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

describe("every screen is either translated or marked English-only", () => {
  const appDir = path.resolve(__dirname, "../../app");

  test("a route that reads no text from tr() must be wrapped in EnglishOnly", () => {
    // Otherwise it would show English words in the Nastaliq type scale, mirrored, when the app is
    // in Urdu. Translate the screen (use `useApp().tr`) or wrap its route in <EnglishOnly>.
    const routes = sourceFiles(appDir).filter((f) => path.basename(f) !== "_layout.tsx" || f.includes("(tabs)"));
    const unhandled = routes
      .filter((f) => {
        const source = fs.readFileSync(f, "utf8");
        return !/\btr\(/.test(source) && !/\bEnglishOnly\b/.test(source);
      })
      .map((f) => path.relative(appDir, f));
    expect(unhandled).toEqual([]);
  });

  test("the four health-worker screens are the English-only ones for now", () => {
    const englishOnly = sourceFiles(appDir)
      .filter((f) => /\bEnglishOnly\b/.test(fs.readFileSync(f, "utf8")))
      .map((f) => path.relative(appDir, f).replace(/\\/g, "/"))
      .sort();
    expect(englishOnly).toEqual(["(tabs)/case.tsx", "(tabs)/guidance.tsx", "(tabs)/health.tsx", "login.tsx"]);
  });
});

describe("screens and components use start/end, not left/right", () => {
  const root = path.resolve(__dirname, "../..");
  const files = [...sourceFiles(path.join(root, "app")), ...sourceFiles(path.join(root, "components"))];

  test("found the screens to scan", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  test("no physical left/right style in app/ or components/", () => {
    const offenders: string[] = [];
    for (const file of files) {
      fs.readFileSync(file, "utf8")
        .split(/\r?\n/)
        .forEach((line, i) => {
          if (line.trim().startsWith("//") || line.trim().startsWith("*")) return;
          for (const [pattern, fix] of FIX) {
            if (pattern.test(line)) {
              offenders.push(`${path.relative(root, file)}:${i + 1}  use ${fix}  →  ${line.trim()}`);
            }
          }
        });
    }
    expect(offenders).toEqual([]);
  });
});
