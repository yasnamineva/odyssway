import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PermitHoldersContent from "../../../../../content/en/guides/residence-permit-holders.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.permitHolders");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/guides/residence-permit-holders" },
  };
}

export default function ResidencePermitHoldersPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <PermitHoldersContent />
    </article>
  );
}
