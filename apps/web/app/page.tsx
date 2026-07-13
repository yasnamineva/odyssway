import { getTranslations } from "next-intl/server";
import Calculator from "../components/Calculator";
import { countriesVerifiedAt } from "../lib/countries";

const MANUAL_URL =
  "https://ec.europa.eu/assets/home/visa-calculator/docs/short_stay_schengen_calculator_user_manual_en.pdf";

export default async function HomePage() {
  const t = await getTranslations();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t("home.h1")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("home.sub")}</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          {t("home.crossCheck")}
        </p>
      </section>

      <section className="grid grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm">
        {(t.raw("home.stats") as Array<{ n: string; label: string }>).map((s, i) => (
          <div key={i} className="px-3 py-4 text-center">
            <div className="font-display text-2xl font-bold text-slate-900">{s.n}</div>
            <div className="mt-1 text-[11px] leading-snug text-slate-500">{s.label}</div>
          </div>
        ))}
      </section>

      <Calculator />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{t("explainer.title")}</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700">
          <p>{t("explainer.p1")}</p>
          <p>{t("explainer.p2")}</p>
          <p>{t("explainer.p3")}</p>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          <a href={MANUAL_URL} rel="noopener noreferrer" className="underline">
            {t("explainer.sourceLabel")}
          </a>
          <br />
          {t("explainer.lastVerified", { date: countriesVerifiedAt })}
        </p>
      </section>
    </div>
  );
}
