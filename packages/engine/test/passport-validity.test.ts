import { describe, expect, it } from "vitest";
import { addMonths, checkPassportValidity, remainingValidity } from "../src/passport-validity";

describe("addMonths", () => {
  it("adds calendar months", () => {
    expect(addMonths("2026-03-15", 6)).toBe("2026-09-15");
  });

  it("crosses a year boundary", () => {
    expect(addMonths("2026-10-18", 6)).toBe("2027-04-18");
  });

  it("clamps to the end of a shorter month", () => {
    expect(addMonths("2026-08-31", 6)).toBe("2027-02-28");
  });

  it("clamps to 29 February in a leap year", () => {
    expect(addMonths("2027-08-31", 6)).toBe("2028-02-29");
  });

  it("rejects fractional months", () => {
    expect(() => addMonths("2026-01-01", 1.5)).toThrow(RangeError);
  });
});

describe("checkPassportValidity", () => {
  const trip = { arrival: "2026-11-01", departure: "2026-11-20" };

  it("months from arrival: passes exactly on the required date", () => {
    const r = checkPassportValidity({ kind: "min_period", amount: 6, unit: "months", from: "arrival" }, trip, "2027-05-01");
    expect(r).toEqual({ validUntilAtLeast: "2027-05-01", compliant: true, marginDays: 0 });
  });

  it("months from arrival: fails one day short", () => {
    const r = checkPassportValidity({ kind: "min_period", amount: 6, unit: "months", from: "arrival" }, trip, "2027-04-30");
    expect(r.compliant).toBe(false);
    expect(r.marginDays).toBe(-1);
  });

  it("months beyond departure uses the departure date", () => {
    const r = checkPassportValidity({ kind: "min_period", amount: 3, unit: "months", from: "departure" }, trip, "2027-02-20");
    expect(r.validUntilAtLeast).toBe("2027-02-20");
    expect(r.compliant).toBe(true);
  });

  it("days beyond departure", () => {
    const r = checkPassportValidity({ kind: "min_period", amount: 60, unit: "days", from: "departure" }, trip, "2027-01-18");
    expect(r.validUntilAtLeast).toBe("2027-01-19");
    expect(r.compliant).toBe(false);
  });

  it("whole stay: valid through the departure day", () => {
    const rule = { kind: "whole_stay" } as const;
    expect(checkPassportValidity(rule, trip, "2026-11-20").compliant).toBe(true);
    expect(checkPassportValidity(rule, trip, "2026-11-19").compliant).toBe(false);
  });

  it("rejects a departure before arrival", () => {
    expect(() =>
      checkPassportValidity({ kind: "whole_stay" }, { arrival: "2026-11-20", departure: "2026-11-01" }, "2030-01-01"),
    ).toThrow(RangeError);
  });

  it("a later expiry never turns a pass into a fail", () => {
    const rule = { kind: "min_period", amount: 6, unit: "months", from: "arrival" } as const;
    let passed = false;
    for (let d = 0; d < 400; d++) {
      const expiry = new Date(Date.UTC(2027, 0, 1 + d)).toISOString().slice(0, 10);
      const ok = checkPassportValidity(rule, trip, expiry).compliant;
      if (passed) expect(ok).toBe(true);
      passed ||= ok;
    }
    expect(passed).toBe(true);
  });
});

describe("remainingValidity", () => {
  it("counts whole months and days", () => {
    expect(remainingValidity("2027-05-01", "2026-11-01")).toEqual({ months: 6, days: 181 });
    expect(remainingValidity("2027-04-30", "2026-11-01")).toEqual({ months: 5, days: 180 });
  });

  it("is zero once the passport has expired", () => {
    expect(remainingValidity("2026-10-01", "2026-11-01")).toEqual({ months: 0, days: 0 });
  });
});
