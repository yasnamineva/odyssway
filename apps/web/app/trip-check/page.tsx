import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import TripCheck from "../../components/TripCheck";

/** Canonical tool URL for the trip-check flow (AGENTS.md §7). */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const title = t("tripCheckTitle");
  const description = t("tripCheckDescription");
  return {
    title,
    description,
    alternates: { canonical: "/trip-check" },
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function TripCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ nationality?: string; destination?: string }>;
}) {
  const t = await getTranslations();
  const { nationality, destination } = await searchParams;
  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t("meta.tripCheckTitle"),
    description: t("meta.description"),
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <TripCheck initialNationality={nationality} initialDestination={destination} />
    </div>
  );
}
