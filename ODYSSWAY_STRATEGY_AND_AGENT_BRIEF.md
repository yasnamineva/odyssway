# Odyssway Strategy & Agent Brief

## Executive decision

**Proceed with Odyssway, but do not pivot it into a generic immigration-route finder.**

The research supports a narrower thesis:

> **Odyssway should become a source-backed travel and residence compliance product: “Can I go, how long can I stay, what must I do, what can I bring, and—once I live abroad—am I still compliant?”**

Keep the existing calculators. Keep the Schengen 90/180 engine as a flagship asset. Keep the EES and ETIAS work. Keep “Can I bring it?”. Add a unified **Trip Compliance** experience that combines entry, stay, documents and item-level customs checks into one answer.

Do **not** prioritize a broad “Where can I move?” / personalized immigration-route marketplace. VisaGuide and Visa Atlas already occupy that territory, with Visa Atlas currently publishing 1,414 routes across 233 destinations and a deterministic route finder, while VisaGuide already markets personalized matching using profile data, barriers, documents, costs and timelines. [1][2]

The long-term expansion should be **residence compliance**, not a larger immigration encyclopedia: residence-permit status, travel/absence history, renewal dates, PR/citizenship clocks, document status, and “will this action affect my status?” checks.

### Confidence

- **High confidence:** keep the calculators and build a unified compliance layer.
- **High confidence:** do not compete head-on with VisaGuide/Visa Atlas on generic immigration discovery.
- **Medium-high confidence:** “Can I bring it?” is valuable as an acquisition/use-case module, but is not a moat by itself; CustomsCheck already offers 190+ country/item checking. [3]
- **Medium confidence:** consumer subscriptions alone are unlikely to be the strongest monetization model. A better model is free/high-traffic utilities → premium persistent compliance features → transactional/affiliate revenue where appropriate → B2B/API later.
- **No guarantee:** this is strategic evidence, not proof of future revenue. The implementation must include explicit validation gates before major investment.

---

## 1. What the research says

### 1.1 The generic immigration-finder category is already crowded

Visa Atlas currently presents itself as a free guide to **233 destinations and 1,414 immigration routes**, with government sourcing, route ranking and a personalized route finder. It also publishes cost-to-complete, salary-floor, processing-time and settlement datasets. [1][4]

Visa Atlas explicitly positions its route finder around qualifications, experience, language, savings and family context, and its dataset includes sponsor requirements and permanent-residence mapping. [1][4]

VisaGuide is also directly in this space: its product materials describe personalized recommendations based on user information and reports covering suitable countries, eligibility/barriers, required documents, costs and timelines. [2]

**Conclusion:** adding a generic “tell us about yourself and we’ll find immigration routes” feature would put Odyssway into an already-developed competitive lane without a clear advantage.

### 1.2 Travel-compliance demand is structurally large

IATA reported **record 2025 air-travel demand**, with international demand up 7.1% year over year. Its December 2025 outlook projected another 4.9% increase in global passenger traffic in 2026. [5][6]

EU tourism also reached a record in 2025, with nearly **3.1 billion nights** in accommodation and international-guest nights up 3.4%. [7]

This does not prove that a new compliance product will monetize, but it confirms a large underlying activity base. The opportunity is to monetize **high-friction moments inside travel**, not generic travel inspiration.

### 1.3 Entry requirements are already a mature B2B data market

IATA Travel Centre describes its database as the travel-document reference used by airlines, aggregating information from more than 1,000 official sources. [8]

Sherpa sells global travel-requirement data/API coverage for 200+ countries and advertises nationality-specific visa, passport, health and trip-procedure intelligence. [9][10]

There are also commercial APIs and application/affiliate businesses around the same data. This means:

- “we have visa requirements” is not differentiated;
- sourcing and freshness are table stakes for trust;
- an eventual Odyssway API should be considered only after the consumer workflow has proven demand.

### 1.4 The Schengen calculator category is competitive, but the problem is real

The European Commission itself publishes a 90/180 calculator and explicitly describes both checking and planning modes. [11]

The web/app category is active, with multiple products competing on trip history, planning, alerts, dashboards and pricing. Current examples include Schengen Monitor, ComplyEur, 90 Days in Europe, Schengen Simple and others. [12][13][14]

