# Odyssway: Growth Plan and Long-Term Roadmap

Written 2026-10-14. This is a working plan, not a rulebook. AGENTS.md still governs how
anything gets built, and its Accuracy Policy (§3) comes before everything here. Topics
listed below as *candidates* are research leads. None of them is a verified rule, and
none can be published until it has a primary official source (§3).

Where we are today:

- 50 destinations, 1,035 nationality × destination entry rows, 540 customs-item rows
  (103 of them medication).
- About 1,870 indexed URLs. Most are `/destinations` (about 1,085), `/bring` (about 446)
  and `/medications` (about 254).
- Google has picked the site up (1,377 pages indexed, 1k+ impressions). Bing is crawling
  it, and IndexNow is set up.
- There are no analytics, by design (see the privacy policy).

---

## 1. Where we can win: questions general AI answers handle badly

ChatGPT, Gemini and AI Overviews are good at the generic version of a travel question:
"Do Americans need a visa for Japan?" or "Can I bring medication on a plane?" We should
not compete there (AGENTS.md §14). They are weak in five places, and each one is a
content direction for us.

### 1.1 Specific combinations

The answer changes with the exact mix of passport, destination, item and the person's
situation. An AI answer flattens that mix into one generic rule.

- **Real example from our own research (2026-10-13):** the usual answer for Canada is
  "you can bring a 90-day supply of prescription medicine". Health Canada's GUI-0116
  says that applies to visitors. Residents returning home generally can't bring drugs
  that were prescribed or bought abroad. A generic answer is wrong for half the people
  asking.
- **Direction:** keep splitting rows by traveller situation wherever the official
  source does: resident or visitor, transit or entry, carried or posted, with or
  without a prescription. Each split is a question nobody else answers correctly.

### 1.2 Recent changes

Models are trained on old data. AI Overviews quote whatever ranks.

- **Examples:** Thailand's 60 → 30 day cut (September 2026); the HSA retatrutide
  advisory (September 2026); Health Canada's peptide advisory (April 2026).
- **Direction:**
  - Make `/changelog` and a monthly "what changed at borders" page the freshest source
    on the web.
  - Every rule change becomes a dated, cited update within days, and IndexNow pushes it
    the same day.
  - This is also how we get **cited by** AI answers instead of replaced by them.
    ChatGPT search and Copilot draw on Bing's index, which is why IndexNow matters.

### 1.3 Procedures, forms and lead times

AI answers say "you may need a permit". They rarely say which form, which office, how
many weeks ahead, or what happens if you skip it.

- **Examples we already cover:** Japan's Yunyu Kakunin-sho and the MHLW narcotics
  permit; Thailand's controlled-medicine rules.
- **Direction:** step-by-step "how to get permission" pages for every permit-required
  row, giving:
  - the form;
  - the authority;
  - the documents needed;
  - the lead time the authority itself states;
  - what happens at the border without it.

  These are HowTo pages (§7), and an AI summary can't replace them.

### 1.4 Things that are legal at home but not abroad

Searchers don't know to ask about these, so the questions come up only after something
goes wrong. They are high-stakes and poorly covered.

**Candidates to research and verify, not claims:**

- **Over-the-counter medicines that are controlled elsewhere:**
  - pseudoephedrine (Sudafed in Japan is already covered);
  - codeine combinations;
  - inhalers containing levmetamfetamine;
  - melatonin;
  - some antihistamines and sleep aids.
- **Grey-market products:**
  - research peptides (in progress: US, CA, NZ, SG, GB);
  - compounded GLP-1s;
  - kratom;
  - nicotine pouches;
  - CBD that is legal in the US but not elsewhere.
- **Medical devices:** CPAP machines, insulin pumps and sharps, portable oxygen,
  continuous glucose monitors (customs only; airline and TSA rules are out of scope,
  §2).

### 1.5 Transit

Many travellers don't realise a transit stop can trigger the transit country's drug
laws. Very few sources cover this.

- **Candidates:** medication through the big hubs (Dubai, Doha, Singapore, Istanbul),
  airside and landside.
- **Requirement:** this only ships where the authority states the transit rule
  explicitly. If it doesn't, the row stays in UNVERIFIED.
- **Payoff:** a "my route goes through X" step in Trip Check would be the one
  question AI answers almost always get wrong.

### 1.6 Things that need to be calculated

A day count or date that depends on the user's own data needs a deterministic tool.

- **Already built:** the 90/180 calculator; the passport validity checker (2026-10-18);
  the multi-country itinerary check in Trip Check, with a passport check per stop (2026-10-22); the combined day counter
  at `/day-counter` (2026-10-22).

**Priority:** depth in medication and controlled substances first (§14 says to test one
area at a time). Within it, the order is:

1. split each row by traveller situation (1.1);
2. permit how-to pages (1.3);
3. medicines that are legal at home but controlled abroad (1.4);
4. transit (1.5).

---

## 2. How to grow reach

### 2.1 Measure without breaking the privacy promise

We have no analytics, and adding cookies is off the table (AGENTS.md §13.5). We still
need data to decide what to build next. These sources need no cookies:

