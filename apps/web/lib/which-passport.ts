import type { StayPolicy } from "@odyssway/engine";
import type { EntryBasis, TripCheckResult } from "./trip-check";

/**
 * "Which passport should I use?" for dual citizens (GROWTH_AND_ROADMAP.md §2):
 * the same destination resolved for two passports, side by side. It only says
 * one has fewer requirements where the verified rows rank clearly (no visa vs a
 * visa; a longer stay under the same kind of rule). Anything else is "compare
 * the details" — never a guess, and never advice on which to use.
 */
const BASIS_RANK: Record<EntryBasis, number> = {
  citizen: 0,
  free_movement: 1,
  visa_free: 2,
  eta_required: 3,
  visa_on_arrival: 4,
  visa_required: 5,
  not_covered: 6,
};

export type Fewer = "a" | "b" | "same" | "compare";

export interface PassportComparison {
  a: TripCheckResult;
  b: TripCheckResult;
  fewer: Fewer;
  /** What decided `fewer`: the entry requirement, or the stay under the same kind of rule. */
  reason?: "requirement" | "stay";
}

/** Comparable stay length: only when both rows use the same kind of rule (and the same window). */
function stayKey(p: StayPolicy | null): string | null {
  if (!p || p.kind === "visa_required") return null;
  return p.kind === "rolling_window" ? `rolling:${p.windowDays}` : p.kind;
}

export function comparePassports(a: TripCheckResult, b: TripCheckResult): PassportComparison {
  if (a.basis === "not_covered" || b.basis === "not_covered") return { a, b, fewer: "compare" };
  const ra = BASIS_RANK[a.basis];
  const rb = BASIS_RANK[b.basis];
  if (ra !== rb) return { a, b, fewer: ra < rb ? "a" : "b", reason: "requirement" };
  const ka = stayKey(a.stayPolicy);
  const kb = stayKey(b.stayPolicy);
  if (ka && ka === kb && a.stayPolicy && b.stayPolicy && "maxDays" in a.stayPolicy && "maxDays" in b.stayPolicy) {
    if (a.stayPolicy.maxDays !== b.stayPolicy.maxDays) {
      return { a, b, fewer: a.stayPolicy.maxDays > b.stayPolicy.maxDays ? "a" : "b", reason: "stay" };
    }
    return { a, b, fewer: "same" };
  }
  return { a, b, fewer: ka === null && kb === null ? "same" : "compare" };
}
