import type { Metadata } from "next";
import CanIBringWidget from "../../../components/CanIBringWidget";
import EmbedResizer from "../../../components/EmbedResizer";

/** The "Can I bring it?" box alone, for other sites' iframes (/widget). Not
 * indexed — /trip-check is the page search engines should rank. */
export const metadata: Metadata = {
  title: "Can I bring it? (embed)",
  robots: { index: false, follow: true },
  alternates: { canonical: "/trip-check" },
};

export default function EmbedCanIBringPage() {
  return (
    <div className="mx-auto max-w-md pt-4">
      <EmbedResizer widget="can-i-bring" />
      <CanIBringWidget />
    </div>
  );
}
