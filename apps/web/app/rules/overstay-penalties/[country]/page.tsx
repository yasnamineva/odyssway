import type { Metadata } from "next";
import { Fact, InShort, LinkCard, LinkCards } from "../../../../components/content/Blocks";
import { AlertIcon, GateIcon, ScaleIcon } from "../../../../components/icons";
import SourceNote from "../../../../components/SourceNote";
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
  const ts = await getTranslations("tripCheck");
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
    <article className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <a href="/rules/overstay-penalties" className="hover:text-slate-900">
          {t("breadcrumbRoot")}
        </a>
        <span aria-hidden="true"> / </span>
        <span className="text-slate-700">{country}</span>
      </nav>
      <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
        {t("h1", { country })}
      </h1>

      <InShort>{t("inShort", { country })}</InShort>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Fact icon={<ScaleIcon />} title={t("fineTitle")}>
          {record.fineRange}
        </Fact>
        <Fact icon={<GateIcon />} title={t("banTitle")}>
          {record.banRange}
        </Fact>
      </div>
      <div className="mt-3">
        <Fact icon={<AlertIcon />} title={t("enforcementTitle")}>
          {record.enforcementNotes}
        </Fact>
      </div>

      <LinkCards>
        <LinkCard href="/rules/overstay-penalties" icon={<ScaleIcon />} title={t("backLink")} />
        <LinkCard href="/ees/dispute-overstay" icon={<AlertIcon />} title={t("disputeLink")} />
      </LinkCards>

      <div className="mt-10 space-y-3">
        <SourceNote
          name={record.legal_source.name}
          url={record.legal_source.url}
          date={record.verified_at}
          sourceLabel={ts("sourceLabel")}
          checkedLabel={record.verified_at ? ts("checkedOn", { date: record.verified_at }) : undefined}
        />
        <p className="text-xs leading-relaxed text-slate-500">{t("disclaimer")}</p>
      </div>
    </article>
  );
}
