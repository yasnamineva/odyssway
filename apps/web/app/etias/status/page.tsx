import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { etias, etiasSources } from "../../../lib/etias";
import { etiasNationalities } from "../../../lib/nationalities";
import { Callout, KeyNumbers, LinkCard, LinkCards, More } from "../../../components/content/Blocks";
import InfoTip from "../../../components/content/InfoTip";
import Photo from "../../../components/content/Photo";
import BreadcrumbJsonLd from "../../../components/BreadcrumbJsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.etias");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/etias/status" },
  };
}

const statusStyles: Record<string, string> = {
  announced: "text-amber-800",
  live: "text-emerald-800",
  grace_period: "text-emerald-800",
};

export default async function EtiasStatusPage() {
  const t = await getTranslations("etias");
  const tc = await getTranslations("common");

  // Each source once, by name — the per-claim notes in etias.json use
  // internal field names that mean nothing to a reader.
  const sources = [...new Map(etiasSources.map((src) => [src.url, src])).values()];

  return (
    <article className="mx-auto max-w-3xl">
      <BreadcrumbJsonLd trail={[{ name: "ETIAS", path: "/etias/status" }]} />
      <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{t("h1")}</h1>

      <Photo name="etias-airport" hero />

      <section className="mt-6">
        <p className={`flex items-center gap-2 text-2xl font-bold ${statusStyles[etias.launchStatus]}`}>
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-30 motion-reduce:animate-none" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-current" />
          </span>
          {t(`status.${etias.launchStatus}`)}
        </p>
        <p className="mt-1 text-[15px] leading-relaxed text-slate-700">{t(`statusDetail.${etias.launchStatus}`)}</p>
        {etias.launchStatus === "announced" ? (
          <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{t("expectedWindow")}</p>
        ) : null}
      </section>

      <KeyNumbers
        items={[
          ...(etias.feeEUR !== null ? [{ value: t("feeValue", { fee: etias.feeEUR }), label: t("feeShort") }] : []),
          ...(etias.validityYears !== null
            ? [{ value: t("validityShortValue", { years: etias.validityYears }), label: t("validityShort") }]
            : []),
          { value: "30", label: t("countriesShort") },
        ]}
      />

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">{t("whatIsTitle")}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
          {t("whatIs")}{" "}
          <InfoTip label={t("detailsLabel")}>
            {t("feeNote")} {t("validityValue", { years: etias.validityYears ?? 3 })}
          </InfoTip>
        </p>
        {etias.launchStatus === "announced" ? <Callout title={t("scamTitle")}>{t("scamNote")}</Callout> : null}
        <LinkCards>
          <LinkCard href="/calculator" title={t("ctaCalculator")} />
        </LinkCards>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">{t("byNationalityTitle")}</h2>
        <p className="mt-1 text-sm text-slate-600">{t("byNationalityHint")}</p>
        <ul className="mt-3 grid grid-cols-2 gap-x-6 sm:grid-cols-3">
          {etiasNationalities.map((rule) => (
            <li key={rule.nationality}>
              <a
                href={`/etias/${rule.nationality.toLowerCase()}`}
                className="block py-1.5 text-[15px] text-brand-800 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-700"
              >
                {rule.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <More summary={t("sourcesTitle")}>
        <ul className="space-y-1.5">
          {sources.map((src) => (
            <li key={src.url}>
              <a href={src.url} rel="noopener noreferrer" className="underline">
                {src.name}
              </a>
            </li>
          ))}
        </ul>
        {etias.verified_at ? <p className="mt-3 text-slate-500">{t("checkedOn", { date: etias.verified_at })}</p> : null}
        <p className="mt-1">
          <a href="/changelog#dataset-etias" className="underline">
            {tc("updateHistory")}
          </a>
        </p>
      </More>
    </article>
  );
}