| Signal | Where | What it tells us |
|---|---|---|
| Search queries, impressions, CTR, position | Google Search Console, Bing Webmaster | Which questions we already show up for, and which pages get seen but not clicked |
| Unmatched item searches | `/api/item-miss` (already in the privacy policy) | Items people look for that we don't cover yet: the research queue |
| Who links to us | Search Console "Links", Bing backlinks | Whether outreach is working |
| Cookie-free page counts (optional) | Plausible, already wired via `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Only if the owner decides to turn it on, and the privacy policy must be updated first |

**Monthly routine:**

1. Export the top queries from Search Console and Bing.
2. Look at pages that rank on page 1–2 but have low CTR. Rewrite their title and
   description.
3. Look at unmatched item searches. Add the most-asked items to the research queue.

### 2.2 Search engines (organic reach)

- **Bing:** already done; IndexNow is set up. Once the Bing Webmaster sitemap has been
  processed, use "Request indexing" for about 20 key pages: the hubs, the top
  medication pages and the blog.
- **Yandex Webmaster** (owner's choice): add its verification tag next to the Google
  one in `layout.tsx`. IndexNow already notifies Yandex.
- **Which engine serves which browser.** Browsers don't index anything themselves, so
  covering a few engines covers nearly every browser:

  | Where people search | Engine | What we need |
  |---|---|---|
  | Chrome, Android, Samsung Internet, Firefox, Safari (default) | Google | Search Console (verified) |
  | Edge, Bing, Yahoo, DuckDuckGo, Ecosia, Copilot | Bing | Bing Webmaster + IndexNow (done) |
  | Brave | Brave Search (own index) | Nothing to submit; it crawls on its own |
  | Safari suggestions, Siri, Spotlight | Applebot | robots.txt already allows it |
  | Yandex | Yandex | Optional Webmaster account |
  | ChatGPT, Perplexity, Claude, Gemini | Own crawlers, plus Bing/Google | Being cited by trusted sites (§2.5) |

- **Bing lags Google (2026-10-20: 1.9K URLs discovered, 4 impressions in 7 days).**
  The site serves bingbot correctly (200, canonical, no noindex, robots allows all), so
  the gap is most likely indexing depth and authority, not a block:
  - "Discovered" isn't "indexed". In Bing Webmaster, check Site Explorer and URL
    Inspection on 10 key pages to see how many are actually indexed.
  - Bing indexes new domains slowly and leans more on backlinks and brand signals
    than Google does. Many similar programmatic pages (pair pages) can sit in
    "discovered, not indexed" until the domain earns trust.
  - Check the Vercel firewall (Firewall → logs): bot protection or attack-challenge
    mode must not challenge verified bingbot requests.
  - Actions: "Request indexing" for ~20 hub pages (it accepts more than Google's
    quota), keep IndexNow to changed URLs only, and earn links (§2.5). Re-check in
    4 weeks; if indexing stays low, consolidate thin pair pages rather than adding more.
- **Titles that match how people search:**
  - "Can I bring Adderall to Japan" beats "Stimulant medication: Japan".
  - Keep checking `seoTitle` against real Search Console queries.
- **Internal links:**
  - Every blog post links to its `/medications` and `/bring` pages.
  - Every destination page links its top three item pages.
  - Pages that no other page links to rank poorly.

### 2.3 Being the source AI answers cite

- Keep the answer-first summary box (§8) at the top of every page. Generative answers
  quote the first clear, dated sentence they find.
- Show "Checked against official sources: {date}" and the legal source name as visible
  text, not just in schema. Both are trust signals for people and for machines.
- The public JSON API (`/api/v1/*`) and the Dataset markup on `/developers` are already
  live. Get the dataset listed in Google Dataset Search and in open-data and travel-API
  directories.
- **Possible:** publish an `llms.txt` that points to the hubs, the changelog and the
  API. It's cheap to do, but there's no proof it helps, so don't spend time on it
  beyond that.

### 2.4 Communities, by helping and not by spamming

The people asking our questions gather in a few predictable places:

- **ADHD:** r/ADHD, r/adhdwomen, CHADD and ADDitude communities, for stimulants
  abroad.
- **Diabetes and weight loss:** r/diabetes, r/type1diabetes, r/Semaglutide,
  r/Mounjaro, r/Zepbound, for pens, needles and refrigeration.
- **Peptides:** r/Peptides, for the customs angle only, never dosing.
- **Travel:** r/JapanTravel, r/ThailandTourism, r/digitalnomad, r/solotravel, and
  expat Facebook groups.

**Rules:**

- Answer the actual question in the reply itself.
- Link only to the one page that holds the exact cited rule.
- Never post as if from a neutral third party.
- Read each community's self-promotion rules first.

A reply that is correct and cited earns the link.

### 2.4b Brand profiles and review sites

Search engines and AI assistants trust a site more when it's a recognisable organisation
with consistent profiles elsewhere.

- **Profiles (owner creates):** LinkedIn company page, Bluesky, X, Mastodon. Same
  name, logo and one-line description everywhere. Then add the URLs to the
  Organization structured data as `sameAs`.
- **Listings:** AlternativeTo (as an alternative to Sherpa and iVisa), Product Hunt
  (save the launch for a notable feature), Crunchbase. Wikidata only after there is
  independent coverage.
- **Trustpilot / Sitejabber:** claim a free business profile, verified with a domain
  email. Link to it with a plain link (footer or `/about`); **don't embed the widget**:
  it loads third-party scripts and cookies, which breaks the no-cookies promise
  (AGENTS.md §10, §13.5) unless the privacy policy is updated first.
  - Reviews only from real users who choose to leave one: no incentives, no asking
    friends, no review gating (AGENTS.md §2, and Trustpilot's own rules).
  - Expect reviews to help visitor trust more than rankings; links matter more.

### 2.5 Partners who need exactly this content (backlinks that count)

These groups already field these questions by hand. A free, cited page they can link to
saves them time.

- **Study-abroad offices at universities.** Students on ADHD or anxiety medication are
  a known problem. Pitch a free "medication abroad" page per destination.
- **Patient organisations** (ADHD, diabetes, epilepsy and transplant charities). Many
  have a travel page that links to outside resources.
- **Travel clinics and travel-health pharmacists.** They give pre-trip advice and need
  a source they can point patients to.
- **Travel bloggers and expat sites.** Offer the embeddable calculator (`/widget`).
  Build a second widget, "Can I bring it? for [destination]", for destination blogs.
- **Journalists.** When a rule changes (Thailand, retatrutide, ETIAS), send a short,
  dated, cited note to travel and health reporters. The changelog is our press
  release. Source-request platforms (Qwoted, Featured.com) connect us with reporters
  who need an expert source. Current hooks: the US hemp change (12 Nov / 11 Dec 2026),
  China's visa-free policy ending 31 Dec 2026, Korea's penalties for cold medicine.
- **Order of work for the owner:** search consoles first (§2.2), then university
  offices and journalists, then profiles (§2.4b). These give the most visibility per
  hour.

### 2.6 Data stories that earn links

Our dataset can produce original, citable findings that no one else can easily repeat.
Each is a blog post that traces back to verified rows, as §7 requires:

- "How many of our 50 countries cap medication at a 90-day supply, and which ones need
  a permit".
- "Where 'legal at home' stops: OTC medicines controlled in N countries".
- "Every border rule that changed this quarter" (from `changelog.json`).

### 2.7 Languages

Translating content is Phase 3 in AGENTS.md (bg, tr, sr), but the order should follow
the data:

- Choose the first locales from Search Console country and query reports.
- For medication pages, the readers are often *inbound* travellers. A Japanese page
  about bringing medicine *to* the US helps less than a Spanish or Korean page about
  bringing medicine *to* Japan.
- Translate the highest-traffic page types first (medication pairs and the top
  destination pages), never the whole site at once.

### 2.8 Things people take with them

These don't need accounts and stay within the privacy architecture:

- **A printable one-page "border card"** per medication and country, listing:
  - the rule;
  - the documents to carry;
  - the authority's contact;
  - the source and the date it was checked.

  It's built in the browser like the existing PDF export.
- **A doctor's letter checklist** that lists only what the destination's verified rule
  asks for.

Both get printed, shared and forwarded, and that spreads the site by word of mouth.

---

## 3. Long-term goals

### What we want to become

> The place travellers, and the people who advise them, check before crossing a border
> with something that could get them in trouble. Every answer is specific, cited, dated
> and kept up to date.

The asset is the **corpus we've accumulated and keep maintaining**, plus its public
revision history. The verification process alone is not the asset (AGENTS.md §14).
Everything below either grows that corpus, makes it easier to reach, or turns it into
revenue without putting a paywall in front of a single fact.

### Horizon 1: now to 3 months. Prove the medication niche.

Goal: show that searchers with high-stakes medication questions choose our answer.

- Do medication and controlled-substance depth across all 50 destinations, in the order
  given in §1.
- Close the open peptide items (Australia; UK research peptides) when the sources can
  be reached.
- Launch the printable border card and the "Can I bring it?" widget.
- Run the outreach in §2.4–2.5. The target is 10–20 real backlinks from universities,
  patient organisations, clinics and bloggers.
- **Gate to Horizon 2:** in Search Console, medication pages rank on page 1 for a
  meaningful set of "[product] [country]" queries, with a CTR at or above the site
  average. If they don't, the gap is distribution or titles, not more research hours.

### Horizon 2: 3 to 12 months. Second niche and repeat use.

- **Second niche, picked from Search Console and item-miss data, not by guessing.**
  The current candidates in order: CBD and cannabis, food, nicotine and vapes,
  drones. Go deep on one before starting the next (§14).
- **Transit rules** in Trip Check, where the sources are explicit.
- **Itinerary check:** a multi-leg trip with one verdict per border.
- **First translated locales** (§2.7).
- **A decision on accounts and email alerts.** This needs its own explicit go-ahead,
  Supabase and Resend, a GDPR review, and a privacy-policy update first (AGENTS.md
  §12).
  - Signals that would justify it: repeat visits, people using the calculator's
    `.ics` reminders, people asking for saved trips.
- **A small paid test**, such as paying once for a family travel-history PDF or
  multi-traveller planning. It tests willingness to pay with no subscription
  infrastructure (§9).
- **Affiliate slots** (insurance, eSIM) through `<PartnerOffer>`, marked as sponsored
  and disclosed. This also needs a privacy and terms update first.

### Horizon 3: 1 to 3 years. Become the reference.

- **Coverage:** the top 80–100 destinations by traveller volume, each covered deeply
  in two or three niches. Measure it as rows that are verified *and maintained*, not
  as a count of countries.
- **Freshness as a product:** the source watcher covers every cited URL. Changes
  appear on the public changelog within days, and a monthly "border rules report" is
  the thing journalists cite.
- **B2B, only after the consumer corpus has proven reliable (§9):**
  - **Buyers:** universities, travel-health clinics, travel management companies,
    relocation firms and insurers. Each already pays people to answer these
    questions.
  - **Product:** API or licensed data access built on `/api/v1`.
  - **Before building any of it:** run five to ten conversations or pilots first.
- **Pro tier:** persistent things (saved profiles, alerts, a day count across
  several countries, exports). It never puts a paywall in front of facts or the
  calculator.
- **Residence compliance:** still a hypothesis we've put off, not a plan (AGENTS.md
  §1, §2, §12). Consider it only if Horizon 2 shows real demand for persistent state
  and there's a credible plan to keep the legal data maintained.

### What we will not do, even under pressure to grow

- Claim global coverage, or fill gaps with inferred answers.
- Write filler posts or doorway pages that target keywords without verified data
  behind them.
- Add tracking cookies or ad networks.
- Build a "where should I move" recommender.
- Give dosing, sourcing or "how to get it through" advice for grey-market products.
  We report the legal status, nothing more.

---

## 4. Key measures

| Measure | Source | Why it matters |
|---|---|---|
| Verified rows maintained in the last 90 days | `data/*.json` `verified_at` | Shows the asset is alive, not just big |
| Impressions and clicks for medication and item queries | Search Console, Bing | Checks the niche (Horizon 1 gate) |
| Average position for "[product] [country]" queries | Search Console | Shows whether depth beats breadth |
| Referring domains | Search Console links | Shows whether distribution is working |
| Top unmatched item searches | `/api/item-miss` logs | Tells us what to research next |
| Time from a source changing to our changelog | Watcher report vs changelog date | Measures freshness |

Review this file each quarter. Update the "Where we are today" numbers and record which
gate was passed or missed, and why.

---

## Progress log

- **2026-10-14. Horizon 1, step 1.3 started: permit procedures.**
  - **What's new:** permit-required medication rows now carry a cited, dated
    `procedure`: who to apply to, when, the documents, numbered steps, and what
    happens at the border and in transit.
  - **Where it shows:** a checklist with HowTo markup on `/bring/medication/[country]`
    and `/medications/[product]/[country]`, plus a "How to get permission, step by
    step" link in Trip Check results.
  - **First batch:** Japan, Thailand, Singapore and the UAE.
  - **New Japan rows:**
    - narcotics: oxycodone, codeine and others;
    - psychotropics: Xanax, Valium, Klonopin, Ritalin, Ambien and others, using
      the official per-substance carry-in limits.
  - **Corrections from re-checking:** Japan's 10% pseudoephedrine exclusion was
    added. The unsupported "Vicks inhaler" match, and Thailand's "Form IC-2" and
    "Schedule I" claims, were removed.
  - **Next:** the remaining permit rows listed in `data/UNVERIFIED/TODO.md`
    ("Permit procedures").
- **2026-10-14. Permit procedures, batch 2.** Added Korea, Hong Kong, Cyprus, Saudi
  Arabia, Qatar, Jamaica and the Philippines, so 11 countries now have step-by-step
  guides.
  - **Korea:** the row was rewritten from MFDS's own guide, and a claim sourced from
    travel websites was removed.
  - **Not given a procedure** (no published official application route, or no permit
    involved): Serbia, Sri Lanka and the document-only countries. The reasons are in
    `data/UNVERIFIED/TODO.md`.
- **2026-10-15. Horizon 1, step 1.4 started: legal at home, restricted abroad.**
  - **Melatonin:** New Zealand (prescription needed to import) and the UK
    (prescription-only; no official personal-import limit, which the page says).
  - **Nicotine pouches:** banned for travellers in Australia (since 24 July 2026)
    and in Singapore.
  - **Blog post:** `/blog/melatonin-zyn-legal-at-home`.
  - **Next:** Australia melatonin (TGA unreachable from here), Japan nicotine
    pouches, and France's "white snus" ban (April 2026). Then more items from the
    unmatched-search log.
- **2026-10-15. Open items cleared, and step 1.4 continued.**
  - **Australia:** growth hormone, peptides (BPC-157, TB-500 and others) and
    melatonin. TGA still times out, so these come from the law itself on
    legislation.gov.au (Poisons Standard, Therapeutic Goods Regulations, Customs
    (Prohibited Imports) Regulations) and the Border Force's item list.
  - **France:** nicotine pouches banned since 1 April 2026, including bringing them
    in and having them. This is the first **national rule inside the Schengen
    Area**: Trip Check now checks a member state's own rows before the shared EU
    rows, and shows them to EU citizens too.
  - **Kratom:** prohibited in Australia and Singapore; New Zealand releases it at
    the border only on a doctor's authority. **Kava:** up to 4 kg for travellers
    18+ in Australia.
  - **Qatar:** quantities re-checked; a wrong "24 hours" processing claim corrected.
  - **Blog:** both the melatonin/Zyn post and the peptides post now cover these.
  - **Still open, no primary source found:** UK personal-import rule, Japan (Vicks,
    pouches), Korea amphetamines, Singapore/Japan melatonin, US growth hormone.
  - **Next:** more step 1.4 items (poppers and phenibut in Australia need TGA;
    kratom in more countries; nicotine pouches in other EU states), driven by the
    unmatched-search log once it's exported.
- **2026-10-15. Step 1.4, batch 3: kratom, phenibut, poppers.**
  - **Kratom** now covers 5 countries: Australia, Japan, Singapore and Sweden
    (prohibited), and New Zealand (doctor's authority). Sweden is the second
    national rule inside Schengen.
  - **Phenibut:** prohibited in Australia. **Poppers:** prohibited in Japan.
  - **Search safety:** everyday words like "pepper" no longer fuzzy-match
    "poppers".
  - **Blog:** `/blog/kratom-phenibut-poppers-customs`.
  - **Not published:** sale-only bans on pouches in Belgium and the Netherlands
    (not traveller rules); poppers in Australia (TGA unreachable).
- **2026-10-15. Step 1.5 started: transit.**
  - Customs rows can now carry a **stated transit rule**: "applies in transit too"
    or "not if you stay airside", with its own source and date.
  - **Trip Check** has an optional "Changing planes in" field. Each item shows the
    stopover's rule, or says honestly that the authority doesn't state one.
  - **Covered:** Singapore, UAE, Korea (exempt airside); Hong Kong, Philippines,
    Argentina, Albania, Colombia, Taiwan (apply in transit); cannabis in Qatar, Sri
    Lanka and Cambodia (applies in transit, per UK government travel advice).
  - **Blog:** `/blog/medication-transit-stopover`.
  - **Next:** Doha, Istanbul and Tokyo transit rules; a "Can I bring it?" widget
    and the printable border card (Horizon 1).
- **2026-10-15 (overnight). Printable border card (Horizon 1, §2.8).**
  - Every customs row on `/bring/...` and `/medications/...` pages has a "Download
    border card (PDF)" button. The one-page PDF has the rule, what to carry as a
    tick-box checklist (this doubles as the doctor's letter checklist: it lists only
    what the verified rule asks for), who to contact, any transit rule, and the
    source with its check date. Built in the browser; nothing leaves the device.
- **2026-10-15 (overnight). "Can I bring it?" widget (Horizon 1).**
  - `/embed/can-i-bring` (noindex): destination + item → the verified verdict, its
    source and check date, and a link to the full answer. Snippet and preview on
    `/widget#can-i-bring`, with a credit link in the host page's HTML.
  - Same matching as Trip Check (shared `resolveItem`), including national Schengen
    rules. Nothing is sent anywhere; privacy policy and terms updated first.
  - **Next (distribution, owner's call):** offer it to the bloggers, patient groups
    and university travel offices in §2.5.
- **2026-10-16 (overnight). Transit, follow-up.** Scanned all 151 cited source pages
  for transit wording. Added Georgia (applies in transit), Hong Kong prescription
  medicine with dangerous drugs (applies), Singapore peptides (exempt airside), and
  Albania CBD (applies). Istanbul still has no primary source.
- **2026-10-16 (overnight). Step 1.4, batch 4.** Pseudoephedrine in New Zealand
  (controlled drug: declare, 1 month, prescription or doctor's letter, even for
  over-the-counter cold tablets) and nicotine gum in Singapore (medicated gum can't
  be imported at all).
- **2026-10-16 (overnight). Step 1.4, batch 5.** Heated tobacco (IQOS) and shisha
  banned in Singapore; shisha banned in Kenya; modafinil needs HSA approval in
  Singapore; heated-tobacco sticks and hookah tobacco now found in the UK and Serbia
  allowances. All from official pages already cited, found by scanning them.
- **2026-10-16 (overnight). Medication holes.** The Bahamas now has a medication row
  (Bahamian embassy: carry a doctor's letter). Jordan, Nigeria and Cambodia still have
  none: no primary traveller source found (details in `data/UNVERIFIED/TODO.md`).
- **2026-10-16. SEO sprint 1 (§2.2, §2.3).**
  - **Answers in search snippets:** `/medications/[p]/[c]` and `/bring/[i]/[c]` titles now
    carry the verdict and the year checked ("Can you bring Adderall to Japan? No, it's
    banned (2026)"); descriptions open with the rule's own first sentence
    (`lib/seo-text.ts`). Product hubs open with a counted summary ("banned in X of N
    countries…") used as the meta description, plus ItemList and FAQPage markup.
  - **Freshness markup:** `dateModified` (the date the rule was checked) on every
    answer page's FAQPage.
  - **Duplicate content cut:** `/bring/[item]` hubs show one sentence per country and
    link to the full page; `/bring/medication` went from 800 KB to 388 KB of HTML.
  - **Internal links:** homepage "Travelling with medicine" section linking every
    medicine hub; "Medicines" in the header nav and footer.
  - **AI citation:** `/llms.txt` lists tools, method, hubs, countries, articles, API.
  - **Speed:** Trip Check and the widget load the 2.8 MB rule corpus after first paint
    (`lib/trip-engine.ts`); first load 483 KB → 152 KB, Lighthouse mobile performance
    79 → 91 on /trip-check. SEO and accessibility 100 on all tested pages.
- **2026-10-16. SEO sprint 2.**
  - **Snippet summaries:** new optional `summary` on customs rows (a one-line
    restatement, never a new claim), written for 63 medication rows whose opening was
    long or hedged. Used for meta descriptions, hub lines and FAQ answers.
  - **Accurate permit wording:** procedures can be marked `optional` (UAE; Philippines
    only above 30 days), so titles say "Only with a permit" only when every traveller
    needs one.
  - **Natural titles:** "to the United States/Kingdom/Arab Emirates/Philippines…", and
    generic medicines in lowercase mid-sentence ("bring melatonin to…").
  - **Share cards:** every `/medications/[p]/[c]` and `/bring/[i]/[c]` page has its own
    preview image ("Adderall to Japan — No, it's banned. Checked … on 2026-10-02"),
    prerendered at build.
- **2026-10-16. Accuracy sweep of medication rows.** Every medicine name that creates a
  product page must now be named by the row's source or by an official schedule we
  cite (US, UK, Canada and Ireland schedules verified; INCB Green/Yellow Lists for
  internationally controlled drugs). Fixed a real error: the EU row said tramadol and
  Vyvanse are internationally controlled; they aren't. Removed unsupported inferences
  and claims in 8 rows, and withdrew 19 product pages whose country source doesn't
  name the medicine (temporary redirects to the product hub).
- **2026-10-16. Country medication pages upgraded.** `/bring/medication/[country]` (and
  every multi-rule `/bring` page) now opens with an "At a glance" list (one line per
  rule, linked to its card), a "Permits to arrange before you travel" box built from
  the rules' procedures, and the named-medicine links up top. FAQ markup has one
  question per rule.
- **2026-10-17. Snippet summaries for all rules, and a non-medication accuracy sweep.**
  144 more rules have a one-line summary for search results and hub lists. Turkey's
  e-cigarette allowance was rewritten from the customs circular itself (the widely
  repeated "10 disposables" was wrong; it's 3). Five rows whose core facts came from a
  newspaper, a law firm or news aggregation were taken off the site until an official
  source is read.
- **2026-10-17. Internal links.** Destination hubs now link every named-medicine page
  for that country, and their customs list shows each rule's one-line summary.
  Medicine blog posts link the country medication pages they rely on.
- **2026-10-17. Turkey controlled medicine, and re-checking August rows.** Turkey now has
  a controlled-medicine answer from official Turkish sources. Ten medication rows from
  August were re-read against their sources: eight still match (re-dated), and three
  had wording the source doesn't support (UK "14 days", Mexico "treatment course",
  India "must" vs "may"), now corrected.
- **2026-10-17. Step 1.4, batch 6.** Chewing gum is banned in Singapore (fines up to
  S$100,000, from the regulations themselves); vapes are allowed in the UAE for personal
  use at the inspector's discretion (Dubai guidance).
- **2026-10-17. Strict cleanup.** Removed 17 claims that came from press, blogs or
  "widely reported" figures (even when labelled unconfirmed), e.g. a Singapore cash
  threshold, Korean and Taiwanese fine amounts, Malaysian drone fees, Maldives press
  reports. Rows now state only what an official page says.
- **2026-10-17. Blog: Vyvanse and tramadol.** `/blog/vyvanse-tramadol-controlled-abroad`
  explains why their rules vary so much (neither is on the UN's control lists) and
  compares the US, UK, Canada, Ireland, Japan, Singapore, UAE and Qatar, each from a
  verified row.
- **2026-10-17. Melatonin in Japan; source-watch follow-up.** Japan: melatonin is on the
  health ministry's medicine-only list, so a supplement counts as a medicine (bring a
  small supply). Reviewed the watcher's 12 October report: rewrote the UAE medication
  row (its source page is gone, and it contradicted the verified controlled-medicine
  row) and flagged Rwanda's offline guideline on three rows.
- **2026-10-18. September medication rows re-checked; batched deploys.** Re-read the
  official source for 24 medication rows and re-dated them. Corrected four: Canada now
  gives the tighter benzodiazepine limit for visitors; the US injectables row restates
  the FDA page only (the TSA screening text was out of scope); the Philippines row says
  "PDEA S2-licensed physician", as the regulation does; Albania names the law its
  prohibition refers to. Builds are now skipped for pushes that don't touch the site,
  and pushes are batched after local verification.
- **2026-10-18. Data story: medicine supply limits by country (§2.6).** New post comparing
  personal-medicine limits in 36 countries (15 days in Serbia to 6 months in Montenegro;
  no fixed number in nine) and where controlled medicine needs a permit before you
  arrive. Every figure restates a verified row and links to that country's page.
- **2026-10-18. Medical devices (§1.4, customs only).** New rows for Singapore (HSA
  approval at least 10 working days ahead unless the device is already in use; up to 3
  months' supply; airside transit exempt; procedure included), Thailand (personal-use
  amount with device information, a not-for-sale letter and a medical certificate) and
  Japan (one unit of home-use equipment; disposable contact lenses for two months). No
  source names CPAP machines or glucose monitors, so neither is used as a search name.
- **2026-10-18. Metadata audit (1,892 pages).** Fixed 247 duplicate meta descriptions
  (named-medicine pages for the same country now name the medicine; multi-rule pages
  now start with the country) and 11 descriptions over 158 characters. Entry-requirement
  answers now read "travelling to the United Kingdom". Audit is clean: no long, missing
  or duplicate titles or descriptions.
- **2026-10-18. Medical devices: Malaysia and Taiwan.** Malaysia's Medical Device
  Authority exempts personal-use devices from registration and the import permit (1 of
  each low/medium-risk device such as a glucose monitor or hearing aid; 3 months of
  consumables). Taiwan's TFDA lists the items travellers can bring without approval, each
  with a cap. Lighthouse re-run: performance 95–98, accessibility/best practices/SEO 100.
- **2026-10-18. Blog: travelling with a medical device.** Compares the six verified device
  rows (Singapore approval, Malaysia one-of-each, Taiwan's capped list, Thailand's
  documents, Japan's one unit, Ecuador's duty-free meters) and links to each row on its
  destination page, which now gives every customs line an anchor.
- **2026-10-18. Permit how-tos (§1.3): India and Costa Rica.** India: apply to the
  Narcotics Commissioner well before departure with the prescription (Department of
  Revenue page, read today). Costa Rica: Ministry of Health authorisation for more than
  one month's supply, applied for a month ahead, with the documents Art. 57 of Decreto
  45161-S lists. The decree couldn't be re-read today, so that procedure keeps the row's
  own verification date.
- **2026-10-18. Passport validity checker (§1.6).** Trip Check now asks (optionally) for
  arrival, departure and passport expiry dates and says whether the passport meets the
  destination's rule — for the 368 entry rows whose wording names its reference date
  ("6 months from arrival", "3 months beyond departure", "whole stay"). Rows that give a
  period without a reference date show remaining validity instead of a verdict. Engine:
  `checkPassportValidity`, calendar-month arithmetic with end-of-month clamping, 14 tests.
  The validator fails if a structured rule drifts from its row's wording. Dates never
  leave the browser.
- **2026-10-18. Passport checker: Schengen and six more rows.** Schengen results now state
  the Borders Code rule (passport valid 3 months after you leave, issued within 10 years;
  confirmed on Your Europe today) and check it. The extractor also recognises "after the
  date you plan to leave" and "expiry date … after the planned departure" (New Zealand,
  Albania): 374 rows now carry a structured rule.
- **2026-10-18. Passport check on entry-requirement pages.** The same check now appears on
  every /destinations/[slug]/[nationality] page whose passport rule states a period
  (Lighthouse on Kenya/US: 97 / 100 / 100 / 100).
- **2026-10-18. Two passport-rule corrections found by the checker work.** US→Albania said
  "3 months beyond entry", which no source says; Albania's own visa rules say 3 months after
  you leave (row corrected and re-dated). Saudi rows citing the same, now unreachable, source
  disagree on the reference date, so they show remaining validity only until re-read.
- **2026-10-18. Blog: "Six months from arrival, or after you leave?"** Passport validity
  rules for 18 destinations and the Schengen Area, grouped by reference date, with a worked
  example computed by the engine and a link to the new checker. Destinations whose rows
  disagree (Malaysia, Cambodia, Argentina, Saudi Arabia) are left out.
- **2026-10-18. Medication gaps: New Zealand and Spain.** New Zealand gets its ordinary
  prescription-medicine row (3 months; 6 for oral contraceptives) from NZ Customs, and the
  controlled-medicine row is re-checked against the same page and re-dated. Spain gets a
  national row: narcotic or psychotropic medicine needs an AEMPS permit (at least 10 days;
  up to 3 months of treatment, 15 days for cannabis), with the application as a procedure.
  Philippines (ordinary medicine): Philippine embassy pages are behind a bot challenge.
- **2026-10-18. August customs rows re-checked.** Re-read the 86 sources behind the 146
  customs rows last checked in August (65 readable). 54 rows re-dated where every figure
  still matches; 9 corrected where the row said more than its source (Morocco and UAE cash,
  Kenya and New Zealand alcohol, Philippine tobacco, US cash). US CBD is re-sourced to the
  statutes and now includes the hemp redefinition taking effect on 12 November 2026.
- **2026-10-19. August entry rows re-checked.** Re-read the sources behind the 252
  entry-requirement rows last checked in August. 128 rows re-dated where the stay limit and
  the nationality's status still match the source. The other 124 (Canada, Japan, Kenya,
  Mexico, Rwanda, Nigeria, Australia, Vietnam, China, plus one each for the US, India and
  New Zealand) need the nationality-list pages re-read; listed in `data/UNVERIFIED/TODO.md`.
- **2026-10-19. More August entry rows re-checked; per-visit caps.** 76 more rows re-checked
  (Canada, Kenya, Rwanda, Nigeria, Australia, China, Vietnam, plus single rows). Corrections:
  Mexico to US (a Border Crossing Card holder can fly in with a passport, no separate visa);
  China visa-free rows now give the policy's 31 December 2026 end date; Nigeria, Australia and
  China notes trimmed to what their sources say. 48 rows held with reasons in the TODO
  (Japan's MOFA blocks fetches; Mexico's cited list is a 2012 PDF). Rolling stay windows can
  now carry a per-visit cap, so Malaysia to China shows "30 days per visit, 90 in 180" and
  Colombia "90 per visit, 180 in 365" instead of only the window total.
- **2026-10-19. August customs rows: manual read.** Read the sources behind the 83 customs rows
  still dated August. 46 re-dated, most with notes trimmed to what the source says. Corrected:
  Morocco drones (an import licence from the foreign trade department; the police route the row
  described is for hunting weapons), Mexico and South Africa weapons (permit-based, not banned),
  Turkey cash (all cash carried is held when the explanation is missing or false), Nigeria
  cannabis penalties (NDLEA Act s. 20), Egypt medicine (medical reports, not a prescription).
  37 rows held, mostly because their official pages don't load from here.
- **2026-10-19. Mexico entry and US customs sources replaced.** Mexico's 21 entry rows cited
  a 2012 PDF; they now cite INM's current lists. Malaysian travellers no longer see a consular
  stamp requirement the current list doesn't have. US customs medicine, meat/dairy and produce
  rows now cite CBP's current page: the agriculture penalty is $300 (first offence), not
  "up to $1,000", and cheese and produce are "depends", not "prohibited".
- **2026-10-19. Source audit after the first full source-watch baseline.** Scanned every
  cited URL for non-government sources. Re-sourced Korea cannabis/CBD to Korea Customs (the
  penalty is life imprisonment or at least 5 years, not "up to 5 years"), China food rows and
  China CBD (a licensed precursor, so "depends") to official pages. Withdrew rows that rested on
  news, law-firm or NGO pages: overstay pages for Greece, Lithuania, Estonia, Denmark, Bulgaria
  and Switzerland, and e-cigarette rows for Morocco and Kenya (307 redirects). Still open:
  rows citing unofficial copies of statutes, to be re-cited to official legal portals.
- **2026-10-19. Source audit, part 2.** Rows that cited unofficial copies of laws now cite the
  official text or are withdrawn. Austria's overstay page is rebuilt from the federal legal
  system; Vietnam's cannabis, drone, meat and plant rows cite the official gazette (with the
  actual fines); Turkey's e-cigarette allowance cites the ministry's own circulars. Withdrawn
  for now (307 redirects): overstay pages for Portugal, Romania, Slovenia, Czechia and
  Slovakia, Nigeria cannabis and Albania e-cigarettes. The overstay explainer now lists 14
  verified countries and names the rest.
- **2026-10-19. US hemp dates corrected; two Argentina rows promoted.** Congress's September
  stopgap law (P.L. 119-103) phases in the new hemp definition: non-natural cannabinoids from
  12 November 2026, the total-THC and 0.4 mg-per-container limits from 11 December 2026. The
  US CBD page said everything started on 12 November. China and India → Argentina entry pages
  published after re-reading the Boletín Oficial resolutions.
- **2026-10-19. Korea: ADHD and cold medicines.** From Korea Customs' own page: methylphenidate
  and amphetamine carry life or at least 5 years without MFDS approval; cough and cold medicines
  with dextromethorphan up to 10 years or KRW 100 million. New pages answer "can I bring NyQuil /
  DayQuil / Robitussin / Mucinex / Delsym / Concerta / Medikinet to South Korea", and Ritalin's
  comparison now includes Korea.
- **2026-10-19. UK medicine corrected; licence how-to (§1.3).** The UK's 3-month limit applies
  to medicine containing a controlled drug, not to all prescription medicine; the ordinary
  medicine row said otherwise and is fixed. The controlled row now has the Home Office's
  step-by-step for a licence above 3 months (exceptional circumstances only).
- **2026-10-19. Indonesia medicine (Horizon 1 depth).** Indonesia now has real numbers from
  its drug authority: 30 tablets or 3 creams/liquids per product without paperwork, or up to
  90 days with an English prescription; psychotropic medicine only for foreign nationals, up
  to 60 days; narcotic medicine not allowed. Also: EU → Montenegro rows now run the passport
  check.
- **2026-10-20. Batch 6 started: Armenia (51 destinations).** All 22 passports from Armenia's
  Foreign Ministry lists (12 visa-free for 180 days a year, 4 under bilateral agreements, 6 need
  a visa but can use the 2026–27 residence-permit exemption), and 7 customs rules from the State
  Revenue Committee's traveller guides, including medicine (10 types × 3 packs; controlled
  medicine must be registered in Armenia, with notarised Armenian translations).
- **2026-10-21. Batch 6: Uruguay (52 destinations).** 22 passports from the Interior Ministry's
  admission table (19 visa-free for 90 days, Malaysia 30 days, China and India need a visa, with a
  US/Canada/UK/EU-visa exemption for China), and 6 customs rules from Aduanas (6 L of spirits and
  4 cartons per adult, cash over USD 10,000 declared, medicines for your stay, fresh produce and
  meat/dairy not allowed).
- **2026-10-21. Batch 6: Mongolia (53 destinations).** 21 passports from Mongolia's Immigration
  Agency (2026 tourist exemption, 30 days) and the Foreign Ministry's agreement list (US, Brazil,
  Argentina, Chile, Korea 90 days; Japan, Germany, Canada, Singapore, Malaysia, Israel 30 days;
  Mexico, China, India need a visa). Ukraine held (exemption only with an official invitation);
  customs held (official figures conflict). Watch 31 Dec 2026, when the tourist exemption ends.
- **2026-10-22. Itinerary check in Trip Check (Horizon 2 / §1.6), and a Trustpilot link.** Trip
  Check now takes up to 5 countries on one trip ("+ Add another country"). A route table shows
  each country's entry status and each item's verified verdict side by side (prohibited / depends /
  declare / within limits / allowed / not verified yet), and each stop opens to its full cited
  result. Nothing is inferred across borders: every cell restates that country's own row. The
  footer links to the Trustpilot profile (plain link, no widget, so no third-party scripts).
- **2026-10-22. Doctor's letter checklist (§2.8).** Medication rows can now carry a `letter`
  field: only what the destination's cited rule says the letter or prescription must contain.
  Shown as a tick-off list with "Copy the list for your doctor" on every page that shows the row.
  First 17 rows: Japan (psychotropics), UAE, Georgia, Maldives, Tanzania, Qatar, Saudi Arabia,
  Philippines, Malaysia, Armenia, Montenegro, Indonesia (×2), US, Australia, New Zealand, UK.
  Each item restates the row's own verified text, with the same source and check date.
- **2026-10-22. Multi-country day counter (§1.6).** New tool at `/day-counter` (header, footer,
  sitemap). Add every trip on one list; Schengen trips are pooled through the same engine as
  `/calculator` (days used/left on a chosen date, first day over 90/180), and every other country
  is checked against its own verified `stayPolicy` for the passport — per-visit limits, rolling
  windows, or both (new engine function `evaluateStays`, overlaps counted once). Countries we
  haven't verified for that passport, or where a visa's own terms decide, say so instead of
  counting. Runs in the browser; nothing stored or sent.
- **2026-10-22. Passport check across a route (§1.6).** When Trip Check has more than one country,
  a panel under the route table takes the passport expiry once and each stop's own dates, then
  checks each stop against that country's own verified rule ("whole stay", "6 months from
  arrival", "3 months after leaving Schengen"…) and names the first stop that fails. Stops whose
  wording names no reference date, or no period at all, show the validity left instead of a
  verdict; stops we haven't verified say so. Dates stay in the browser.
- **2026-10-23. Uzbekistan: 20 entry rows.** From the Cabinet of Ministers' consolidated visa-free
  list (Resolution No. 408, Annex 5, as amended 21 Oct 2025, on LexUz), the 2025 presidential
  decree giving US citizens 30 days from 1 Jan 2026, and the Foreign Ministry's visa page (e-visa
  and five-day transit lists, for India). 18 passports get 30 days from crossing the border; the
  Foreign Ministry list agrees. China held (the annex says 30 days, the Foreign Ministry page says
  10 days with an onward ticket); Ukraine held ("no time limit" doesn't fit the stay model).
  Kazakhstan and Laos tried and blocked (sources are JavaScript apps or unreachable; see TODO).
- **2026-10-23. Bosnia and Herzegovina: 22 entry rows.** From the Foreign Ministry's per-country
  consular pages (one official page per passport). Most passports: 90 days in a six-month period
  from first entry; China 90 in any 180 days; Brazil 90 per stay and 180 a year; Malaysia 90 days;
  Ukraine 30 days within two months; India needs a visa. EU citizens can enter with an ID card.
- **2026-10-23. Bosnia and Herzegovina customs: 6 rows.** From the Indirect Taxation Authority's
  traveller page: alcohol and tobacco allowances, the EUR 10,000 cash declaration, ordinary
  medicines (with a doctor's-letter checklist) and psychotropic medicines (7 days' supply,
  declared at the border), and meat and dairy (EU and listed European countries only).
- **2026-10-23. Macao: 21 entry rows.** From the Macao government's immigration page (Public
  Security Police, updated August 2026): 30, 90 or 180 days depending on the passport, Ukraine
  via an entry permit on arrival, and the passport (90 days beyond the stay), onward-ticket and
  funds rules. China held (Chinese citizens use PRC travel permits, not passports).
- **2026-10-23. Macao cash row.** From the Customs Service's cash declaration form (Law 6/2017):
  declare MOP 120,000 or more on arrival, no limit on the amount. Tobacco and alcohol allowances
  logged as candidates until the 2016 Chief Executive Order behind them is confirmed current.
- **2026-10-23. Seychelles: 22 entry rows.** From the Immigration and Civil Status Department: no
  visa for anyone, but an ETA before departure; a free Visitor's Permit on arrival for up to three
  months (extendable to twelve); return ticket, accommodation and US$150 a day.
- **2026-10-23. Uzbekistan medicine and Seychelles customs: 5 rows.** Uzbekistan: ordinary
  medicines (10 medicines, 5 packs each, pack-size limits) and narcotic/psychotropic medicines
  (declare; narcotics 7 days with a medical document; psychotropics 5 × 2 packs), with
  doctor's-letter checklists, from the 2016 Cabinet regulation as amended in 2026. Seychelles:
  alcohol and tobacco allowances (2024 regulations) and the SCR 50,000 cash declaration.
- **2026-10-23. Ghana: 22 entry rows and 2 customs rows.** From the Ghana Immigration Service's
  visa regime table (Singapore visa-free for 60 days; the rest of our passports need a visa) and
  the Revenue Authority's passenger page (alcohol and tobacco allowances).
- **2026-10-23. Zambia: 22 entry rows.** From the Department of Immigration's three nationality
  lists and its visitor page: 18 of our passports need no visa, Brazil, Mexico and Chile get a visa
  on arrival, India needs approval before travel; everyone gets 90 days in any 12 months.
- **2026-10-23. Zambia customs: 2 rows.** Alcohol and tobacco allowances from the Revenue
  Authority's importation page (from age 18: 2.5 L beer, 2.5 L wine, 1.5 L spirits; 400
  cigarettes or 0.5 kg tobacco or cigars). Cash held until the 2024 border-form guide can be read.
- **2026-10-23. Fiji: 22 entry rows.** From the Ministry of Immigration: every passport we cover
  is visa-exempt and gets a visitor permit on arrival for up to 4 months, extendable by 2.