Some products monetize with small subscriptions, while others are free. [14][15]

**Conclusion:** the raw calculator is not a defensible moat. Odyssway needs to win on **edge-case correctness + compliance context + integration with the rest of the trip/residence workflow**.

### 1.5 “Can I bring it?” is a real, concrete use case

CustomsCheck currently markets item-level checking for **190+ countries**, with route input, item/photo identification and verdict categories such as allowed, declaration required, restricted and banned. [3]

This proves the category is commercially intelligible and useful, but also means a simple “destination + item → yes/no” checker is not defensible alone.

The correct Odyssway positioning is:

> **Can I bring this on this trip, under the rules that apply to me and my destination?**

The result should be nuanced and source-backed, not binary by force.

### 1.6 People do pay for compliance when the consequence of being wrong is high

B2B travel-compliance vendors already charge meaningful amounts. WorkFlex pricing is publicly listed from **€29/trip** for core travel compliance and **€69/trip** for a more comprehensive compliance tier; premote lists business-travel/compliance pricing from €19 per trip plus module fees. [16][17]

On the consumer side, willingness to pay is more limited. A 2026 Visa study of CEE travelers found higher-income travelers were willing to pay only around **€2 on average** for certain additional travel services, including AI travel planning and extra app features. [18]

This is an important warning:

> **Do not design Odyssway around a high-priced generic consumer subscription.**

A persistent consumer subscription can work only if it provides recurring, high-value compliance state—not just static information.

### 1.7 ETIAS/EES make the category more relevant, but are not enough by themselves

The EU says ETIAS will start in the last quarter of 2026 and currently is not accepting applications. [19][20]

The EU also operates the EES framework and publishes traveler-facing information about the system and stay checking. [21]

These programs increase the importance of accurate travel records and proactive compliance guidance. They are a **timing tailwind**, not the whole business.

---

## 2. The strategic thesis to implement

### Product thesis

**Odyssway is the source-backed compliance layer for international travel and residence.**

It should answer four questions for travel:

1. **Can I go?**
2. **How long can I stay?**
3. **What do I need to do / carry?**
4. **Can I bring this?**

Then extend the same state model into residence:

5. **What is my current legal/administrative status?**
6. **What happens if I travel/change jobs/change residence/family status?**
7. **When do I need to renew or act?**
8. **When could I become eligible for PR/citizenship?**

This is stronger than “immigration manual” because it creates a continuous product state rather than a reference library.

---

## 3. What NOT to build first

### Explicitly deprioritize

- Generic “best country for me” AI recommender.
- Broad personalized immigration-route marketplace.
- A 200-country immigration encyclopedia as the primary product.
- Generic relocation-cost content with no compliance state.
- A pure AI immigration chatbot.
- A “yes/no customs checker” with weak source provenance.
- An expensive consumer subscription sold before persistent compliance value exists.

These either duplicate established competitors or create a high-maintenance content burden without sufficient differentiation. [1][2]

---

## 4. What to keep from the existing AGENTS.md

### Keep and elevate

#### A. Schengen 90/180 calculator

Keep it as a flagship module.

Required strengths:

- rolling-window correctness;
- trip history;
- future-trip planning;
- overlapping-trip handling;
- residence permit / long-stay visa exclusions where legally applicable;
- dual-citizenship edge cases where supported;
- bilateral-agreement handling where supported;
- explicit rule scope;
- calculation auditability;
- test cases against the European Commission calculator. [11]

The calculator itself is not the moat. The **verified rule engine + surrounding compliance state** is.

#### B. EES guides

Keep. Prefer practical “what happens / what if it is wrong?” guidance over general explainers.

High-value future extension:

- record-error scenarios;
- false-overstay scenario;
- missing exit scenario;
- correction workflow;
- authority contact details;
- template correspondence;
- document preparation checklist.

#### C. ETIAS tracker

Keep, but classify it as opportunistic/traffic-generating until the system launches. The EU currently says ETIAS is expected in Q4 2026. [19]

Do not allocate core engineering architecture around ETIAS-specific logic.

#### D. “Can I bring it?”

Keep and make it part of the flagship trip-compliance flow.

