import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import DualCitizensContent from "../../../../../content/en/guides/dual-citizens.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.dualCitizens");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/guides/dual-citizens" },
  };
}

export default function DualCitizensPage() {
  return (
    <article>
      <DualCitizensContent />
    </article>
  );
}
