import { describe, expect, it } from "vitest";
import { customsItems } from "./destinations";
import { allRowsTranslated, countryName, germanPairs, translatedCustomsDetails, translatedCustomsRow } from "./translations";

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
    const untranslated = customsItems.find((r) => r.slug === "cash-vn")!;
    expect(translatedCustomsRow(untranslated, "de")).toBeNull();
    expect(allRowsTranslated([euDrones, untranslated], "de")).toBe(false);
  });

  it("builds German pages only for fully translated pairs", () => {
    const pages = germanPairs();
    expect(pages.length).toBeGreaterThan(0);
    expect(pages.some((p) => p.category === "drones" && p.destinationSlug === "france")).toBe(true);
    // Turkey's medicine page: both rows translated and both have German row labels.
    expect(pages.some((p) => p.category === "medication" && p.destinationSlug === "turkey")).toBe(true);
    expect(pages.some((p) => p.category === "alcohol" && p.destinationSlug === "turkey")).toBe(true);
    expect(pages.some((p) => p.category === "tobacco" && p.destinationSlug === "united-arab-emirates")).toBe(true);
    // Vietnam cash waits on its threshold wording, so it has no German page.
    expect(pages.some((p) => p.category === "cash" && p.destinationSlug === "vietnam")).toBe(false);
  });

  it("translates a row's permit how-to, letter checklist and transit rule separately", () => {
    const sg = customsItems.find((r) => r.slug === "controlled-medication-sg")!;
    const d = translatedCustomsDetails(sg, "de");
    expect(d?.procedureSteps?.length).toBe(sg.procedure!.steps.length);
    expect(d?.letterItems?.length).toBe(sg.letter!.items.length);
    expect(d?.transitDescription).toMatch(/Transitbereich/);
    // A changed procedure step withdraws the details and with them the whole row,
    // so a German page never drops what the English page shows.
    const changed = { ...sg, procedure: { ...sg.procedure!, steps: [...sg.procedure!.steps, "New step."] } };
    expect(translatedCustomsDetails(changed, "de")).toBeNull();
    expect(translatedCustomsRow(changed, "de")).toBeNull();
    // A row without details has none to translate.
    expect(translatedCustomsDetails(euDrones, "de")).toBeNull();
    expect(translatedCustomsRow(euDrones, "de")).not.toBeNull();
  });

  it("names countries in German, with short forms where CLDR is long", () => {
    expect(countryName("FR", "de", "France")).toBe("Frankreich");
    expect(countryName("HK", "de", "Hong Kong")).toBe("Hongkong");
  });
});
