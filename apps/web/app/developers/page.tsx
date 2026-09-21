import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import DevelopersContent from "../../../../content/en/developers.mdx";
import { customsItems, destinations, entryRequirements } from "../../lib/destinations";
import { SITE_URL } from "../../lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.developers");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/developers" },
  };
}

const verifiedDates = [...customsItems, ...entryRequirements, ...destinations]
  .map((r) => r.verified_at)
  .filter((d): d is string => Boolean(d))
  .sort();

/** Dataset markup (schema.org) so the verified corpus — the product's actual
 * moat — is discoverable in Google Dataset Search, with counts derived from
 * the data files rather than hand-typed. No `license` is declared: none has
 * been chosen, and asserting one here would be a legal claim. */
const datasetJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Odyssway verified travel-compliance rules",
  description: `Entry requirements, stay limits and customs rules for ${destinations.filter((d) => d.status === "verified").length} destinations — ${customsItems.filter((i) => i.status === "verified").length} customs-item rules and ${entryRequirements.filter((r) => r.status === "verified").length} nationality-by-destination entry rules — each row cited to an official source and dated.`,
  url: `${SITE_URL}/developers`,
  keywords: ["customs rules", "entry requirements", "travel compliance", "Schengen", "90/180 rule"],
  isAccessibleForFree: true,
  dateModified: verifiedDates.at(-1),
  creator: { "@type": "Organization", name: "Odyssway", url: SITE_URL },
  distribution: ["trip-check", "destinations", "customs-items"].map((endpoint) => ({
    "@type": "DataDownload",
    encodingFormat: "application/json",
    contentUrl: `${SITE_URL}/api/v1/${endpoint}`,
  })),
};

export default function DevelopersPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />
      <DevelopersContent />
    </article>
  );
}
