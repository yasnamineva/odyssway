import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import MedicationPlanner from "../../components/MedicationPlanner";

/** Medication travel planner (GROWTH_AND_ROADMAP.md §2.1): each medicine on each stop, with permit deadlines. */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("medicationPlanner");
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    alternates: { canonical: "/medication-planner" },
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function MedicationPlannerPage() {
  const t = await getTranslations("medicationPlanner");
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
      <MedicationPlanner />
    </div>
  );
}