---

## 5. The new flagship experience: Trip Compliance

### User input

```text
Passport / nationality
Current residence (optional but important for some cases)
Destination
Transit countries
Travel dates
Items being carried
Purpose of trip
```

### Output

```text
TRIP COMPLIANCE

Entry                 ✅
Stay                  ✅  23 days permitted for this trip
Passport/documents    ⚠️  1 document/action needed
Customs/items         ⚠️  1 item must be declared
Health                ✅ / ⚠️ as applicable
EES / border          ℹ️  what to expect

Sources + last verified dates
```

### The key UX principle

Do not make users separately run five calculators if Odyssway already has enough context to answer the whole trip.

The calculators remain available as deep tools, but **the flagship flow becomes the orchestration layer.**

---

## 6. “Can I bring it?” product specification

### Verdict model

Do not use only `allowed | banned`.

Use:

- `ALLOWED`
- `ALLOWED_WITH_DECLARATION`
- `RESTRICTED`
- `PROHIBITED`
- `PERMIT_REQUIRED`
- `UNSURE / OFFICIAL_CONFIRMATION_REQUIRED`
- `NOT_COVERED`

### Inputs

Minimum:

- origin
- destination
- item category
- item description
- quantity
- intended use

Optional/conditional:

- prescription status
- active ingredient
- animal/plant species
- alcohol percentage
- tobacco product type
- commercial vs personal use
- value
- accompanying documents

### Source requirements

Every substantive result must store:

- authority
- source URL
- source title
- jurisdiction
- effective date where available
- last-verified timestamp
- rule scope
- conditions/exceptions

### Safety/product requirement

If the system cannot establish the applicable rule, it must **not invent a verdict**. Return the uncertainty state and point the user to the competent authority.

---

## 7. The long-term moat: Personal Compliance Ledger

This is the expansion worth building after Trip Compliance is strong.

### Profile

- nationality/citizenship(s)
- current residence
- residence permits
- relevant visas
- travel history
- residence history
- family/dependant relationships
- document metadata
- immigration goals

Avoid collecting more sensitive data than necessary.

### State

```text
Current status
Upcoming deadlines
Travel days
Absence periods
Permit validity
PR progress
Citizenship progress
Missing documents
Required actions
Risk / attention items
```

### High-value questions

- “Can I leave for 60 days?”
- “How many days can I spend outside?”
- “When does my permit expire?”
- “Can I change employer?”
- “Does this trip affect my PR clock?”
- “What do I need for renewal?”
- “When can I apply for PR/citizenship?”

This is the recurring product value that generic visa-finder reports lack.

---

## 8. Residence strategy: narrow, not global

Do **not** immediately attempt to cover every immigration pathway worldwide.

Start with a handful of jurisdictions where there is a strong connection to Odyssway’s existing Europe/travel strengths and where long-stay/PR logic is commercially meaningful.

Candidate first-wave jurisdictions:

- Germany
- Spain
- Portugal
- France
- Netherlands
- Ireland
- United Kingdom

Then expand selectively based on demand and source-maintenance economics.

### Coverage model

Each residence module should define:

```text
JURISDICTION
  STATUS TYPES
    -> ENTRY PATH
    -> RESIDENCE CONDITIONS
    -> TRAVEL / ABSENCE RULES
    -> RENEWAL
    -> PR PATH
    -> CITIZENSHIP PATH
```

Do not build a giant “visa catalog” first.

---

## 9. Monetization model

### 9.1 Free acquisition layer

Make the following free or mostly free:

- Schengen calculator
- basic entry checker
- basic stay calculator
- basic customs checker
- ETIAS/EES informational pages
- single-purpose calculators

The goal is search/discovery and trust-building.

### 9.2 Premium individual layer

Charge for **persistent state**, not for facts.

Possible paid features:

- saved travel ledger
- multiple traveler profiles
- alerts
- upcoming-compliance dashboard
- trip compliance report export
- residence ledger
- PR/citizenship tracking
- multi-jurisdiction history
- document status management
- advanced planning scenarios

Initial pricing should be tested, not assumed. A reasonable hypothesis to test is **€3–8/month** or a **€29–59/year** plan for consumers who travel/reside internationally often.

