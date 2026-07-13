import { describe, expect, it } from "vitest";
import { checkTimeline, maxStay, nextEntry, planTrip, status } from "../src/engine";
import { EngineError, InvalidTripError } from "../src/errors";
import { trips } from "./helpers";

describe("status", () => {
  it("counts days used in the rolling window and days remaining", () => {
    const t = trips(["2024-06-01", "2024-06-10"]);
    const s = status(t, "2024-06-10");
    expect(s.daysUsed).toBe(10);
    expect(s.daysRemaining).toBe(80);
    expect(s.overstayDays).toBe(0);
    expect(s.presentOnDate).toBe(true);
    expect(s.windowStart).toBe("2023-12-14");
  });

  it("keeps a presence day in the window exactly 180 days (boundary straddle)", () => {
    const t = trips(["2024-06-01", "2024-06-10"]);
    // 2024-06-10 is still inside the window ending 2024-12-06 (= 06-10 + 179)…
    expect(status(t, "2024-12-06").daysUsed).toBe(1);
    // …and outside the window ending one day later.
    expect(status(t, "2024-12-07").daysUsed).toBe(0);
  });

  it("reports overstay days beyond 90", () => {
    const t = trips(["2024-01-01", "2024-04-10"]); // 101 days
    const s = status(t, "2024-04-10");
    expect(s.daysUsed).toBe(101);
    expect(s.daysRemaining).toBe(0);
    expect(s.overstayDays).toBe(11);
  });

  it("reports next safe entry = onDate when allowance remains", () => {
    const t = trips(["2024-06-01", "2024-06-10"]);
    expect(status(t, "2024-07-01").nextSafeEntry).toBe("2024-07-01");
  });

  it("after a maxed-out 90-day stay, next safe entry is 91 days after entry", () => {
    // Stay 1 Jan – 30 Mar 2024 = 90 days. The window ending on any day up to
    // 2024-06-28 still contains 90 used days; first compliant 1-day entry is 2024-06-29.
    const t = trips(["2024-01-01", "2024-03-30"]);
    const s = status(t, "2024-03-31");
    expect(s.daysRemaining).toBe(0);
    expect(s.nextSafeEntry).toBe("2024-06-29");
  });

  it("computes correctly with an empty trip list", () => {
    const s = status([], "2026-07-12");
    expect(s.daysUsed).toBe(0);
    expect(s.daysRemaining).toBe(90);
    expect(s.nextSafeEntry).toBe("2026-07-12");
  });
});

describe("planTrip", () => {
  it("accepts a compliant trip", () => {
    const result = planTrip([], "2026-08-01", "2026-10-29"); // exactly 90 days
    expect(result.tripLengthDays).toBe(90);
    expect(result.compliant).toBe(true);
    expect(result.firstViolationDay).toBeNull();
    expect(result.latestSafeExit).toBe("2026-10-29");
    expect(result.daysUsedOnExit).toBe(90);
    expect(result.daysRemainingAfterTrip).toBe(0);
  });

  it("rejects a 91-day trip and reports the first violating day", () => {
    const result = planTrip([], "2026-08-01", "2026-10-30");
    expect(result.compliant).toBe(false);
    expect(result.firstViolationDay).toBe("2026-10-30");
    expect(result.latestSafeExit).toBe("2026-10-29");
  });

  it("accounts for prior trips inside the window", () => {
    const prior = trips(["2026-05-01", "2026-06-29"]); // 60 days, all inside the window until late Oct
    const ok = planTrip(prior, "2026-08-01", "2026-08-30"); // 30 more → exactly 90 in-window
    expect(ok.compliant).toBe(true);
    const tooLong = planTrip(prior, "2026-08-01", "2026-08-31"); // 91st day in-window
    expect(tooLong.compliant).toBe(false);
    expect(tooLong.firstViolationDay).toBe("2026-08-31");
    expect(tooLong.latestSafeExit).toBe("2026-08-30");
  });

  it("returns null latestSafeExit when even the entry day is not compliant", () => {
    const prior = trips(["2024-01-01", "2024-03-30"]); // 90 days used
    const result = planTrip(prior, "2024-04-15", "2024-04-20");
    expect(result.compliant).toBe(false);
    expect(result.firstViolationDay).toBe("2024-04-15");
    expect(result.latestSafeExit).toBeNull();
  });

  it("merges a planned trip overlapping an existing trip without double counting", () => {
    const prior = trips(["2026-08-01", "2026-08-10"]);
    const result = planTrip(prior, "2026-08-05", "2026-08-20");
    expect(result.compliant).toBe(true);
    expect(result.daysUsedOnExit).toBe(20); // 1–20 Aug, days counted once
  });

  it("rejects a planned trip with entry after exit", () => {
    expect(() => planTrip([], "2026-08-10", "2026-08-01")).toThrow(InvalidTripError);
  });
});

