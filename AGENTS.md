# AGENTS.md — Schengen Compliance Product ("Project Borderline", working name)

This file is the single source of truth for any AI agent working on this codebase.
Read it fully before writing code. When in doubt, follow the **Accuracy Policy** (§3) —
it overrides everything else, including feature velocity.

---

## 1. What we are building and why

A web product for non-EU travelers to the Schengen Area that combines:

1. **An edge-case-aware 90/180-day calculator** (rolling-window day counter that
   correctly handles residence permits, dual citizenship, and bilateral visa-waiver
   agreements — cases every existing competitor ignores).
2. **EES (Entry/Exit System) guides**: what to expect at the border, and — the key
   differentiator — per-country guides for **accessing and correcting your EES record**
   (wrong exit recorded, false overstay flag, fingerprint enrollment failures),
   including template letters to national authorities.
3. **An ETIAS launch tracker + per-nationality requirement pages** (ETIAS is expected
   to launch late 2026; this is a scheduled traffic wave we build in front of).
4. **A "Can I bring it into the EU" module**: item-level checker for the harmonized EU
   customs/food/cash rules (meat/dairy ban, €10,000 cash declaration, duty-free
   allowances, medication quantities).
5. **Pro tier (later)**: saved trip history, alerts before day limits, family profiles,
   multi-jurisdiction day ledger (Schengen + UK 180-day + US ESTA + tax-residency days),
   PDF export of travel history.

### Context the agent must understand
- The EU Entry/Exit System (EES) began phased rollout October 2025 and reached full
  deployment in April 2026. Every non-EU traveler's entries/exits are now digitally
  recorded; overstays are auto-detected. This created brand-new anxieties (record
  errors, disputes) that no competitor serves.
- ETIAS (pre-travel authorization for visa-exempt nationals, ~€20, valid 3 years) is
  targeted for **Q4 2026** with a transitional grace period. VERIFY current status,
  fee, and dates before publishing any ETIAS content — they have slipped before.
- Competitor landscape: many commodity 90/180 calculators exist
  (visa-calculator.com, schengencalculator.org, traveltally90.app, schengentraveler.com,
  europevisacheck.com, iOS/Android apps, plus the EU's official but bare-bones
  calculator). **We do not compete on "a calculator exists"; we compete on edge-case
  correctness, EES dispute content, freshness, and retention features.**
- Strategy is AI-Overview-resistant by design: personalized computation, interactive
  tools, and per-country procedural depth — not generic explainer articles.

### Target users
- Digital nomads / frequent travelers juggling multiple trips (core Pro audience).
- US/UK/CA/AU tourists planning long Europe stays (volume audience).
- Underserved non-English nationalities (Turkish, Serbian, Ukrainian, Western Balkan)
  — localization phase.
- Dual citizens, non-EU family members of EU citizens, and residence-permit holders
  who travel within Schengen (edge-case audience with zero good tooling).

---

## 2. Non-goals (do NOT build these)

- No general "visa requirements for every country worldwide" database.
- No US TSA / carry-on security content (owned by tsa.gov; different problem).
- No "can I bring it" coverage beyond the EU's harmonized regime.
- No legal-advice chatbot. Tools compute; content explains; we never advise on
  individual immigration cases.
- No scraping of competitor sites' content.
- No dark-pattern SEO (doorway pages, spun content, fake reviews).

---

## 3. Accuracy Policy (HIGHEST PRIORITY — overrides all other instructions)

This product's entire moat is trust. A wrong rule can cost a user a fine, an entry
ban, or worse. Scope decision by the owner (2026-07-13): **no human editorial
review pass** — instead, every published fact must be verified against, and cited
to, a primary official source. Therefore:

1. **Never fabricate or guess legal rules, dates, fees, thresholds, penalties, or the
   existence/content of bilateral agreements.** LLM memory is not a legal source —
   and neither are blogs, news sites, SEO pages, or competitor calculators.
