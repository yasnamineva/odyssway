import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import EesHubContent from "../../../../content/en/ees/index.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.eesHub");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/ees" },
  };
}

export default function EesHubPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <EesHubContent />
    </article>
  );
}
