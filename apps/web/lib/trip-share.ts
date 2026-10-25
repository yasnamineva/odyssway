/**
 * Shareable Trip Check links (GROWTH_AND_ROADMAP.md §2). The trip lives in the
 * URL fragment, which browsers never send to a server, so a shared result's
 * medicines and route stay out of request logs (same approach as lib/share.ts).
 *
 * Format: #n=US&d=JP&l=KR,TH&s=QA&i=adderall,melatonin
 * n = passport, d = first destination, l = further stops, s = stopover,
 * i = items (each URI-encoded, so a comma inside an item becomes %2C; joined with ,).
 */
export interface TripShareState {
  nationality: string;
  destination: string;
  legs: string[];
  transit: string;
  items: string[];
}

const CODE = /^[A-Z]{2}$|^SCHENGEN$/;

export function encodeTripShare(s: TripShareState): string {
  const parts = [`n=${s.nationality}`, `d=${s.destination}`];
  const legs = s.legs.filter(Boolean);
  if (legs.length) parts.push(`l=${legs.join(",")}`);
  if (s.transit) parts.push(`s=${s.transit}`);
  if (s.items.length) parts.push(`i=${s.items.map((i) => encodeURIComponent(i)).join(",")}`);
  return parts.join("&");
}

/** Parses a fragment (with or without the leading #); null unless passport and destination are valid codes. */
export function decodeTripShare(hash: string): TripShareState | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const nationality = params.get("n") ?? "";
  const destination = params.get("d") ?? "";
  if (!CODE.test(nationality) || nationality === "SCHENGEN" || !CODE.test(destination)) return null;
  const legs = (params.get("l") ?? "").split(",").filter((c) => CODE.test(c)).slice(0, 4);
  const transitRaw = params.get("s") ?? "";
  const transit = CODE.test(transitRaw) && transitRaw !== "SCHENGEN" ? transitRaw : "";
  // Read the raw value: URLSearchParams would decode %2C before we split on ",".
  const raw = /(?:^|&)i=([^&]*)/.exec(hash.replace(/^#/, ""))?.[1] ?? "";
  const items = raw
    .split(",")
    .map((i) => {
      try {
        return decodeURIComponent(i).trim();
      } catch {
        return "";
      }
    })
    .filter(Boolean)
    .slice(0, 20);
  return { nationality, destination, legs, transit, items };
}
