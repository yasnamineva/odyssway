import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import BreadcrumbJsonLd from "../../../components/BreadcrumbJsonLd";
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

export function generateStaticParams(): Params[] {
  return medicationProducts.map((p) => ({ product: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const product = productBySlug((await params).product);
  if (!product) return {};
  const t = await getTranslations("medicationProduct");
  const vars = { product: product.name, count: pairsForProduct(product.slug).length };
  return {
    title: t("metaTitle", vars),
    description: t("metaDescription", vars),
    alternates: { canonical: `/medications/${product.slug}` },
    openGraph: { title: t("metaTitle", vars), description: t("metaDescription", vars), images: ["/opengraph-image"] },
  };
}

export default async function MedicationProductPage({ params }: { params: Promise<Params> }) {
  const product = productBySlug((await params).product);
  if (!product) notFound();
  const pairs = pairsForProduct(product.slug);
  const t = await getTranslations("medicationProduct");
  const tv = await getTranslations("destinationPage.verdict");
  const others = medicationProducts.filter((p) => p.slug !== product.slug);

  return (
    <article className="mx-auto max-w-3xl space-y-6">
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
    </article>
  );
}
