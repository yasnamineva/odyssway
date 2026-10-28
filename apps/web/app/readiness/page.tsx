import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ReadinessPlanner from "../../components/ReadinessPlanner";
import { changes } from "../../lib/changelog";

/** Trip readiness planner (GROWTH_AND_ROADMAP.md §2, "Travel readiness"): every traveller, every stop, dated actions. */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("readiness");
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    alternates: { canonical: "/readiness" },
    openGraph: { title, description },
    twitter: { title, description },
  };
}

/** Each destination's change dates only, so a saved plan can be rechecked without shipping the changelog. */
function changeDatesByDestination(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const c of changes) {
    for (const d of c.destinations) {
      const list = (out[d] ??= []);
      if (!list.includes(c.date)) list.push(c.date);
    }
  }
  return out;
}

export default async function ReadinessPage() {
  const t = await getTranslations("readiness");
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
      <ReadinessPlanner changeDates={changeDatesByDestination()} />
    </div>
  );
}
