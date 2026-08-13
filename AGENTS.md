# AGENTS.md — Trip Compliance Platform ("Odyssway")

This file is the single source of truth for any AI agent working on this codebase.
Read it fully before writing code. When in doubt, follow the **Accuracy Policy** (§3) —
it overrides everything else, including feature velocity.

---

## 1. What we are building and why

A web product that answers one question directly: **I'm from ⟨nationality⟩, going to
⟨destination⟩, bringing ⟨items⟩ — can I go, for how long, what do I need, and can I
bring it?** (rearchitected 2026-08 from a Schengen-only tool into this general
front door; see §14 for why the calculator alone was not a durable enough product).
The flagship flow (`/`, §7) resolves, per destination:

1. **Entry eligibility** — visa-free, ETA-required, visa-required, or visa-on-arrival,
   for the destination.
2. **Allowed stay length** — a generalized `StayPolicy` (§6.7): the Schengen rolling
   90/180 window for Schengen destinations, or a flat per-entry limit (the pattern
   most of the rest of the world uses — US VWP, UK Standard Visitor, Canada eTA, etc.).
3. **Required documents** — passport validity, proof of funds/onward travel, and
   similar entry conditions, per destination.
4. **Customs "can I bring it"** — item-level verdicts (alcohol, tobacco, cash,
   medication, CBD/cannabis, food of animal/plant origin, e-cigarettes, weapons,
   drones) for the specific destination, not just the EU.

This combines what used to be five separate mid-funnel products into one flow, built
on top of:

1. **An edge-case-aware Schengen 90/180-day calculator** (rolling-window day counter
   that correctly handles residence permits, dual citizenship, and bilateral
   visa-waiver agreements — cases every existing competitor ignores). This remains
   our deepest, most-verified destination module, reachable directly at `/calculator`
   for travelers who need multi-trip tracking, and linked from Schengen results in the
   general flow.
2. **EES (Entry/Exit System) guides**: what to expect at the border, and — a key
   differentiator — per-country guides for **accessing and correcting your EES record**
   (wrong exit recorded, false overstay flag, fingerprint enrollment failures),
   including template letters to national authorities.
3. **An ETIAS launch tracker + per-nationality requirement pages** (ETIAS is expected
   to launch late 2026; opportunistic upside, not foundational — see the note below).
4. **A general "can I bring it" module** (§5.11): item-level checker per destination,
   not limited to the EU's harmonized regime. Launch coverage is curated and
   expanding — see §2 for how uncovered pairs are handled honestly.
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
  **ETIAS is opportunistic upside, not foundation** (competitive red-team, 2026-07):
  launch timing has slipped repeatedly, and when it launches, generic queries
  ("is ETIAS live", "ETIAS cost") will largely be answered by official sources and
  AI Overviews. Our ETIAS assets target the **long tail** ("ETIAS rejected what now",
  nationality + residence-permit combinations) and freshness. The business case must
  close on the evergreen calculator + EES demand alone; ETIAS traffic is a bonus.
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

- **No claim of exhaustive global coverage.** The (nationality × destination) and
  (destination × item) matrix is curated and grows over time — never assembled by
  guessing at the shape of a country's immigration/customs regime. A pair is either
  `verified` (§3) or it renders the honest "not yet covered — here's the official
  source to check yourself" state. This replaces the old blanket "no visa database" /
  "no can-I-bring beyond the EU" non-goals (2026-07 scope) now that general coverage
  is the point — the constraint moved from *scope* to *honesty about scope*.
- No US TSA / carry-on security content (owned by tsa.gov; different problem).
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

### 5.7 `data/eu-items.json` — SUPERSEDED by 5.11 `data/customs-items.json`

Never built. Superseded 2026-08 by the destination-keyed `customs-items.json` below,
which generalizes the same idea beyond the EU. Kept here only so the section numbers
below stay stable; do not build this file.

Original spec, for reference:
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