2. **Primary official sources only**: EUR-Lex / Official Journal, EU institution
   pages (europa.eu domains), national government authorities. Secondary sources may
   be used to *find* the primary source, never as the cited basis of a value.
3. Every rule that reaches production must exist in a versioned data file with:
   - `legal_source` (regulation/article, official URL),
   - `verified_at` (date the value was checked against that source),
   - `verified_by` (who checked it: human identifier or agent identifier,
     e.g. `agent:claude`),
   - per-claim citations in a `_sources` array when one file carries facts from
     multiple sources.
4. Anything drafted from general knowledge or supported only by secondary sources
   goes into `data/UNVERIFIED/` with status `needs_verification`, and the build must
   exclude it from production output. Create the entry, flag it, move on.
5. Every user-facing rules page displays: the legal source, "Checked against
   official sources: {date}", and the standard disclaimer (see §10). Never imply a
   human/editorial or official review that didn't happen.
6. If a task requires a rule whose primary source you can't reach, implement the
   structure with a placeholder and add a TODO to `data/UNVERIFIED/TODO.md`.
   Do not "fill in something reasonable."
7. The calculator engine may only encode logic whose legal basis is in the
   production data files. Engine behavior for unverified scenarios = explicit
   `"we can't compute this case yet"` response, never a silent guess.
8. Accepted-risk mitigations (since no human reviews): cross-check high-stakes
   values (fees, penalties, procedures) against a second independent official page
   when one exists; run the §11 source watcher weekly; official pages can
   themselves be stale (e.g. EEAS displayed a superseded ETIAS fee in 2026) — when
   two official sources conflict, the legally controlling text (regulation/OJ) wins
   and the conflict gets recorded in `_sources`.

---

## 4. Tech stack and conventions

- **Framework**: Next.js (App Router) + TypeScript, strict mode.
- **Styling**: Tailwind CSS. Component library: shadcn/ui. Mobile-first (most traffic
  is mobile).
- **Content**: MDX files in `/content` for guides; structured rule data in `/data`
  as JSON (never hardcode rules in components).
- **Rendering**: Static generation / ISR for all content and programmatic pages
  (SEO-critical). The calculator runs fully client-side — no account required, no
  trip data sent to the server for anonymous users.
- **Backend (Phase 2+)**: Supabase (Postgres + Auth) for accounts, saved trips,
  alerts. Email via Resend.
- **Analytics**: Plausible (privacy-first, no cookie banner needed for it).
- **Testing**: Vitest for the calculator engine (see §6.6 — tests are mandatory),
  Playwright smoke tests for critical pages.
- **Deploy**: Vercel. Env vars documented in `.env.example`.
- **i18n**: next-intl; default locale `en`; architecture must support locales from
  day one even though translations come in Phase 3. All user-facing strings through
  the i18n layer — no hardcoded copy in components.
- Code style: functional components, no `any`, small pure functions in the engine,
  descriptive names. The engine (`/packages/engine`) must have **zero** framework
  dependencies (pure TS, so it can later power a mobile app / API).

Repo layout:

```
/apps/web            # Next.js app
/packages/engine     # pure-TS Schengen calculation engine + tests
/content             # MDX guides (en/, later bg/, tr/, sr/…)
/data                # verified rule data (JSON) — the crown jewels
/data/UNVERIFIED     # agent-drafted data awaiting human verification
/scripts             # data validation, sitemap gen, change-detection scrapers
```

---

## 5. Data models

All rule data is versioned JSON, validated by Zod schemas in `packages/engine/schemas.ts`.
A CI script (`scripts/validate-data.ts`) must fail the build on schema violations or
on any production reference to `UNVERIFIED` data.

### 5.1 `data/countries.json`
```ts
{
  code: "FR",                    // ISO 3166-1 alpha-2
  name: string,
  schengenMember: boolean,
  schengenSince?: string,        // ISO date — matters for historic trips (e.g. BG/RO joined 2024/2025 air-land phases; VERIFY exact dates)
  euMember: boolean,
  etiasRequired: boolean,        // for visa-exempt nationals, once live
  notes?: string                 // e.g. Cyprus/Ireland special status
}
```

