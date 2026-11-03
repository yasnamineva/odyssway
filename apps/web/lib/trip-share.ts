/**
 * Shareable Trip Check links (GROWTH_AND_ROADMAP.md §2). The trip lives in the
 * URL fragment, which browsers never send to a server, so a shared result's
 * medicines and route stay out of request logs (same approach as lib/share.ts).
 *
 * Format: #n=US&d=JP&l=KR,TH&s=QA,,AE&i=adderall,melatonin
 * n = passport, d = first destination, l = further stops, s = the stopover on the
 * way to each stop, in the same order (first destination, then each further stop;
 * empty for a direct flight; older links carry one code, for the first destination),
 * i = items (each URI-encoded, so a comma inside an item becomes %2C; joined with ,).
 */
export interface TripShareState {
  nationality: string;
  destination: string;
  legs: string[];
  /** Stopover on the way to the first destination ("" for none). */
  transit: string;
  /** Stopover on the way to each of `legs`, same order ("" for none). */
  legTransits: string[];
  items: string[];
}

const CODE = /^[A-Z]{2}$|^SCHENGEN$/;

export function encodeTripShare(s: TripShareState): string {
  const parts = [`n=${s.nationality}`, `d=${s.destination}`];
  const kept = s.legs.map((code, i) => ({ code, via: s.legTransits[i] ?? "" })).filter((l) => l.code);
  if (kept.length) parts.push(`l=${kept.map((l) => l.code).join(",")}`);
  const vias = [s.transit, ...kept.map((l) => l.via)];
  while (vias.length && !vias[vias.length - 1]) vias.pop();
  if (vias.length) parts.push(`s=${vias.join(",")}`);
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
  const vias = (params.get("s") ?? "").split(",").map((c) => (CODE.test(c) && c !== "SCHENGEN" ? c : ""));
  const transit = vias[0] ?? "";
  const legTransits = legs.map((_, i) => vias[i + 1] ?? "");
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
  return { nationality, destination, legs, transit, legTransits, items };
}
