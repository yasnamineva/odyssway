import { describe, expect, it } from "vitest";
import { stayPolicySchema } from "../src/schemas";
import { evaluateSimpleStay, evaluateStays, type StayPolicy } from "../src/stay-policy";

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

describe("stayPolicySchema maxDaysPerEntry", () => {
  const base = { kind: "rolling_window", windowDays: 180, maxDays: 90 } as const;

  it("accepts a rolling window without a per-entry cap", () => {
    expect(stayPolicySchema.safeParse(base).success).toBe(true);
  });

  it("accepts a per-entry cap below the window total", () => {
    expect(stayPolicySchema.safeParse({ ...base, maxDaysPerEntry: 30 }).success).toBe(true);
  });

  it("rejects a per-entry cap that is not below the window total", () => {
    expect(stayPolicySchema.safeParse({ ...base, maxDaysPerEntry: 90 }).success).toBe(false);
  });
});

describe("evaluateStays", () => {
  it("checks each stay against a per-entry limit, counting entry and exit days", () => {
    const r = evaluateStays({ kind: "fixed_per_entry", maxDays: 90 }, [
      { entry: "2026-01-01", exit: "2026-03-31" },
      { entry: "2026-05-01", exit: "2026-08-01" },
    ]);
    expect(r.stays.map((s) => s.days)).toEqual([90, 93]);
    expect(r.stays[1]?.overPerEntry).toBe(3);
    expect(r.compliant).toBe(false);
  });

  it("finds the first day a rolling window goes over", () => {
    const r = evaluateStays({ kind: "rolling_window", windowDays: 180, maxDays: 90 }, [
      { entry: "2026-01-01", exit: "2026-02-28" },
      { entry: "2026-04-01", exit: "2026-05-15" },
    ]);
    expect(r.peakInWindow).toBe(104);
    expect(r.firstWindowViolation).toBe("2026-05-02");
    expect(r.compliant).toBe(false);
  });

  it("counts overlapping stays once and respects a per-visit cap inside a window", () => {
    const r = evaluateStays({ kind: "rolling_window", windowDays: 180, maxDays: 90, maxDaysPerEntry: 30 }, [
      { entry: "2026-01-01", exit: "2026-01-20" },
      { entry: "2026-01-15", exit: "2026-01-25" },
      { entry: "2026-03-01", exit: "2026-04-05" },
    ]);
    expect(r.peakInWindow).toBe(61);
    expect(r.stays[2]?.overPerEntry).toBe(6);
    expect(r.firstWindowViolation).toBeNull();
    expect(r.compliant).toBe(false);
  });

  it("rejects an exit before the entry", () => {
    expect(() => evaluateStays({ kind: "fixed_per_entry", maxDays: 30 }, [{ entry: "2026-02-02", exit: "2026-02-01" }])).toThrow();
  });
});
