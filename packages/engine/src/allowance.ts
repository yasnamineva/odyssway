/**
 * A duty-free allowance for alcohol or tobacco, restating a customs row's own
 * `limits` wording (validate-data checks every amount against it). Set only
 * when the wording states amounts per product; otherwise callers quote the prose.
 *
 * Groups are separate allowances that add up (the EU's spirits group *plus*
 * still wine *plus* beer). Inside a group:
 * - `one_of`: the source lists alternatives ("200 cigarettes, or 50 cigars")
 *   without saying they can be combined;
 * - `proportional`: the source says they can be combined pro rata
 *   ("proportional combinations", "splittable across types");
 * - `total`: one amount shared by every listed product ("250 g in total").
 */
export type AllowanceProduct =
  | "cigarettes"
  | "cigarillos"
  | "cigars"
  | "smoking_tobacco"
  | "heated_tobacco_sticks"
  | "spirits"
  | "intermediate"
  | "still_wine"
  | "beer";

/** Pieces for cigarettes, cigarillos, cigars and sticks; grams for tobacco; litres for drinks. */
export type AllowanceUnit = "pieces" | "g" | "l";

export const PRODUCT_UNIT: Record<AllowanceProduct, AllowanceUnit> = {
  cigarettes: "pieces",
  cigarillos: "pieces",
  cigars: "pieces",
  smoking_tobacco: "g",
  heated_tobacco_sticks: "pieces",
  spirits: "l",
  intermediate: "l",
  still_wine: "l",
  beer: "l",
};

export interface AllowanceOption {
  /** Products counted against this amount together (e.g. "wine" = still + intermediate). */
  products: AllowanceProduct[];
  amount: number;
}

export type AllowanceGroup =
  | { kind: "one_of" | "proportional"; options: AllowanceOption[] }
  | { kind: "total"; products: AllowanceProduct[]; amount: number };

export interface Allowance {
  groups: AllowanceGroup[];
}

export type Quantities = Partial<Record<AllowanceProduct, number>>;

export type GroupStatus = "within" | "over" | "unclear";

export interface GroupResult {
  index: number;
  status: GroupStatus;
  /** Share of the allowance used, where it can be computed (1 = all of it). */
  used?: number;
}

export interface AllowanceResult {
  /** "within": every product is inside a stated allowance; "over": at least one group is exceeded;
   * "unclear": alternatives were mixed and the source doesn't say they combine;
   * "not_covered": a product has no allowance in this row. */
  status: "within" | "over" | "unclear" | "not_covered" | "empty";
  groups: GroupResult[];
  /** Products entered that no group covers: the row states no duty-free amount for them. */
  uncovered: AllowanceProduct[];
}

function sumOf(products: AllowanceProduct[], q: Quantities): number {
  return products.reduce((n, p) => n + (q[p] ?? 0), 0);
}

/** Floating-point litres: treat a hair over as within (1.14 L entered as 1.14). */
const EPS = 1e-9;

function evaluateGroup(group: AllowanceGroup, q: Quantities, index: number): GroupResult | null {
  if (group.kind === "total") {
    const n = sumOf(group.products, q);
    if (n === 0) return null;
    const used = n / group.amount;
    return { index, status: used <= 1 + EPS ? "within" : "over", used };
  }
  const shares = group.options.map((o) => sumOf(o.products, q) / o.amount);
  const usedOptions = shares.filter((s) => s > 0);
  if (usedOptions.length === 0) return null;
  if (group.kind === "proportional") {
    const used = usedOptions.reduce((a, b) => a + b, 0);
    return { index, status: used <= 1 + EPS ? "within" : "over", used };
  }
  if (usedOptions.length === 1) {
    const used = usedOptions[0]!;
    return { index, status: used <= 1 + EPS ? "within" : "over", used };
  }
  // Alternatives mixed: over if even one alone is exceeded; otherwise the source doesn't say.
  if (usedOptions.some((s) => s > 1 + EPS)) return { index, status: "over" };
  return { index, status: "unclear" };
}

export function productsOf(allowance: Allowance): AllowanceProduct[] {
  const seen = new Set<AllowanceProduct>();
  for (const g of allowance.groups) {
    for (const p of g.kind === "total" ? g.products : g.options.flatMap((o) => o.products)) seen.add(p);
  }
  return [...seen];
}

/**
 * Checks what a traveller carries against the allowance. A product listed in
 * more than one group (rare) is counted in each, which can only make the
 * answer stricter, never looser.
 */
export function evaluateAllowance(allowance: Allowance, quantities: Quantities): AllowanceResult {
  for (const [p, n] of Object.entries(quantities)) {
    if (n !== undefined && (!Number.isFinite(n) || n < 0)) {
      throw new RangeError(`quantity for ${p} must be a non-negative number, got ${n}.`);
    }
  }
  const covered = new Set(productsOf(allowance));
  const entered = (Object.keys(quantities) as AllowanceProduct[]).filter((p) => (quantities[p] ?? 0) > 0);
  if (entered.length === 0) return { status: "empty", groups: [], uncovered: [] };
  const uncovered = entered.filter((p) => !covered.has(p));
  const groups = allowance.groups
    .map((g, i) => evaluateGroup(g, quantities, i))
    .filter((r): r is GroupResult => r !== null);
  const status = groups.some((g) => g.status === "over")
    ? "over"
    : uncovered.length > 0
      ? "not_covered"
      : groups.some((g) => g.status === "unclear")
        ? "unclear"
        : "within";
  return { status, groups, uncovered };
}