### 5.2 `data/nationality-rules.json`
Per nationality: `visaExempt: boolean`, `etiasApplicable: boolean`,
`schengenVisaRequired: boolean`, plus `legal_source`, `verified_at`.

### 5.3 `data/bilateral-agreements.json`
The high-value edge-case table. Schema:
```ts
{
  id: string,
  nationality: "NZ",             // passport this applies to
  schengenState: "DK",
  effect: "additional_90_days_after_schengen_allowance" | "other",
  conditions: string[],          // e.g. "must enter directly from non-Schengen", "tourism only"
  howToInvoke: string,           // practical procedure, per verified sources
  caveats: string[],
  legal_source: { name: string, url: string },
  verified_at: string, verified_by: string,
  status: "verified" | "needs_verification"
}
```
Known candidates to research (DO NOT publish until verified against primary
sources): New Zealand's bilateral agreements with many Schengen states; reported US
bilateral arrangements with e.g. Denmark, Norway, Poland; possible ones for
CA/AU/JP nationals. Seed these into `data/UNVERIFIED/bilateral-candidates.json`
with `needs_verification`.

### 5.4 `data/overstay-penalties.json`
Per Schengen state: fine ranges, ban ranges, enforcement notes, `legal_source`,
`verified_at`. Drives the `/rules/overstay-penalties/[country]` pages.

### 5.5 `data/ees.json`
Per state: authority responsible for EES data access/correction requests, contact
channel, form/URL, expected timelines, appeal path, language requirements. Drives
`/ees/data-access/[country]` pages + template letters. This data comes from national
data-protection and border authorities; the legal backbone is the EES Regulation
(EU) 2017/2226 (right of access/rectification — VERIFY articles) and GDPR-adjacent
provisions.

### 5.6 `data/etias.json`
Launch status (`announced | live | grace_period`), fee, validity, exemptions
(age brackets), per-nationality applicability, official source URL, `verified_at`.
The `/etias/status` tracker page renders directly from this file so updating one
JSON updates the whole site.

### 5.7 `data/eu-items.json` ("Can I bring it into the EU" module)
```ts
{
  slug: "meat-products",
  names: string[],               // synonyms for search: "salami", "jamón", "biltong"
  category: "food_animal_origin" | "food_plant" | "cash" | "alcohol" | "tobacco" | "medication" | "pets" | "other",
  verdict: "prohibited" | "allowed_with_limits" | "allowed" | "declaration_required" | "depends",
  limits?: { description: string, quantity?: string },
  exceptions?: string[],         // e.g. powdered infant food, special medical foods; limited allowances from specific territories
  appliesTo: "entering_EU_from_non_EU",
  legal_source: { name: string, url: string },   // e.g. Directive 2007/74/EC (traveller allowances), Regulation (EU) 2018/1672 (cash), Regulation (EU) 2019/2122 (personal consignments of animal products) — VERIFY all before publishing
  verified_at: string, verified_by: string, status: "verified" | "needs_verification"
}
```
Scope guard: EU-harmonized rules only. Where member states diverge (e.g. some
medication categories), verdict = `"depends"` + link to national authority. Do not
attempt per-country depth here in v1.

### 5.8 User data (Phase 2, Supabase)
`users`, `profiles` (one user can track family members), `trips`
(`profile_id, entry_date, exit_date, country_code, basis`), `alerts`
(`threshold_days, channel`). Trip `basis` enum:
`visa_free | c_visa | d_visa_or_permit(issuing_country) | bilateral(agreement_id)`.
GDPR requirements in §10 apply.

---

## 6. Calculator engine spec (`packages/engine`)

