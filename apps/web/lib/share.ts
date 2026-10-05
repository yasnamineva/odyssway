import { isValidISODate } from "@odyssway/engine";

/**
 * URL-encoded calculator state (AGENTS.md §6.5): dates live in the link,
 * nothing is stored server-side.
 *
 * Format: #t=<trip>~<trip>&d=<refDate>&pe=<planEntry>&px=<planExit>
 * The state goes in the fragment (after #), which browsers never send to a
 * server, so shared dates stay out of request logs and Referer headers. Links
 * made before 2026-10 used the query string (?t=…); decodeShareState still
 * reads those, and the calculator rewrites them to the fragment form on load.
 * where <trip> = entry.exit | entry.exit.CC | entry.exit.CC.p
 * ("p" = residence permit / D visa issued by that country).
 */
export interface ShareTrip {
  entry: string;
  exit: string;
  /** ISO country code, or "" = Schengen Area, country unspecified. */
  country: string;
  permit: boolean;
}

export interface ShareState {
  trips: ShareTrip[];
  refDate: string;
  planEntry: string;
  planExit: string;
}

export interface DecodedShareState {
  trips: ShareTrip[] | null;
  refDate: string | null;
  planEntry: string | null;
  planExit: string | null;
}

export function encodeShareState(state: ShareState): string {
  const params = new URLSearchParams();
  const t = state.trips
    .map((trip) => {
      if (!trip.country) return `${trip.entry}.${trip.exit}`;
      const base = `${trip.entry}.${trip.exit}.${trip.country}`;
      return trip.permit ? `${base}.p` : base;
    })
    .join("~");
  if (t) params.set("t", t);
  params.set("d", state.refDate);
  if (state.planEntry) params.set("pe", state.planEntry);
  if (state.planExit) params.set("px", state.planExit);
  return params.toString();
}

export function decodeShareState(
  search: string,
  knownCountryCodes: ReadonlySet<string>,
): DecodedShareState {
  // Accepts "#…", "?…" or a bare query string.
  const params = new URLSearchParams(search.replace(/^[#?]/, ""));

  const trips =
    params
      .get("t")
      ?.split("~")
      .map((token) => token.split("."))
      .filter(
        (p) =>
          p.length >= 2 &&
          p.length <= 4 &&
          isValidISODate(p[0]!) &&
          isValidISODate(p[1]!),
      )
      .map((p): ShareTrip => {
        const country =
          p[2] !== undefined && knownCountryCodes.has(p[2]) ? p[2] : "";
        return {
          entry: p[0]!,
          exit: p[1]!,
          country,
          permit: country !== "" && p[3] === "p",
        };
      }) ?? null;

  const date = (key: string): string | null => {
    const value = params.get(key);
    return value !== null && isValidISODate(value) ? value : null;
  };

  return {
    trips,
    refDate: date("d"),
    planEntry: date("pe"),
    planExit: date("px"),
  };
}
