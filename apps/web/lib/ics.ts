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

function vevent(event: IcsEvent, stamp: string): string[] {
  const start = event.date.replace(/-/g, "");
  // DTEND is exclusive for all-day VEVENTs, so it's the day after.
  const end = addDays(event.date, 1).replace(/-/g, "");
  return [
    "BEGIN:VEVENT",
    `UID:${event.id}@odyssway`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escape(event.title)}`,
    `DESCRIPTION:${escape(event.description)}`,
    "END:VEVENT",
  ];
}

/** An .ics file with one all-day event per entry — no external dependency needed. */
export function buildIcsCalendar(events: IcsEvent[]): string {
  const stamp = `${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Odyssway//Trip Reminders//EN",
    ...events.flatMap((e) => vevent(e, stamp)),
    "END:VCALENDAR",
  ].join("\r\n");
}

/** A minimal, single-event .ics file. */
export function buildIcs(event: IcsEvent): string {
  return buildIcsCalendar([event]);
}

function download(filename: string, ics: string): void {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Triggers a client-side download of the event as a .ics file — no server round-trip. */
export function downloadIcs(event: IcsEvent): void {
  download(`${event.id}.ics`, buildIcs(event));
}

/** Downloads several events as one .ics file. */
export function downloadIcsCalendar(filename: string, events: IcsEvent[]): void {
  download(filename, buildIcsCalendar(events));
}
