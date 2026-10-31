import type { EuroRates } from "@odyssway/engine";

export const ECB_RATES_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";

/** Parses the ECB daily reference-rate XML (units per 1 EUR). */
export function parseEcbRates(xml: string): EuroRates | null {
  const date = xml.match(/time=['"](\d{4}-\d{2}-\d{2})['"]/)?.[1];
  const rates: Record<string, number> = {};
  for (const m of xml.matchAll(/currency=['"]([A-Z]{3})['"]\s+rate=['"]([\d.]+)['"]/g)) rates[m[1]!] = Number(m[2]);
  return date && Object.keys(rates).length > 0 ? { date, rates } : null;
}

/**
 * The ECB's reference rates, fetched when the page is built (at most once a day).
 * Null when the ECB can't be reached: the cash check then only compares amounts
 * already in the threshold's currency.
 */
export async function getEuroRates(): Promise<EuroRates | null> {
  try {
    const res = await fetch(ECB_RATES_URL, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    return parseEcbRates(await res.text());
  } catch {
    return null;
  }
}
