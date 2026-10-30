# Odyssway Product Expansion Strategy
## Implementation brief for a coding agent

**Purpose:** Expand Odyssway from travel entry/stay-compliance tools into a travel readiness and trip-cost optimization platform.

**Product thesis:** Help travelers answer three questions:
1. **Can I go?** Entry requirements, visas, passport validity, stay limits, and transit rules.
2. **Am I ready?** Document expiry, application steps, deadlines, and reminders.
3. **Can I get a comparable experience for less?** Compare dates, destinations, flights, accommodation, and total trip cost.

**Important:** This document is a product and implementation brief, not permission to invent functionality, change production data, or integrate paid services without approval. Inspect the existing repository and architecture first. Preserve working functionality and existing design conventions.

---

## Status (updated 2026-10-30)

Reviewed 2026-10-28 against AGENTS.md and `GROWTH_AND_ROADMAP.md` §2. Questions 1 and 2 ("Can I go?", "Am I ready?") were adopted; question 3 ("Can I get it for less?") was declined. The roadmap is the working plan; this brief is kept as the source of the reasoning. Sections below are the original brief, unchanged.

| Brief section | Status | Where |
|---|---|---|
| §2 Audit | Done as the roadmap review, not as `docs/product-expansion-audit.md` | `GROWTH_AND_ROADMAP.md` §2 |
| §3 Document expiry and readiness | **Built (passport only)**: trip readiness planner, per traveller and stop, passport validity checked against each verified rule, legal deadline kept apart from a recommended date (the user's buffer), one `.ics`, plan saved only in the browser on opt-in | `/readiness`, `apps/web/lib/readiness.ts` |
| §3 Other documents (ID, visas, permits, IDP, insurance) | Open. Needs verified rules per document type before a validity check is possible; free-form expiry reminders could come first | Roadmap §2 candidate |
| §4 Visa and document action planner | **Built**: 9 travel-authorisation guides (official link, fee, validity, processing time, unofficial-site warning), each claim checked against the issuing government; Canada eTA, NZeTA and Israel ETA-IL held until their pages are readable | `/authorisations`, `data/travel-authorisations.json` |
| §5 Budget calculator, cost model | **Partly, government charges only**: authorisation fees, compulsory insurance, levies and departure taxes per destination and per stop | `data/trip-charges.json`, destination hubs, `/readiness` |
| §5 Live flights and hotels, cheapest dates or destinations | **Declined** (2026-10-28): no advantage against funded price-comparison sites, and unverifiable prices would undermine the cited-and-dated brand | Roadmap §2 "Deliberately not building" |
| §6 Trip workspace | **Partly**: `/readiness` connects entry, passport, authorisations, forms, charges and reminders. A saved trip shows rule changes for its destinations since it was last checked (pre-departure recheck) | `/readiness` |
| §8 Privacy | Kept: no accounts, no document numbers or scans, everything in the browser | `/privacy` |
| §9 Monetization | Not started. Accounts, email alerts and a paid plan for saved trips need the owner's go-ahead (Horizon 2); affiliates need a privacy and terms update first | Roadmap §6, §7 |
| §13 Metrics | Partly: cookie-free anonymous counter of tool actions (`/api/count`). Analytics (Plausible) declined for now on cost | Roadmap §2 item 5 |

**Next steps from this brief:**
1. Read the counter data: is `/readiness` used, are `.ics` files downloaded, do people return? That decides whether accounts and email alerts (§3 "later") are worth proposing.
2. Expiry reminders for documents other than passports, without validity verdicts until rules for them are verified.
3. Test a one-off paid item (§9, e.g. a family travel-history PDF) only after the counter shows repeat use, and only with the owner's go-ahead.

---

## 1. Strategic direction

Build a connected trip workflow, not a collection of disconnected tools.

Recommended positioning:

> Know if you can go. Get everything ready. Find a better trip for your budget.

Prioritize:
1. Document expiry and travel-readiness reminders.
2. Personalized visa/document application guidance.
3. Indicative trip budget and transparent total-cost model.
4. Live flight/hotel comparisons through approved data providers.
5. Date and destination optimization.
6. Unified trip dashboard and pre-departure rechecks.

Do not start by building a generic itinerary chatbot, a global booking engine, a passport-scan vault, or automated visa application submission.

## 2. First step: audit the current product

Before implementing anything:

- Inspect the repository, framework, routing, data model, authentication, database, styling system, deployment setup, tests, and analytics.
- Review the current production website and existing tools.
- Identify existing Trip Check, Schengen calculator, source verification/changelog, browser-only calculations, and any reminder or export features.
- Identify reusable components and logic; do not duplicate existing functionality.
- Document current architecture, known constraints, and recommended integration points in `docs/product-expansion-audit.md`.
- Report findings and a proposed implementation plan before making broad architectural changes.

Do not assume the existing stack or provider APIs. Do not expose secrets, introduce credentials into source control, or make unapproved paid API calls.

## 3. Product 1: document expiry and readiness manager

### User value

Users should be able to track document dates and determine whether a document appears to satisfy requirements for a specific itinerary. The tool must distinguish legal requirements from recommended action dates.

### MVP

Allow a user to record:
- Document type (passport, national ID, visa, electronic travel authorization, residence/re-entry permit, international driving permit, insurance, or custom item).
- Issuing country, when relevant.
- Expiration date.
- Optional notes.
- Optional linked trip/destination and travel dates.

Start with metadata only. Do not require passport numbers, document scans, or other unnecessary sensitive data.

### Trip-specific checks

For a selected itinerary, show:
- The applicable requirement and its official source.
- Whether the stored expiration date appears to satisfy the rule.
- The official/legal deadline, where one exists.
- A recommended action date based on documented processing-time assumptions and an explicit safety buffer.
- Uncertainty, exceptions, and what needs confirmation.

Never assume every destination requires six months of remaining passport validity. Rules can depend on nationality, document type, destination, transit, residence status, and travel dates. Avoid definitive legal guarantees.

### Reminders

Initial implementation:
- Generate downloadable `.ics` calendar events.
- Support editable reminder dates and labels.
- Make clear that an `.ics` file only creates reminders after the user imports it into a calendar.
- Ensure events include time zone/date handling that avoids off-by-one-day errors.
- Provide clear instructions for importing into common calendar apps.

Later, if user accounts and infrastructure support it:
- Persistent email/push notifications.
- Direct calendar integration only after explicit user authorization.
- Ability to update, cancel, and deduplicate reminders.

### Acceptance criteria

- User can create, edit, and delete a document record.
- Expiration dates are validated and displayed consistently.
- User can link a document to a trip.
- The app never labels an estimate as an official legal deadline.
- Every rule-based result has a source and last-verified date, or clearly says that verification is unavailable.
- Calendar export produces a valid `.ics` file with the correct date.
- No sensitive fields are collected unless strictly necessary and approved.
- Automated tests cover date boundaries, leap years, time zones, and missing/uncertain rule data.

## 4. Product 2: personalized visa and document action planner

### User inputs

Collect only the inputs necessary for the requested itinerary:
- Passport nationality/citizenship.
- Legal residence, when relevant.
- Destination(s) and transit points.
- Travel dates and trip duration.
- Purpose of travel (tourism, business, study, work, family visit, etc.).
- Current documents/permissions, where relevant.

Explain why each input is needed. Do not infer work authorization from tourist entry eligibility.

### Output

Create a step-by-step checklist containing:
- Entry/visa/authorization requirement.
- Supporting documents.
- Application channel and official government/consulate link.
- Official fees and processing time only where verified.
- Earliest/latest application timing when supported by official sources.
- Requirement exceptions and unresolved questions.
- Source URL, source title, and last-checked timestamp.
- Clear labels for verified, incomplete, conflicting, or uncertain information.

### Data quality and safety

Use structured rules and authoritative sources rather than asking a language model to invent requirements. AI can explain rules in plain language, but should not be the authority for eligibility decisions.

High-impact changes, conflicting sources, and complex edge cases should be flagged for human review. Do not submit applications on behalf of users in the MVP. Do not imply that a checklist guarantees visa approval or admission.

### Acceptance criteria

- Results are based on structured rules for the known user/trip context.
- Unknown or missing inputs trigger clarification or a clearly qualified result.
- Official links are visibly distinguished from third-party services.
- Fees and processing times are omitted or marked unverified if no reliable source is available.
- Entry permission and permission to work/reside are treated separately.
- Each result is traceable to a source and a verification date.

## 5. Product 3: vacation budget calculator

### Product promise

“Give me the experience I want, and find the cheapest realistic way to get it.”

Users should be able to specify:
- Origin airport/city and acceptable nearby airports.
- Number and type of travelers.
- Travel window and date flexibility.
- Trip duration or flexibility in trip length.
- Total budget and currency.
- Desired experience (beach, city, nature, resort, culture, etc.).
- Accommodation standard and location preferences.
- Flight constraints (direct flights, maximum travel time, baggage, layovers).
- Accessibility and other important constraints.

### Cost model

Calculate a comparable trip total from:
- Return flights and applicable taxes.
- Baggage and relevant seat/booking fees, when data is available.
- Accommodation for the full stay.
- Mandatory accommodation taxes and fees.
- Ground transport, airport transfers, rental car, parking, or local transit.
- Food estimate based on user-selected travel style.
- Activities estimate.
- Relevant visa/authorization and insurance costs.
- Optional contingency buffer.

Show assumptions and itemized cost breakdowns. Distinguish:
- **Indicative estimate:** modeled or estimated price, not verified as bookable.
- **Retrieved offer:** price returned by a provider, with timestamp and terms.
- **Verified/bookable offer:** only use this label if the provider flow supports that claim.

Do not show invented live prices, availability, flight schedules, hotel ratings, or savings.

### Search modes

1. **Cheapest dates:** preserve trip duration and constraints while varying dates.
2. **Cheapest destination:** find destinations with a similar experience, taking into account transport and ground costs.
3. **Best value:** rank by price, experience fit, travel time, comfort, and constraints—not price alone.

### Alternative destinations

Recommendations must explain why the alternative matches the desired experience and what differs. Compare factors such as:
- Weather/seasonality.
- Beach or activity characteristics.
- Accommodation standard and location.
- Food and local transport costs.
- Total travel time and complexity.
- Visa/entry eligibility.
- Any meaningful trade-offs.

Do not assume two destinations are interchangeable merely because both are coastal or have similar marketing labels.

### Implementation stages

**Stage A — indicative budget**
- Build the input form and transparent estimate model.
- Make assumptions editable.
- Clearly label estimates as estimates.

**Stage B — real inventory**
- Research available, approved flight/hotel data providers and their commercial/API terms.
- Do not select a provider until coverage, cost, attribution, caching, rate limits, and booking-link rules are understood.
- Integrate approved APIs behind server-side adapters.
- Keep API keys server-side and out of browser bundles.
- Record provider and retrieval timestamp for offers.

**Stage C — optimization**
- Generate candidate date windows, nearby airports, destinations, and accommodation options.
- Retrieve actual offers.
- Calculate full-trip totals.
- Filter hard constraints first.
- Rank remaining options by total cost and experience similarity.
- Show the top 3–5 options and explain trade-offs.

**Stage D — saved searches**
- Saved comparisons and user-configurable price alerts.
- Recheck availability before showing an offer as current.
- Do not promise the absolute cheapest trip across the whole market unless coverage supports that claim.

### Ranking guidance

Use deterministic code for arithmetic, dates, constraints, and ranking. AI can interpret natural-language preferences, suggest candidate destinations, and explain results. AI must not fabricate offers or override hard eligibility constraints.

### Acceptance criteria

- Each offer clearly identifies the source/provider and retrieval time.
- Price components and assumptions are visible.
- Missing cost components are marked unknown or estimated, not silently treated as zero.
- Results obey hard user constraints or explicitly explain why no match exists.
- Recommendations never claim universal cheapest status without evidence.
- Booking/referral links are valid and commercial relationships are disclosed.
- Tests cover currency conversion assumptions, rounding, per-person vs total pricing, nights vs days, child/infant pricing where supported, and missing fees.

## 6. Product 4: unified trip workspace

Create one trip record that can connect compliance, documents, reminders, and cost comparisons.

Suggested sections:
- Trip overview and travelers.
- Entry requirements and transit checks.
- Document checklist and deadlines.
- Application actions.
- Flight/hotel comparisons and cost breakdown.
- Calendar reminders.
- Pre-departure recheck.
- Source/update history.

A group trip must not assume every traveler has the same nationality, documents, visa status, or stay history. Store eligibility per traveler where relevant.

The dashboard should show actionable status without falsely implying legal certainty. For example, prefer “Review required” or “Based on the information provided” over an unqualified “You are cleared to travel.”

## 7. Shared architecture

Reuse the existing stack and conventions wherever practical. A conceptual shared foundation:

- **Trip profile:** traveler context, destinations, dates, preferences.
- **Compliance engine:** entry rules, visas, stay limits, customs, transit.
- **Readiness engine:** documents, deadlines, reminders.
- **Travel inventory adapters:** flights, hotels, prices, offers.
- **Optimization engine:** date/destination candidate generation, cost calculation, ranking.
- **Notification service:** calendar exports first; persistent alerts later.
- **Trip workspace:** unified user-facing workflow.
- **Source registry:** official URL, title, jurisdiction, rule scope, last verified, review status, and version/history.

Avoid duplicating rule logic across tools. Keep business logic separate from UI. Make external providers replaceable behind adapters. Add observability for API failures, stale offers, and rule-data problems.

Do not perform broad migrations or add infrastructure without documenting why and getting approval where required.

## 8. Privacy, security, and trust

The current product may perform some calculations locally. Persisting trips or reminders can change the privacy model. Make that change explicit.

Requirements:
- Collect the minimum data necessary.
- Do not store passport scans or passport numbers in the MVP.
- Use secure authentication and authorization if accounts are introduced.
- Encrypt sensitive data in transit and at rest where applicable.
- Define retention and deletion behavior.
- Avoid logging sensitive traveler details.
- Keep secrets out of source control and client bundles.
- Make connected calendar access opt-in and revocable.
- Clearly distinguish official sources, third-party providers, estimates, and affiliate offers.
- Do not let affiliate commission change the ranking criteria in undisclosed ways.

## 9. Monetization hypotheses

Keep essential entry-rule and stay-compliance functionality accessible for free.

Potential models to validate:
- One-time paid trip readiness report.
- Annual plan for frequent travelers/families with multiple saved trips and monitoring.
- Flight/hotel referral commissions.
- Relevant insurance or travel-service partnerships, with clear disclosure.

Illustrative pricing hypotheses for user research only:
- One-time trip product: €3–9.
- Annual frequent-traveler plan: €20–40/year.

Do not hard-code pricing before validation. Do not implement paywalls or commercial integrations without approval. Prioritize user trust and accurate results over affiliate conversion.

## 10. SEO and acquisition

Potential tool/content clusters:
- Passport validity by destination.
- Passport expiry calculator.
- Visa and transit requirement checker.
- Family travel document checklist.
- Cheapest month to visit a destination.
- Total cost for a 7-day trip.
- Flexible-date destination comparisons.
- Pre-departure checklist.

Avoid mass-producing thin AI-generated pages. Every page should offer a useful tool, sourced guidance, or a meaningful comparison. Track completed tool actions, saved trips, reminder activation, repeat use, and referral conversion—not just impressions.

## 11. What not to build yet

Defer:
- Generic AI itinerary generator as a standalone product.
- Full global flight/hotel booking engine.
- Passport/document scan vault.
- Automated visa application submission.
- Global coverage before data quality and demand are proven.

A generic itinerary can be a supporting feature. A booking engine introduces significant supplier, cancellation, support, and operational complexity. A document vault raises security obligations. Application submission is highly jurisdiction-dependent and should not be attempted without a proven operating model.

## 12. Suggested 90-day plan

### Days 1–30: audit and readiness MVP
- Complete repository/product audit.
- Implement document metadata and expiry tracking.
- Add downloadable calendar events.
- Connect document checks to itinerary context.
- Build official-source application checklists.
- Add a saved-trip prototype only if privacy and persistence are understood.
- Test with 10–15 target travelers.

### Days 31–60: validate cost optimization
- Choose one launch market and limited destination set.
- Research and select a provider only after API/commercial review.
- Build an indicative budget and cost breakdown.
- Add real offers through approved integrations if feasible.
- Test flexible dates and destination alternatives.
- Track clicks, saved comparisons, and user-reported usefulness.

### Days 61–90: connect and optimize
- Launch the trip workspace.
- Add pre-departure rechecks and notification preferences.
- Test group/family workflows.
- Validate paid trip reports and affiliate economics.
- Measure actual savings and offer price accuracy.
- Expand only where quality and demand justify it.

The dates are a planning framework, not a commitment. Adjust after the repository audit and provider research.

## 13. Metrics to instrument

Initial internal hypotheses (not industry benchmarks):
- 25%+ of visitors complete a useful tool action.
- 15%+ of completed trip checks lead to a saved checklist/reminder.
- 15%+ of users return within 90 days.
- 5%+ click a relevant travel offer.
- 95%+ of offers still match displayed pricing when reopened, subject to provider capabilities.
- 100% of high-impact published compliance rules have traceable sources.

Track:
- Rule correctness and source coverage.
- Stale/missing offer rate.
- Offer-to-booking conversion where measurable.
- User-reported savings.
- Retention and reminder activation.
- Support incidents and user trust signals.

Do not optimize one metric at the expense of safety, compliance accuracy, or transparent pricing.

## 14. Required coding-agent workflow

1. **Inspect first.** Audit the codebase, existing product, and deployment constraints.
2. **Write an audit report.** Create `docs/product-expansion-audit.md` with current architecture, existing features, reusable logic, gaps, risks, and recommended sequence.
3. **Propose a small implementation plan.** Identify files/components/data changes, tests, dependencies, and any external services needed.
4. **Implement the smallest useful slice.** Prefer document metadata + itinerary-aware validity checks + `.ics` export as the first vertical slice, unless the audit finds this already exists or a better immediate path.
5. **Test.** Add unit/integration tests for date logic, rule uncertainty, permissions, export behavior, and regressions.
6. **Document.** Explain configuration, data assumptions, limitations, and how to run tests.
7. **Report honestly.** List what changed, tests run, known gaps, provider dependencies, and any manual steps required.

Do not:
- Invent API endpoints, credentials, prices, or live inventory.
- Claim a feature is complete when only a UI mock exists.
- silently replace existing functionality.
- add paid services or send production notifications without authorization.
- publish unverified immigration guidance as authoritative.
- make large architecture changes before documenting the rationale.

## 15. Definition of success

The first release is successful when a user can:
1. Add a document and its expiration date.
2. Connect it to a trip.
3. See a sourced, qualified assessment of relevant validity requirements.
4. Understand the difference between official deadlines and recommended action dates.
5. Export reminders to a calendar.
6. Follow an official application checklist when additional documents or permissions are required.

The next release is successful when users can compare realistic trip totals and discover a cheaper alternative without misleading prices or ignored travel constraints.

The long-term product advantage is the connected workflow: **eligibility → readiness → trip optimization → reminders → pre-departure recheck**.
