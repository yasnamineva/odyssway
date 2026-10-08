import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import TermsContent from "../../../../content/en/legal/terms.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.terms");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/terms" },
  };
}

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <TermsContent />
    </article>
  );
}
