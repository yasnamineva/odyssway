import { describe, expect, it } from "vitest";
import { figuresIn, missingFigures, translationSourceHash } from "../src/translation";

describe("translationSourceHash", () => {
  it("changes when the English text changes, and only then", () => {
    const a = translationSourceHash({ summary: "Declare cash over USD 10,000.", notes: "Form 7." });
    expect(translationSourceHash({ summary: "Declare cash over USD 10,000.", notes: "Form 7." })).toBe(a);
    expect(translationSourceHash({ summary: "Declare cash over USD 15,000.", notes: "Form 7." })).not.toBe(a);
    expect(translationSourceHash({ summary: "Declare cash over USD 10,000." })).not.toBe(a);
  });
});

describe("missingFigures", () => {
  it("finds amounts, days and ages lost or changed in translation", () => {
    expect(figuresIn("USD 10,000 or 1.5 litres, aged 18")).toEqual(["10000", "1.5", "18"]);
    const en = { summary: "Up to 200 cigarettes, aged 18 or over.", documentsNeeded: ["Passport valid 3 months"] };
    expect(missingFigures(en, { summary: "紙巻たばこ200本まで（18歳以上）。", documentsNeeded: ["3か月有効なパスポート"] })).toEqual([]);
    expect(missingFigures(en, { summary: "紙巻たばこ20本まで（18歳以上）。", documentsNeeded: ["3か月有効なパスポート"] })).toEqual([
      "summary: 200",
    ]);
    // Full-width digits don't count: figures must stay in ASCII.
    expect(missingFigures({ notes: "90 days" }, { notes: "９０日" })).toEqual(["notes: 90"]);
    // A figure used twice in English must appear twice.
    expect(missingFigures({ notes: "1 litre spirits and 1 litre wine" }, { notes: "スピリッツ1リットルとワイン" })).toEqual(["notes: 1"]);
  });

  it("treats a missing translated field as missing all its figures", () => {
    expect(missingFigures({ notes: "Within 48 hours" }, {})).toEqual(["notes: 48"]);
  });

  it("accepts a German decimal comma and still accepts thousands separators", () => {
    expect(missingFigures({ notes: "max 1.125 litres each" }, { notes: "je höchstens 1,125 Liter" })).toEqual([]);
    expect(missingFigures({ notes: "NZ$10,000 or more" }, { notes: "ab NZ$10\u00a0000" })).toEqual([]);
    expect(missingFigures({ notes: "NZ$10,000 or more" }, { notes: "ab NZ$10,000" })).toEqual([]);
    expect(missingFigures({ notes: "1.125 litres" }, { notes: "1,5 Liter" })).toEqual(["notes: 1.125"]);
  });
});