describe("maxStay", () => {
  it("allows the full 90 days with no history", () => {
    const result = maxStay([], "2026-08-01");
    expect(result.maxDays).toBe(90);
    expect(result.lastAllowedDay).toBe("2026-10-29");
  });

  it("returns 0 days / null exit when entry itself is not compliant", () => {
    const prior = trips(["2024-01-01", "2024-03-30"]);
    const result = maxStay(prior, "2024-04-15");
    expect(result.maxDays).toBe(0);
    expect(result.lastAllowedDay).toBeNull();
  });

  it("accounts for already-planned future trips after the entry date", () => {
    const future = trips(["2026-09-01", "2026-10-10"]); // 40 days already planned
    const result = maxStay(future, "2026-08-01");
    // Stay from 1 Aug: by 10 Oct the window holds the whole continuous stay +
    // the planned trip merged into it; continuous presence caps at 90 total in window.
    expect(result.maxDays).toBeLessThanOrEqual(90);
    expect(result.maxDays).toBeGreaterThan(0);
  });
});

describe("checkTimeline", () => {
  it("accepts compliant trip sets", () => {
    const t = trips(["2026-01-01", "2026-03-31"]); // 90 days
    expect(checkTimeline(t)).toEqual({ compliant: true, firstViolationDay: null });
  });

  it("catches two individually-fine trips that break the rule together", () => {
    // 90 days + 5 more inside the same window: each trip alone is ≤ 90.
    const t = trips(["2026-01-01", "2026-03-31"], ["2026-04-10", "2026-04-14"]);
    const result = checkTimeline(t);
    expect(result.compliant).toBe(false);
    expect(result.firstViolationDay).toBe("2026-04-10");
  });

  it("is order-independent and merges duplicates", () => {
    const ordered = trips(["2026-01-01", "2026-01-10"], ["2026-03-01", "2026-03-20"]);
    const shuffled = trips(
      ["2026-03-01", "2026-03-20"],
      ["2026-01-01", "2026-01-10"],
      ["2026-01-01", "2026-01-10"], // duplicate must count once
    );
    expect(status(ordered, "2026-03-20")).toEqual(status(shuffled, "2026-03-20"));
    expect(status(shuffled, "2026-03-20").daysUsed).toBe(30);
  });

  it("handles an empty trip list", () => {
    expect(checkTimeline([]).compliant).toBe(true);
  });
});

describe("nextEntry", () => {
  it("returns `from` when the stay already fits", () => {
    const result = nextEntry([], 90, "2026-07-12");
    expect(result.earliestEntry).toBe("2026-07-12");
    expect(result.lastAllowedDay).toBe("2026-10-09");
  });

  it("after a full 90-day stay, a new 90-day stay needs 90 days of absence", () => {
    const t = trips(["2024-01-01", "2024-03-30"]);
    const result = nextEntry(t, 90, "2024-03-31");
    expect(result.earliestEntry).toBe("2024-06-29");
  });

  it("shorter desired stays can start earlier than longer ones", () => {
    const t = trips(["2024-01-01", "2024-03-01"]); // 61 days
    const short = nextEntry(t, 10, "2024-03-02");
    const long = nextEntry(t, 60, "2024-03-02");
    expect(short.earliestEntry <= long.earliestEntry).toBe(true);
  });

  it("rejects out-of-range desired stays", () => {
    expect(() => nextEntry([], 0, "2026-07-12")).toThrow(EngineError);
    expect(() => nextEntry([], 91, "2026-07-12")).toThrow(EngineError);
    expect(() => nextEntry([], 1.5, "2026-07-12")).toThrow(EngineError);
  });
});
