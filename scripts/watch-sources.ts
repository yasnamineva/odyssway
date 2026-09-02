/**
 * Freshness / change-detection (AGENTS.md §11): fetch the configured official
 * sources, hash their content, diff against stored hashes, and write a review
 * report to data/UNVERIFIED/source-changes-{date}.md when something changed.
 *
 * Run weekly via GitHub Action (.github/workflows/watch-sources.yml) or
 * manually: pnpm watch:sources
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface WatchedSource {
  id: string;
  url: string;
  usedBy: string;
}

/** Official URLs whose changes require human review. Extend as data/ees.json grows. */
const SOURCES: WatchedSource[] = [
  {
    id: "ec-short-stay-calculator-manual",
    url: "https://ec.europa.eu/assets/home/visa-calculator/docs/short_stay_schengen_calculator_user_manual_en.pdf",
    usedBy: "engine rules + golden test fixtures",
  },
  {
    id: "ec-short-stay-calculator-page",
    url: "https://home-affairs.ec.europa.eu/policies/schengen/border-crossing/short-stay-calculator_en",
    usedBy: "engine rules, /rules/90-180-rule",
  },
  {
    id: "eu-ees-hub",
    url: "https://travel-europe.europa.eu/ees_en",
    usedBy: "/ees pages (verify URL is still canonical)",
  },
  {
    id: "eu-etias-hub",
    url: "https://travel-europe.europa.eu/etias_en",
    usedBy: "data/etias.json, /etias/status (verify URL is still canonical)",
  },
  {
    id: "ec-ees-policy-page",
    url: "https://home-affairs.ec.europa.eu/policies/schengen/smart-borders/entry-exit-system_en",
    usedBy: "/ees and /ees/what-to-expect content (rollout dates, data collected)",
  },
  {
    id: "ec-schengen-area-page",
    url: "https://home-affairs.ec.europa.eu/policies/schengen/schengen-area_en",
    usedBy: "data/countries.json (membership list, Cyprus status)",
  },
  {
    id: "eulisa-home",
    url: "https://www.eulisa.europa.eu/",
    usedBy: "eu-LISA announcements — EES/ETIAS operational news and official EU traveler app releases (tracked competitive risk per AGENTS.md §11)",
  },
  {
    id: "eeas-visa-free-etias",
    url: "https://www.eeas.europa.eu/eeas/coming-visa-free-country-and-travelling-europe_en",
    usedBy: "data/etias.json (launch window, validity, 30-country scope; fee figure on this page is stale — EUR 20 per Delegated Regulation (EU) 2025/1411)",
  },
  {
    id: "us-vwp-statute",
    url: "https://www.govinfo.gov/content/pkg/USCODE-2023-title8/html/USCODE-2023-title8-chap12-subchapII-partII-sec1187.htm",
    usedBy: "data/entry-requirements.json (US Visa Waiver Program eligibility, stay length, ESTA)",
  },
  {
    id: "us-customs-personal-exemptions",
    url: "https://www.govinfo.gov/content/pkg/CFR-2023-title19-vol2/xml/CFR-2023-title19-vol2-sec148-43.xml",
    usedBy: "data/customs-items.json (US alcohol/tobacco duty-free allowances)",
  },
  {
    id: "uk-standard-visitor",
    url: "https://www.gov.uk/standard-visitor-visa",
    usedBy: "data/entry-requirements.json (UK Standard Visitor route, ETA, stay length, documents)",
  },
  {
    id: "uk-bringing-goods",
    url: "https://www.gov.uk/bringing-goods-into-uk-personal-use/arriving-in-Great-Britain",
    usedBy: "data/customs-items.json (UK alcohol/tobacco/general-goods allowances)",
  },
  {
    id: "ca-eta-eligibility",
    url: "https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=1016&top=16",
    usedBy: "data/entry-requirements.json (Canada eTA eligibility, stay length)",
  },
  {
    id: "ca-customs-alcohol-tobacco",
    url: "https://www.cbsa-asfc.gc.ca/travel-voyage/atl-lat-eng.html",
    usedBy: "data/customs-items.json (Canada alcohol/tobacco/vape allowances). Known to block some automated fetches — a persistent failure here is itself a signal to re-check manually.",
  },
  {
    id: "eu-cash-declaration-regulation",
    url: "http://publications.europa.eu/resource/celex/32018R1672",
    usedBy: "data/customs-items.json (EU €10,000 cash declaration threshold), fetched via the Publications Office CELLAR API (eur-lex.europa.eu itself blocks automated fetching)",
  },
  // --- Non-launch-set destinations added 2026-08-11 through 2026-08-13 (AGENTS.md §12 Phase 1.5) ---
  {
    id: "jp-visa-exemption-list",
    url: "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html",
    usedBy: "data/entry-requirements.json (Japan reciprocal visa exemption list)",
  },
  {
    id: "ke-eta-regulation",
    url: "https://new.kenyalaw.org/akn/ke/act/ln/2024/1/eng@2024-01-19/source.pdf",
    usedBy: "data/entry-requirements.json (Kenya eTA regime, Legal Notice No. 1 of 2024)",
  },
  {
    id: "mx-visa-exemption-list",
    url: "https://www.gob.mx/cms/uploads/attachment/file/67045/Paises_y_regiones_que_requieren_VISA_para_viajar_a_Mexico-Paises_y_regiones_que_no_requieren_VISA_para_viajar_a_Mexico.pdf",
    usedBy: "data/entry-requirements.json (Mexico INM/SRE visa-exemption annex)",
  },
  {
    id: "za-visa-exemption-list",
    url: "https://www.dha.gov.za/index.php/immigration-services/exempt-countries",
    usedBy: "data/entry-requirements.json (South Africa DHA visa exemption list — also watch for the new ETA's eligibility/fee terms once published)",
  },
  {
    id: "th-visa-exemption-list",
    url: "https://image.mfa.go.th/mfa/0/zE6021nSnu/0303/%E0%B8%9C.60.pdf",
    usedBy: "data/entry-requirements.json (Thailand ผ.60 visa-exemption scheme — a cabinet-approved 30/15-day replacement was pending Royal Gazette publication as of verification; check for that specifically)",
  },
  {
    id: "rw-visa-on-arrival",
    url: "https://www.migration.gov.rw/visa-on-arrival",
    usedBy: "data/entry-requirements.json (Rwanda DGIE visa-on-arrival terms by nationality group)",
  },
  {
    id: "eg-evisa-faq",
    url: "https://visa2egypt.gov.eg/eVisa/FAQ",
    usedBy: "data/entry-requirements.json (Egypt e-Visa eligible-nationality list)",
  },
  {
    id: "ng-tourism-visa",
    url: "https://immigration.gov.ng/info-center/tourism-visa-f5a/",
    usedBy: "data/entry-requirements.json (Nigeria Tourism Visa F5A e-Visa terms)",
  },
  {
    id: "ma-visa-exemption-list",
    url: "https://www.consulat.ma/en/list-countries-whose-citizens-are-exempted-entry-visa-morocco",
    usedBy: "data/entry-requirements.json (Morocco visa-exemption list)",
  },
  {
    id: "in-evisa-tvoa",
    url: "https://indianvisaonline.gov.in/evisa/tvoa.html",
    usedBy: "data/entry-requirements.json (India e-Tourist Visa eligible-country list and terms)",
  },
  {
    id: "tr-visa-information",
    url: "https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa",
    usedBy: "data/entry-requirements.json (Turkey visa-exemption regime, Law No. 6458). Note: evisa.gov.tr — the domain named in secondary sources as Turkey's e-Visa portal — currently redirects to a private company; not used as a citation, but worth periodically re-checking.",
  },
  {
    id: "au-eta-subclass-601",
    url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601",
    usedBy: "data/entry-requirements.json (Australia ETA subclass 601 and eVisitor terms)",
  },
  {
    id: "ae-movement-residence-law",
    url: "https://www.gdrfad.gov.ae/themes/gdrfad/content/pdf/Law-of-Movement-and-Residence-of-Aliens-en.pdf",
    usedBy: "data/entry-requirements.json (UAE entry/residence law underlying the visa-exemption list)",
  },
  // --- Destinations added 2026-09-02 (AGENTS.md §12 Phase 1.5 continued) ---
  {
    id: "ph-evisa-policy",
    url: "https://evisa.gov.ph/",
    usedBy: "data/entry-requirements.json (Philippines Executive Order No. 408 visa-waiver country list)",
  },
  {
    id: "cn-nia-visa-free-list",
    url: "https://www.nia.gov.cn/",
    usedBy: "data/entry-requirements.json (China NIA unilateral visa-free list)",
  },
  {
    id: "vn-evisa-portal",
    url: "https://evisa.xuatnhapcanh.gov.vn/",
    usedBy: "data/entry-requirements.json (Vietnam e-Visa portal — unilateral exemption + e-visa nationality lists). Note: newer evisa.gov.vn/thithucdientu.gov.vn domains have broken SSL certs as of verification.",
  },
  {
    id: "nz-nzeta-visa-waiver-list",
    url: "https://www.immigration.govt.nz/new-zealand-visas/visas/visa/nzeta",
    usedBy: "data/entry-requirements.json (New Zealand NZeTA + visa-waiver country list, IVL fee)",
  },
  {
    id: "id-imigrasi-voa-bvk-list",
    url: "https://www.imigrasi.go.id/wna/daftar-negara-voa-bvk-calling-visa",
    usedBy: "data/entry-requirements.json (Indonesia VOA/visa-free/Calling Visa nationality lists — Brazil moved from VOA to visa-free 2026-07-09, worth periodic recheck)",
  },
  {
    id: "sa-evisa-portal",
    url: "https://visa.visitsaudi.com/",
    usedBy: "data/entry-requirements.json (Saudi Arabia eVisa eligible-nationality list)",
  },
  {
    id: "sg-ica-entering-singapore",
    url: "https://www.ica.gov.sg/enter-transit-depart/entering-singapore",
    usedBy: "data/entry-requirements.json (Singapore ICA visa-required country list — exact per-nationality stay lengths for several countries are not published by ICA and were sourced from converging secondary reporting; recheck if precision matters)",
  },
  {
    id: "kr-keta-portal",
    url: "https://www.k-eta.go.kr/",
    usedBy: "data/entry-requirements.json (South Korea K-ETA eligible-nationality list, fee, temporary exemption window through 2026-12-31)",
  },
  {
    id: "br-qgrv-visa-regime",
    url: "https://www.gov.br/pf/pt-br/assuntos/imigracao/prorrogar-estada-no-brasil/qgrv-simples-port-140120.pdf",
    usedBy: "data/entry-requirements.json (Brazil Polícia Federal QGRV visa-regime table — US/CA/AU visa requirement reinstated 2025-04-10 by Decreto 11.982/2025, a repeal bill was pending as of verification; recheck periodically)",
  },
];

