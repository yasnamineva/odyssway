import { describe, expect, it } from "vitest";
import { applyByDate } from "../src/lead-time";

const dates = { travel: "2026-12-01", arrival: "2026-12-02" };

describe("applyByDate", () => {
  it("counts calendar days, weeks and months back from the right reference date", () => {
    expect(applyByDate({ amount: 14, unit: "days", before: "travel" }, dates)).toBe("2026-11-17");
    expect(applyByDate({ amount: 2, unit: "weeks", before: "arrival" }, dates)).toBe("2026-11-18");
    expect(applyByDate({ amount: 1, unit: "months", before: "travel" }, dates)).toBe("2026-11-01");
    expect(applyByDate({ amount: 1, unit: "months", before: "travel" }, { travel: "2026-03-31", arrival: "2026-03-31" })).toBe(
      "2026-02-28",
    );
  });

  it("skips weekends when counting working days", () => {
    // 2026-12-02 is a Wednesday: 5 working days back is Wednesday 25 November.
    expect(applyByDate({ amount: 5, unit: "working_days", before: "arrival" }, dates)).toBe("2026-11-25");
    // From Monday 2026-11-30, 1 working day back is Friday 27 November.
    expect(applyByDate({ amount: 1, unit: "working_days", before: "travel" }, { travel: "2026-11-30", arrival: "2026-11-30" })).toBe(
      "2026-11-27",
    );
  });

  it("rejects a non-positive amount", () => {
    expect(() => applyByDate({ amount: 0, unit: "days", before: "travel" }, dates)).toThrow(RangeError);
  });
});
