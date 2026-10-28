import { describe, expect, it } from "vitest";
import { timedStepDate, type TimedStep } from "../src/timed-step";

const step = (kind: TimedStep["window"]["kind"], amount: number, unit: "hours" | "days"): TimedStep => ({
  line: "x",
  window: { kind, amount, unit },
});

describe("timedStepDate", () => {
  it("opens 72 hours before arrival = 3 days earlier", () => {
    expect(timedStepDate(step("opens_before_arrival", 72, "hours"), "2026-12-01")).toBe("2026-11-28");
  });
  it("rounds part days up (96 hours = 4 days, 36 hours = 2 days)", () => {
    expect(timedStepDate(step("opens_before_arrival", 96, "hours"), "2026-03-01")).toBe("2026-02-25");
    expect(timedStepDate(step("opens_before_arrival", 36, "hours"), "2026-03-01")).toBe("2026-02-27");
  });
  it("due at least 4 days before arrival", () => {
    expect(timedStepDate(step("due_before_arrival", 4, "days"), "2027-01-02")).toBe("2026-12-29");
  });
  it("due within 24 hours / 3 days of arrival", () => {
    expect(timedStepDate(step("due_after_arrival", 24, "hours"), "2028-02-28")).toBe("2028-02-29");
    expect(timedStepDate(step("due_after_arrival", 3, "days"), "2026-12-30")).toBe("2027-01-02");
  });
  it("rejects a non-positive amount", () => {
    expect(() => timedStepDate(step("due_after_arrival", 0, "days"), "2026-01-01")).toThrow(RangeError);
  });
});