The important thing is not the exact price. The important test is whether users return often enough to value a persistent compliance record.

### 9.3 Transactional / affiliate revenue

Where legally and ethically appropriate, consider referral revenue for:

- visa application services
- travel insurance
- document translation
- apostille providers
- relocation services
- regulated immigration professionals

Do not bias compliance answers toward the paid partner.

### 9.4 B2B later

This is the strongest obvious monetization extension if consumer usage proves the underlying rules engine.

Potential customers:

- relocation firms
- immigration lawyers
- HR/global mobility teams
- recruitment agencies
- international employers
- travel platforms

B2B pricing can be substantially higher than consumer pricing. Existing travel-compliance software publicly advertises per-trip pricing such as €29 and €69, while other vendors use monthly module fees plus usage-based pricing. [16][17]

---

## 10. Validation gates: do not build on faith

This section is mandatory. Agents should treat it as a product requirement.

### Gate 1 — Calculator demand

Measure:

- organic visits to Schengen calculator;
- completion rate;
- repeat usage;
- saved-trip adoption;
- future-trip planning usage;
- percentage of users who open a second Odyssway tool.

**Pass condition:** users demonstrate multi-step behavior, not just one-off calculator use.

### Gate 2 — Trip Compliance demand

Ship a combined Trip Compliance beta.

Measure:

- completion rate;
- percentage checking at least 2 categories;
- return usage before another trip;
- share of users checking an item/customs rule;
- report/export usage;
- email/alert opt-in.

**Pass condition:** meaningful cross-tool usage and repeat intent.

### Gate 3 — Willingness to pay

Before building a large subscription system, test:

- premium report purchase;
- saved-history premium;
- alerts premium;
- family/multi-traveler premium.

Use real checkout/price experiments, not surveys alone.

### Gate 4 — Residence ledger

Only build the residence product when:

- users repeatedly ask for “what happens after I move?”;
- existing travelers save long-term profiles;
- a non-trivial percentage opts into reminders/status tracking.

### Gate 5 — B2B

Do not build an API merely because it sounds attractive.

Pilot with 3–5 actual organizations first.

Success should mean willingness to pay for:

- a data feed;
- a compliance dashboard;
- employee/traveler case tracking;
- or an API.

---

## 11. Recommended product roadmap

### Phase 1 — Current foundation

**Goal:** establish Odyssway as the trusted travel compliance product.

Build/finish:

- Schengen calculator excellence;
- entry checker;
- stay policy engine;
- document requirements;
- customs/item checker;
- EES guides;
- ETIAS tracker;
- source/versioning infrastructure.

### Phase 2 — Trip Compliance

Create a single result that combines:

- entry
- stay
- documents
- customs/items
- border guidance

Add:

- saved trip
- share/export
- source trail
- last-verified timestamps

### Phase 3 — Personal Travel Ledger

Add:

- persistent travel history;
- alerts;
- multi-traveler support;
- cross-trip reasoning;
- compliance dashboard.

### Phase 4 — Residence Compliance

Add selectively by jurisdiction:

- residence status;
- permit expiry;
- absence tracking;
- renewal;
- PR clock;
- citizenship clock;
- action/deadline reminders.

### Phase 5 — B2B

Only after consumer rules/data infrastructure proves reliable:

- API;
- team dashboard;
- employee travel compliance;
- relocation workflows;
- professional exports.

---

## 12. Data architecture requirements

The architecture should support the product thesis from the beginning.

### Every rule should be versioned

```text
rule_id
jurisdiction
category
applicability
conditions
value
unit
effective_from
effective_until
source_url
source_title
source_authority
last_verified_at
review_due_at
confidence
```

### Every calculator should expose scope

Each calculation should state:

- jurisdiction;
- legal rule being applied;
- what inputs count;
- what inputs are excluded;
- assumptions;
- known limitations;
- last verification date.

### Every answer should be reproducible

A user should be able to understand:

> “Why did Odyssway give me this answer?”

Do not make runtime LLM generation the authority for legal/compliance facts.

Use deterministic rules/data for the decision, and AI for explanation/navigation where appropriate.

