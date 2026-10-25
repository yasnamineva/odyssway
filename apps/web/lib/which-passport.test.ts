import { describe, expect, it } from "vitest";
import { resolveTripCheck } from "./trip-check";
import { comparePassports } from "./which-passport";

const cmp = (a: string, b: string, dest: string) => comparePassports(resolveTripCheck(a, dest, []), resolveTripCheck(b, dest, []));

describe("comparePassports", () => {
  it("prefers the passport with the lighter entry requirement", () => {
    // India needs a visa for Uzbekistan; the UK doesn't (Cabinet Resolution 408, Annex 5).
    const r = cmp("IN", "GB", "UZ");
    expect(r.fewer).toBe("b");
    expect(r.reason).toBe("requirement");
  });

  it("compares stay length only under the same kind of rule", () => {
    // Macao: UK 6 months (180 days) vs US 30 days, both per visit.
    const r = cmp("GB", "US", "MO");
    expect(r.fewer).toBe("a");
    expect(r.reason).toBe("stay");
  });

  it("says 'same' when the rows match", () => {
    expect(cmp("US", "CA", "UZ").fewer).toBe("same");
  });

  it("an EU passport for a Schengen state means free movement", () => {
    const r = cmp("US", "FR", "IT");
    expect(r.b.basis).toBe("free_movement");
    expect(r.fewer).toBe("b");
  });
});
