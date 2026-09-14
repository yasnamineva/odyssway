import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import TravelerTabs from "../../components/TravelerTabs";

/** Canonical tool URL (AGENTS.md §7) — same component as the home page. */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const title = t("calculatorTitle");
  const description = t("calculatorDescription");
  return {
    title,
    description,
    alternates: { canonical: "/calculator" },
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function CalculatorPage() {
  const t = await getTranslations();
  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t("meta.title"),
    description: t("meta.description"),
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        {t("calc.pageH1")}
      </h1>
      <TravelerTabs />
    </div>
  );
}