This is aligned with the strongest public parts of the current market: Visa Atlas, for example, explicitly uses structured primary-source data and says its route triage does not call an LLM at runtime. [1][4]

---

## 13. SEO/content strategy

Use calculators as acquisition pages, not as the product thesis.

### High-intent page families

```text
/can-i-enter/{destination}/{nationality}
/how-long-can-i-stay/{destination}/{nationality}
/can-i-bring/{destination}/{item}
/customs/{destination}
/schengen-90-180-calculator
/{destination}/ees
/{destination}/etias
/{destination}/entry-requirements
```

Then connect each page into:

**Check my whole trip → Trip Compliance**

This is more coherent than publishing thousands of disconnected visa pages.

---

## 14. “Can I bring it?” content model

Launch with high-risk/high-search categories:

- medication
- food
- animal products
- plants/seeds
- alcohol
- tobacco/nicotine
- cash
- CBD/cannabis
- drones
- weapons
- batteries/electronics

Do not try to build a generic item encyclopedia.

Prioritize combinations where rules differ significantly by destination and the consequences of error are meaningful.

---

## 15. Product positioning

Avoid positioning such as:

> AI immigration assistant

> Find the best country to move to

> Global visa database

> Immigration manual

Preferred positioning:

> **International travel & residence compliance**

And the user-facing promise:

> **Know if you can go. Know how long you can stay. Know what you need. Know what you can bring. Stay compliant after you move.**

Alternative shorter promise:

> **Your travel and residence compliance layer.**

---

## 16. What the agents should change in AGENTS.md

### Replace the current top-level product framing

Replace the current single travel question with:

```text
Odyssway answers:
“Given who I am, where I am going, what I am carrying, and—when relevant—my
residence/travel history: can I go, how long can I stay, what do I need, can I
bring it, and what actions do I need to take to remain compliant?”
```

### Add these product principles

```text
1. Accuracy beats coverage.
2. Rules are authoritative; AI is explanatory.
3. Every material compliance answer needs a source trail and verification state.
4. Unknown is a valid result. Never fabricate certainty.
5. Calculators are reusable engines, not isolated pages.
6. The flagship product is Trip Compliance, not a visa directory.
7. Persistent compliance state is the long-term retention layer.
8. Immigration expansion should focus on residence compliance, not generic visa discovery.
9. New jurisdictions are added only when source maintenance is sustainable.
10. Consumer monetization must be validated before large subscription engineering.
```

### Add explicit product boundaries

```text
We do NOT compete primarily on:
- largest visa-route directory;
- generic country ranking;
- generic AI immigration advice;
- broad relocation content.

We compete on:
- source-backed compliance decisions;
- edge-case-aware calculators;
- integrated trip compliance;
- item-level customs checks;
- persistent travel/residence state;
- explainable and auditable answers.
```

---

## 17. Agent implementation order

Agents should implement in this order:

### P0 — Protect correctness

- formalize source metadata;
- formalize effective dates/review dates;
- improve calculator test coverage;
- make uncertainty/coverage explicit;
- ensure every result can expose source provenance.

### P1 — Trip Compliance orchestration

- shared traveler/destination/trip context;
- combine entry + stay + documents + customs;
- unified result schema;
- source trail UI;
- saved trip.

### P2 — Can I bring it?

- structured item categories;
- destination-specific rules;
- nuanced verdicts;
- quantity/condition handling;
- conservative unknown state;
- source-backed item pages.

### P3 — Retention

- travel ledger;
- alerts;
- multiple travelers;
- report/export;
- repeat-trip support.

### P4 — Residence compliance

- one jurisdiction at a time;
- permit status;
- renewal;
- absence tracking;
- PR/citizenship milestones.

### P5 — Monetization experiments

- premium saved history;
- alerts;
- exports;
- annual plan;
- transactional referrals.

### P6 — B2B validation

- manual concierge pilot first;
- then API/dashboard if customers pay.

---

## 18. Final strategic verdict

### Build

- Schengen calculator
- generalized StayPolicy engine
- entry/document checker
- “Can I bring it?”
- EES/ETIAS
- unified Trip Compliance
- source/versioning infrastructure
- personal travel ledger
- selective residence compliance

### Do not make the core

