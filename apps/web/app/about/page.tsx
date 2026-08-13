import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AboutContent from "../../../../content/en/about.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.about");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/about" },
  };
}

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <AboutContent />
    </article>
  );
}
