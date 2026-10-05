import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import EmbedResizer from "../../../components/EmbedResizer";
import TravelerTabs from "../../../components/TravelerTabs";

/** The calculator alone, for other sites' iframes (/widget). Not indexed —
 * /calculator is the page search engines should rank. */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: "/calculator" },
};

export default async function EmbedCalculatorPage() {
  const t = await getTranslations("widgetPage");
  return (
    <div className="pt-4">
      <EmbedResizer />
      <TravelerTabs />
      <p className="mt-4 text-center text-xs text-slate-500">
        <a href="https://odyssway.com/calculator" target="_blank" rel="noopener" className="underline">
          {t("poweredBy")}
        </a>
      </p>
    </div>
  );
}
