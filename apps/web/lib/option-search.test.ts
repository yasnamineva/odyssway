import { describe, expect, it } from "vitest";
import { searchOptions } from "./option-search";

const options = [
  { value: "AU", label: "Australia" },
  { value: "AT", label: "Austria (Schengen)" },
  { value: "DE", label: "Germany (Schengen)" },
  { value: "KR", label: "South Korea" },
  { value: "NL", label: "Netherlands (Schengen)" },
  { value: "TR", label: "Türkiye" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
];
const top = (q: string) => searchOptions(q, options)[0]?.value;

describe("searchOptions", () => {
  it("matches abbreviations and ISO codes", () => {
    expect(top("USA")).toBe("US");
    expect(top("usa")).toBe("US");
    expect(top("U.S.")).toBe("US");
    expect(top("us")).toBe("US");
    expect(top("UK")).toBe("GB");
    expect(top("uae")).toBe("AE");
    expect(top("de")).toBe("DE");
  });

  it("matches other names, demonyms and accents", () => {
    expect(top("america")).toBe("US");
    expect(top("britain")).toBe("GB");
    expect(top("holland")).toBe("NL");
    expect(top("turkey")).toBe("TR");
    expect(top("turkiye")).toBe("TR");
    expect(top("korea")).toBe("KR");
    expect(top("dubai")).toBe("AE");
  });

  it("ranks name prefixes before substrings", () => {
    expect(searchOptions("aus", options).map((o) => o.value)).toEqual(["AU", "AT"]);
    expect(top("united k")).toBe("GB");
  });

  it("tolerates small typos", () => {
    expect(top("germnay")).toBe("DE");
    expect(top("austrlia")).toBe("AU");
  });

  it("returns nothing for unrelated text and everything for an empty query", () => {
    expect(searchOptions("zzzz", options)).toEqual([]);
    expect(searchOptions("  ", options)).toHaveLength(options.length);
  });
});
