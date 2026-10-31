import { describe, expect, it } from "vitest";
import { checkCash, type EuroRates } from "../src/cash-threshold";

const rates: EuroRates = { date: "2026-10-30", rates: { USD: 1.1172, GBP: 0.8338, JPY: 175.68 } };

describe("checkCash", () => {
  it("compares in the threshold's own currency without a rate", () => {
    const eu = { amount: 10000, currency: "EUR", comparison: "at_least" as const };
    expect(checkCash(eu, { amount: 10000, currency: "EUR" }, null).status).toBe("declare");
    const us = { amount: 10000, currency: "USD", comparison: "over" as const };
    expect(checkCash(us, { amount: 10000, currency: "USD" }, null).status).toBe("below");
    expect(checkCash(us, { amount: 10000.01, currency: "USD" }, null).status).toBe("declare");
  });

  it("converts through the euro and flags amounts just under the threshold", () => {
    const us = { amount: 10000, currency: "USD", comparison: "over" as const };
    // 9,000 EUR ≈ 10,055 USD: over.
    const r = checkCash(us, { amount: 9000, currency: "EUR" }, rates);
    expect(r.status).toBe("declare");
    expect(r.converted).toBeCloseTo(10054.8, 0);
    // 8,700 EUR ≈ 9,720 USD: within 5% below, so "close".
    expect(checkCash(us, { amount: 8700, currency: "EUR" }, rates).status).toBe("close");
    // 5,000 GBP ≈ 6,699 USD: below.
    expect(checkCash(us, { amount: 5000, currency: "GBP" }, rates).status).toBe("below");
  });

  it("says unknown when a currency has no rate", () => {
    const qa = { amount: 50000, currency: "QAR", comparison: "over" as const };
    expect(checkCash(qa, { amount: 20000, currency: "EUR" }, rates).status).toBe("unknown");
    expect(checkCash(qa, { amount: 60000, currency: "QAR" }, rates).status).toBe("declare");
    expect(() => checkCash(qa, { amount: -1, currency: "QAR" }, rates)).toThrow(RangeError);
  });
});
