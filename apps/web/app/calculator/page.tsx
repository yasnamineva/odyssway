import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Calculator from "../../components/Calculator";

/** Canonical tool URL (AGENTS.md §7) — same component as the home page. */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/calculator" },
  };
}

export default async function CalculatorPage() {
  const t = await getTranslations();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        {t("home.h1")}
      </h1>
      <Calculator />
    </div>
  );
}
