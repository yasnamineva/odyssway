import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import MethodologyContent from "../../../../content/en/methodology.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.methodology");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/methodology" },
  };
}

export default function MethodologyPage() {
  return (
    <article>
      <MethodologyContent />
    </article>
  );
}
