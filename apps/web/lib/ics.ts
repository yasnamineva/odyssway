import { addDays } from "@odyssway/engine";

export interface IcsEvent {
  /** Stable identifier, used as both the ICS UID and the downloaded filename. */
  id: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD) — rendered as an all-day event. */
  date: string;
}

const escape = (s: string) => s.replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

/** A minimal, single-event .ics file — all-day, no external dependency needed. */
export function buildIcs(event: IcsEvent): string {
  const start = event.date.replace(/-/g, "");
  // DTEND is exclusive for all-day VEVENTs, so it's the day after.
  const end = addDays(event.date, 1).replace(/-/g, "");
  const stamp = `${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Odyssway//Trip Reminders//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@odyssway`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escape(event.title)}`,
    `DESCRIPTION:${escape(event.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Triggers a client-side download of the event as a .ics file — no server round-trip. */
export function downloadIcs(event: IcsEvent): void {
  const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
