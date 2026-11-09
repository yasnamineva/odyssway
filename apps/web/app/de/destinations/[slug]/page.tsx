import type { Metadata } from "next";
import { createTranslator } from "next-intl";
import { notFound } from "next/navigation";
import deMessages from "../../../../messages/de.json";
import { VERDICT_STYLES } from "../../../../components/CustomsRowCard";
import { germanDestination, germanDestinations } from "../../../../lib/german-destinations";
import { germanProductName } from "../../../../lib/german-medications";
import type { BringPair } from "../../../../lib/bring-pages";
import { germanDate, germanRowHeading, translatedCustomsRow } from "../../../../lib/translations";

/**
 * German country page, customs part only (GROWTH_AND_ROADMAP.md §5.5): every "Can I bring
 * it?" rule with a German page for this country, plus its German named-medicine pages.
 * Entry rules aren't translated yet, so the page links the English hub for them and
 * declares no hreflang pair: the English hub isn't the same content.
 */
const t = createTranslator({ locale: "de", messages: deMessages, namespace: "dePages" });
const td = createTranslator({ locale: "de", messages: deMessages, namespace: "dePages.destinations" });
const tm = createTranslator({ locale: "de", messages: deMessages, namespace: "dePages.medications" });

export const dynamicParams = false;

/** Same headings as the German item page: the row's kind, the EU-wide rules, or the national extras. */
function rowHeading(slug: string, pair: BringPair, country: string): string {
  const h = germanRowHeading(slug, pair)!;
  return h.kind === "shared" ? t("euRows") : h.kind === "label" ? h.label : t("nationalRows", { country });
}

export function generateStaticParams(): Array<{ slug: string }> {
  return germanDestinations().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = germanDestination((await params).slug);
  if (!d) return {};
  const title = td("metaTitle", { country: d.country, year: (d.lastVerified ?? "").slice(0, 4) });
  const description = td("metaDescription", { count: d.pairs.length, date: germanDate(d.lastVerified) });
  return {
    title,
    description,
    alternates: { canonical: `/de/destinations/${d.slug}` },
    openGraph: { title, description, locale: "de_DE" },
  };
}

export default async function GermanDestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const d = germanDestination((await params).slug);
  if (!d) notFound();

  return (
    <article lang="de" className="mx-auto max-w-3xl space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <a href="/de/destinations" className="hover:text-slate-900">
          {td("breadcrumbRoot")}
        </a>
        <span aria-hidden="true"> / </span>
        <span className="text-slate-700">{d.country}</span>
      </nav>
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{td("h1", { country: d.country })}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{td("intro", { count: d.pairs.length })}</p>
        <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700" data-testid="de-entry-english">
          {td("entryEnglish")}{" "}
          <a href={`/destinations/${d.slug}`} hrefLang="en" lang="en" className="font-medium text-blue-700 underline">
            {td("entryLink")}
          </a>
        </p>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">{td("rulesHeading")}</h2>
        <ul className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm" data-testid="de-destination-rules">
          {d.pairs.map((p) => (
            <li key={p.itemSlug} className="px-5 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <a href={`/de/bring/${p.itemSlug}/${p.destinationSlug}`} className="font-medium text-blue-700 underline">
                  {t(`categories.${p.category}.label`)}
                </a>
                <span className="flex flex-wrap justify-end gap-1">
                  {[...new Set(p.rows.map((r) => r.verdict))].map((v) => (
                    <span
                      key={v}
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${VERDICT_STYLES[v] ?? VERDICT_STYLES.depends}`}
                    >
                      {t(`verdict.${v}`)}
                    </span>
                  ))}
                </span>
              </div>
              {p.rows.map((r) => (
                <p key={r.slug} className="mt-1 text-sm leading-relaxed text-slate-600">
                  {p.rows.length > 1 && (
                    <span className="font-medium text-slate-900">
                      {rowHeading(r.slug, p, d.country)}: {t(`verdict.${r.verdict}`)}.{" "}
                    </span>
                  )}
                  {translatedCustomsRow(r, "de")?.summary}
                </p>
              ))}
            </li>
          ))}
        </ul>
      </section>

      {d.medicines.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-slate-900">{td("medicinesHeading")}</h2>
          <ul className="mt-3 flex flex-wrap gap-2" data-testid="de-destination-medicines">
            {d.medicines.map((p) => (
              <li key={p.product.slug}>
                <a
                  href={`/de/medications/${p.product.slug}/${p.destinationSlug}`}
                  className="inline-block rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  {germanProductName(p.product)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs leading-relaxed text-slate-500">{t("translatedNotice")}</p>
      <p className="text-xs leading-relaxed text-slate-500">
        {t("disclaimer")} {d.medicines.length > 0 ? tm("medicalDisclaimer") : null}
      </p>
    </article>
  );
}
