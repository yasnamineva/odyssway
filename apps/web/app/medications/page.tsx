import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreadcrumbJsonLd from "../../components/BreadcrumbJsonLd";
import { medicationProducts, pairsForProduct } from "../../lib/medication-products";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("medicationsIndex");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/medications" },
    openGraph: { title: t("metaTitle"), description: t("metaDescription"), images: ["/opengraph-image"] },
  };
}

export default async function MedicationsIndexPage() {
  const tc = await getTranslations("common");
  const t = await getTranslations("medicationsIndex");
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <BreadcrumbJsonLd trail={[{ name: t("h1"), path: "/medications" }]} />
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{t("h1")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("intro")}</p>
      </header>
      <ul className="grid gap-x-8 border-y border-slate-200 sm:grid-cols-2">
        {medicationProducts.map((p) => (
          <li key={p.slug} className="border-b border-slate-200 last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
            <a href={`/medications/${p.slug}`} className="flex items-baseline justify-between gap-4 py-3 hover:text-slate-900">
              <span className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2">{p.name}</span>
              <span className="text-xs text-slate-500">{t("countries", { count: pairsForProduct(p.slug).length })}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-sm">
        <a href="/bring/medication" className="text-blue-700 underline">
          {t("generalLink")}
        </a>
      </p>
      <p className="text-xs leading-relaxed text-slate-500">{tc("medicalDisclaimer")}</p>
    </article>
  );
}
