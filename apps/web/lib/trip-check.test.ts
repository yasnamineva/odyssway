import { describe, expect, it } from "vitest";
import { resolveItem, resolveTripCheck, SCHENGEN_DESTINATION } from "./trip-check";

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

  it("catches a common typo of a real controlled-substance item", () => {
    // Japan's amphetamine row covers Adderall — prohibited outright, kept
    // separate from the "needs permission" stimulant raw materials.
    const result = resolveTripCheck("US", "JP", ["adderoll"]);
    expect(result.items[0]!.match?.slug).toBe("amphetamine-medication-jp");
    expect(result.items[0]!.match?.verdict).toBe("prohibited");
  });

  it("resolves a known slang/abbreviation to its canonical item", () => {
    const result = resolveTripCheck("US", "JP", ["addy"]);
    expect(result.items[0]!.match?.slug).toBe("amphetamine-medication-jp");
  });

  it("keeps permission-needed stimulant raw materials on their own row", () => {
    const result = resolveTripCheck("US", "JP", ["sudafed"]);
    expect(result.items[0]!.match?.slug).toBe("stimulant-medication-jp");
    expect(result.items[0]!.match?.verdict).toBe("depends");
  });

  it("matches named medicines to their own Japan rows: narcotics need a permit, psychotropics have limits", () => {
    expect(resolveTripCheck("US", "JP", ["oxycodone"]).items[0]!.match?.slug).toBe("narcotic-medication-jp");
    expect(resolveTripCheck("US", "JP", ["xanax"]).items[0]!.match?.slug).toBe("psychotropic-medication-jp");
    expect(resolveTripCheck("US", "JP", ["adderall"]).items[0]!.match?.slug).toBe("amphetamine-medication-jp");
  });

  it("answers things legal at home but restricted abroad: melatonin and nicotine pouches", () => {
    expect(resolveTripCheck("US", "NZ", ["melatonin"]).items[0]!.match?.slug).toBe("melatonin-nz");
    const zyn = resolveTripCheck("US", "AU", ["zyn"]).items[0]!.match;
    expect(zyn?.slug).toBe("nicotine-pouches-au");
    expect(zyn?.verdict).toBe("prohibited");
    expect(resolveTripCheck("US", "SG", ["nicotine pouches"]).items[0]!.match?.slug).toBe("nicotine-pouches-sg");
  });

  it("answers growth hormone, peptides and melatonin for Australia", () => {
    expect(resolveTripCheck("US", "AU", ["hgh"]).items[0]!.match?.slug).toBe("growth-hormone-au");
    expect(resolveTripCheck("US", "AU", ["bpc-157"]).items[0]!.match?.slug).toBe("peptides-au");
    expect(resolveTripCheck("US", "AU", ["melatonin"]).items[0]!.match?.slug).toBe("melatonin-au");
  });

  it("answers kratom and poppers in Japan, kratom in Sweden and phenibut in Australia", () => {
    expect(resolveTripCheck("US", "JP", ["kratom"]).items[0]!.match?.slug).toBe("kratom-jp");
    expect(resolveTripCheck("US", "JP", ["poppers"]).items[0]!.match?.verdict).toBe("prohibited");
    expect(resolveTripCheck("US", "JP", ["pepper"]).items[0]!.match?.slug).not.toBe("poppers-jp");
    expect(resolveTripCheck("US", "JP", ["peppers"]).items[0]!.match?.slug).not.toBe("poppers-jp");
    expect(resolveTripCheck("US", "JP", ["popper"]).items[0]!.match?.slug).toBe("poppers-jp");
    expect(resolveTripCheck("US", "JP", ["hoppers"]).items[0]!.match).toBeNull();
    expect(resolveTripCheck("US", "SE", ["kratom"]).items[0]!.match?.slug).toBe("kratom-se");
    expect(resolveTripCheck("DE", "SE", ["kratom"]).items[0]!.match?.slug).toBe("kratom-se");
    expect(resolveTripCheck("US", "AU", ["phenibut"]).items[0]!.match?.slug).toBe("phenibut-au");
  });

  it("answers heated tobacco and shisha, and modafinil in Singapore", () => {
    expect(resolveItem("SG", "iqos")?.slug).toBe("heated-tobacco-sg");
    expect(resolveItem("SG", "tobacco")?.slug).toBe("tobacco-sg");
    expect(resolveItem("KE", "shisha")?.verdict).toBe("prohibited");
    expect(resolveItem("GB", "heated tobacco")?.slug).toBe("tobacco-gb");
    expect(resolveItem("SG", "modafinil")?.slug).toBe("controlled-medication-sg");
  });

  it("answers chewing gum in Singapore and vapes in the UAE", () => {
    expect(resolveItem("SG", "gum")?.slug).toBe("chewing-gum-sg");
    expect(resolveItem("SG", "nicotine gum")?.slug).toBe("medicated-gum-sg");
    expect(resolveItem("AE", "vape")?.slug).toBe("e-cigarettes-ae");
  });

  it("answers pseudoephedrine in New Zealand and nicotine gum in Singapore", () => {
    expect(resolveItem("NZ", "pseudoephedrine")?.slug).toBe("pseudoephedrine-nz");
    expect(resolveItem("SG", "nicotine gum")?.verdict).toBe("prohibited");
  });

  it("answers kratom and kava, and keeps generic words from matching them", () => {
    expect(resolveTripCheck("US", "AU", ["kratom"]).items[0]!.match?.verdict).toBe("prohibited");
    expect(resolveTripCheck("US", "NZ", ["kratom"]).items[0]!.match?.slug).toBe("kratom-nz");
    expect(resolveTripCheck("US", "SG", ["kratom"]).items[0]!.match?.slug).toBe("kratom-sg");
    expect(resolveTripCheck("US", "AU", ["kava"]).items[0]!.match?.slug).toBe("kava-au");
    expect(resolveTripCheck("US", "AU", ["tea"]).items[0]!.match?.slug).not.toBe("kratom-au");
    expect(resolveTripCheck("US", "NZ", ["supplement"]).items[0]!.match?.slug).not.toBe("melatonin-nz");
  });

  it("applies a member state's national rule on top of the EU rows, for everyone arriving there", () => {
    const visitor = resolveTripCheck("US", "FR", ["zyn", "cigarettes"]);
    expect(visitor.items[0]!.match?.slug).toBe("nicotine-pouches-fr");
    expect(visitor.items[0]!.match?.verdict).toBe("prohibited");
    expect(visitor.items[1]!.match?.destination).toBe("EU");

    const euCitizen = resolveTripCheck("DE", "FR", ["nicotine pouches", "cigarettes"]);
    expect(euCitizen.intraEuCustoms).toBe(true);
    expect(euCitizen.items[0]!.match?.slug).toBe("nicotine-pouches-fr");
    expect(euCitizen.items[1]!.match).toBeNull();

    // Neither another member state nor "Schengen Area, unspecified" picks up France's rule.
    expect(resolveTripCheck("US", "DE", ["zyn"]).items[0]!.match?.slug).not.toBe("nicotine-pouches-fr");
    expect(resolveTripCheck("US", "SCHENGEN", ["zyn"]).items[0]!.match?.slug).not.toBe("nicotine-pouches-fr");
  });

  it("resolveItem gives the widget the same answer Trip Check gives a non-EU traveller", () => {
    for (const [dest, q] of [["JP", "adderall"], ["FR", "zyn"], ["DE", "cigarettes"], ["SCHENGEN", "cash"], ["AU", "kava"], ["IE", "cigarettes"]]) {
      expect(resolveItem(dest!, q!)?.slug).toBe(resolveTripCheck("US", dest!, [q!]).items[0]!.match?.slug);
    }
    expect(resolveItem("FR", "zyn")?.slug).toBe("nicotine-pouches-fr");
    expect(resolveItem("JP", "   ")).toBeNull();
  });

  it("adds a stopover country's stated transit rule for each item", () => {
    const viaSg = resolveTripCheck("US", "AU", ["adderall"], "SG");
    expect(viaSg.transit).toEqual({ code: "SG", name: "Singapore" });
    expect(viaSg.items[0]!.match?.slug).toBe("controlled-medication-au");
    expect(viaSg.items[0]!.transitMatch?.transit?.rule).toBe("exempt_airside");

    const viaHk = resolveTripCheck("US", "AU", ["adderall"], "HK");
    expect(viaHk.items[0]!.transitMatch?.transit?.rule).toBe("applies");

    // A verified row with no stated transit rule stays a row without `transit`; no row stays null.
    const viaJp = resolveTripCheck("US", "AU", ["adderall", "kava"], "JP");
    expect(viaJp.items[0]!.transitMatch?.slug).toBe("amphetamine-medication-jp");
    expect(viaJp.items[0]!.transitMatch?.transit).toBeUndefined();
    expect(viaJp.items[1]!.transitMatch).toBeNull();

    // No stopover, an unknown one, or the destination itself: no transit at all.
    expect(resolveTripCheck("US", "AU", ["adderall"]).items[0]!.transitMatch).toBeUndefined();
    expect(resolveTripCheck("US", "AU", ["adderall"], "XX").transit).toBeUndefined();
    expect(resolveTripCheck("US", "AU", ["adderall"], "AU").transit).toBeUndefined();

    // EU citizens get the stopover answer too.
    expect(resolveTripCheck("DE", "FR", ["adderall"], "AE").items[0]!.transitMatch?.transit?.rule).toBe(
      "exempt_airside",
    );
  });

  it("gives EU citizens free movement within the EU, and withholds extra-EU customs verdicts", () => {
    for (const destination of ["SCHENGEN", "DE", "IE", "CY"]) {
      const result = resolveTripCheck("FR", destination, ["cigarettes"]);
      expect(result.basis).toBe("free_movement");
      expect(result.stayPolicy).toBeNull();
      expect(result.intraEuCustoms).toBe(true);
      expect(result.items[0]!.match).toBeNull();
    }
  });

  it("does not apply free movement to an EU citizen leaving the EU", () => {
    expect(resolveTripCheck("FR", "JP", []).basis).not.toBe("free_movement");
  });

  it("does not fuzzy-match a short query into an unrelated item", () => {
    // "cash" is one edit from "hash"-type slang, but must never cross into
    // an unrelated category just because they're similarly spelled.
    const result = resolveTripCheck("US", "CA", ["cash"]);
    expect(result.items[0]!.match?.category).toBe("cash");
  });

  it("ignores blank item queries", () => {
    const result = resolveTripCheck("US", "US", ["  ", "", "wine"]);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]!.query).toBe("wine");
  });
});

describe("resolveTripCheck — passport validity (§1.6)", () => {
  it("carries the structured rule when the wording names its reference date", () => {
    const result = resolveTripCheck("US", "KE", []);
    expect(result.passportLine).toMatch(/six months beyond your planned arrival/);
    expect(result.passportValidity).toEqual({ kind: "min_period", amount: 6, unit: "months", from: "arrival" });
  });

  it("applies the Schengen Borders Code rule: 3 months after you leave", () => {
    const result = resolveTripCheck("US", SCHENGEN_DESTINATION, []);
    expect(result.passportLine).toMatch(/3 months after the date you intend to leave/);
    expect(result.passportValidity).toEqual({ kind: "min_period", amount: 3, unit: "months", from: "departure" });
  });

  it("has no rule when the wording doesn't say which date the period counts from", () => {
    const result = resolveTripCheck("US", "AE", []);
    expect(result.passportLine).toMatch(/at least 6 months/);
    expect(result.passportValidity).toBeUndefined();
  });
});