### 5.9 `data/destinations.json` (non-Schengen destinations)
Metadata for destinations outside the Schengen Area — Schengen members already live
in `countries.json` and are never duplicated here.
```ts
{
  code: string,                  // ISO 3166-1 alpha-2
  name: string,
  region: string,
  officialAuthorityUrl: string,  // fallback link when a pair isn't covered yet
  legal_source, verified_at, verified_by, status
}
```

### 5.10 `data/entry-requirements.json` (nationality × non-Schengen destination)
The general entry-eligibility matrix. Schengen destinations are **not** looked up
here — they resolve from the existing `nationality-rules.json` + `countries.json` +
`etias.json`, so an already-verified fact is never duplicated into a second file.
```ts
{
  nationality: string, destination: string,     // both ISO alpha-2
  requirement: "visa_free" | "eta_required" | "visa_required" | "visa_on_arrival",
  stayPolicy: StayPolicy,        // §6.7
  documentsNeeded: string[],
  notes?: string,
  legal_source, verified_at, verified_by, status
}
```

### 5.11 `data/customs-items.json` (destination × item category)
Generalizes the never-built `eu-items.json` (5.7) to any destination, keyed by
destination code. The sentinel code `"EU"` is used for the EU/Schengen-harmonized
customs rules (the same allowances apply across every Schengen member).
```ts
{
  slug: string, names: string[],   // search synonyms
  destination: string,             // ISO alpha-2, or "EU" for the harmonized EU regime
  category: "alcohol" | "tobacco" | "cash" | "medication" | "cbd_cannabis"
    | "food_animal" | "food_plant" | "e_cigarettes" | "weapons" | "drones" | "other",
  verdict: "prohibited" | "allowed_with_limits" | "allowed" | "declaration_required" | "depends",
  limits?: { description: string, quantity?: string },
  notes?: string,
  legal_source, verified_at, verified_by, status
}
```

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

### 6.6 `StayPolicy` — generalizing "how long can I stay" beyond Schengen
Most of the world does not use a rolling window: it uses a flat per-entry limit
(US VWP 90 days, UK Standard Visitor up to 6 months, Canada visitor status up to
6 months, each judged per entry with no lookback across other trips). `packages/
engine/src/stay-policy.ts` expresses this as a discriminated union so the trip-check
resolver (§7 `/`) can share one type across destinations:
```ts
type StayPolicy =
  | { kind: "rolling_window"; windowDays: number; maxDays: number }  // Schengen: 180/90
  | { kind: "fixed_per_entry"; maxDays: number }
  | { kind: "visa_required" };                                       // no automatic duration
```
`rolling_window` is handled entirely by the existing §6.1–§6.5 engine — nothing about
that engine changes. `fixed_per_entry` is evaluated by `evaluateSimpleStay()`, a
one-line comparison with no lookback. `visa_required` means the engine computes no
number at all; the visa's own terms decide the stay, and the UI must not display a
day count for it.

