import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { etias } from "../../../lib/etias";
import { etiasNationalities, nationalityBySlug } from "../../../lib/nationalities";

interface Params {
  nationality: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return etiasNationalities.map((r) => ({
    nationality: r.nationality.toLowerCase(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const rule = nationalityBySlug((await params).nationality);
  if (!rule) return {};
  const t = await getTranslations("etiasNat");
  return {
    title: t("metaTitle", { citizens: rule.citizenLabel }),
    description: t("metaDescription", { citizens: rule.citizenLabel, country: rule.name }),
    alternates: { canonical: `/etias/${rule.nationality.toLowerCase()}` },
  };
}

export default async function EtiasNationalityPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const rule = nationalityBySlug((await params).nationality);
  if (!rule || !rule.visaExempt || !rule.etiasApplicable) notFound();
  const t = await getTranslations("etiasNat");
  const te = await getTranslations("etias");
  const tc = await getTranslations("common");

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("h1", { citizens: rule.citizenLabel })}
        </h1>
      </header>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
        <p className="text-lg font-semibold">
          {etias.launchStatus === "announced"
            ? t("verdictNotLive", { citizens: rule.citizenLabel })
            : t("verdictLive", { citizens: rule.citizenLabel })}
        </p>
        {etias.launchStatus === "announced" ? (
          <p className="mt-1 text-sm leading-relaxed">{te("expectedWindow")}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">{t("factsTitle")}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>{t("factVisaExempt", { country: rule.name })}</li>
          <li>{t("factEtias", { citizens: rule.citizenLabel })}</li>
          {etias.feeEUR !== null && etias.validityYears !== null ? (
            <li>
              {t("factFee", { fee: etias.feeEUR, years: etias.validityYears })}
            </li>
          ) : null}
          {etias.exemptions.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
        {rule.notes ? (
          <p className="mt-4 rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-slate-700">
            <strong>{t("noteLabel")}:</strong> {rule.notes}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">{t("ninetyTitle")}</h2>
        <p className="mt-2">{t("ninetyBody", { citizens: rule.citizenLabel })}</p>
        <p className="mt-3">
          <a href="/calculator" className="font-medium underline hover:text-slate-900">
            {t("ninetyCta")}
          </a>
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-4 text-xs leading-relaxed text-slate-600">
        <p>
          {t("sourceLine")}{" "}
          <a href={rule.legal_source.url} rel="noopener noreferrer" className="underline">
            {rule.legal_source.name}
          </a>
        </p>
        {rule.verified_at ? (
          <p className="mt-1">{te("checkedOn", { date: rule.verified_at })}</p>
        ) : null}
        <p className="mt-1">
          <a href="/changelog#dataset-nationality-rules" className="underline">
            {tc("updateHistory")}
          </a>
        </p>
      </section>
    </article>
  );
}
