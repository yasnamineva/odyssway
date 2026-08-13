import type { MaxStayResult, StatusResult } from "@odyssway/engine";
import { describe, expect, it } from "vitest";
import { buildReportLines } from "./report-lines";

/** Records key + values so assertions can check exactly what was requested, without depending on next-intl's ICU engine. */
function fakeT(key: string, values?: Record<string, string | number>): string {
  return values ? `${key}(${JSON.stringify(values)})` : key;
}

const status: StatusResult = {
  onDate: "2026-08-10",
  windowStart: "2026-02-11",
  daysUsed: 30,
  daysRemaining: 60,
  overstayDays: 0,
  presentOnDate: true,
  nextSafeEntry: "2026-08-10",
  exclusions: [],
};

const maxStay: MaxStayResult = {
  entry: "2026-08-10",
  maxDays: 60,
  lastAllowedDay: "2026-10-08",
};

const formatDate = (iso: string) => iso;

describe("buildReportLines", () => {
  it("includes the title, each stay, the status sentence, and the disclaimer in order", () => {
    const lines = buildReportLines(
      fakeT,
      formatDate,
      "2026-08-10",
      [{ entry: "2026-07-01", exit: "2026-07-10", country: "FR", permit: false }],
      status,
      maxStay,
    );
    expect(lines[0]).toContain("report.title");
    expect(lines).toContain("report.staysHeading");
    expect(lines.some((l) => l.startsWith("report.stayLine"))).toBe(true);
    expect(lines.some((l) => l.startsWith("statusSentence"))).toBe(true);
    expect(lines.some((l) => l.startsWith("maxStaySentence"))).toBe(true);
    expect(lines.at(-1)).toBe("report.disclaimer");
  });

  it("marks residence-permit stays with the permit suffix", () => {
    const lines = buildReportLines(
      fakeT,
      formatDate,
      "2026-08-10",
      [{ entry: "2026-07-01", exit: "2026-07-10", country: "FR", permit: true }],
      status,
      maxStay,
    );
    expect(lines.some((l) => l.includes("report.permitSuffix"))).toBe(true);
  });

  it("omits the maxStaySentence line when there is no compliant stay available", () => {
    const blocked: MaxStayResult = { entry: "2026-08-10", maxDays: 0, lastAllowedDay: null };
    const lines = buildReportLines(fakeT, formatDate, "2026-08-10", [], status, blocked);
    expect(lines.some((l) => l.startsWith("maxStaySentence"))).toBe(false);
  });

  it("uses the unspecified-country label when a stay has no country set", () => {
    const lines = buildReportLines(
      fakeT,
      formatDate,
      "2026-08-10",
      [{ entry: "2026-07-01", exit: "2026-07-10", country: "", permit: false }],
      status,
      maxStay,
    );
    const stayLine = lines.find((l) => l.startsWith("report.stayLine"));
    expect(stayLine).toContain("countryUnspecified");
  });
});