### 6.1 Core rule
Non-EU nationals under short-stay rules may be present in the Schengen Area at most
**90 days within any rolling 180-day window**. For a reference date `D`, the window
is `[D − 179, D]` inclusive. **Entry day and exit day both count as presence days.**
The window rolls daily; there is no fixed reset.

### 6.2 Inputs
```ts
type Trip = { entry: ISODate; exit: ISODate; country: CountryCode; basis: Basis };
type Query =
  | { kind: "status"; onDate: ISODate }                    // days used/remaining on a date
  | { kind: "planTrip"; entry: ISODate; exit: ISODate }    // is this future trip compliant?
  | { kind: "maxStay"; entry: ISODate }                    // longest compliant stay from entry
  | { kind: "nextEntry"; desiredStay: number };            // earliest entry allowing N-day stay
```

### 6.3 Algorithms
- **Presence set**: expand trips to a set of presence dates. Overlapping trips merge
  (a day counts once even if two trips touch it).
- **status(D)**: `used = |presence ∩ [D−179, D]|`, `remaining = 90 − used`.
- **planTrip(s, e)**: add planned days to presence; the trip is compliant iff for
  **every** day `d ∈ [s, e]`: `|presence ∩ [d−179, d]| ≤ 90`. Report the first
  violating day if any (that's the user's actionable info).
- **maxStay(s)**: iterate `d` from `s` forward, extending the stay day by day until
  the window constraint would break; return count and the forced exit date.
- **nextEntry(N)**: iterate candidate entry dates forward from today; return the
  first date where `maxStay(candidate) ≥ N`.
- Complexity is trivial (windows of 180 ints); prefer clarity over cleverness.

### 6.4 Edge-case handling (the differentiator)
1. **Residence permit / national D visa**: days present in the **issuing** state
   under that permit do NOT consume the 90/180 allowance; days spent in **other**
   Schengen states do. Implement via `basis`: trips with
   `d_visa_or_permit(X)` in country `X` are excluded from the presence set; the UI
   must explain this and link the legal basis. (Encode only after the legal note in
   `data/` is verified.)
2. **Dual citizens**: if one nationality is EU/EEA/CH → 90/180 does not apply;
   the tool should detect this from the nationality picker and say so plainly
   (plus an EES note: which document you travel on determines what gets recorded —
   content page, not engine logic).
3. **Bilateral agreements**: when a verified agreement exists for
   (nationality, state), the planner may model a post-Schengen extension stay in
   that state under `basis: bilateral(id)`, excluded from the 90/180 count but
   subject to the agreement's own limit. UI must show heavy caveats + the
   `howToInvoke` procedure. If agreement status ≠ `verified`, this option must not
   appear.
