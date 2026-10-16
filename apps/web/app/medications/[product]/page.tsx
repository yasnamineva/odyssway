import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import BreadcrumbJsonLd from "../../../components/BreadcrumbJsonLd";
import { DESCRIPTION_MAX, clip, firstSentence } from "../../../lib/seo-text";
import { SITE_URL } from "../../../lib/site";
import { VERDICT_STYLES } from "../../../components/CustomsRowCard";
import {
  latestVerified,
  medicationProducts,
  pairsForProduct,
  productBySlug,
} from "../../../lib/medication-products";

interface Params {
  product: string;
}

export const dynamicParams = false;

/**
 * One answer class per country: a country whose rows disagree (e.g. one form
 * allowed, another banned) counts as conditional, never as allowed.
 */
function verdictCounts(pairs: ReturnType<typeof pairsForProduct>) {
  const counts = { banned: 0, conditional: 0, allowed: 0 };
  for (const pair of pairs) {
    const verdicts = new Set(pair.rows.map((r) => r.verdict));
    if (verdicts.size === 1 && verdicts.has("prohibited")) counts.banned += 1;
    else if ([...verdicts].every((v) => v === "allowed" || v === "allowed_with_limits")) counts.allowed += 1;
    else counts.conditional += 1;
  }
  return counts;
}

export function generateStaticParams(): Params[] {
  return medicationProducts.map((p) => ({ product: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const product = productBySlug((await params).product);
  if (!product) return {};
  const t = await getTranslations("medicationProduct");
  const pairs = pairsForProduct(product.slug);
  const vars = { product: product.name, count: pairs.length };
  const description = clip(t("summary", { ...vars, ...verdictCounts(pairs) }), DESCRIPTION_MAX);
  return {
    title: t("metaTitle", vars),
    description,
    alternates: { canonical: `/medications/${product.slug}` },
    openGraph: { title: t("metaTitle", vars), description, images: ["/opengraph-image"] },
  };
}

export default async function MedicationProductPage({ params }: { params: Promise<Params> }) {
  const product = productBySlug((await params).product);
  if (!product) notFound();
  const pairs = pairsForProduct(product.slug);
  const t = await getTranslations("medicationProduct");
  const tv = await getTranslations("destinationPage.verdict");
  const tc = await getTranslations("common");
  const others = medicationProducts.filter((p) => p.slug !== product.slug);

  const counts = verdictCounts(pairs);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: t("h1", { product: product.name }),
      itemListElement: pairs.map((pair, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: pair.destination.name,
        url: `${SITE_URL}/medications/${product.slug}/${pair.destinationSlug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: pairs.map((pair) => ({
        "@type": "Question",
        name: t("faqQuestion", { product: product.name, destination: pair.destination.name }),
        acceptedAnswer: {
          "@type": "Answer",
          text: pair.rows
            .map((r) => {
              const v = tv(r.verdict);
              const lead = r.limits?.description ? ` ${clip(firstSentence(r.limits.description), 220)}` : "";
              return `${v.charAt(0).toUpperCase()}${v.slice(1)}.${lead}`;
            })
            .join(" "),
        },
      })),
    },
  ];

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BreadcrumbJsonLd
        trail={[
          { name: t("breadcrumbRoot"), path: "/medications" },
          { name: t("h1", { product: product.name }), path: `/medications/${product.slug}` },
        ]}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <a href="/medications" className="hover:text-slate-900">
          {t("breadcrumbRoot")}
        </a>
        <span aria-hidden="true"> / </span>
        <span className="text-slate-700">{product.name}</span>
      </nav>
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          {t("h1", { product: product.name })}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("intro", { product: product.name })}</p>
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-800" data-testid="product-summary">
          {t("summary", { product: product.name, count: pairs.length, ...counts })}
        </p>
      </header>

      <table className="w-full border-y border-slate-200 text-left text-sm">
        <thead className="text-xs text-slate-500">
          <tr>
            <th className="py-2 font-medium">{t("colCountry")}</th>
            <th className="py-2 font-medium">{t("colVerdict")}</th>
            <th className="hidden py-2 font-medium sm:table-cell">{t("colChecked")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {pairs.map((pair) => (
            <tr key={pair.destination.code}>
              <td className="py-2.5 pr-3">
                <a
                  href={`/medications/${product.slug}/${pair.destinationSlug}`}
                  className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2"
                >
                  {pair.destination.name}
                </a>
              </td>
              <td className="py-2.5 pr-3">
                {pair.rows.map((r) => (
                  <span
                    key={r.slug}
                    className={`mr-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${VERDICT_STYLES[r.verdict] ?? VERDICT_STYLES.depends}`}
                  >
                    {tv(r.verdict)}
                  </span>
                ))}
              </td>
              <td className="hidden py-2.5 text-xs text-slate-500 sm:table-cell">{latestVerified(pair.rows)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-sm text-slate-600">
        {t("missing", { product: product.name })}{" "}
        <a href="/trip-check" className="text-blue-700 underline">
          Trip Check →
        </a>
      </p>

      <section>
        <h2 className="text-base font-semibold text-slate-900">{t("otherMedicines")}</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {others.map((p) => (
            <li key={p.slug}>
              <a
                href={`/medications/${p.slug}`}
                className="inline-block rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
              >
                {p.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs leading-relaxed text-slate-500">{tc("medicalDisclaimer")}</p>
    </article>
  );
}
