"use client";

import {
  evaluateAllowance,
  PRODUCT_UNIT,
  productsOf,
  type Allowance,
  type AllowanceProduct,
  type Quantities,
} from "@odyssway/engine";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

const ORDER: AllowanceProduct[] = [
  "cigarettes",
  "cigarillos",
  "cigars",
  "heated_tobacco_sticks",
  "smoking_tobacco",
  "spirits",
  "intermediate",
  "still_wine",
  "beer",
];

/**
 * "How much am I carrying?" against a customs row's duty-free allowance
 * (allowance.ts). Quantities stay in this component's state. Checks amounts
 * only: age, value and frequency conditions stay in the row's own wording,
 * and mixing alternatives the source doesn't say combine is reported as
 * unclear rather than guessed.
 */
export default function AllowanceCheck({ allowance }: { allowance: Allowance }) {
  const t = useTranslations("allowanceCheck");
  const id = useId();
  const products = ORDER.filter((p) => productsOf(allowance).includes(p));
  const [values, setValues] = useState<Partial<Record<AllowanceProduct, string>>>({});

  const quantities: Quantities = {};
  let invalid = false;
  for (const p of products) {
    const raw = (values[p] ?? "").trim().replace(",", ".");
    if (raw === "") continue;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) invalid = true;
    else quantities[p] = n;
  }
  const result = invalid ? null : evaluateAllowance(allowance, quantities);

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4" data-testid="allowance-check">
      <h3 className="text-sm font-semibold text-slate-900">{t("title")}</h3>
      <p className="mt-1 text-xs text-slate-600">{t("intro")}</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {products.map((p) => (
          <label key={p} htmlFor={`${id}-${p}`} className="block text-xs font-medium text-slate-700">
            {t(`product.${p}`)} <span className="font-normal text-slate-500">({t(`unit.${PRODUCT_UNIT[p]}`)})</span>
            <input
              id={`${id}-${p}`}
              type="text"
              inputMode="decimal"
              value={values[p] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [p]: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
              data-product={p}
            />
          </label>
        ))}
      </div>
      {products.some((p) => PRODUCT_UNIT[p] === "l") && <p className="mt-2 text-xs text-slate-500">{t("bottleHint")}</p>}
      <div className="mt-3 text-sm" aria-live="polite" data-testid="allowance-result">
        {invalid && <p className="text-amber-800">{t("invalid")}</p>}
        {result && result.status !== "empty" && (
          <>
            <p
              className={
                result.status === "within"
                  ? "font-medium text-emerald-800"
                  : result.status === "over"
                    ? "font-medium text-red-800"
                    : "font-medium text-amber-800"
              }
            >
              {t(`status.${result.status}`)}
            </p>
            {result.uncovered.length > 0 && (
              <p className="mt-1 text-slate-700">
                {t("uncovered", { products: result.uncovered.map((p) => t(`product.${p}`)).join(", ") })}
              </p>
            )}
            {result.groups
              .filter((g) => g.used !== undefined && allowance.groups.length > 1)
              .map((g) => {
                const group = allowance.groups[g.index]!;
                const names = (group.kind === "total" ? group.products : group.options.flatMap((o) => o.products))
                  .filter((p, i, all) => all.indexOf(p) === i)
                  .map((p) => t(`product.${p}`))
                  .join(", ");
                return (
                  <p key={g.index} className="mt-1 text-slate-700">
                    {t("groupUsed", { names, percent: Math.round((g.used ?? 0) * 100) })}
                  </p>
                );
              })}
          </>
        )}
        <p className="mt-2 text-xs text-slate-500">{t("disclaimer")}</p>
      </div>
    </div>
  );
}