4. **Non-Schengen Europe**: days in UK, Ireland, Cyprus (until full Schengen
   application — VERIFY current status), Albania, Serbia, etc. never count.
   Country picker must make this obvious (it's a top user confusion).
5. **Historic accession dates**: a 2024 trip to Bulgaria/Romania may count
   differently than a 2026 one depending on accession phase dates
   (`schengenSince` in countries.json). Engine must consult per-date membership.

### 6.5 Outputs must be actionable
Every result includes: days used, days remaining, **next safe entry date**,
**latest safe exit date** for a planned trip, and a plain-language sentence
(e.g. "You can stay until 14 Sep 2026. Entering as planned on 1 Aug, your window
breaks on 15 Sep."). Include a shareable/exportable summary (URL-encoded state;
no server storage for anonymous users).

### 6.6 Tests (mandatory before any UI work)
- Unit tests for every algorithm and edge case above, including: overlapping trips,
  trips straddling the 180-day boundary, entry=exit same-day trips, leap years,
  timezone-free date math (use date-only arithmetic; never `Date` with local TZ).
- **Golden tests**: reproduce the worked examples from the European Commission's
  official short-stay calculator user guide (the "KOM" test cases on
  ec.europa.eu — fetch them during development and encode as fixtures). Our engine
  must match the official calculator's results on all of them.
- Property test: removing a day of presence never decreases `remaining`.

---

## 7. Site architecture, pages, and keyword map

URL structure (locale-prefixed later: `/bg/…`, `/tr/…`, `hreflang` everywhere):

| Route | Purpose / primary keywords |
|---|---|
| `/` | Calculator front and center + trust signals. KW: "schengen calculator", "90/180 day rule calculator" |
| `/calculator` | Canonical tool URL (same component), FAQ + HowTo schema |
| `/rules/90-180-rule` | Definitive plain-language explainer feeding the tool. KW: "schengen 90 180 rule explained" |
| `/rules/overstay-penalties/[country]` | Programmatic, from verified data. KW: "overstay schengen fine {country}" |
| `/guides/residence-permit-holders` | Edge case. KW: "residence permit travel other schengen countries 90 days" |
| `/guides/dual-citizens` | KW: "dual citizen which passport schengen ees" |
| `/rules/bilateral-agreements/[nationality]` | Only for verified rows. KW: "{nationality} bilateral agreement schengen stay longer than 90 days" |
| `/ees` | Hub. KW: "EU entry exit system explained" |
| `/ees/what-to-expect` | Border procedure, kiosks, kids, fingerprints. KW: "EES airport what to expect" |
| `/ees/my-record` | How to access your EES data. KW: "check my EES record" |
| `/ees/data-access/[country]` | Programmatic: authority, form, template letter, timeline. KW: "EES data correction {country}", "EES wrong exit recorded" |
| `/ees/dispute-overstay` | KW: "EES says I overstayed but I didn't" |
| `/etias/status` | **Launch tracker** — renders from `data/etias.json`, updated frequently. KW: "is ETIAS live", "ETIAS start date" |
| `/etias/[nationality]` | Programmatic. KW: "ETIAS for {nationality} citizens" |
| `/bring` | EU items module hub. KW: "what can I bring into the EU" |
| `/bring/[item]` | Programmatic from `eu-items.json`. KW: "can I bring {item} into the EU/Europe" |
| `/tracker` | Phase-2 app (accounts, alerts, Pro) |
| `/about`, `/methodology`, `/sources` | Trust pages: how we verify, full source list |

Rules for programmatic pages (anti-thin-content):
- A page ships only if its data row is `verified` AND it renders ≥ some unique
  substance (verdict, limits, procedure, sources, related items). Otherwise 404 —
  never publish placeholder pages.
- Interlink: every content page has a CTA into the relevant tool; every tool result
  links the pages explaining the rules it applied.
- Structured data: `FAQPage` on explainers, `HowTo` on procedures,
  `BreadcrumbList` sitewide, `WebApplication` on tool pages. `lastmod` in sitemap
  from `verified_at`.

---

## 8. Content style guide

- Plain language, ~8th-grade reading level. Short sentences. Second person.
- Every rules page: answer-first summary box (2–3 sentences) → details → sources.
- Always show: legal source name + link, "Checked against official sources: {date}".
- Never copy text from competitors or paste regulation text wholesale; paraphrase
  with citation.
- Tone: calm and precise. No fear-mongering headlines, even though the topics are
  anxiety-driven — trust is the brand.
- Template letters (EES disputes): provide EN + official-language versions,
  placeholders in `{curly_braces}`, and a short "how to send" note per country.

---

## 9. Monetization hooks (build the slots, even before partnerships exist)

- Affiliate slot component `<PartnerOffer context="...">` with contexts:
  `travel_insurance` (highest intent: Schengen visa applicants MUST have insurance),
  `esim`, `visa_service` (for visa-required nationalities on /etias and nationality
  pages). Config-driven; render nothing if no partner configured. Mark links
  `rel="sponsored"`; add a visible "affiliate disclosure" note + page.
- Pro feature flags (Phase 2): saved profiles, alerts, PDF travel-history export,
  multi-jurisdiction ledger. Free tier must remain genuinely useful (calculator
  never paywalled — it's the acquisition engine).
- No display-ad networks in v1 (they wreck trust and Core Web Vitals).

---

## 10. Legal, privacy, compliance

- Sitewide disclaimer (footer + tool results): informational only, not legal advice,
  verify with official authorities; we are not affiliated with the EU.
- **GDPR** (we're EU-based and serve EU-adjacent users): anonymous calculator = all
  client-side, nothing stored server-side. Accounts: trip history is personal data —
  data minimization, export + delete self-service endpoints, privacy policy, DPA
  with Supabase/Resend, EU region hosting for the DB. No third-party cookies;
  Plausible for analytics.
- Don't imply the tool's output is an official determination; wording like
  "estimated days remaining" + link to the official EU calculator for
  cross-checking (this also builds trust).

---

## 11. Freshness & change-detection (the moat)

- `scripts/watch-sources.ts`: fetch a configured list of official URLs (EU
  Commission EES/ETIAS pages, national border/DPA pages used in `data/ees.json`),
  hash the content, diff against stored hashes, open a report in
  `data/UNVERIFIED/source-changes-{date}.md` when something changes. Run via cron
  (GitHub Action, weekly).
- Any source change → re-check the value against the (possibly moved/updated)
  official source → bump `verified_at` → sitemap `lastmod` updates automatically.
- The `/etias/status` page is the fastest-moving asset; design it so a single JSON
  edit + deploy updates everything (banner, per-nationality pages, FAQ answers).

---

## 12. Build phases and acceptance criteria

**Phase 0 — Foundation (do first)**
- Monorepo scaffold, CI (typecheck, tests, data validation), deploy pipeline.
- Engine complete with full test suite incl. official golden cases. ✅ when: all
  tests pass; engine README documents every rule with its data-file legal source.

**Phase 1 — Public launch surface**
- Calculator UI (mobile-first, shareable results), `/rules/90-180-rule`,
  `/ees` hub + `what-to-expect` + `dispute-overstay`, `/etias/status`,
  `/about` + `/methodology` + `/sources`, disclaimers, schema.org, sitemap,
  Plausible. ✅ when: Lighthouse ≥ 95 perf/SEO/accessibility on mobile; zero
  unverified data rendered.

**Phase 2 — Depth + retention**
- `data/ees.json` for first 5 countries (suggest: FR, ES, DE, IT, NL — highest
  traveler volume) → `/ees/data-access/[country]` + template letters.
- Programmatic `/etias/[nationality]` for top 15 visa-exempt nationalities.
- Accounts (Supabase), saved trips, email alert at N days remaining. GDPR
  export/delete. ✅ when: a user can save trips, get an alert, delete account fully.

**Phase 3 — Expansion**
- `/bring` module (top 25 items), overstay-penalties pages, bilateral-agreements
  pages (verified rows only), Pro gating + Stripe, locales (bg, tr, sr) with
  hreflang. ✅ when: item pages render only verified rows; locale switcher +
  translated engine strings work.

Work order within any phase: data schema → data (verified or UNVERIFIED) →
engine/logic → tests → UI → content → SEO wiring.

---

## 13. Things agents get wrong — explicit guardrails

1. Don't compute dates with `new Date()` local-timezone arithmetic. Date-only math
   (e.g. `Temporal.PlainDate` or a tiny date-int utility). One off-by-one here is a
   user's overstay.
2. Don't render any rule whose data row lacks `verified_at`. The build must fail,
   not warn.
3. Don't invent bilateral agreements, penalty amounts, ETIAS fees/dates, EES
   authority contacts, or customs thresholds. UNVERIFIED file + TODO.
4. Don't blend "Schengen Area", "EU", and "Europe" — membership differences are
   the product. Always resolve through `countries.json`.
5. Don't add a cookie banner "just in case" — we architected to not need one;
   adding tracking requires a human decision.
6. Don't paywall or degrade the free calculator.
7. Don't generate filler blog posts. Every page must map to a row in §7's table or
   be explicitly approved.
