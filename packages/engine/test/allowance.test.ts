import { describe, expect, it } from "vitest";
import { evaluateAllowance, type Allowance } from "../src/allowance";

// EU: 1 L spirits or 2 L ≤22% (proportional), plus 4 L still wine, plus 16 L beer.
const eu: Allowance = {
  groups: [
    { kind: "proportional", options: [{ products: ["spirits"], amount: 1 }, { products: ["intermediate"], amount: 2 }] },
    { kind: "one_of", options: [{ products: ["still_wine"], amount: 4 }] },
    { kind: "one_of", options: [{ products: ["beer"], amount: 16 }] },
  ],
};
// Canada-style alternatives with no statement that they combine.
const alternatives: Allowance = {
  groups: [
    {
      kind: "one_of",
      options: [
        { products: ["still_wine", "intermediate"], amount: 1.5 },
        { products: ["spirits"], amount: 1.14 },
        { products: ["beer"], amount: 8.5 },
      ],
    },
  ],
};
const kenyaTobacco: Allowance = { groups: [{ kind: "total", products: ["smoking_tobacco"], amount: 250 }] };

describe("evaluateAllowance", () => {
  it("adds separate groups and splits a proportional group pro rata", () => {
    expect(evaluateAllowance(eu, { spirits: 0.5, intermediate: 1, still_wine: 4, beer: 16 }).status).toBe("within");
    const over = evaluateAllowance(eu, { spirits: 0.75, intermediate: 1 });
    expect(over.status).toBe("over");
    expect(over.groups[0]!.used).toBeCloseTo(1.25);
  });

  it("checks a single alternative on its own, and won't guess when alternatives are mixed", () => {
    expect(evaluateAllowance(alternatives, { spirits: 1.14 }).status).toBe("within");
    expect(evaluateAllowance(alternatives, { spirits: 1.2 }).status).toBe("over");
    expect(evaluateAllowance(alternatives, { spirits: 0.5, beer: 1 }).status).toBe("unclear");
    // Mixed, but one alone is already over the limit.
    expect(evaluateAllowance(alternatives, { spirits: 2, beer: 1 }).status).toBe("over");
  });

  it("shares one amount across a total group", () => {
    expect(evaluateAllowance(kenyaTobacco, { smoking_tobacco: 250 }).status).toBe("within");
    expect(evaluateAllowance(kenyaTobacco, { smoking_tobacco: 251 }).status).toBe("over");
  });

  it("flags products the row gives no allowance for, and handles empty input", () => {
    const r = evaluateAllowance(kenyaTobacco, { smoking_tobacco: 100, cigars: 2 });
    expect(r.status).toBe("not_covered");
    expect(r.uncovered).toEqual(["cigars"]);
    expect(evaluateAllowance(eu, {}).status).toBe("empty");
    expect(evaluateAllowance(eu, { beer: 0 }).status).toBe("empty");
  });

  it("over beats not-covered, and rejects negative quantities", () => {
    expect(evaluateAllowance(kenyaTobacco, { smoking_tobacco: 300, cigars: 1 }).status).toBe("over");
    expect(() => evaluateAllowance(eu, { beer: -1 })).toThrow(RangeError);
  });
});
