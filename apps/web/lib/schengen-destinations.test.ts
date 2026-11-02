import { describe, expect, it } from "vitest";
import { bringPair } from "./bring-pages";
import { nationalityRules } from "./nationalities";
import { schengenCustomsRows, schengenDestinations, schengenEntryGroups } from "./schengen-destinations";

describe("Schengen hubs", () => {
  it("derives a hub for each Schengen state not already in destinations.json", () => {
    const codes = schengenDestinations.map((d) => d.code);
    expect(codes).toEqual(expect.arrayContaining(["DE", "FR", "IT", "ES", "NO", "CH", "LI", "IS"]));
    expect(codes).not.toContain("IE"); // not in Schengen, and has its own destination record
  });

  it("answers customs from national rows plus the customs territory's rows", () => {
    const fr = schengenCustomsRows("FR").map((r) => r.slug);
    expect(fr).toContain("nicotine-pouches-fr");
    expect(fr).toContain("alcohol-eu");
    expect(fr.indexOf("nicotine-pouches-fr")).toBeLessThan(fr.indexOf("alcohol-eu"));
    expect(schengenCustomsRows("NO").every((r) => r.destination === "NO")).toBe(true);
    expect(schengenCustomsRows("LI").every((r) => r.destination === "CH")).toBe(true);
  });

  it("makes item pages for Schengen states with readable row labels", () => {
    const pair = bringPair("alcohol", "germany");
    expect(pair?.rows.map((r) => r.slug)).toEqual(["alcohol-eu"]);
  });

  it("puts every verified passport in exactly one entry group", () => {
    const grouped = schengenEntryGroups().flatMap((g) => g.nationalities.map((n) => n.nationality));
    const verified = nationalityRules.filter((n) => n.status === "verified").map((n) => n.nationality);
    expect(new Set(grouped).size).toBe(grouped.length);
    expect([...grouped].sort()).toEqual([...verified].sort());
  });
});
