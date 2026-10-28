import { describe, expect, it } from "vitest";
import { buildIcs, buildIcsCalendar } from "./ics";

describe("buildIcs", () => {
  it("produces a valid single-event all-day VCALENDAR", () => {
    const ics = buildIcs({
      id: "test-event",
      title: "Passport renewal reminder",
      description: "Your passport expires soon.",
      date: "2026-12-01",
    });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("UID:test-event@odyssway");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261201");
    // DTEND is exclusive for all-day events — the day after DTSTART.
    expect(ics).toContain("DTEND;VALUE=DATE:20261202");
    expect(ics).toContain("SUMMARY:Passport renewal reminder");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("escapes commas and semicolons in text fields", () => {
    const ics = buildIcs({
      id: "escape-test",
      title: "Renew; check dates, twice",
      description: "line one",
      date: "2026-06-15",
    });
    expect(ics).toContain("SUMMARY:Renew\\; check dates\\, twice");
  });

  it("rolls DTEND correctly across a month boundary", () => {
    const ics = buildIcs({
      id: "month-boundary",
      title: "x",
      description: "x",
      date: "2026-01-31",
    });
    expect(ics).toContain("DTSTART;VALUE=DATE:20260131");
    expect(ics).toContain("DTEND;VALUE=DATE:20260201");
  });
});

describe("buildIcsCalendar", () => {
  it("puts every event in one calendar", () => {
    const ics = buildIcsCalendar([
      { id: "a", title: "One", description: "x", date: "2026-11-01" },
      { id: "b", title: "Two", description: "y", date: "2026-12-31" },
    ]);
    expect(ics.match(/BEGIN:VCALENDAR/g)).toHaveLength(1);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261231\r\nDTEND;VALUE=DATE:20270101");
  });
});
