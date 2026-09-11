import { describe, expect, it } from "vitest";
import { expandQuery, isFuzzyMatch, levenshtein } from "./fuzzy-match";

describe("levenshtein", () => {
  it("is 0 for identical strings", () => {
    expect(levenshtein("adderall", "adderall")).toBe(0);
  });

  it("counts a single substitution as 1", () => {
    expect(levenshtein("adderall", "adderoll")).toBe(1);
  });

  it("counts a single deletion as 1", () => {
    expect(levenshtein("adderall", "adderal")).toBe(1);
  });

  it("handles empty strings", () => {
    expect(levenshtein("", "xanax")).toBe(5);
    expect(levenshtein("xanax", "")).toBe(5);
  });
});

describe("isFuzzyMatch", () => {
  it("matches common one-letter typos of a real drug name", () => {
    expect(isFuzzyMatch("adderoll", "adderall")).toBe(true);
    expect(isFuzzyMatch("codine", "codeine")).toBe(true);
  });

  it("does not match unrelated short words within a tight tolerance", () => {
    expect(isFuzzyMatch("cash", "hash")).toBe(false);
  });

  it("never fuzzy-matches against a multi-word phrase (substring matching already covers those)", () => {
    expect(isFuzzyMatch("painkiller", "opioid painkiller")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isFuzzyMatch("Adderoll", "ADDERALL")).toBe(true);
  });
});

describe("expandQuery", () => {
  it("returns just the normalized query when there's no known alias", () => {
    expect(expandQuery("  Adderall  ")).toEqual(["adderall"]);
  });

  it("adds the canonical term for a known slang/abbreviation", () => {
    expect(expandQuery("addy")).toEqual(["addy", "adderall"]);
  });

  it("never aliases to a different substance", () => {
    // "roxy" (oxycodone slang) has no entry — it must resolve to itself only,
    // not silently match against an unrelated drug's data.
    expect(expandQuery("roxy")).toEqual(["roxy"]);
  });
});