- immigration-route discovery
- country recommendation
- generic immigration reports
- giant immigration directory

### Why

The broad immigration-discovery problem is already being attacked aggressively by VisaGuide and Visa Atlas. [1][2]

The travel-compliance market is large and active, while the exact individual utility categories already show user demand and some monetization. [3][5][12][16]

The strategic whitespace is therefore **not another database**. It is the integration of multiple compliance decisions into one persistent, source-backed personal state.

### The core bet

> **Odyssway wins when a traveler stops asking five separate questions and instead trusts one system to keep their travel/residence compliance state correct.**

That bet should be validated with real usage and payment behavior before a major expansion into global immigration coverage.

---

## Sources

1. **Visa Atlas**, “Visa Atlas — Compare sourced visa routes to 100+ countries,” current site, accessed September 11, 2026. https://visaatlas.org/ and https://visaatlas.org/visas
2. **VisaGuide**, current immigration/migration product and personalized reports, accessed September 11, 2026. https://visaguide.app/
3. **CustomsCheck**, “Know what you can bring before you travel,” current product page, accessed September 11, 2026. https://customscheck.org/en
4. **Visa Atlas**, “Immigration figures, compared across destinations,” current datasets and methodology, accessed September 11, 2026. https://visaatlas.org/figures
5. **IATA**, “Strong 2025 Passenger Demand Masks Ongoing Capacity Constraints,” January 29, 2026. https://www.iata.org/en/pressroom/2026-releases/2026-01-29-02/
6. **IATA**, “Global Outlook for Air Transport – Trade, AI, and the energy transition,” December 2025. https://www.iata.org/en/iata-repository/publications/economic-reports/global-outlook-for-air-transport-december-2025/
7. **Eurostat**, “Another record year for EU tourism in 2025,” March 4, 2026. https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20260304-1
8. **IATA**, “Travel Centre – Passport, Visa & Health requirements,” current product page, accessed September 11, 2026. https://www.iata.org/en/travel-centre/
9. **Sherpa**, “Global Travel Requirements,” current product page, accessed September 11, 2026. https://www.joinsherpa.com/products/travel-requirements
10. **Sherpa**, official API documentation, accessed September 11, 2026. https://docs.joinsherpa.com/
11. **European Commission**, “Short-stay calculator,” updated October 27, 2025. https://home-affairs.ec.europa.eu/policies/schengen/border-crossing/short-stay-calculator_en
12. **Schengen Monitor**, “Schengen 90/180 Calculator & Trip Planner,” accessed September 11, 2026. https://www.schengenmonitor.com/
13. **ComplyEur**, “Schengen 90/180 day rule calculator,” accessed September 11, 2026. https://complyeur.com/schengen-calculator
14. **90 Days in Europe**, “Best Schengen Calculator Apps & Tools Compared 2026,” March 27, 2026. https://90daysineurope.com/2026/03/27/best-schengen-calculator-apps-tools-compared-2026-find-your-perfect-90-180-day-tracker/
15. **Do a Stretch**, comparison of Schengen calculator products, updated August 29, 2026. https://doastretch.com/compare/stretch-vs-schengen-90-180-calculator/
16. **OMR Reviews**, WorkFlex pricing, June 2026. https://omr.com/en/reviews/product/workflex/pricing
17. **premote**, pricing page, accessed September 11, 2026. https://www.premote.de/en/preise
18. **Visa**, CEE travel benefits / willingness-to-pay study, 2026. https://www.visa.pl/o-korporacji-visa/newsroom/press-releases.3450277.html
19. **European Union / ETIAS**, “What you need to apply,” current official page. https://www.travel-europe.europa.eu/etias/how-to-apply/what-you-need-to-apply
20. **European Union / ETIAS**, “Not operational,” current official page. https://travel-europe.europa.eu/etias/ltr/not-operational.html
21. **European Union / EES**, official EES information portal. https://travel-europe.europa.eu/ees/ltr

---

## Appendix: Recommended one-line product definition for agents

```text
Odyssway is a source-backed international travel and residence compliance platform that combines entry eligibility, stay calculations, document requirements, item-level customs checks, border/EES guidance, and—over time—persistent travel and residence compliance tracking.
```
