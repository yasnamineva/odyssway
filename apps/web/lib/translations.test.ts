import { describe, expect, it } from "vitest";
import { customsItems } from "./destinations";
import { allRowsTranslated, countryName, germanPairs, translatedCustomsRow } from "./translations";

const euDrones = customsItems.find((r) => r.slug === "drones-eu")!;

describe("German translations", () => {
  it("returns the German text for a fresh, complete translation", () => {
    const tr = translatedCustomsRow(euDrones, "de");
    expect(tr?.summary).toMatch(/Zollregel/);
    expect(tr?.notes).toMatch(/Betriebskategorie „offen“/);
  });

  it("falls back (no translation) once the English row changes", () => {
    const changed = { ...euDrones, summary: `${euDrones.summary} Changed.` };
    expect(translatedCustomsRow(changed, "de")).toBeNull();
  });

  it("has no translation for a row nobody translated", () => {
    const alcohol = customsItems.find((r) => r.slug === "alcohol-eu")!;
    expect(translatedCustomsRow(alcohol, "de")).toBeNull();
    expect(allRowsTranslated([euDrones, alcohol], "de")).toBe(false);
  });

  it("builds German pages only for fully translated pairs", () => {
    const pages = germanPairs();
    expect(pages.length).toBeGreaterThan(0);
    expect(pages.some((p) => p.category === "drones" && p.destinationSlug === "france")).toBe(true);
    // Turkey's medicine page: both rows translated and both have German row labels.
    expect(pages.some((p) => p.category === "medication" && p.destinationSlug === "turkey")).toBe(true);
    expect(pages.some((p) => p.category === "alcohol" && p.destinationSlug === "turkey")).toBe(true);
    expect(pages.some((p) => p.category === "tobacco" && p.destinationSlug === "united-arab-emirates")).toBe(true);
    // Weapons aren't translated anywhere yet.
    expect(pages.some((p) => p.category === "weapons")).toBe(false);
  });

  it("names countries in German, with short forms where CLDR is long", () => {
    expect(countryName("FR", "de", "France")).toBe("Frankreich");
    expect(countryName("HK", "de", "Hong Kong")).toBe("Hongkong");
  });
});
