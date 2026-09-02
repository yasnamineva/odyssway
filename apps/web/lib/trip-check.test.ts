import { describe, expect, it } from "vitest";
import { resolveTripCheck, SCHENGEN_DESTINATION } from "./trip-check";

describe("resolveTripCheck", () => {
  it("returns the citizen shortcut when nationality equals destination", () => {
    const result = resolveTripCheck("US", "US", []);
    expect(result.covered).toBe(true);
    expect(result.basis).toBe("citizen");
    expect(result.stayPolicy).toBeNull();
  });

  it("hands off to the Schengen rolling-window engine for a verified nationality", () => {
    const result = resolveTripCheck("US", SCHENGEN_DESTINATION, []);
    expect(result.covered).toBe(true);
    expect(result.isSchengen).toBe(true);
    expect(result.basis).toBe("visa_free");
    expect(result.stayPolicy).toEqual({ kind: "rolling_window", windowDays: 180, maxDays: 90 });
    expect(result.documentsNeeded.length).toBeGreaterThan(0);
    expect(result.legalSource?.name).toContain("Schengen Borders Code");
  });

  it("resolves a specific Schengen member state the same way as the SCHENGEN sentinel", () => {
    const bySentinel = resolveTripCheck("US", SCHENGEN_DESTINATION, []);
    const byCountry = resolveTripCheck("US", "FR", []);
    expect(byCountry.isSchengen).toBe(true);
    expect(byCountry.basis).toBe(bySentinel.basis);
  });

  it("is honestly not-covered for a nationality outside the verified roster", () => {
    const result = resolveTripCheck("ZZ", SCHENGEN_DESTINATION, []);
    expect(result.covered).toBe(false);
    expect(result.basis).toBe("not_covered");
  });

  it("is honestly not-covered for a nationality/destination pair with no verified entry-requirements row yet", () => {
    // Singapore is a verified destination, but the IL->SG row was withheld
    // from production data (only secondary-sourced, not primary-confirmed) —
    // this must still resolve to an honest not-covered result, not a guess.
    const result = resolveTripCheck("IL", "SG", []);
    expect(result.covered).toBe(false);
    expect(result.basis).toBe("not_covered");
    expect(result.officialAuthorityUrl).toContain("ica.gov.sg");
  });

  it("resolves a verified non-Schengen destination (UK ETA route)", () => {
    const result = resolveTripCheck("US", "GB", []);
    expect(result.covered).toBe(true);
    expect(result.isSchengen).toBe(false);
    expect(result.basis).toBe("eta_required");
    expect(result.stayPolicy).toEqual({ kind: "fixed_per_entry", maxDays: 180 });
  });

  it("resolves a verified non-Schengen visa-required pair with no automatic stay length", () => {
    const result = resolveTripCheck("UA", "US", []);
    expect(result.covered).toBe(true);
    expect(result.basis).toBe("visa_required");
    expect(result.stayPolicy).toEqual({ kind: "visa_required" });
  });

  it("finds a verified customs item for a covered destination", () => {
    const result = resolveTripCheck("US", "CA", ["cannabis"]);
    expect(result.items[0]!.match?.verdict).toBe("prohibited");
    expect(result.items[0]!.match?.destination).toBe("CA");
  });

  it("looks up EU-harmonized customs items under the EU sentinel for Schengen destinations", () => {
    const result = resolveTripCheck("US", SCHENGEN_DESTINATION, ["cash"]);
    expect(result.items[0]!.match?.destination).toBe("EU");
    expect(result.items[0]!.match?.verdict).toBe("declaration_required");
  });

  it("never fabricates an item match when no customs data exists for the queried items", () => {
    // South Korea's only verified customs row is the cash-declaration
    // threshold — alcohol/weapons must never fall back to a guess.
    const result = resolveTripCheck("US", "KR", ["alcohol", "weapons"]);
    expect(result.items).toHaveLength(2);
    expect(result.items.every((i) => i.match === null)).toBe(true);
  });

  it("ignores blank item queries", () => {
    const result = resolveTripCheck("US", "US", ["  ", "", "wine"]);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]!.query).toBe("wine");
  });
});
