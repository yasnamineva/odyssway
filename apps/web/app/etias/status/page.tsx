import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { etias, etiasSources } from "../../../lib/etias";
import { etiasNationalities } from "../../../lib/nationalities";
import { Callout, KeyNumbers, LinkCard, LinkCards, More } from "../../../components/content/Blocks";
import InfoTip from "../../../components/content/InfoTip";
import { CalendarClockIcon } from "../../../components/icons";
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
  announced: "bg-amber-50 border-amber-200 text-amber-900",
  live: "bg-emerald-50 border-emerald-200 text-emerald-900",
  grace_period: "bg-emerald-50 border-emerald-200 text-emerald-900",
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

      <section className={`mt-5 rounded-2xl border p-5 ${statusStyles[etias.launchStatus]}`}>
        <p className="flex items-center gap-2 text-2xl font-bold">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-30 motion-reduce:animate-none" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-current" />
          </span>
          {t(`status.${etias.launchStatus}`)}
        </p>
        <p className="mt-1 text-sm leading-relaxed">{t(`statusDetail.${etias.launchStatus}`)}</p>
        {etias.launchStatus === "announced" ? <p className="mt-2 text-sm leading-relaxed">{t("expectedWindow")}</p> : null}
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
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {t("whatIs")}{" "}
          <InfoTip label={t("detailsLabel")}>
            {t("feeNote")} {t("validityValue", { years: etias.validityYears ?? 3 })}
          </InfoTip>
        </p>
        {etias.launchStatus === "announced" ? <Callout title={t("scamTitle")}>{t("scamNote")}</Callout> : null}
        <LinkCards>
          <LinkCard href="/calculator" icon={<CalendarClockIcon />} title={t("ctaCalculator")} />
        </LinkCards>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">{t("byNationalityTitle")}</h2>
        <p className="mt-1 text-sm text-slate-600">{t("byNationalityHint")}</p>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {etiasNationalities.map((rule) => (
            <li key={rule.nationality}>
              <a
                href={`/etias/${rule.nationality.toLowerCase()}`}
                className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 transition hover:border-slate-900"
              >
                <span className="flex h-6 w-8 shrink-0 items-center justify-center rounded bg-slate-100 font-mono text-[11px] font-semibold text-slate-600">
                  {rule.nationality}
                </span>
                <span className="min-w-0 break-words">{rule.name}</span>
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
