import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PrivacyContent from "../../../../content/en/legal/privacy.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.privacy");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/privacy" },
  };
}

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <PrivacyContent />
    </article>
  );
}
