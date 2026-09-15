import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import OverstayContent from "../../../../../content/en/rules/overstay-penalties.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.overstayPenalties");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/rules/overstay-penalties" },
  };
}

export default function OverstayPenaltiesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "The 90/180 rule", item: "/rules/90-180-rule" },
      { "@type": "ListItem", position: 2, name: "Overstay penalties", item: "/rules/overstay-penalties" },
    ],
  };

  return (
    <article className="mx-auto max-w-2xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <OverstayContent />
    </article>
  );
}
