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

- **Already built:** the 90/180 calculator.
- **Next candidates:**
  - **Passport validity checker:** "valid for X months *beyond departure*", calculated
    from the user's dates and each destination's verified rule.
  - **Multi-country itinerary check:** the whole route, one verdict per leg, for each
    medication.
  - **Combined day count:** Schengen 90/180, plus the UK and US per-entry limits, on
    one timeline.

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
  release.

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
