import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import BreadcrumbJsonLd from "../../../components/BreadcrumbJsonLd";
import { destinationByCode, destinationPath } from "../../../lib/destination-index";
import {
  authorisationBySlug,
  authorisationSources,
  travelAuthorisations,
} from "../../../lib/travel-authorisations";
import { travelPairPath, travelPairs } from "../../../lib/travel-pairs";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return travelAuthorisations.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const a = authorisationBySlug(slug);
  if (!a) return {};
  const t = await getTranslations("authorisations");
  const title = t("metaTitle", { name: a.shortName });
  const description = t("metaDescription", { name: a.shortName, fee: a.fee.text });
  return {
    title,
    description,
    alternates: { canonical: `/authorisations/${a.slug}` },
    openGraph: { title, description },
  };
}

export default async function AuthorisationPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const a = authorisationBySlug(slug);
  if (!a) notFound();
  const t = await getTranslations("authorisations");
  const tc = await getTranslations("tripCheck");
  const dest = destinationByCode(a.destination);
  const country = dest?.name ?? a.destination;
  const pairs = travelPairs
    .filter((p) => p.row.destination === a.destination)
    .sort((x, y) => x.nationality.name.localeCompare(y.nationality.name));
  const facts: Array<[string, string | undefined]> = [
    [t("fee"), a.fee.text],
    [t("validity"), a.validity],
    [t("processing"), a.processing],
    [t("applyAhead"), a.applyAhead],
    [t("maxStay"), a.maxStay],
  ];

  return (
    <article className="mx-auto max-w-3xl">
      <BreadcrumbJsonLd
        trail={[
          { name: t("indexTitle"), path: "/authorisations" },
          { name: a.shortName, path: `/authorisations/${a.slug}` },
        ]}
      />
      <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{t("h1", { name: a.shortName })}</h1>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[15px] leading-relaxed text-slate-800" data-testid="authorisation-summary">
        <p>{t(a.kind === "e_visa" ? "summaryVisa" : "summaryEta", { name: a.name, country, issuer: a.issuer })}</p>
        <a
          href={a.applyUrl}
          rel="noopener noreferrer"
          target="_blank"
          className="mt-3 inline-block rounded-lg bg-brand-700 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-800"
          data-testid="authorisation-apply"
        >
          {t("applyButton", { issuer: a.issuer })}
        </a>
      </div>

      <dl className="mt-6 divide-y divide-slate-200 border-y border-slate-200" data-testid="authorisation-facts">
        {facts
          .filter((f): f is [string, string] => Boolean(f[1]))
          .map(([label, value]) => (
            <div key={label} className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr]">
              <dt className="text-sm font-semibold text-slate-900">{label}</dt>
              <dd className="text-[15px] leading-relaxed text-slate-700">{value}</dd>
            </div>
          ))}
      </dl>

      {a.officialOnly && (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900" data-testid="authorisation-official-only">
          <span className="font-semibold">{t("officialOnlyTitle")} </span>
          {a.officialOnly}
        </p>
      )}
      {!a.officialOnly && <p className="mt-4 text-sm text-slate-600">{t("officialOnlyGeneric", { issuer: a.issuer })}</p>}
      {a.notes && <p className="mt-4 text-[15px] leading-relaxed text-slate-700">{a.notes}</p>}

      {pairs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">{t("passportsTitle", { country })}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("passportsHint", { name: a.shortName })}</p>
          <ul className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {pairs.map((p) => (
              <li key={p.nationality.nationality} className="text-sm">
                <a href={travelPairPath(p)} className="text-brand-700 underline underline-offset-2">
                  {p.nationality.name}
                </a>
                <span className="text-slate-600">: {tc(`routeBasis.${p.row.requirement}`)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 text-sm text-slate-600">
        <h2 className="text-sm font-semibold text-slate-900">{t("sourcesTitle")}</h2>
        <ul className="mt-2 space-y-1">
          {authorisationSources(a).map((s) => (
            <li key={`${s.url}-${"claim" in s ? s.claim : ""}`}>
              {"claim" in s && s.claim ? `${s.claim}: ` : ""}
              <a href={s.url} rel="noopener noreferrer" target="_blank" className="underline underline-offset-2">
                {s.name}
              </a>
            </li>
          ))}
        </ul>
        {a.verified_at && <p className="mt-2">{tc("checkedOn", { date: a.verified_at })}</p>}
        <p className="mt-2">{t("disclaimer")}</p>
      </section>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
        <a href="/readiness" className="text-brand-700 underline underline-offset-2">
          {t("readinessCta")}
        </a>
        {dest && (
          <a href={destinationPath(dest)} className="text-brand-700 underline underline-offset-2">
            {t("destinationCta", { country })}
          </a>
        )}
        <a href="/authorisations" className="text-brand-700 underline underline-offset-2">
          {t("allGuides")}
        </a>
      </div>
    </article>
  );
}
