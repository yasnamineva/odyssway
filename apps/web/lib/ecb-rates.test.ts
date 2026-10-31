import { describe, expect, it } from "vitest";
import { parseEcbRates } from "./ecb-rates";

describe("parseEcbRates", () => {
  it("reads the date and every currency rate", () => {
    const xml = `<Cube><Cube time='2026-10-30'><Cube currency='USD' rate='1.1172'/><Cube currency='JPY' rate='175.68'/></Cube></Cube>`;
    expect(parseEcbRates(xml)).toEqual({ date: "2026-10-30", rates: { USD: 1.1172, JPY: 175.68 } });
  });
  it("returns null for anything else", () => {
    expect(parseEcbRates("<html>error</html>")).toBeNull();
  });
});
