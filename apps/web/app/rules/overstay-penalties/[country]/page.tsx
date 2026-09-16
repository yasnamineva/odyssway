import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  overstayCountryName,
  overstayPenaltyBySlug,
  publishedOverstayPenalties,
} from "../../../../lib/overstay-penalties";

interface Params {
  country: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return publishedOverstayPenalties.map((r) => ({ country: r.country.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const record = overstayPenaltyBySlug((await params).country);
  if (!record) return {};
  const t = await getTranslations("overstayCountry");
  const country = overstayCountryName(record.country);
  return {
    title: t("metaTitle", { country }),
    description: t("metaDescription", { country }),
    alternates: { canonical: `/rules/overstay-penalties/${record.country.toLowerCase()}` },
  };
}

export default async function OverstayCountryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const record = overstayPenaltyBySlug((await params).country);
  if (!record) notFound();
  const t = await getTranslations("overstayCountry");
  const country = overstayCountryName(record.country);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "The 90/180 rule", item: "/rules/90-180-rule" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Overstay penalties",
        item: "/rules/overstay-penalties",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: country,
        item: `/rules/overstay-penalties/${record.country.toLowerCase()}`,
      },
    ],
  };

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t("h1", { country })}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("intro", { country })}</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">{t("fineTitle")}</h2>
        <p className="mt-2">{record.fineRange}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">{t("banTitle")}</h2>
        <p className="mt-2">{record.banRange}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">{t("enforcementTitle")}</h2>
        <p className="mt-2">{record.enforcementNotes}</p>
      </section>

      <p className="text-xs leading-relaxed text-slate-500">{t("disclaimer")}</p>

      <section className="rounded-2xl border border-slate-200 bg-slate-100 p-4 text-xs leading-relaxed text-slate-600">
        <p>
          {t("sourceLine")}{" "}
          <a href={record.legal_source.url} rel="noopener noreferrer" className="underline">
            {record.legal_source.name}
          </a>
        </p>
        {record.verified_at ? (
          <p className="mt-1">{t("checkedOn", { date: record.verified_at })}</p>
        ) : null}
        <p className="mt-2">
          <a href="/rules/overstay-penalties" className="underline">
            {t("backLink")}
          </a>
        </p>
      </section>
    </article>
  );
}