### 6.7 Tests (mandatory before any UI work)
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
| `/` | **Marketing landing page** (2026-08): hero + tool cards linking `/trip-check` and `/calculator` — not a tool itself. Named, icon-forward cards so the two tools read as distinct products, not one blended flow. KW: "schengen travel requirements checker", "can I travel to {destination}" |
| `/trip-check` | **"Trip Check"** — the canonical trip-check tool (named and given its own nav entry 2026-08, moved off `/`): "I'm from ⟨X⟩, going to ⟨Y⟩, bringing ⟨Z⟩" — resolves entry eligibility, stay length, documents, and item verdicts (§5.9–5.11, §6.6). Uncovered pairs render the honest not-yet-verified state, never a guess. KW: "can I travel to {destination}", "what can I bring to {destination}" |
| `/calculator` | The Schengen 90/180 deep-dive — **retained as-is**, not rewritten. Reached directly, from the header nav, and linked from Schengen results on `/trip-check`. FAQ + HowTo schema. KW: "schengen calculator", "90/180 day rule calculator" |
| `/destinations/[slug]` | Programmatic per-destination hub (verified destinations only, §5.9): entry requirements by nationality + item verdicts for that destination. KW: "{destination} entry requirements", "what can I bring to {destination}" |
| `/rules/90-180-rule` | Definitive plain-language explainer feeding the Schengen tool. KW: "schengen 90 180 rule explained" |
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
| `/bring/[item]` | Phase 3, optional: standalone SEO landing pages generalizing `customs-items.json` (§5.11) item results beyond the inline results already on `/` and `/destinations/[slug]`. KW: "can I bring {item} to {destination}" |
| `/tracker` | Phase-2 app (accounts, alerts, Pro) |
| `/about`, `/methodology`, `/sources` | Trust pages: how we verify, full source list |
| `/changelog` | **Verification changelog**: public, chronological log of every rule-data change (what changed, why, source link, `verified_at`, `verified_by`). Rendered **automatically** from the versioned data files (derive from git history or a dedicated changelog JSON — implementer's choice, but never hand-maintained). |
| `/faq` | General trust/how-it-works questions (not per-rule FAQs, which live on their own pages per §6.7/existing `rulesFaq` pattern) — legal-advice disclaimer, verification method, coverage gaps, privacy, pricing. `FAQPage` schema. |
| `/blog` + `/blog/[slug]` | **Explicitly approved exception to the §13.7 no-filler-posts rule**: every post exists because of a real, already-verified change in our own data (`apps/web/lib/blog.ts` pairs each post with the `legal_source` + `verified_at` that justify it) — regulation changes we caught (new destination policy, EES/ETIAS milestones) or transparency posts about our own verification process. MDX bodies in `content/en/blog/`, explanatory/no-fear tone (§8). Never a post that isn't traceable to a citation. |
| `/widget` | Embed instructions for the embeddable calculator (Phase 3): iframe or script embed for travel blogs / expat sites, with a "powered by" backlink |

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
- Every rules page links to its own entries in `/changelog` ("see update history").
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
- Watched sources must also include: **eu-LISA announcements** and any **official
  EU traveler app releases** (the EU shipping better official tooling is a tracked
  competitive risk), plus the **official ETIAS site** for launch-status changes.
- **Known gap (as of 2026-08-13)**: the 13 non-launch-set destinations added since
  Phase 1.5's original US/GB/CA (§12) — Japan, Kenya, South Africa, Mexico,
  Thailand, Rwanda, Nigeria, Egypt, India, Turkey, Morocco, Australia, UAE — are
  not yet in `scripts/watch-sources.ts`'s `SOURCES` list, so their pages aren't
  covered by the weekly diff yet. Add each destination's key source URLs (from its
  `legal_source`/`officialAuthorityUrl` fields and the research notes in
  `data/UNVERIFIED/TODO.md`) before relying on the watcher for freshness on these
  rows. Two destinations flagged their own rules as unusually time-sensitive and
  worth checking sooner than the weekly cadence regardless: Thailand (a
  cabinet-approved visa-exemption cut not yet gazetted) and South Africa (its ETA
  launched 2026-08-12 with eligibility/fee still unconfirmed on any primary
  source).
- The `/changelog` (§7) is part of this moat: cloned competitors can fake a
  "verified" badge but cannot fake a consistent public update history. The
  changelog makes our verification legible to users, journalists, search engines,
  and AI systems that decide what to cite.
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
  Plausible.
- `data/ees.json` for the first 5 countries (FR, ES, DE, IT, NL — highest
  traveler volume) → programmatic `/ees/data-access/[country]` pages +
  **downloadable** template letters (EN + official language). *Moved up from
  Phase 2 (competitive red-team, 2026-07): this wedge is a first-mover race —
  content authorities (SchengenVisaInfo-class sites) can outrank us within
  weeks of noticing the demand, so page age and backlink accumulation must
  start at launch.*
