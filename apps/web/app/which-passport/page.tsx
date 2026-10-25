import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import WhichPassport from "../../components/WhichPassport";

/** "Which passport should I use?" for dual citizens (GROWTH_AND_ROADMAP.md §2). */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("whichPassport");
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    alternates: { canonical: "/which-passport" },
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function WhichPassportPage() {
  const t = await getTranslations("whichPassport");
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
      <WhichPassport />
    </div>
  );
}
