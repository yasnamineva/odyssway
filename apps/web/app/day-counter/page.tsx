import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import DayCounter from "../../components/DayCounter";

/** Multi-country day counter (GROWTH_AND_ROADMAP.md §1.6): every trip checked against its destination's own verified stay rule. */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dayCounter");
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    alternates: { canonical: "/day-counter" },
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function DayCounterPage() {
  const t = await getTranslations("dayCounter");
  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t("metaTitle"),
    description: t("metaDescription"),
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };
  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />
      <DayCounter />
    </div>
  );
}
