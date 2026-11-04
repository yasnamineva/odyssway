# Odyssway: Growth Plan and Long-Term Roadmap

Rewritten 2026-10-25. This file lists only what is still ahead; finished work lives in git
history and on `/changelog`. It is a working plan, not a rulebook: AGENTS.md governs how
anything gets built, and its Accuracy Policy (§3) comes before everything here. Topics
listed as *candidates* are research leads, not verified rules, and none can be published
without a primary official source.

Where we are today (2026-11-04):

- 68 destinations plus the Schengen Area; 3,924 verified entry rows; 736 customs rows
  (155 medication, 43 with a doctor's-letter checklist, 21 with a permit how-to, 19 with
  a transit rule); 1,125 entry rows with a structured passport-validity rule.
- Tools: Trip Check (multi-country route, passport check per stop), the trip readiness
  planner, travel-authorisation guides, the 90/180 calculator, the multi-country day counter, named-medicine pages, border cards,
  embeddable calculator and "Can I bring it?" widgets, the public JSON API.
- About 2,000 URLs in the sitemap. Google indexes well; Bing indexes the pages but shows
  them rarely (young domain, few links).
- No analytics, by design.

---

## 0. Current priority: SEO (from the October 2026 Search Console review)

SEO comes first until the striking-distance pages below reach page 1. The full work list with
numbers is local (`seo/gsc/2026-10/worklist.md`, git-ignored because the repo is public).

**What the data says (last 28 days to 24 Oct 2026):**
- "Can I bring X to Y" pages (`/bring/{item}/{country}`) and named-medicine pages earn about 70%
  of clicks and rank around position 14: the item niche works. Invest here.
- Passport × destination pages get as many impressions but rank around position 49 for generic
  visa searches ("israel visa for us citizens", "thailand visa for indians"). Don't chase those
  (§14); improve pair pages only where they're already close.
- Hub pages (`/bring/tobacco`, `/bring/medication`) reach position 10–11 but get almost no
  clicks: their titles are generic.
- Mobile ranks much better than desktop (position ~19 vs ~40).

