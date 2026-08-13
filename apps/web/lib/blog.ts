/**
 * Blog post metadata. Every post exists because of a real, already-verified
 * change in our own rule data (AGENTS.md §13.7: no filler posts) — the MDX
 * body in content/en/blog/ is the narrative write-up, this is the citation
 * and chrome data that wraps it (title, date, source), matching the pattern
 * every rules page follows (legal source + "checked against official
 * sources: {date}").
 */
export interface BlogPost {
  slug: string;
  title: string;
  dek: string;
  date: string; // ISO date — when the post was published
  category: string;
  legalSource: { name: string; url: string };
  verifiedAt: string; // ISO date — when the underlying data was checked (may predate `date`)
  /** Anchor into /changelog for the dataset this post is about, if one exists there. */
  changelogDataset?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "south-africa-eta-launched",
    title: "South Africa's New ETA Just Launched — Here's What We Actually Know",
    dek: "An Electronic Travel Authorisation went live on 12 August 2026. The eligibility list and fee aren't published anywhere yet, so neither are we.",
    date: "2026-08-13",
    category: "Regulation change",
    legalSource: {
      name: "Department of Home Affairs — Visa Exemption List (Immigration Act 13 of 2002)",
      url: "https://www.dha.gov.za/index.php/immigration-services/exempt-countries",
    },
    verifiedAt: "2026-08-11",
  },
  {
    slug: "kenya-replaced-visa-on-arrival",
    title: "Kenya Replaced Visa-on-Arrival With a Universal eTA — What Changed",
    dek: "If you're still planning around Kenya's old visa-on-arrival system, you're planning around a rule that no longer exists.",
    date: "2026-08-12",
    category: "Regulation change",
    legalSource: {
      name: "Kenya Citizenship and Immigration (Amendment) Regulations, 2023 (Legal Notice No. 1 of 2024)",
      url: "https://new.kenyalaw.org/akn/ke/act/ln/2024/1/eng@2024-01-19/source.pdf",
    },
    verifiedAt: "2026-08-11",
  },
  {
    slug: "ees-live-five-countries",
    title: "EES Is Now Live in France, Spain, Germany, Italy & the Netherlands — What Changes at the Border",
    dek: "The Entry/Exit System now logs every crossing automatically at these five borders. There's no more passport stamp to argue with — and no more rounding.",
    date: "2026-08-11",
    category: "Regulation change",
    legalSource: {
      name: "Regulation (EU) 2017/2226 (EES Regulation), Arts. 52–54, consolidated 02017R2226-20260612",
      url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02017R2226-20260612",
    },
    verifiedAt: "2026-07-13",
    changelogDataset: "ees",
  },
  {
    slug: "sixteen-destinations-verified",
    title: "We Just Verified 13 New Destinations. Here's Exactly How.",
    dek: "No shortcuts: every entry requirement and customs rule for Egypt, Morocco, Nigeria, Rwanda, India, the UAE, Thailand, Turkey, and Australia was checked against that country's own government sources before it went live.",
    date: "2026-08-13",
    category: "Site news",
    legalSource: {
      name: "Odyssway — full source list",
      url: "/sources",
    },
    verifiedAt: "2026-08-13",
  },
];

export function blogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

/** Newest first — the ordering both the index and sitemap use. */
export const blogPostsByDate: BlogPost[] = [...blogPosts].sort((a, b) =>
  b.date.localeCompare(a.date),
);
