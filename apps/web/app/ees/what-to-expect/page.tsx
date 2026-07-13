import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import EesWhatContent from "../../../../../content/en/ees/what-to-expect.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.eesWhat");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/ees/what-to-expect" },
  };
}

export default function EesWhatToExpectPage() {
  return (
    <article>
      <EesWhatContent />
    </article>
  );
}