**Work, in order** (✔ = done):
1. ✔ (2026-10-26) "Can I bring it?" item hubs retitled in search wording ("How many cigarettes
   can you bring?"), with a counted summary and an at-a-glance limits table. Every
   `/bring/{item}/{country}` page now also links the same item in up to 12 other countries,
   same region first (the Malaysia cluster was already linked by country).
2. ✔ 2026-10-26: titles on item and medicine pages now give the limit when it's
   short ("Yes, limit: 1 litre", "Yes; declaration limit ¥1,000,000"), falling back to the plain
   answer. ✔ 2026-10-26: answer-first summaries for 15 priority rows whose text opened with a source
   attribution (Serbia, UAE, Maldives, Mexico, Hong Kong tobacco); UK vaping allowance updated
   (50 ml). ✔ 2026-10-26: summaries for the other 61 rows on pages with 20+ impressions in the October
   export. Remaining rows without one get fewer impressions; add summaries as pages start ranking.
   Striking distance (position 8–20): for each page, a title and H1 in the search wording, the
   answer in the first two sentences, facts the row has but the page hides, and links from 3+
   related pages. Priority pages:
   - Malaysia cluster: tobacco, e-cigarettes, meat and dairy, fresh produce.
   - Hong Kong alcohol and cash; Philippines alcohol; Thailand tobacco; UAE meat and dairy;
     Indonesia e-cigarettes; Morocco tobacco; Serbia alcohol; Taiwan tobacco.
   - Fresh produce: Singapore, United Kingdom, Taiwan.
   - Medication: Argentina, Maldives; Ozempic and Wegovy in Mexico, Wegovy in Thailand.
   - `/blog/thailand-visa-free-cut-2026`, `/sources`.
   ✔ 2026-10-26 pass over the list above: snippets on pages with several rules now quote each
   rule (allowance first) instead of listing verdicts; Malaysia tobacco re-labelled "declaration
   required" (no duty-free, declare all); the Thailand post is linked from every Thailand passport
   page (entry-rule posts now show on their destinations' passport pages); `/sources` has a
   search-worded title, counts, the oldest check date and links to each destination hub. The
   "can you buy Wegovy in Mexico" queries stay ignored (buying, not bringing).
3. Position 21–40 with volume: ✔ Thailand e-cigarettes re-sourced to the Royal Thai Embassy
   with a summary (2026-10-26; exact penalties need the Customs Act text). ✔ Turkey alcohol and
   tobacco corrected (2026-10-26): each product has its own allowance (1 L spirits *and* 2 L
   wine/beer), per the Ministry of Trade and the Foreign Ministry; the rows said "or". ✔ South Korea
   e-cigarettes re-read: age 19, declaration discount and undeclared-goods surcharge added. Still:
   Australia drones (casa.gov.au unreachable from here; see TODO).
4. Each month: new export → compare positions for the pages above → next list (§5.1).

**Deliberately ignored queries:** airport-security wording ("tobacco in hand luggage", §2), buying
medicine abroad ("can you buy wegovy in mexico"), exporting ("import fresh fruit from thailand"),
"global entry", generic visa queries at position 60+.

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

**Travel readiness (agreed 2026-10-28, after review of an external expansion brief,
kept with a status table in `odyssway_product_expansion_brief.md`).**
The connected workflow is *can I go → am I ready → what will entry cost → what changed
since I checked*. Built client-side from verified rows; no accounts.

1. **Trip readiness planner** (`/readiness`). Per traveller (mixed nationalities allowed):
   passport check per stop, travel authorisations needed, arrival forms with their time
   windows, permits with lead times. Two kinds of date, never mixed up: the **legal
   deadline** (from a verified rule) and a **recommended action date** (deadline minus a
   buffer the user chooses; we don't model home-country passport processing times). One
   `.ics` for everything. Saved only in the browser, opt-in.
2. **Travel-authorisation guides** (`/authorisations/[scheme]`, ~10 schemes: ESTA, eTA,
   UK ETA, K-ETA, AU ETA/eVisitor, NZeTA, Kenya eTA, India e-visa, Sri Lanka ETA, ETIAS,
   ETA-IL, Egypt e-visa): official link, fee, validity, processing time, apply-ahead
   advice, and a warning about unofficial sites. Data: `data/travel-authorisations.json`.
3. **Entry costs per trip**: authorisation fees, mandatory insurance, tourist levies and
   departure taxes, from `data/trip-charges.json` (government charges only, never prices
   of services).
4. **Pre-departure recheck**: a saved trip remembers when it was checked; on return it
   lists the rule changes for its destinations since then (from the per-destination
   changelog).
5. **Cookie-free event counter**: anonymous counts of tool actions (no cookies, no
   personal data) so the next phase can be decided on evidence (§12 validation rule).
6. Later, only with the owner's go-ahead: accounts, email alerts, an annual plan for
   saved trips and alerts (sells persistent state, not facts).

✔ 2026-11-03 (owner feedback) **Pickers and route map**: country pickers match codes and common names ("USA", "UK", "UAE", "Holland", "Türkiye" without accents, small typos), rank the best match first, and Tab picks it. The Trip Check map draws the whole route (passport country → stopover → destination → further countries) with numbered pins, arrows and a legend, zooms to the route, and is taller on phones. A stopover now shows the passport's entry rule there (what applies if you leave the airport) and says plainly that airside transit rules aren't verified; Schengen hubs can be picked as stopovers. ✔ Same day: verified airside rules for the UK (Direct Airside Transit Visa list, transit-without-visa conditions and exemptions, no ETA airside) and the Schengen Area (Visa Code Annex IV plus each state's national airport transit visa list, e.g. Türkiye in BE CZ DE ES FR NL NO CH; India in CZ RO), in `data/transit-rules.json`; Trip Check shows them on the stopover card. ✔ Singapore added the same day (ICA: no requirements airside; the 96-hour Visa Free Transit Facility for leaving the airport shown for India, the CIS, Georgia, Turkmenistan and Ukraine). Still unverified (see TODO): US (travel.state.gov 403), Türkiye, UAE (404), Qatar (no airside statement on a government page).

✔ 2026-11-03 (owner feedback) **A stopover per flight**: the single "Changing planes in" field is replaced by an optional "Changing planes on the way to {country}?" under every country on the trip, so each stopover belongs to a specific flight. The map draws them in travel order (passport → stopover → country → stopover → country), "Your route at a glance" shows a column per stopover (airside rule, and each item's verdict there: "applies in transit too", "if you leave the airport" or "not if you stay airside"), and share links keep a stopover per stop (`s=` lists them in stop order; older one-code links still open).
✔ 2026-11-03 (owner-approved) **Uncovered-pair counter**: Trip Check sends the two country codes of a passport × destination pair with no verified row to `/api/pair-miss`, which adds 1 to a monthly Upstash counter (no IP, no identifier); `/privacy` section 2 updated first (LEGAL_UPDATED 2026-11-03). Read with `pnpm pair:misses [YYYY-MM]`; use it with Search Console to rank the next passports and destinations (§3). Same day: Tab in country pickers also picks an option highlighted with the arrow keys or mouse.

**Deliberately not building:** live flight/hotel pricing, "cheapest month" or "similar
destination" optimisation, study/work/residence routing, a document vault, or submitting
applications for users. Reasons: no advantage against funded price-comparison sites,
unverifiable numbers would undermine the cited-and-dated brand, and immigration routing is
a non-goal (AGENTS.md §2).

**Other:**

- **Calendar-year stay rule.** The engine type is written and tested (patch saved during
   the Mauritius work). Merge it the first time an official source states a
   calendar-year cap for visa-free visitors.

✔ 2026-10-31 **Cash declaration check** on 59 cash rows ("Do I need to declare my cash?"):
structured thresholds checked by validate-data, ECB reference rates (official) for conversion,
"close" within 5% below a converted threshold. Not structured: India, South Africa, Vietnam,
Uzbekistan, Turkey, Taiwan, Mongolia (split or unclear wording).

Later, if demand shows up in Search Console or item-miss data: an overstay-consequences
page per country (needs verified penalty data).

---

## 3. Expansion

### 3.1 Destinations

Pick by traffic and source reachability, not by map coverage.

- **Blocked, with what would unblock them:**
  - ✔ North Macedonia added 2026-10-30 (MFA tool + Law on Foreigners, 22 rows).
  - ✔ Belize added 2026-10-31 (immigration.gov.bz country table; 30 days, UK and Canada agree).
  - ✔ El Salvador added 2026-10-31 (CA-4 visa classification PDF linked by migracion.gob.sv via its
    WordPress API `wp-json/wp/v2/servicios`; 180 days, UK and Canada agree; CA-4 90-day regional note).
    The same CA-4 list covers Guatemala, Honduras and Nicaragua: reuse it once each country's stay
    rule is sourced.
  - Newly reachable, to research next: Bhutan, Cape Verde, Paraguay, Nepal; Bolivia's
    visa portal has an API (servicios.cancilleria.gob.bo/visas/api), routes not found yet.
  - Kazakhstan, Laos, Kuwait, Pakistan, Nepal: official sites are
    JavaScript apps or refuse connections. Retry periodically; a readable official PDF or
    legal-database text unblocks each.
  - Moldova: list readable, stay rule only in Law 200/2010 (legis.md blocked).
  - Kosovo, Paraguay, Barbados, Brunei, Uganda: list missing, archived or contradictory.
- **Next candidates to probe:** Kyrgyzstan (eVisa portal reachable) and Ethiopia first; Oman,
  Guatemala, Brunei. Probed 2026-10-26 and unreachable from here: Panama, Namibia, Botswana,
  Azerbaijan, Cuba, Bolivia; Tunisia's MFA site is an empty shell; Bahrain's lists still lack
  stay lengths (see TODO).
- **Held rows inside covered destinations** (China in Uzbekistan and Macao, Ukraine in
  Uzbekistan and Mongolia, 48 August rows with unreachable sources): see
  `data/UNVERIFIED/TODO.md`.

### 3.2 Nationalities

✔ 2026-10-31 (owner request): all 27 EU passports can be picked (EU free movement in the
EU/Schengen, Your Europe source re-read); outside Europe the 22 new ones show "not verified yet"
until rows are added. Destination pickers list every Schengen country by name (one alphabetical
list, shared helper `lib/destination-options.ts`); the unspecified "Schengen Area" option is gone
from pickers. ✔ Same day: 17 non-EU European passports added with their Schengen status from Reg. (EU)
2018/1806 (Annex II: Albania, Andorra, Bosnia, Georgia, Kosovo, Moldova, Monaco, Montenegro, North
Macedonia, San Marino, Serbia, Holy See, with biometric-passport footnotes; Annex I: Türkiye,
Armenia, Azerbaijan, Belarus, Russia). EUR-Lex blocks scripts, but the Publications Office serves
the consolidated text: `curl -H 'Accept: application/xhtml+xml' -H 'Accept-Language: eng'
http://publications.europa.eu/resource/celex/02018R1806-20251230`. **Still to do**: Iceland, Norway,
Switzerland, Liechtenstein (EEA/Swiss free movement needs an official source); destination rows
for all the new passports, starting with the most-travelled pairs.
✔ 2026-11-01: UK (Appendix ETA National List / visa national list), US (DHS VWP list; non-EU
Europeans held pending the entry-proclamation check), Canada (IRPR Schedule 1.1) and Australia
(eVisitor/ETA lists) rows for the new passports: 142 rows. ✔ 2026-11-01 Thailand (MFA revised-scheme
summary) and Türkiye (MFA per-country list), 39 rows each. ✔ 2026-11-02 UAE, 39 rows: statuses from MOFA's
country cards (Moldova, North Macedonia and Türkiye need a visa); 90 in 180 for the 21 EU passports from
the EU–UAE visa waiver agreement (CELEX 22015A0521(01), Art. 4(1); Ireland excluded by Art. 2(a)); stay
not shown for Ireland and the 14 visa-free non-EU passports (no primary source gives it; ireland.ie
returns 403). ✔ 2026-11-02 Serbia (37, MFA per-country pages; Kosovo held), Montenegro (37, gov.me pages;
**visa required for Belarus, Russia, Türkiye since 1 Nov 2026** per the decree of 23 July 2026; Holy See held),
Bosnia and Herzegovina (37, mvp.gov.ba pages; Russia 30 days in 60 by bilateral agreement; Armenia, Belarus
visa; Kosovo held). ✔ 2026-11-02 North Macedonia (38, MFA Livewire tool: visa for Armenia, Azerbaijan,
Belarus, Russia). ✔ 2026-11-02 Albania (33: EU and Annex II passports via the MFA sheet's Schengen-exempt rule;
Türkiye, Armenia, Azerbaijan, Belarus, Russia held, per-country table behind a bot check). ✔ 2026-11-02 Armenia (38:
180 days a year for EU, Andorra, Monaco, Montenegro, San Marino, Holy See; bilateral visa-free, no day count, for
Albania, Belarus, Georgia, Moldova, Russia, Serbia; visa for Bosnia, North Macedonia, Kosovo, Türkiye, Azerbaijan).
✔ 2026-11-02 Georgia (38: one full year for 36 listed passports; Kosovo, North Macedonia need a visa or
the Ordinance 256 route). The consolidated Ordinance 255 is paid on matsne, but each amending ordinance's text is
free (Georgian): read all eight. **China corrected**: visa-free 30 days, tourism only, since Ordinance 359 (11 Sep 2023);
the row said visa required. Re-check other rows built from an initial matsne text the same way. Next: Japan
(blocked .go.jp). ✔ 2026-11-02 Iceland, Norway, Switzerland, Liechtenstein passports selectable (`eeaSwissNational`):
free movement in the EU from EEA Joint Committee Decision 158/2007 (Directive 2004/38 for EFTA-State nationals) and the
EU–Swiss agreement (Annex I Art. 1); among the four from the EFTA Convention Annex K App. 1 Art. 1. Destination rows
outside Europe: ✔ UK, US, Canada, Australia, Thailand, Türkiye, UAE and the seven Balkan/Caucasus
destinations (2026-11-02).
✔ 2026-11-02 second batch, all 43 newer passports: Kenya (eTA; Cyprus, San Marino exempt), South Africa (DHA table,
Ordinary column), New Zealand (waiver list), Seychelles (no visa for anyone), Zambia (three lists), Fiji (list in the
page data, all tabs), Ghana (none exempt), Mauritius (2025 country-wise PDF). Mexico: the 13 on INM's text
visa-required list, and (✔ later the same day) 29 from the SRE consulate's text visa-free list (Kosovo held). Destinations now covering (nearly) all 65 passports: GB CA
KE ZA TH TR AU AE NZ GE RS ME AM BA SC GH ZM FJ MU MK (+ US 49, AL 58). **Next, by the same method** (one official
list per destination): Philippines (evisa.gov.ph policy page), Jamaica (country listing PDF), Bahamas, Tanzania,
Sri Lanka (ETA fees page), Uruguay, El Salvador and Belize (country tables), Chile, Peru, Costa Rica (directrices PDF),
Dominican Republic, Argentina, Taiwan (BOCA), Indonesia (VoA list), Malaysia, Oman, Brunei, Macao, Israel, India, Korea.
Blocked today: Morocco (firewall), Japan (.go.jp 403), Hong Kong and Saudi Arabia (JS).
✔ 2026-11-02 third batch (all 43 newer passports unless held): Sri Lanka, Uruguay, Belize, El Salvador (CA-4 PDF via the
Drive link on migracion.gob.sv), Peru (each row cites its own legal basis), Costa Rica (directive groups), Dominican
Republic (one MIREX query per passport), Argentina, Brazil (QGRV codes), Bahamas, Chile; Colombia for 21 EU passports
(EU–Colombia agreement). Holds in `data/entry-lists.json` (`held`) and TODO. Next by the same method: Ecuador, Taiwan,
Indonesia, Malaysia, Oman, Brunei, Macao, Israel, India, Korea, Vietnam, Mongolia, Egypt, Jordan, Nigeria, Rwanda,
Cambodia, Maldives, Uzbekistan, China; Colombia's own list (Res. 5488/2022) for non-EU passports.
✔ 2026-11-02 fourth batch (same method): Ecuador, Taiwan, Indonesia, Oman, Brunei, Macao, Israel, India, Mongolia,
Rwanda, Maldives, Nigeria, China (41; mutual-exemption list read; Kosovo, Holy See held), Uzbekistan (42; Kosovo unlisted), Egypt (40 on the e-Visa list; Andorra,
Liechtenstein, Türkiye unlisted; 13 rows re-quoted to the FAQ's current wording). **Blocked, retry later:** Jordan
(Ministry of Interior restricted list, host refuses connections), Japan (mofa.go.jp 403 to every fetch), Cambodia
(e-visa list behind a captcha), Korea (JS), Vietnam (✔ 16 added from the signed Resolutions 44 and 229; 27 held), Malaysia (16 added from embassy pages; 27 have no readable embassy statement), Hong Kong (✔ 42 added from ImmD's table, which is in the served HTML after all), Saudi Arabia, Qatar (✔ 39 added from the MOI's two on-arrival lists, reached through the portal's sub-pages),
Kyrgyzstan, Ireland (✔ 17 added from ISD's table), Morocco. Uzbekistan's six "no time limit" passports added as visa-free with no day count (the
pattern Armenia's bilateral rows use); their registration rules are still open. ✔ Colombia completed from Res.
12189 de 2026 (current exempt list; Israel exempt since 4 Sep 2026).
✔ Same day, later: Malaysia (16 from embassy pages), Jamaica (14 conditional rows: visa-free with vaccination proof for
the Baltics and Slovenia; visa on arrival for ten others, visa-free only with a US/CA/UK/Schengen visa plus vaccination), Mexico (29 from the
SRE visa-free list). New guard: validate-data fails when a row cites a source claim written for another passport (it
caught 106 rows, fixed). **Pushed 2026-11-03** (106 commits; build, unit tests and 121 e2e passed); IndexNow `--since 2026-11-02` sent (2,363 URLs).
**External review follow-ups (2026-11-02)**: ✔ source registry with re-check intervals (`data/source-registry.json`,
`pnpm sources:registry`; `pnpm coverage` lists rows due); ✔ entry lists stored by group (`data/entry-lists.json`, 26
destinations, `pnpm entry:lists --apply` to add a passport); ✔ "Suggest an official source" mail form on /sources (no
data stored); ✔ regional blocs, first step: Mercosur ID-card travel added for Argentine (UY, CL, PE, EC, CO), Chilean
(UY, PE, EC, CO) and Brazilian (UY, tourism) passports from each traveller government's page. Still open: Brazil to
CL/PE/EC/CO (the Polícia Federal says only "países do MERCOSUL"); GCC, EAC and ECOWAS rules matter only once those
passports are on the roster. Double extraction for AI-read values: not built (rows are generated by scripts from
parsed lists, and the quote check covers re-reading).
**Quote check** (advice from an external review, 2026-11-02): `pnpm check:quotes` runs weekly after the watcher and
reports quoted passages not found on the saved source text. **Customs fix, same day:** Trip Check answered for Norway, Iceland, Switzerland
and Liechtenstein with the EU allowances (Schengen isn't customs membership); now `customsCodeFor()` sends them to
their own rows, which don't exist yet, so they show 'not verified'. ✔ Customs rows added the same day: Norway (alcohol, tobacco,
vapes, pouches, cash NOK 25,000), Switzerland (alcohol, tobacco, vapes, meat/dairy, produce), Iceland (alcohol units,
tobacco, nicotine, medicines, cannabis); Liechtenstein answers from the Swiss rows (`customsTerritory`, 1923 treaty).
✔ 2026-11-03 Swiss cash (no limit, no declaration; CHF 10,000 disclosure on questioning) and medication (30 days' supply of narcotic/psychotropic medicines, no doping substances), from BAZG pages; Swissmedic's site times out from here. ✔ 2026-11-03 Norway: medication (3 months from outside the EEA, 1 year from it), narcotic medication (30 days for visitors; permit how-to for longer stays from the Medical Products Agency page), CBD (a narcotic whatever its THC), meat and dairy (none from outside the EEA without a permit; 10 kg from it), fruit and vegetables (10 kg; potatoes need a permit). ✔ Same day, Iceland from island.is: cash (declare €10,000 or more, form E-29), meat and dairy and fruit and vegetables (no food from outside the EEA, no raw meat), weapons (police permit; European Firearms Pass for up to 3 months). ✔ Weapons for Switzerland (declare all; permit; banned list incl. switchblades, stun guns, silencers) and Norway (Firearms Pass, or police licence two months before arrival, with an apply-by date). ✔ Belize alcohol (1 L wine or spirits) and tobacco (200 cigarettes or 50 cigars or 250 g) from the customs passenger-exemptions sheet; cannabis held (2003 schedule), North Macedonia customs unreachable (see TODO). ✔ Zimbabwe medication (MCAZ permit per ZIMRA; personal-use coverage unstated, said so), weapons, fresh produce from ZIMRA's restricted-goods page.
✔ 2026-11-03 Singapore completed (44 rows, all 64 other passports now covered): ICA's visa guidelines list, readable again at the new `/information-and-e-services/...` URLs. Seven need a visa (Armenia, Azerbaijan, Belarus, Georgia, Moldova, Russia, Kosovo), each citing its own ICA page (6 months' passport validity from entry, Form 14A, apply within 30 days); the rest are visa-free with the stay set at the checkpoint (e-Pass). No passport-validity rule shown for visa-free rows: ICA states none. ✔ Same day, Kyrgyzstan (41 rows) from the e-Visa portal's per-passport checker: 34 at 30 days (counted as 30 in 60, as the existing rows), Serbia and Türkiye 90 days, Armenia, Azerbaijan, Belarus, Georgia and Russia visa-free with no limit stated; Moldova held (portal answers conflict), Kosovo not listed. ✔ Same day, Zimbabwe (39 rows) from the Department of Immigration's Category A (Cyprus, Malta: no visa) and Category B (visa on arrival or eVisa) lists; Finland, France, Liechtenstein, Montenegro and Kosovo are on neither list and held. Cyprus's MFA list now returns 403. Still under 25 rows: Cambodia, Cyprus, Saudi Arabia, Korea, Japan, Morocco, Jordan.
✔ Same day, US hold released: 14 non-EU European passports and the Holy See need a visitor visa (not VWP), and the current entry proclamation (No. 10998, 16 Dec 2025, read through the Federal Register API; no later one) restricts none of them. The US now covers every passport.
✔ 2026-11-02 Türkiye passport URLs: slugs dropped the 'ü' (`/t-rkiye`); fixed to `/turkiye` with 308 redirects.
✔ Post `/blog/montenegro-visa-turkey-russia-belarus-2026`. **Pushed 2026-11-02** (through the Bosnia rows); IndexNow 383 URLs.

Each new passport adds a row in every destination, so this multiplies coverage. Choose
from Search Console country data. Likely candidates: Philippines, Indonesia, Turkey,
South Africa, Nigeria, Poland, Portugal, Vietnam, Pakistan. Add one at a time, filling all
61 destinations before announcing it.

### 3.3 Customs depth

- **Method that works where national sites don't (2026-10-26):** the UK government's travel
  advice is readable through `https://www.gov.uk/api/content/foreign-travel-advice/{country}`
  and often states vape, CBD, drone, cash and medicine rules. It filled 10 gaps in one pass
  (Rwanda vapes, Armenia cannabis, Uzbekistan drones and cash, Zimbabwe cash, Vietnam
  medication, CBD for Indonesia, Tanzania and the UAE, Jordan's drone lead time). Cite it as a
  foreign government's advice, note when no local page was read, and record conflicts.
- ✔ 2026-10-26: South Korea alcohol, tobacco and weapons; Egypt cash; Qatar tobacco (read from
  the customs PDF's page image, since its text layer is broken); weapons for Singapore, Türkiye,
  UAE and China. Still blocked: Mongolia (customs figures conflict, undated), Uzbekistan
  (customs.uz is a JavaScript app), China e-cigarettes (source unreachable), Australia drones
  depth (CASA unreachable).
- ✔ 2026-10-30 GOV.UK pass over the gaps: e-cigarettes (Oman, Kyrgyzstan), cannabis (Ghana,
  Mongolia, Bosnia and Herzegovina, Mauritius, Zimbabwe; no CBD inferred), cash (Mongolia),
  drones (Oman), medication (Oman, Kyrgyzstan); Mauritius cigarette papers. GOV.UK says nothing
  usable on vapes for the other 35 destinations without a vape row, on drones for 16, on CBD
  for 18; those need each country's own customs or health pages.
- ✔ 2026-10-31 two more foreign-ministry routes for customs gaps: **Germany's Auswärtiges Amt open
  data** (`/opendata/travelwarning` lists content ids; `/opendata/travelwarning/{id}` gives each
  country's full advice incl. 'Einreise und Zoll'; the public page resolves from the id) and
  **Korea's 0404.go.kr** entry notes. Added: Brunei cash/tobacco/e-cigarettes, Singapore cash
  threshold (SGD 20,000), Kyrgyzstan cash/tobacco/alcohol/drones, e-cigarettes for Uzbekistan,
  Mauritius and Seychelles (allowed), Jordan medication, weapons for Mauritius, Seychelles, North
  Macedonia, Bosnia, Sri Lanka, Tanzania and Oman; conflicts recorded (Uzbekistan drones, Oman
  alcohol). Re-run both scans after each destination batch.
- **Gap scan (2026-11-03)**: categories still missing, worst first (FR/SE/ES fall back to the EU rows, so they're fine): El Salvador 8 (aduana.gob.sv unreachable, mh.gob.sv 403), North Macedonia 7 (customs.gov.mk DNS fails), Belize 7, Uzbekistan 6, Ghana 6, Zambia 6, Mongolia 6, Ecuador 5, Cambodia 5, Brunei 5. ✔ Same day: Ghana weapons and plants (GRA). Blocked: Ghana medication (FDA covers shipments only), Zambia (no ZRA passenger page), Ecuador food (Agrocalidad 403), Cambodia (Nuxt app, no allowance text); details in TODO. ✔ Macao medication (AIP Macao GEN 1.4); Macao food held (AIP passenger and cargo sections conflict); Brunei's customs pages are importer-only. The remaining gaps mostly need sites blocked from here; next pass: ✔ GOV.UK and Auswärtiges Amt scans re-run for Uzbekistan, Mongolia, Zambia and Cambodia: only Cambodia alcohol and tobacco were new (no legal limit; in practice 1.5 L and ten packs, per the AA). Then move back to SEO striking-distance work when the November Search Console export arrives.
- Customs rows for destinations that have none or very few: Mongolia, Seychelles medicine,
  Zimbabwe tobacco and cash (ZIMRA gives no primary threshold).
- **Schengen national rules (from the external review's step 3, started 2026-11-03)**: ✔ EU controlled-medication row re-sourced to the 1994 Executive Committee decision (Article 75 certificate is for Schengen residents only; visitors from outside follow national rules); ✔ Germany (BtMAHV § 15 + German Customs: controlled and ordinary medicine), France (French Customs) and Austria (Ministry of Health) medication rows. Held: Italy (bot wall), Netherlands (sources cover residents leaving only), Greece (403s), Belgium (captcha), Portugal (no page found). ✔ Same day: CBD and cannabis for Germany (Consumer Cannabis Act §§ 1–2), France (MILDECA's legal guide) and the Netherlands (Opium Act lists); Germany weapons (German Customs). ✔ Same day: EU drones row now has EASA's flying rules for visitors (register with the first EU country's aviation authority; home training not recognised); Netherlands medication from Netherlands Worldwide (Opium Act medicines need a certificate from the departure country, also when only changing planes; other medicines need none). Held: France weapons (Légifrance behind Cloudflare; service-public search is client-rendered). ✔ 2026-11-04 Italy controlled medicines (Ministry of Health decree of 16 Nov 2007: a certificate or prescription from the home health authority; one pack of each medicine or low-dose codeine combinations need only a prescription), from the ministry's new portal, which scripts can read. Next: Greece retry, national drone rules where they add to EASA (e.g. no-fly zones), then the November Search Console export.
- **Second vertical after medication**, chosen from data (§5): CBD and cannabis, food,
  nicotine and vapes, or drones. Go deep on one before starting the next.
  ✔ 2026-10-26 CBD audit: 12 cannabis rows answered CBD searches with "banned" by inference
  (from "narcotics" or silence). Their CBD search names were removed (CBD now shows "not
  verified" there) and Albania's CBD row moved to UNVERIFIED; New Zealand (prescribed medicinal
  cannabis allowed) and Taiwan CBD (TFDA permit) corrected from official pages. CBD is sourced
  for CA, TH, SG, KR, HK, CY, IE, US, JP, CN, NZ, TW, CL, NO, DE, FR, NL (2026-11-03). Researching CBD for the rest is a good
  start for the CBD vertical.
  ✔ Post `/blog/cbd-travel-rules` (2026-10-26), linked from each covered country's cannabis page.
  Photo: CBD-Infos-com on Pixabay (added 2026-10-28).

---

## 4. Competitive advantages: how to deepen them

The asset is the accumulated, maintained corpus plus its public history (AGENTS.md §14).
Ways to make that harder to copy and easier to trust:

1. **Freshness as a promise.** Publish a target ("rule changes reflected within 7 days of
   the official source") and measure it from the source watcher against `/changelog`.
1b. **Foreign-ministry cross-check (started 2026-10-27).** Each traveller government's own advice
   (GOV.UK API, travel.gc.ca, France Diplomatie, Auswärtiges Amt) is compared with that
   nationality's rows by a read-only subagent; every quote is re-read before an edit. Where two
   governments agree, the rule goes on every nationality's row; where sources disagree, the row
   keeps the destination's own text and records the conflict. First pass fixed: Kenya's mandatory
   insurance (5 Oct 2026), Korea K-ETA exemption shown as visa-free, Taiwan arrival card 3 days,
   India e-Arrival Card, South Africa traveller declaration, 24h registration (China, Serbia,
   Montenegro), US/Rwanda Ebola restrictions, ~100 passport-validity rules. Second pass (NL, JP) added the New Zealand Traveller Declaration,
   the Mauritius All in One form and Nigeria's health declaration for everyone, and each
   passport's own validity rules. Repeat quarterly; Third pass (IT, ES) added Georgia's insurance where it was missing, Ghana's
   yellow fever certificate, India's Air Suvidha form and Thailand's land-entry limit. ✔ 2026-10-31 KR: Korea's Foreign Ministry
   (0404.go.kr, per-country 'visa-free entry' section, scriptable) cross-checks 61 KR rows; 4
   conflicts recorded (Dominican Republic 30 vs 90 days, Oman 14 vs 30, Seychelles 3 months vs
   30 days, Zambia 90/12 months vs 30 per entry), destination's own source kept. Still to do: NZ
   (SafeTravel) and AU (Smartraveller) need a browser.
2. **Re-verification cadence.** Every row re-read at least every 6 months; show the
   oldest check date on `/sources`. A competitor can copy today's data, not the history.
   ✔ 2026-10-30: the July-dated Schengen files re-read (EC Schengen-area and visa-policy
   pages: membership and Annex I/II status unchanged for all 22 passports). Oldest data is
   now the August customs, destination and entry rows: re-read them in check-date order,
   a batch per session, before 2027-02 (6 months).
   ✔ 2026-10-30 August pass: 18 destination records, Mexico food (2) and China cash re-read
   (China's RMB 20,000 limit removed: no official text reachable). Still August-dated because
   the sources don't load from here: 15 Japan rows (all `.go.jp` 403), 26 customs rows
   (Australia, India, Vietnam, Nigeria, Rwanda, China alcohol/tobacco, EU weapons, NZ, TH
   drones); list in `data/UNVERIFIED/TODO.md`.
   ✔ 2026-10-30 September customs pass: 97 of 148 rows re-dated (figures re-found on the
   current page, or read by hand); Singapore food rows corrected (SFA's per-type limits);
   Taiwan e-cigarette fine cited to the Act. Held: 48 customs rows and the 134 September
   entry rows (JS portals, paywalled Georgian register), see TODO for the route.
3. **Exception awareness.** Keep splitting by situation (resident vs visitor, carried vs
   posted). Each split is an answer nobody else gives correctly.
4. **Computation on top of data.** The tools in §2 turn rows into personal answers with
   dates. That's what one-off AI answers and static competitor pages can't match.
5. **Distribution through embeds and the API.** Every embedded widget is a backlink and a
   channel; every API user is a reason to keep the data clean.
6. **Honest coverage.** "Not verified yet" with an official link builds more trust than a
   guess. Keep it visible.

---

### 4.1 Competitor watch (2026-10-30)

Searched three of our striking-distance queries (Malaysia cigarettes, Thailand vapes, ADHD
medication in Argentina) and read the niche sites that outrank us. Structure only; nothing copied.

- **goodsacrossborders.com** is the closest competitor and has adopted our positioning:
  per-rule "verified" dates, official-source links, a confidence grade, printable rule cards,
  an export ("leaving X") side, a quantity check, a correction link per rule, an API and
  pricing. It claims 85 countries, 111 items, 5,339 rules (we have 65 destinations, 630 rows).
  Its pages contradict themselves (Malaysia tobacco: 225 g vs 250 g on one page; penalties
  "MYR 500–100,000" next to "civil penalty only"; a vape guide dated 2024 describing 2025–26
  changes, and transit advice to pack a vape in checked luggage after saying that's banned).
  **Our answer is accuracy, not breadth** (§14): one contradiction-free row per rule, the
  public changelog, cross-checks between governments.
- **canibringto.com**: one page per item variant (cigarettes, cigars, loose tobacco, vape
  pods, e-liquids), versions in Chinese, Japanese and Vietnamese, short misconception FAQs
  ("does a duty-free purchase change the allowance?"), an Airalo affiliate banner. On Malaysia
  tobacco it agrees with our row (no duty-free allowance) against goodsacrossborders.

Gaps worth closing, in order:
1. ✔ 2026-10-30: "Something wrong or out of date? Report it" on every customs rule card and
   passport page: a pre-filled email (rule, page, our source, check date) to the support
   address. The FAQ said "point us at the source" but gave no way to do it.
2. ✗ Dropped 2026-10-30: pair pages already show transit, permit and letter facts, and Google
   now limits FAQ rich results mostly to government and health sites. **Misconception FAQs from verified rows only**: where a source states it (duty-free
   purchases, transit airside, carrying for someone else), add a question to the pair page's
   FAQ markup. No new facts, only questions our rows already answer.
3. **Translated item and medicine pages** (§5.5): canibringto ranks in zh/ja/vi. Our Search
   Console top countries include India and Singapore; pick locales from the November export.
4. ✔ 2026-10-30 **Quantity check** ("Check what you're carrying") on 70 alcohol and tobacco rows. Not yet
   structured (wording gives packs, bottles, cans, weight shared with cigarettes, or 16/20/30%
   strength lines): ~40 rows, e.g. Japan, Mexico tobacco, Seychelles, Vietnam alcohol, Hong Kong
   alcohol, Mauritius. Original note: quantity check on allowance pages (enter how many you carry, see within/over the
   limit). Needs structured quantities on alcohol/tobacco rows first (like `passportValidity`
   restating prose, checked by validate-data).
5. Export direction ("leaving X with Y") stays out for now (§0 ignored queries); revisit if
   Search Console shows real demand.

## 5. SEO and reach

### 5.1 Measure without breaking the privacy promise

| Signal | Where | Use |
|---|---|---|
| Queries, impressions, CTR, position | Google Search Console, Bing Webmaster | What we show up for; pages seen but not clicked |
| Unmatched item searches | `/api/item-miss` | Research queue |
| Referring domains | Search Console links, Bing backlinks | Whether outreach works |

**Monthly ranking routine.** Rank first, CTR second: a low CTR at position 30 means
nothing, and it rises on its own as a page reaches the top 10.

1. **Export.** The owner exports Search Console → Performance (Queries and Pages, last 28
   days) as CSV into `seo/gsc/YYYY-MM/`. The agent turns it into a work list.
2. **Striking distance first (position 11–20).** These are the cheapest wins. For each
   page: make the H1 and title match the query wording; answer the query in the first
   two sentences; add the facts our verified rows already hold but the page doesn't show
   (limits, procedure, letter checklist, passport rule); link to it from 3+ related pages.
3. **Position 21–40: depth.** Compare with the top 3 results. Close the gap only with
   verified content: split rows by traveller situation, add a permit how-to, add the
   tool that answers the query (planner, passport check), add a comparison across
   countries or passports. Never filler text (AGENTS.md §13.7).
4. **CTR only on page 1.** Rewrite titles and descriptions only for page-1 results whose
   CTR is below what similar pages get.
5. **Research queue.** Queries we rank for without a verified row, plus the top unmatched
   item searches, go into `data/UNVERIFIED/TODO.md` as research leads.
6. **Record** what changed and the positions before, then check the same queries next
   month.

`pnpm gsc:compare <previous> <new>` does steps 2 and 6 from the two exports
(`seo/gsc/<new>/compare.md`).

### 5.2 On-site

- **Headings that match searches.** Test putting the query words in hub H1s
  ("Japan entry requirements and customs rules" instead of "Travelling to Japan"); Bing
  weights literal matches more than Google. Owner decision pending.
- **Internal links:** every destination hub links its top item pages and named medicines;
  every pair page links the same passport's neighbouring destinations; no orphan pages.
  ✔ 2026-10-26 crawl of all 2,217 sitemap URLs: no orphans; pages with under 3 in-content
  links cut from 70 to ~10 (EES, overstay and ETIAS pages now link their siblings and each
  other; medication pages link the medicine posts that cover the country). The rest are tools
  reached from the site nav.
- **Homepage as a link source.** "Recently added" and the tools row are live; new
  tools go into the tools row the day they launch.
- **Structured data:** FAQ on pair and medication pages (done for some), HowTo on every
  permit procedure, Dataset on `/developers`. Add `sameAs` to Organization once the
  brand profiles exist.
- **Thin pages:** watch pair pages in "discovered, not indexed". If many stay there, make
  them more distinct (comparisons, passport check, related items) rather than adding more.
- **Speed:** keep Lighthouse ≥ 95 on mobile; re-run after each feature.

### 5.2b Definition of done for every new page or tool

Nothing counts as shipped until:

- it's in the sitemap, and linked from the homepage "Recently added" list and from at
  least three related pages (hub, sibling pages, the relevant tool);
- its H1, title and first two sentences use the words people search for;
- it has the right structured data (FAQ, HowTo, WebApplication, BreadcrumbList);
- after the deploy, its URLs go to IndexNow and into the next Bing submission batch
  (`bing-url-batches.txt`);
- it's on next month's ranking routine (§5.1) to check where it landed.

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

### 5.5 Languages (plan approved by the owner 2026-10-31)

**Goal:** reach travellers searching in their own language for the item and medication
questions we already answer well, without weakening the accuracy policy.

**Evidence so far (October export, English-only site):** Japan is the best-ranking
non-English country (position 10.6, 246 impressions, CTR 1.2%), and Japanese queries already
reach us ("シンガポール お酒 持ち込み", position 62). Smaller signals: French (Maldives
arrival form), Russian (vapes in Korea), German (drones), Chinese (cigarettes). Competitor
canibringto.com ranks with zh, ja and vi pages. The reader of an item page is the *inbound*
traveller, so the language follows who travels, not the destination.

**Decision rule (November export):** pick the first locale by impressions from that country
plus non-English queries in that language, weighted toward item and medication pages.
Current favourite: **Japanese**; runners-up German and Chinese (Traditional, for Taiwan and
Hong Kong, where Google is used).

**Scope of the pilot (one locale, ~8 weeks):**
1. `/xx/bring/{item}/{country}` and `/xx/medications/...` pairs, the item hubs, destination
   hubs, Trip Check and the "Check what you're carrying" box. Not the blog, EES or legal
   pages at first.
2. English URLs stay unchanged (no `/en` prefix); hreflang pairs and sitemap alternates for
   every translated page; untranslated pages aren't generated in the locale (no thin copies).

**How translations stay accurate (no human review, AGENTS.md §3):**
- Translations restate verified English rows; they never add facts. Stored in
  `data/i18n/{locale}/*.json`, keyed by row id, each with a hash of the English text it
  translates.
- When the English row changes (stale hash), `validate-data` warns and the page falls back to
  English until it's retranslated; it fails when any figure in the English text (amounts,
  days, ages) is missing from the translation, in ASCII digits.
- Each translated page says it's translated from the verified English text, links the
  English page and keeps source names and check dates as they are.
- Where the source itself is in that language (e.g. Japanese ministry pages), quote it in
  the original instead of translating back.

**Success measure:** impressions and position for the locale's queries in the 8 weeks after
launch vs. the English pages for that country's traffic; go on to a second locale only if
the first earns clicks.

**Build order:** (1) ✔ 2026-10-31 translation data schema + validator (`data/i18n/{locale}/`,
`packages/engine/src/translation.ts`; a stale hash warns and falls back to English, a lost
figure or an unknown/unverified row fails);
(2) locale routing with hreflang and sitemap; (3) UI strings for the pilot pages; (4) data
translations for the top 100 pair pages by impressions in that country; (5) launch, IndexNow,
measure.

## 6. Long-term goals

> The place travellers, and the people who advise them, check before crossing a border
> with something that could get them in trouble. Every answer specific, cited, dated and
> kept up to date.

### Horizon 1: now to 3 months. Prove the medication wedge.

- **SEO first** (§0): get the striking-distance item and medication pages onto page 1.

- Launch the medication planner on Product Hunt.
- Run the first monthly ranking routine (§5.1) as soon as there's a Search Console export.
- More structured lead times: 11 permits have one; India, Saudi Arabia, Cyprus and Jamaica state none, and Hong Kong gives only a processing time (re-checked 2026-10-25). Revisit when their sources change.
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

- ✔ Translations: plan approved 2026-10-31 (§5.5). First locale chosen from the November export; Japanese is the current favourite.

- ✔ Keyword-matching H1s on destination hubs: done 2026-10-28 ("{Country} entry requirements and customs rules"); compare hub positions in the November export.
- Turning on cookie-free Plausible (needs a privacy-policy update first). Owner, 2026-10-28: not now (cost).
- Brand profiles and `sameAs` (§5.3).
- Accounts and email alerts (Horizon 2).
- ✔ **Pages for each Schengen country**: owner chose hubs + item pages (2026-11-02); built the same day
  (`lib/schengen-destinations.ts`). Passport-pair pages for Schengen states wait for indexing data from the hubs.
- ✔ Data licence: CC BY 4.0 (decided 2026-10-28).

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
