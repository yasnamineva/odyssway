import { describe, expect, it } from "vitest";
import { addDays, fromEpochDay, isValidISODate, toEpochDay } from "../src/date";
import { InvalidDateError } from "../src/errors";

describe("toEpochDay / fromEpochDay", () => {
  it("anchors at the Unix epoch", () => {
    expect(toEpochDay("1970-01-01")).toBe(0);
    expect(fromEpochDay(0)).toBe("1970-01-01");
  });

  it("round-trips arbitrary dates", () => {
    for (const iso of [
      "1969-12-31",
      "2000-02-29",
      "2023-12-18",
      "2024-02-29",
      "2024-06-14",
      "2026-07-12",
      "2100-01-01",
    ]) {
      expect(fromEpochDay(toEpochDay(iso))).toBe(iso);
    }
  });

  it("is timezone-free: consecutive days differ by exactly 1", () => {
    expect(toEpochDay("2024-03-31") - toEpochDay("2024-03-30")).toBe(1); // EU DST change
    expect(toEpochDay("2024-11-03") - toEpochDay("2024-11-02")).toBe(1); // US DST change
  });

  it("handles leap years", () => {
    expect(toEpochDay("2024-03-01") - toEpochDay("2024-02-28")).toBe(2);
    expect(toEpochDay("2023-03-01") - toEpochDay("2023-02-28")).toBe(1);
    expect(toEpochDay("2100-03-01") - toEpochDay("2100-02-28")).toBe(1); // century non-leap
  });

  it("rejects malformed input", () => {
    for (const bad of ["2024-1-01", "01/01/2024", "2024-01-01T00:00:00Z", "", "20240101"]) {
      expect(() => toEpochDay(bad)).toThrow(InvalidDateError);
    }
  });

  it("rejects nonexistent calendar dates", () => {
    for (const bad of ["2023-02-29", "2024-02-30", "2024-13-01", "2024-04-31", "2024-00-10"]) {
      expect(() => toEpochDay(bad)).toThrow(InvalidDateError);
    }
  });

  it("rejects non-integer epoch days", () => {
    expect(() => fromEpochDay(1.5)).toThrow(InvalidDateError);
  });
});

describe("addDays", () => {
  it("crosses month, year, and leap boundaries", () => {
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2024-02-29", 1)).toBe("2024-03-01");
    expect(addDays("2023-12-31", 1)).toBe("2024-01-01");
    expect(addDays("2024-01-01", -1)).toBe("2023-12-31");
    expect(addDays("2024-06-14", -179)).toBe("2023-12-18"); // KOM-1.1 window start
  });
});

describe("isValidISODate", () => {
  it("accepts real dates and rejects the rest", () => {
    expect(isValidISODate("2024-02-29")).toBe(true);
    expect(isValidISODate("2023-02-29")).toBe(false);
    expect(isValidISODate("not-a-date")).toBe(false);
  });
});
