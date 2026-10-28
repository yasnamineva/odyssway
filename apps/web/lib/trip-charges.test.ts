import { describe, expect, it } from "vitest";
import { chargesForDestination, tripCharges } from "./trip-charges";

describe("trip charges", () => {
  it("publishes verified rows only, each with an amount as the source states it", () => {
    expect(tripCharges.length).toBeGreaterThan(0);
    for (const c of tripCharges) {
      expect(c.status).toBe("verified");
      expect(c.amountText).toBeTruthy();
      expect(c.legal_source.url).toMatch(/^https:\/\//);
    }
  });

  it("finds a destination's charges by code, in either case", () => {
    expect(chargesForDestination("ec").map((c) => c.id)).toEqual([
      "galapagos-protected-areas-entry-fee",
      "galapagos-transit-control-card",
    ]);
    expect(chargesForDestination("US")).toEqual([]);
  });
});
