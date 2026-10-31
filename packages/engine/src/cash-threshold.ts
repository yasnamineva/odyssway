/**
 * A cash declaration threshold, restating a customs row's own `limits` wording
 * (validate-data checks the amount, currency and comparison word). `over`: declare
 * only above the amount ("more than USD 10,000"); `at_least`: declare at the amount
 * itself ("EUR 10,000 or more").
 */
export interface CashThreshold {
  amount: number;
  /** ISO 4217 code. */
  currency: string;
  comparison: "over" | "at_least";
  /** True when the threshold covers foreign currency only; local-currency rules stay in the wording. */
  foreignOnly?: boolean;
}

/** Units of each currency per 1 EUR, e.g. from the ECB's daily reference rates. */
export interface EuroRates {
  date: string;
  rates: Record<string, number>;
}

export interface CashCheckResult {
  /** "declare": at or over the threshold; "close": within 5% below it; "below"; "unknown": no rate for a currency. */
  status: "declare" | "close" | "below" | "unknown";
  /** The carried amount in the threshold's currency, when it could be converted. */
  converted?: number;
}

/** A converted amount below the threshold but within this share of it counts as "close". */
export const CLOSE_MARGIN = 0.05;

function perEuro(currency: string, rates: EuroRates): number | undefined {
  return currency === "EUR" ? 1 : rates.rates[currency];
}

export function checkCash(
  threshold: CashThreshold,
  carried: { amount: number; currency: string },
  rates: EuroRates | null,
): CashCheckResult {
  if (!Number.isFinite(carried.amount) || carried.amount < 0) {
    throw new RangeError(`amount must be a non-negative number, got ${carried.amount}.`);
  }
  let converted: number | undefined;
  if (carried.currency === threshold.currency) converted = carried.amount;
  else if (rates) {
    const from = perEuro(carried.currency, rates);
    const to = perEuro(threshold.currency, rates);
    if (from && to) converted = (carried.amount / from) * to;
  }
  if (converted === undefined) return { status: "unknown" };
  const over = threshold.comparison === "over" ? converted > threshold.amount : converted >= threshold.amount;
  if (over) return { status: "declare", converted };
  // Only a converted amount can be "close": customs may use another exchange rate.
  if (carried.currency !== threshold.currency && converted >= threshold.amount * (1 - CLOSE_MARGIN)) {
    return { status: "close", converted };
  }
  return { status: "below", converted };
}
