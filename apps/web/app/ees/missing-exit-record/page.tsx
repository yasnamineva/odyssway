import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import MissingExitContent from "../../../../../content/en/ees/missing-exit-record.mdx";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.eesMissingExit");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/ees/missing-exit-record" },
  };
}

export default function EesMissingExitRecordPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <MissingExitContent />
    </article>
  );
}
