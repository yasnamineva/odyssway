/** Tool actions we count anonymously (/privacy, section 3). Nothing else is accepted. */
export const COUNT_EVENTS = [
  "readiness_check",
  "readiness_ics",
  "readiness_saved",
  "tripcheck_run",
  "calculator_ics",
] as const;

export type CountEvent = (typeof COUNT_EVENTS)[number];

/** Fire-and-forget; never throws, never blocks the UI. */
export function count(event: CountEvent): void {
  try {
    const body = JSON.stringify({ event });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/count", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/count", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
    }
  } catch {
    // ignore
  }
}