- ✅ when: Lighthouse ≥ 95 perf/SEO/accessibility on mobile; zero unverified
  data rendered; **5 dispute-guide pages live with verified authority data and
  downloadable templates**.

**Phase 1.5 — General trip-check (2026-08 rearchitecture)**
- Trip-check front door (§1, §7): nationality × destination × items → entry,
  stay, documents, customs, via `apps/web/lib/trip-check.ts`. `/calculator`
  untouched, reached from Schengen results.
- `StayPolicy` engine generalization (§6.6) + `data/destinations.json`,
  `entry-requirements.json`, `customs-items.json` (§5.9–5.11).
- Launch coverage, curated and expanded from here: Schengen Area (reuses existing
  verified data), United States, United Kingdom, Canada — chosen for
  well-documented, English-language, single-authority official sources. Grown since
  (2026-08-11 through 2026-08-13, in three research batches) to **16 destinations**:
  US, GB, CA, Japan, Kenya, South Africa, Mexico, Thailand, Rwanda, Nigeria, Egypt,
  India, Turkey, Morocco, Australia, UAE — each with the full 15-nationality entry
  requirement matrix and per-destination customs verdicts, every row individually
  cited (see `data/UNVERIFIED/TODO.md` for the per-destination research notes,
  including source-reachability findings worth reading before picking the next
  batch). Brazil is the only destination still queued (`data/UNVERIFIED/
  destinations.json`). Everything outside this set, and any nationality outside the
  existing 15-nationality roster, renders the honest not-yet-covered state, never a
  guess.
- `/destinations/[slug]` programmatic hub, verified destinations only.
- **Given its own name and route** (2026-08): the tool is named "Trip Check",
  moved to `/trip-check` with its own header nav entry, and `/` became a
  proper marketing landing page (hero + named tool cards for both products)
  instead of being the tool itself. The homepage also surfaces a live, computed
  "N destinations verified" trust badge (`coveredDestinationCount` in
  `apps/web/lib/destinations.ts`, linked to `/sources`) — counts destinations with
  at least one verified entry-requirement row, not just a `destinations.json` stub,
  so it can never overstate coverage mid-research-pass.
- ✅ when: launch destinations resolve real entry + stay + document + item data
  with citations; every other destination in the picker is visibly "coming soon"
  and resolves to the not-covered state, never a fabricated answer. (Met at launch
  for the original four; the bar carries forward for every destination added since.)

