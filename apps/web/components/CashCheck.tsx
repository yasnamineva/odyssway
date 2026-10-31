"use client";

import { checkCash, type CashThreshold, type EuroRates } from "@odyssway/engine";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

const fmt = (n: number, currency: string) =>
  `${currency} ${n.toLocaleString("en", { maximumFractionDigits: n >= 100 ? 0 : 2 })}`;

/**
 * "Do I need to declare this cash?" against a row's declaration threshold
 * (cash-threshold.ts), converting with the ECB reference rates of the build day.
 * The amount stays in this component's state.
 */
export default function CashCheck({ threshold, rates }: { threshold: CashThreshold; rates: EuroRates | null }) {
  const t = useTranslations("cashCheck");
  const id = useId();
  const currencies = [
    ...new Set([threshold.currency, "EUR", "USD", "GBP", ...Object.keys(rates?.rates ?? {}).sort()]),
  ].filter((c) => c === threshold.currency || c === "EUR" || rates?.rates[c] !== undefined);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(threshold.currency);
  const n = Number(amount.trim().replace(/[ ,]/g, ""));
  const valid = amount.trim() !== "" && Number.isFinite(n) && n >= 0;
  const result = valid ? checkCash(threshold, { amount: n, currency }, rates) : null;
  const limit = fmt(threshold.amount, threshold.currency);
  const converted = result?.converted !== undefined ? fmt(result.converted, threshold.currency) : "";

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4" data-testid="cash-check">
      <h3 className="text-sm font-semibold text-slate-900">{t("title")}</h3>
      <p className="mt-1 text-xs text-slate-600">
        {t(threshold.comparison === "over" ? "ruleOver" : "ruleAtLeast", { limit })}
        {threshold.foreignOnly ? ` ${t("foreignOnly")}` : ""}
      </p>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
        <label htmlFor={`${id}-amount`} className="block text-xs font-medium text-slate-700">
          {t("amountLabel")}
          <input
            id={`${id}-amount`}
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
            data-testid="cash-amount"
          />
        </label>
        <label htmlFor={`${id}-currency`} className="block text-xs font-medium text-slate-700">
          {t("currencyLabel")}
          <select
            id={`${id}-currency`}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
            data-testid="cash-currency"
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3 text-sm" aria-live="polite" data-testid="cash-result">
        {amount.trim() !== "" && !valid && <p className="text-amber-800">{t("invalid")}</p>}
        {result && (
          <p
            className={
              result.status === "declare"
                ? "font-medium text-red-800"
                : result.status === "below"
                  ? "font-medium text-emerald-800"
                  : "font-medium text-amber-800"
            }
          >
            {t(`status.${result.status}`, { converted, limit, currency })}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-500">
          {rates && currency !== threshold.currency ? `${t("rateNote", { date: rates.date })} ` : ""}
          {t("disclaimer")}
        </p>
      </div>
    </div>
  );
}
