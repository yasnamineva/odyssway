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
    slug: "medication-supply-limits-by-country",
    title: "How much medicine can you bring? Supply limits by country",
    seoTitle: "How Much Medication Can You Bring Abroad? Limits by Country",
    seoDescription:
      "From 15 days in Serbia to 6 months in Montenegro: personal medicine limits in 30+ countries, and where controlled medicine needs a permit before you travel.",
    dek: "The usual limit is 3 months, but it ranges from 15 days to 6 months, and some countries need a permit weeks before you arrive.",
    date: "2026-10-18",
    category: "Medicine",
    legalSource: {
      name: "Health Sciences Authority (Singapore) — Travelling with medications to Singapore",
      url: "https://www.hsa.gov.sg/travelling-with-medication-and-medical-devices/personal-medications/",
    },
    verifiedAt: "2026-10-18",
    changelogDataset: "customs-items",
    destinationCodes: ["US", "GB", "CA", "AU", "SG", "KR", "JP", "TH", "RS", "TZ", "HK", "PH"],
    photo: "blog-supply",
  },
  {
    slug: "vyvanse-tramadol-controlled-abroad",
    title: "Vyvanse and tramadol: why the rules change so much from country to country",
    seoTitle: "Can You Travel With Vyvanse or Tramadol? Rules by Country",
    seoDescription:
      "Unlike Adderall, Vyvanse and tramadol aren't on the UN's control lists, so each country decides. US, UK, Canada, Japan, Singapore, UAE and Qatar compared.",
    dek: "Unlike Adderall, neither is on the UN's international control lists, so each country sets its own rule, from 'not a narcotic' to 'permit only'.",
    date: "2026-10-17",
    category: "Medicine",
    legalSource: {
      name: "International Narcotics Control Board — Green List: psychotropic substances under international control (36th edition, 2025)",
      url: "https://www.incb.org/incb/uploads/documents/Psychotropics/forms/greenlist/2026/2510307E.pdf",
    },
    verifiedAt: "2026-10-17",
    changelogDataset: "customs-items",
    destinationCodes: ["US", "GB", "CA", "IE", "JP", "SG", "AE", "QA"],
    photo: "blog-vyvanse",
  },
  {
    slug: "medication-transit-stopover",
    title: "Changing planes with medication: which stopovers count",
    seoTitle: "Transiting With Medication: Singapore, Dubai, Hong Kong, Seoul",
    seoDescription:
      "Singapore, the UAE and Korea don't require a medication permit if you stay airside. Hong Kong and the Philippines apply their rules to transit passengers too.",
    dek: "Stay airside in Singapore, Dubai or Seoul and you don't need their medication permits. In Hong Kong and the Philippines, the rules apply even if you're only changing planes.",
    date: "2026-10-15",
    category: "Medicine",
    legalSource: {
      name: "Drug Office, Department of Health (Hong Kong) — Frequently Asked Questions (medicines carried by visitors)",
      url: "https://www.drugoffice.gov.hk/eps/do/en/consumer/news_informations/faq.html",
    },
    verifiedAt: "2026-10-15",
    changelogDataset: "customs-items",
    destinationCodes: ["SG", "AE", "KR", "HK", "PH", "TW", "AR"],
    photo: "blog-transit",
  },
  {
    slug: "kratom-phenibut-poppers-customs",
    title: "Kratom, phenibut and poppers: easy to buy, banned at these borders",
    seoTitle: "Can You Bring Kratom Abroad? Australia, Japan, Singapore, Sweden",
    seoDescription:
      "Kratom is banned in Australia, Japan, Singapore and Sweden; New Zealand holds it without a doctor's authority. Australia bans phenibut, Japan bans poppers.",
    dek: "Kratom is banned in Australia, Japan, Singapore and Sweden, and held at New Zealand's border without a doctor's say-so. Australia also bans phenibut, and Japan bans poppers.",
    date: "2026-10-15",
    category: "Medicine",
    legalSource: {
      name: "Ministry of Health, Labour and Welfare — List of \"Designated Substances\" in Japan (as of 6 September 2026)",
      url: "https://www.mhlw.go.jp/content/11120000/001743042.pdf",
    },
    verifiedAt: "2026-10-15",
    changelogDataset: "customs-items",
    destinationCodes: ["AU", "JP", "SG", "NZ"],
    photo: "blog-kratom",
  },
  {
    slug: "melatonin-zyn-legal-at-home",
    title: "Legal at home, trouble at the border: melatonin and nicotine pouches",
    seoTitle: "Can You Bring Melatonin or Zyn Abroad? Australia, France, NZ, UK",
    seoDescription:
      "Australia banned nicotine pouches for travellers in July 2026, France in April; Singapore bans them too. Melatonin needs a prescription in NZ and Australia.",
    dek: "Australia now seizes nicotine pouches at the border, and France and Singapore ban them. Melatonin, a US supplement, is a prescription medicine in New Zealand, Australia and the UK.",
    date: "2026-10-15",
    category: "Medicine",
    legalSource: {
      name: "Australian Border Force — Australian Customs Notice No. 2026/29, Changes to nicotine pouch regulations",
      url: "https://www.abf.gov.au/help-and-support-subsite/CustomsNotices/2026-29.pdf",
    },
    verifiedAt: "2026-10-15",
    changelogDataset: "customs-items",
    destinationCodes: ["AU", "SG", "NZ", "GB", "JP"],
    photo: "blog-legal-at-home",
  },
  {
    slug: "peptides-bpc-157-customs",
    title: "Travelling with peptides? \"Research use only\" won't get BPC-157 through customs",
    seoTitle: "Can You Travel With Peptides? BPC-157, TB-500 at Customs",
    seoDescription:
      "BPC-157, TB-500 and melanotan II are unapproved drugs in the US, Canada and New Zealand, and need a prescription in Australia. Plus growth hormone in the UK.",
    dek: "The US, Canada and New Zealand treat research peptides as unapproved medicines, and Australia needs a prescription. The UK lets you carry prescribed growth hormone and HCG, but only in person.",
    date: "2026-10-13",
    category: "Medicine",
    legalSource: {
      name: "Health Canada — Think twice before injecting peptides bought online (advisory RA-81874)",
      url: "https://recalls-rappels.canada.ca/en/alert-recall/think-twice-injecting-peptides-bought-online-unauthorized-products-can-seriously-harm",
    },
    verifiedAt: "2026-10-15",
    changelogDataset: "customs-items",
    destinationCodes: ["US", "CA", "NZ", "GB", "AU"],
    photo: "blog-peptides",
  },
  {
    slug: "retatrutide-is-not-ozempic",
    title: "Retatrutide isn't Ozempic, and customs knows the difference",
    seoTitle: "Travelling With Retatrutide vs Ozempic: Customs Rules",
    seoDescription:
      "Approved GLP-1 pens like Ozempic and Mounjaro can travel with a prescription. Retatrutide is an unapproved peptide in the US, Canada, New Zealand and Singapore.",
    dek: "Approved weight-loss pens can usually come with you. Retatrutide bought online usually can't.",
    date: "2026-10-13",
    category: "Medicine",
    legalSource: {
      name: "U.S. Food and Drug Administration — Personal Importation",
      url: "https://www.fda.gov/industry/import-basics/personal-importation",
    },
    verifiedAt: "2026-10-13",
    changelogDataset: "customs-items",
    destinationCodes: ["US", "CA", "NZ", "SG"],
    photo: "blog-retatrutide",
  },
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
      "Adderall is banned in Japan, even with a prescription. Vyvanse needs a permit; Ritalin is allowed up to a limit. The rules from Japan's health ministry.",
    dek: "Adderall is banned in Japan, prescription or not. Vyvanse is allowed with a permit you apply for weeks ahead, and so are some cold remedies.",
    date: "2026-10-06",
    category: "Medicine",
    legalSource: {
      name: "Narcotics Control Department, Ministry of Health, Labour and Welfare — bringing narcotics and stimulant raw materials into Japan",
      url: "https://www.ncd.mhlw.go.jp/en/application2.html",
    },
    verifiedAt: "2026-10-14",
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
