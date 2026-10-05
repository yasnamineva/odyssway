import { SITE_URL } from "../lib/site";

/** schema.org BreadcrumbList for a page's position under the home page
 * (AGENTS.md §7). `trail` lists the levels below home, ending with the page itself. */
export default function BreadcrumbJsonLd({ trail }: { trail: Array<{ name: string; path: string }> }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Odyssway", path: "" }, ...trail].map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}
