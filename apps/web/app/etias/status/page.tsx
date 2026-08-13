import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { etias, etiasSources } from "../../../lib/etias";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.etias");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/etias/status" },
  };
}

const statusStyles: Record<string, string> = {
  announced: "bg-amber-50 border-amber-200 text-amber-900",
  live: "bg-emerald-50 border-emerald-200 text-emerald-900",
  grace_period: "bg-emerald-50 border-emerald-200 text-emerald-900",
};

export default async function EtiasStatusPage() {
  const t = await getTranslations("etias");
  const tc = await getTranslations("common");

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("h1")}</h1>

      <section
        className={`rounded-2xl border p-5 ${statusStyles[etias.launchStatus]}`}
      >
        <div className="text-2xl font-bold">
          {t(`status.${etias.launchStatus}`)}
        </div>
        <p className="mt-1 text-sm leading-relaxed">
          {t(`statusDetail.${etias.launchStatus}`)}
        </p>
        {etias.launchStatus === "announced" ? (
          <p className="mt-2 text-sm leading-relaxed">{t("expectedWindow")}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm">
        <p>{t("whatIs")}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          {etias.feeEUR !== null ? (
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">{t("feeLabel")}</dt>
              <dd className="text-xl font-bold text-slate-900">
                {t("feeValue", { fee: etias.feeEUR })}
              </dd>
              <dd className="mt-1 text-xs text-slate-500">{t("feeNote")}</dd>
            </div>
          ) : null}
          {etias.validityYears !== null ? (
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">{t("validityLabel")}</dt>
              <dd className="text-sm font-medium text-slate-900">
                {t("validityValue", { years: etias.validityYears })}
              </dd>
            </div>
          ) : null}
        </dl>
        {etias.launchStatus === "announced" ? (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            {t("scamNote")}
          </p>
        ) : null}
        <p className="mt-4">
          <a href="/calculator" className="font-medium underline hover:text-slate-900">
            {t("ctaCalculator")}
          </a>
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-4 text-xs leading-relaxed text-slate-600">
        <h2 className="mb-2 font-semibold text-slate-800">{t("sourcesTitle")}</h2>
        <ul className="space-y-1">
          {etiasSources.map((s, i) => (
            <li key={i}>
              {s.claim} —{" "}
              <a href={s.url} rel="noopener noreferrer" className="underline">
                {s.name}
              </a>
            </li>
          ))}
        </ul>
        {etias.verified_at ? (
          <p className="mt-2">{t("checkedOn", { date: etias.verified_at })}</p>
        ) : null}
        <p className="mt-1">
          <a href="/changelog#dataset-etias" className="underline">
            {tc("updateHistory")}
          </a>
        </p>
      </section>
    </article>
  );
}
