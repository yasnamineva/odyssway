import { describe, expect, it } from "vitest";
import { evaluateSimpleStay, type StayPolicy } from "../src/stay-policy";

const ninetyDays: Extract<StayPolicy, { kind: "fixed_per_entry" }> = {
  kind: "fixed_per_entry",
  maxDays: 90,
};

describe("evaluateSimpleStay", () => {
  it("is compliant for a trip under the limit", () => {
    const result = evaluateSimpleStay(ninetyDays, 30);
    expect(result.compliant).toBe(true);
    expect(result.maxDays).toBe(90);
    expect(result.tripLengthDays).toBe(30);
  });

  it("is compliant exactly at the boundary", () => {
    expect(evaluateSimpleStay(ninetyDays, 90).compliant).toBe(true);
  });

  it("is not compliant one day over the boundary", () => {
    expect(evaluateSimpleStay(ninetyDays, 91).compliant).toBe(false);
  });

  it("has no lookback across other trips — each entry judged alone", () => {
    const first = evaluateSimpleStay(ninetyDays, 90);
    const second = evaluateSimpleStay(ninetyDays, 90);
    expect(first.compliant).toBe(true);
    expect(second.compliant).toBe(true);
  });

  it("rejects a non-positive-integer trip length", () => {
    expect(() => evaluateSimpleStay(ninetyDays, 0)).toThrow(RangeError);
    expect(() => evaluateSimpleStay(ninetyDays, -5)).toThrow(RangeError);
    expect(() => evaluateSimpleStay(ninetyDays, 1.5)).toThrow(RangeError);
  });

  it("works with a different policy limit (e.g. UK's 180 days)", () => {
    const uk: Extract<StayPolicy, { kind: "fixed_per_entry" }> = {
      kind: "fixed_per_entry",
      maxDays: 180,
    };
    expect(evaluateSimpleStay(uk, 180).compliant).toBe(true);
    expect(evaluateSimpleStay(uk, 181).compliant).toBe(false);
  });
});
