import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import DevelopersContent from "../../../../content/en/developers.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.developers");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/developers" },
  };
}

export default function DevelopersPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <DevelopersContent />
    </article>
  );
}
