import type { Trip } from "../src/types";

/** Schengen short-stay trip with unspecified country (v0 UI contract). */
export function trip(entry: string, exit: string): Trip {
  return { entry, exit, country: "ZZ", basis: { kind: "visa_free" } };
}

export function trips(...pairs: Array<[string, string]>): Trip[] {
  return pairs.map(([entry, exit]) => trip(entry, exit));
}
