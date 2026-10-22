import { describe, expect, it } from "vitest";
import { checkRouteStop, firstFailingStop, type RouteStop } from "./route-passport";

const stop = (over: Partial<RouteStop>): RouteStop => ({
  destinationName: "X",
  covered: true,
  arrival: "2026-11-01",
  departure: "2026-11-10",
  ...over,
});

describe("checkRouteStop", () => {
  it("judges each stop by its own rule and finds the first failure", () => {
    const expiry = "2027-03-01";
    const statuses = [
      stop({ passportLine: "Passport valid for the whole of your stay", passportValidity: { kind: "whole_stay" } }),
      stop({
        passportLine: "Passport valid for at least 6 months from the date of arrival",
        passportValidity: { kind: "min_period", amount: 6, unit: "months", from: "arrival" },
        arrival: "2026-11-12",
        departure: "2026-11-20",
      }),
    ].map((s) => checkRouteStop(s, expiry));
    expect(statuses[0]?.kind === "verdict" && statuses[0].result.compliant).toBe(true);
    expect(statuses[1]?.kind === "verdict" && statuses[1].result.validUntilAtLeast).toBe("2027-05-12");
    expect(firstFailingStop(statuses)).toBe(1);
  });

  it("never gives a verdict without a stated reference date", () => {
    const noRef = checkRouteStop(stop({ passportLine: "Passport valid for at least 6 months" }), "2027-03-01");
    expect(noRef.kind).toBe("no_reference");
    const noPeriod = checkRouteStop(stop({ passportLine: "Valid passport" }), "2027-03-01");
    expect(noPeriod.kind).toBe("no_period");
    expect(checkRouteStop(stop({ covered: false }), "2027-03-01").kind).toBe("not_covered");
    expect(checkRouteStop(stop({}), "2027-03-01").kind).toBe("no_rule");
  });

  it("waits for complete dates and flags reversed ones", () => {
    expect(checkRouteStop(stop({ passportLine: "Valid passport", arrival: "" }), "2027-03-01").kind).toBe("pending");
    expect(
      checkRouteStop(stop({ passportLine: "Valid passport", arrival: "2026-11-10", departure: "2026-11-01" }), "2027-03-01").kind,
    ).toBe("reversed");
  });
});
