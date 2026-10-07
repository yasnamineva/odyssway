import type { PhotoKey } from "./photos";

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
  /** Search-result title/description when the on-page headline or dek is too long
   * to survive truncation (~60 / ~160 chars). The page itself still shows `title`/`dek`. */
  seoTitle?: string;
  seoDescription?: string;
  date: string; // ISO date — when the post was published
  category: string;
  legalSource: { name: string; url: string };
  verifiedAt: string; // ISO date — when the underlying data was checked (may predate `date`)
  /** Anchor into /changelog for the dataset this post is about, if one exists there. */
  changelogDataset?: string;
  /** Destination codes (data/destinations.json) this post covers, for cross-linking
   * from destination pages — internal links between topically-related, already-cited
   * pages, not a separate content surface. */
  destinationCodes?: string[];
  /** Pixabay photo shown on the card, the post and its social preview (lib/photos.ts). */
  photo: PhotoKey;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "thailand-visa-free-cut-2026",
    title:
      "Thailand just halved its visa-free stay. Four more rule changes to check before you book",
    seoTitle: "Thailand Halved Its Visa-Free Stay: 2026 Rule Changes",
    seoDescription:
      "Thailand cut visa-free stays from 60 to 30 days. Korea's K-ETA waiver and China's visa-free policy both end 31 December 2026, and Brazil's visas are back.",
    dek: "Thailand cut 60 days to 30. Korea's K-ETA waiver and China's visa-free policy both have an end date, Brazil brought back visas, and Vietnam went the other way.",
    date: "2026-10-06",
    category: "Visa rules",
    legalSource: {
      name: "Ministry of Foreign Affairs of Thailand — revision of the visa exemption and VoA schemes, effective 15 September 2026",
      url: "https://image.mfa.go.th/mfa/0/umufy3EgqL/Con0926/Visa_Exemption_(EN)_0.jpg",
    },
    verifiedAt: "2026-10-05",
    changelogDataset: "entry-requirements",
    destinationCodes: ["TH", "KR", "CN", "BR", "VN"],
    photo: "blog-thailand",
  },
  {
    slug: "visa-free-is-not-form-free",
    title: "Visa-free doesn't mean form-free any more",
    seoTitle: "Visa-Free Doesn't Mean Form-Free: Travel Authorisations",
    seoDescription:
      "The UK, US, Canada, Australia, New Zealand and Kenya all want an online authorisation before you fly. Costs, validity, and where ETIAS stands.",
    dek: "The UK, US, Canada, Australia, New Zealand and Kenya all want an approved online form before you board. Here's who needs what, and what it costs.",
    date: "2026-10-06",
    category: "Visa rules",
    legalSource: {
      name: "GOV.UK — Visiting the UK as an EU, EEA or Swiss citizen; Immigration Rules Appendix ETA National List",
      url: "https://www.gov.uk/guidance/visiting-the-uk-as-an-eu-eea-or-swiss-citizen",
    },
    verifiedAt: "2026-10-05",
    changelogDataset: "entry-requirements",
    destinationCodes: ["GB", "US", "CA", "AU", "NZ", "KE", "KR", "ZA"],
    photo: "blog-eta",
  },
  {
    slug: "adhd-medication-japan",
    title: "Taking ADHD medication to Japan? Adderall can't come with you",
    seoTitle: "Adderall and Vyvanse in Japan: What You Can Bring",
    seoDescription:
      "Adderall is banned in Japan even with a prescription. Vyvanse and Sudafed need advance permission. The rules from Japan's health ministry and customs.",
    dek: "Adderall is banned in Japan, prescription or not. Vyvanse is allowed with a permit you apply for weeks ahead, and so are some cold remedies.",
    date: "2026-10-06",
    category: "Medicine",
    legalSource: {
      name: "Narcotics Control Department, Ministry of Health, Labour and Welfare — bringing narcotics and stimulant raw materials into Japan",
      url: "https://www.ncd.mhlw.go.jp/en/application2.html",
    },
    verifiedAt: "2026-10-02",
    changelogDataset: "customs-items",
    destinationCodes: ["JP"],
    photo: "blog-japan",
  },
  {
    slug: "ozempic-wegovy-mounjaro-travel",
    title: "Flying with Ozempic, Wegovy or Mounjaro: what ten countries allow",
    seoTitle: "Travelling With Ozempic, Wegovy or Mounjaro",
    seoDescription:
      "How much Ozempic, Wegovy or Mounjaro you can bring into the US, UK, Canada, Australia, Japan, Thailand, Singapore, Mexico, Brazil and Rwanda.",
    dek: "None of these countries bans GLP-1 pens, but most cap the supply, and two need planning weeks ahead.",
    date: "2026-10-06",
    category: "Medicine",
    legalSource: {
      name: "Therapeutic Goods Administration — Entering Australia (travelling with medicines and medical devices)",
      url: "https://www.tga.gov.au/resources/consumer-information-and-resources/travelling-medicines-and-medical-devices/entering-australia",
    },
    verifiedAt: "2026-09-13",
    changelogDataset: "customs-items",
    destinationCodes: [
      "US",
      "GB",
      "CA",
      "AU",
      "JP",
      "TH",
      "SG",
      "MX",
      "BR",
      "RW",
    ],
    photo: "blog-glp1",
  },
  {
    slug: "europe-counts-your-days",
    title: "Europe's borders now count your days for you",
    seoTitle: "EES: Europe's Borders Now Count Your Days",
    seoDescription:
      "Since 10 April 2026 the EU's Entry/Exit System logs every crossing and flags overstays automatically. What it records and how to fix a wrong record.",
    dek: "Since 10 April 2026, the passport stamp is gone. The Entry/Exit System logs every crossing and flags overstays on its own.",
    date: "2026-10-06",
    category: "Europe",
    legalSource: {
      name: "Regulation (EU) 2017/2226 (EES Regulation), consolidated version of 12 June 2026",
      url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02017R2226-20260612",
    },
    verifiedAt: "2026-10-05",
    changelogDataset: "ees",
    photo: "blog-ees",
  },
  {
    slug: "overstay-europe-what-happens",
    title: "Overstayed in Europe? What actually happens next",
    seoTitle: "Overstayed in Schengen? What Actually Happens",
    seoDescription:
      "An overstay in Europe doesn't mean an automatic ban. How the EU's Return Directive works, and how France, Spain, the Netherlands and Germany differ.",
    dek: "There's no automatic ban. There is a process, and each country runs it differently.",
    date: "2026-10-06",
    category: "Europe",
    legalSource: {
      name: "Directive 2008/115/EC (Return Directive), Arts. 6, 7 and 11",
      url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32008L0115",
    },
    verifiedAt: "2026-09-16",
    changelogDataset: "overstay-penalties",
    photo: "blog-overstay",
  },
];

export function blogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

/** Newest first — the ordering both the index and sitemap use. */
export const blogPostsByDate: BlogPost[] = [...blogPosts].sort((a, b) =>
  b.date.localeCompare(a.date),
);