**Phase 2 — Depth + retention**
- **Lightweight retention, early and DEFENSIVE (not a monetization feature)**.
  *Rationale (competitive red-team, 2026-07): general-purpose AI assistants can
  replicate one-off day calculations, but cannot offer persistence, proactive
  alerts, deterministic verified computation, or exportable artifacts — this
  layer is the primary long-term moat.*
  - ✅ **Shipped, client-only (2026-08)**: "border-proof PDF" export
    (`lib/report-lines.ts` + jsPDF, one shared line-builder feeds both the PDF
    and the existing clipboard report — never two sources of truth for the
    wording); a passport-expiry reminder and an "approaching your 90-day
    limit" warning, each backed by a one-click `.ics` calendar download
    (`lib/ics.ts`) so the reminder lives in the user's own calendar app. All
    of this is opt-in, stored only in `localStorage` (same toggle as "remember
    my trips"), and requires no account, no email, and no server — it does
    not touch the architecture in §4/§10 ("no trip data sent to the server
    for anonymous users").
  - **Still open, and a materially bigger decision** (needs an actual backend
    decision, not just a UI addition): **email-based** day-threshold alerts,
    saved trips synced across devices, and accounts. This is the part of
    Phase 2 that requires Supabase + Resend (§4) and a GDPR review (§10) —
    don't start it opportunistically off a UI request; it needs its own
    explicit go-ahead given the privacy-architecture change it represents.
- Programmatic `/etias/[nationality]` for top 15 visa-exempt nationalities.
- Accounts (Supabase), GDPR export/delete. ✅ when: a user can save trips
  server-side, get an email alert, and delete their account fully (the
  client-only PDF/reminders above already satisfy the export/reminder half of
  the original acceptance criterion without needing this).

**Phase 3 — Expansion**
- `/bring/[item]` standalone landing pages (top 25 items across launch
  destinations), overstay-penalties pages, bilateral-agreements pages (verified
  rows only), Pro gating + Stripe, locales (bg, tr, sr) with hreflang. Continue
  expanding `entry-requirements.json`/`customs-items.json` destination coverage
  beyond the current 16-destination set (§12 Phase 1.5) — Brazil is next, already
  queued in `data/UNVERIFIED/destinations.json`; after that, prioritize by
  traffic/tourism volume and by source-reachability signal from prior research
  passes (see `data/UNVERIFIED/TODO.md`'s per-destination "source-quality note"
  entries — e.g. Rwanda and South Africa were unusually clean, several
  government sites need a Wayback-Machine-plus-live-cross-check workaround for
  Cloudflare/Akamai-blocked pages).
- **Embeddable calculator** (iframe or script embed) that travel blogs and
  expat sites can install, with a "powered by" backlink; embed instructions at
  `/widget` (§7). *Rationale: reduces dependence on organic search rankings by
  generating durable backlinks and referral traffic.*
- ✅ when: item pages render only verified rows; locale switcher + translated
  engine strings work; the widget renders on a third-party page with a working
  backlink.

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

---

## 14. Competitive posture

The 2026-08 rearchitecture (§1) moved us from a single-purpose Schengen calculator
to a general trip-check platform, because a single-purpose tool — however good —
is a feature competitors and general-purpose AI assistants can eventually match.
This also puts us next to a broader field: iVisa, Sherpa, VisaGuide.World, Wanderlog's
"requirements" panels, and Google's own "before you go" surfaces. The response is
the same one that already worked for the Schengen-only product: don't try to win on
breadth-of-claims (nobody can verify the whole world at once, and pretending to is
how competitors get things wrong) — win by being the one place where every claim is
cited, dated, and never a guess.

What we deliberately do **NOT** compete on:
- Generic informational queries owned by content authorities ("what is the
  Schengen Area", "do I need a US visa") — that traffic is theirs and AI
  Overviews' now.
- "A calculator/checker exists" as an identity — the commodity tool is table
  stakes, not a product.
- **Breadth of claimed coverage.** iVisa- and Sherpa-class competitors answer for
  every country pair immediately, often by inference or stale data. We answer for
  fewer pairs, correctly, with a citation — and say "not yet verified" everywhere
  else (§2). This is a deliberate trade, not a temporary gap to hide.
- App-store distribution — we don't fight the iOS/Android calculator apps on
  their turf in v1.

The durable moats, in priority order:
1. A **verified legal data corpus with a public changelog** (§7 `/changelog`, §11) —
   now spanning entry requirements, stay policy, and customs items, not just
   Schengen dates.
2. The **edge-case engine with cited legal basis** (permits, accession dates,
   bilateral bases, and now `StayPolicy` per destination — each rule traceable to
   a regulation or official-source article).
3. **Per-country EES dispute procedures + template letters** (first-mover wedge).
4. **Persistence, alerts, and exportable artifacts** (Phase 2 — what one-off AI
   answers can't do).
5. **Freshness infrastructure** (§11 source watching + fast single-JSON updates).
6. **Honesty about coverage gaps as itself a trust signal** — a visibly curated,
   growing, cited matrix reads as more credible than a competitor's silent guess
   at full coverage, once a user has been burned by one wrong answer.

Features can be cloned in a weekend; a continuously verified, publicly
auditable legal data corpus cannot.