const ROOT = join(import.meta.dirname, "..");
const HASHES_FILE = join(ROOT, "data", "source-hashes.json");
const REPORT_DIR = join(ROOT, "data", "UNVERIFIED");

function loadHashes(): Record<string, string> {
  try {
    return JSON.parse(readFileSync(HASHES_FILE, "utf8")) as Record<string, string>;
  } catch {
    return {};
  }
}

async function fetchHash(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "user-agent": "odyssway-source-watch/0.1 (change detection for compliance data)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = Buffer.from(await res.arrayBuffer());
  return createHash("sha256").update(body).digest("hex");
}

const today = new Date().toISOString().slice(0, 10);
const previous = loadHashes();
const next: Record<string, string> = { ...previous };
const changes: string[] = [];
const failures: string[] = [];

for (const source of SOURCES) {
  try {
    const hash = await fetchHash(source.url);
    const old = previous[source.id];
    if (old === undefined) {
      changes.push(`- **${source.id}** — first snapshot recorded (no baseline to diff).`);
    } else if (old !== hash) {
      changes.push(
        `- **${source.id}** — CONTENT CHANGED. Review ${source.url} and re-verify: ${source.usedBy}.`,
      );
    }
    next[source.id] = hash;
  } catch (e) {
    failures.push(`- **${source.id}** — fetch failed (${(e as Error).message}): ${source.url}`);
  }
}

writeFileSync(HASHES_FILE, `${JSON.stringify(next, null, 2)}\n`);

if (changes.length > 0 || failures.length > 0) {
  mkdirSync(REPORT_DIR, { recursive: true });
  const report = [
    `# Source changes — ${today}`,
    "",
    "Official sources changed (or could not be checked). A human must review",
    "each item, update the affected data, and bump `verified_at`.",
    "",
    ...(changes.length > 0 ? ["## Changed", "", ...changes, ""] : []),
    ...(failures.length > 0 ? ["## Fetch failures (URL moved? blocked?)", "", ...failures, ""] : []),
  ].join("\n");
  const reportPath = join(REPORT_DIR, `source-changes-${today}.md`);
  writeFileSync(reportPath, report);
  console.log(`Wrote ${reportPath}`);
  console.log(report);
} else {
  console.log("No source changes detected.");
}
