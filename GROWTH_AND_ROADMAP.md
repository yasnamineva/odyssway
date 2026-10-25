# Odyssway: Growth Plan and Long-Term Roadmap

Rewritten 2026-10-25. This file lists only what is still ahead; finished work lives in git
history and on `/changelog`. It is a working plan, not a rulebook: AGENTS.md governs how
anything gets built, and its Accuracy Policy (§3) comes before everything here. Topics
listed as *candidates* are research leads, not verified rules, and none can be published
without a primary official source.

Where we are today (2026-10-25):

- 61 destinations plus the Schengen Area; 1,275 verified entry rows; 595 customs rows
  (131 medication, 35 with a doctor's-letter checklist, 17 with a permit how-to, 20 with
  a transit rule); 400 entry rows with a structured passport-validity rule.
- Tools: Trip Check (multi-country route, passport check per stop), the 90/180
  calculator, the multi-country day counter, named-medicine pages, border cards,
  embeddable calculator and "Can I bring it?" widgets, the public JSON API.
- About 2,000 URLs in the sitemap. Google indexes well; Bing indexes the pages but shows
  them rarely (young domain, few links).
- No analytics, by design.

---

## 1. Where we can win

General AI answers handle the generic question well ("Do Americans need a visa for
Japan?"). They are weak in five places, and each one is a direction for us:

1. **Specific combinations.** The answer changes with passport × destination × item ×
   situation (visitor or resident, carried or posted, with or without a prescription).
   Keep splitting rows wherever the official source does.
2. **Recent changes.** Models are trained on old data. Every rule change becomes a dated,
   cited update within days, pushed to IndexNow the same day.
3. **Procedures and lead times.** "You may need a permit" is not an answer. Which form,
   which office, how many weeks ahead, and what happens without it.
4. **Legal at home, controlled abroad.** Candidates to research: codeine combinations,
   levmetamfetamine inhalers, sleep aids, nicotine pouches, compounded GLP-1s, CBD.
5. **Transit.** Hub airports (Dubai, Doha, Istanbul, Singapore) only where the authority
   states the transit rule explicitly.

---

## 2. Tools to build next

Tools are the part AI answers can't copy: they compute from the user's own dates and
items, deterministically, from verified rows. In priority order:

1. **Medication travel planner.** "My medicines + my route + my dates" → for each country:
   the verdict, the supply limit, the merged doctor's-letter checklist, which permits are
   needed and an **"apply by" date** computed from the travel date and the lead time the
   authority states. It joins three things we already have (medication rows, letter
   checklists, permit procedures) and it's the core of the medication wedge.
   - Needs: a structured `leadTimeDays` on procedures (only where the source states it).
2. **Rule-change feeds, no account needed.** An RSS/Atom feed per destination and per item
   category, generated from `changelog.json` at build time. People subscribe in their own
   reader or email-to-RSS service; we store nothing. This is retention without accounts.
3. **"Which passport should I use?" for dual citizens.** Pick two passports and a
   destination; see both rows side by side (entry, stay, documents, passport validity).
   Dual citizens are a named target audience (AGENTS.md §1) and nobody serves this well.
4. **Shareable Trip Check links.** Encode the route and items in the URL (as the calculator
   already does) so a result can be sent to a travel partner, a doctor or a study-abroad
   office. No server storage.
5. **Whole-trip "before you go" pack.** One printable page per trip: entry requirement and
   documents per stop, passport check, item verdicts, letters and permits, all with
   sources and check dates. Built in the browser like the existing PDF export.
6. **Calendar-year stay rule.** The engine type is written and tested (patch saved during
   the Mauritius work). Merge it the first time an official source states a
   calendar-year cap for visa-free visitors.

Later, if demand shows up in Search Console or item-miss data: an overstay-consequences
page per country (needs verified penalty data), and a cash-declaration converter
(threshold in local currency vs. what you carry; exchange rates would need a cited source).

---

## 3. Expansion

### 3.1 Destinations

Pick by traffic and source reachability, not by map coverage.

- **Blocked, with what would unblock them:**
  - Kazakhstan, Laos, North Macedonia, Kuwait, Pakistan, Nepal: official sites are
    JavaScript apps or refuse connections. Retry periodically; a readable official PDF or
    legal-database text unblocks each.
  - Moldova: list readable, stay rule only in Law 200/2010 (legis.md blocked).
  - Kosovo, Paraguay, Barbados, Brunei, Uganda: list missing, archived or contradictory.
- **Next candidates to probe:** Bahrain, Oman, Tunisia, Namibia, Botswana, Zimbabwe,
  Ethiopia, Cuba, Guatemala, Panama, Bolivia, Kyrgyzstan, Azerbaijan, Brunei.
- **Held rows inside covered destinations** (China in Uzbekistan and Macao, Ukraine in
  Uzbekistan and Mongolia, 48 August rows with unreachable sources): see
  `data/UNVERIFIED/TODO.md`.

### 3.2 Nationalities

Each new passport adds a row in every destination, so this multiplies coverage. Choose
from Search Console country data. Likely candidates: Philippines, Indonesia, Turkey,
South Africa, Nigeria, Poland, Portugal, Vietnam, Pakistan. Add one at a time, filling all
61 destinations before announcing it.

### 3.3 Customs depth

- Customs rows for destinations that have none or very few: Mongolia, Macao (tobacco and
  alcohol pending a check of Chief Executive Order 255/2016), Ghana and Zambia cash,
  Seychelles medicine.
- **Second vertical after medication**, chosen from data (§5): CBD and cannabis, food,
  nicotine and vapes, or drones. Go deep on one before starting the next.

---

## 4. Competitive advantages: how to deepen them

The asset is the accumulated, maintained corpus plus its public history (AGENTS.md §14).
Ways to make that harder to copy and easier to trust:

1. **Freshness as a promise.** Publish a target ("rule changes reflected within 7 days of
   the official source") and measure it from the source watcher against `/changelog`.
2. **Re-verification cadence.** Every row re-read at least every 6 months; show the
   oldest check date on `/sources`. A competitor can copy today's data, not the history.
3. **Exception awareness.** Keep splitting by situation (resident vs visitor, carried vs
   posted). Each split is an answer nobody else gives correctly.
4. **Computation on top of data.** The tools in §2 turn rows into personal answers with
   dates. That's what one-off AI answers and static competitor pages can't match.
5. **Distribution through embeds and the API.** Every embedded widget is a backlink and a
   channel; every API user is a reason to keep the data clean.
6. **Honest coverage.** "Not verified yet" with an official link builds more trust than a
   guess. Keep it visible.

---

## 5. SEO and reach

### 5.1 Measure without breaking the privacy promise

| Signal | Where | Use |
|---|---|---|
| Queries, impressions, CTR, position | Google Search Console, Bing Webmaster | What we show up for; pages seen but not clicked |
| Unmatched item searches | `/api/item-miss` | Research queue |
| Referring domains | Search Console links, Bing backlinks | Whether outreach works |

Monthly: export top queries; rewrite titles and descriptions for page-1/2 results with low
CTR; add the most-requested unmatched items to research.

### 5.2 On-site

- **Headings that match searches.** Test putting the query words in hub H1s
  ("Japan entry requirements and customs rules" instead of "Travelling to Japan"); Bing
  weights literal matches more than Google. Owner decision pending.
- **Internal links:** every destination hub links its top item pages and named medicines;
  every pair page links the same passport's neighbouring destinations; no orphan pages.
- **Structured data:** FAQ on pair and medication pages (done for some), HowTo on every
  permit procedure, Dataset on `/developers`. Add `sameAs` to Organization once the
  brand profiles exist.
- **Thin pages:** watch pair pages in "discovered, not indexed". If many stay there, make
  them more distinct (comparisons, passport check, related items) rather than adding more.
- **Speed:** keep Lighthouse ≥ 95 on mobile; re-run after each feature.

### 5.3 Off-site (links and brand)

- **Bing:** submit 100 URLs a day via URL Submission (hubs first, then medication pairs),
  keep IndexNow to changed URLs, re-check impressions in 4 weeks.
- **Profiles:** LinkedIn company page, Bluesky, X, Mastodon; AlternativeTo, Product Hunt
  (save for a notable tool launch, e.g. the medication planner), Crunchbase.
- **Partners who need this content:** university study-abroad offices, patient
  organisations (ADHD, diabetes, epilepsy, transplant), travel clinics, travel bloggers
  (widgets). Target: 10–20 real backlinks.
- **Journalists:** send a short, dated, cited note when a rule changes. Current hooks:
  China's visa-free policy ending 31 Dec 2026, the US hemp change (11 Dec 2026),
  Mongolia's and Korea's exemptions ending 31 Dec 2026. Source-request platforms (Qwoted,
  Featured.com).
- **Communities:** answer the actual question with the one page that holds the cited rule;
  never post as a neutral third party; follow each community's rules.
- **Data stories:** "Which countries cap medication at a 90-day supply", "OTC medicines
  controlled in N countries", "Every border rule that changed this quarter".

### 5.4 Being cited by AI answers

Answer-first summary boxes, visible source names and check dates, `llms.txt`, the API and
Dataset markup are in place. Next: get the dataset listed in Google Dataset Search and
open-data directories; keep the monthly change report as the page AI answers quote.

### 5.5 Languages

Choose the first locales from Search Console country data. For medication pages the reader
is usually the *inbound* traveller (a Korean page about bringing medicine to Japan helps
more than a Japanese page about the US). Translate the highest-traffic page types first.

---

## 6. Long-term goals

> The place travellers, and the people who advise them, check before crossing a border
> with something that could get them in trouble. Every answer specific, cited, dated and
> kept up to date.

### Horizon 1: now to 3 months. Prove the medication wedge.

- Ship the medication travel planner (§2.1) and the rule-change feeds (§2.2).
- Customs depth for the newest destinations; medication rows wherever an official
  traveller rule exists.
- Outreach (§5.3) to 10–20 real backlinks; Bing impressions growing.
- **Gate:** medication pages rank on page 1 for a meaningful set of "[product] [country]"
  queries with CTR at or above the site average. If not, fix distribution and titles
  before adding research.

### Horizon 2: 3 to 12 months. Second vertical and repeat use.

- Second customs vertical chosen from data (§3.3).
- 80 destinations and 2–3 more nationalities (§3.1, §3.2).
- Transit rules in Trip Check where sources are explicit.
- First translated locales (§5.5).
- **Decision on accounts and email alerts** (needs its own go-ahead, Supabase/Resend, GDPR
  review and privacy-policy update first). Signals that would justify it: feed
  subscriptions, `.ics` downloads, repeat visits, requests for saved trips.
- **A small paid test** of persistent state (for example a one-off family travel-history
  PDF) before any subscription infrastructure.
- **Affiliate slots** (insurance, eSIM), disclosed and sponsored-marked, after a privacy
  and terms update.

### Horizon 3: 1 to 3 years. Become the reference.

- 100+ destinations, each deep in two or three verticals, measured as rows verified *and
  maintained*, not as country count.
- Freshness as a product: every cited URL watched, changes public within days, a monthly
  border-rules report that journalists cite.
- **B2B after the consumer corpus has proven reliable:** universities, travel-health
  clinics, travel management companies, relocation firms and insurers, via licensed API
  access. Five to ten pilot conversations before building anything.
- **Pro tier** for persistent things only (saved profiles, alerts, multi-country ledger,
  exports); facts and the calculator stay free.
- **Residence compliance** stays a deferred hypothesis (AGENTS.md §1, §2, §12).

### What we will not do, even under pressure to grow

- Claim global coverage, or fill gaps with inferred answers.
- Write filler posts or doorway pages without verified data behind them.
- Add tracking cookies or ad networks.
- Build a "where should I move" recommender.
- Give dosing, sourcing or "how to get it through" advice for grey-market products.

---

## 7. Open decisions for the owner

- Keyword-matching H1s on destination hubs (§5.2).
- Turning on cookie-free Plausible (needs a privacy-policy update first).
- Brand profiles and `sameAs` (§5.3).
- Accounts and email alerts (Horizon 2).

---

## 8. Key measures

| Measure | Source | Why it matters |
|---|---|---|
| Rows re-checked in the last 180 days | `data/*.json` `verified_at` | The asset is alive, not just big |
| Days from a source change to our changelog | Watcher report vs changelog | Freshness promise |
| Impressions and clicks on medication and item queries | Search Console, Bing | Horizon 1 gate |
| Average position for "[product] [country]" | Search Console | Whether depth beats breadth |
| Referring domains | Search Console links | Whether distribution works |
| Feed subscribers and widget embeds | Server logs (no cookies) | Repeat use without accounts |
| Top unmatched item searches | `/api/item-miss` | What to research next |

Review this file each quarter: update "Where we are today" and record which gate was
passed or missed, and why.
