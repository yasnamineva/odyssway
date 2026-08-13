import { toEpochDay, type MaxStayResult, type StatusResult } from "@odyssway/engine";
import { countryName } from "./countries";

type Translate = (key: string, values?: Record<string, string | number>) => string;

export interface ReportRow {
  entry: string;
  exit: string;
  country: string;
  permit: boolean;
}

/** Shared by the clipboard "copy report" action and the PDF export — one source of truth for the wording. */
export function buildReportLines(
  t: Translate,
  formatDate: (iso: string) => string,
  todayISO: string,
  rows: ReportRow[],
  status: StatusResult,
  maxStay: MaxStayResult,
): string[] {
  return [
    t("report.title", { date: formatDate(todayISO) }),
    "",
    t("report.staysHeading"),
    ...rows.map((r) => {
      const days = toEpochDay(r.exit) - toEpochDay(r.entry) + 1;
      const base = t("report.stayLine", {
        entry: formatDate(r.entry),
        exit: formatDate(r.exit),
        days,
        country: r.country ? countryName(r.country) : t("countryUnspecified"),
      });
      return r.permit ? `${base} ${t("report.permitSuffix")}` : base;
    }),
    "",
    t("statusSentence", {
      start: formatDate(status.windowStart),
      end: formatDate(status.onDate),
      used: status.daysUsed,
      remaining: status.daysRemaining,
    }),
    ...(maxStay.maxDays > 0 && maxStay.lastAllowedDay
      ? [
          t("maxStaySentence", {
            entry: formatDate(maxStay.entry),
            exit: formatDate(maxStay.lastAllowedDay),
            days: maxStay.maxDays,
          }),
        ]
      : []),
    t("nextSafeEntry", { date: formatDate(status.nextSafeEntry) }),
    "",
    t("report.disclaimer"),
  ];
}
