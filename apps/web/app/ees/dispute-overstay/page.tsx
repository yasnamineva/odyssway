import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import DisputeContent from "../../../../../content/en/ees/dispute-overstay.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.eesDispute");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/ees/dispute-overstay" },
  };
}

export default function EesDisputeOverstayPage() {
  return (
    <article>
      <DisputeContent />
    </article>
  );
}
