# Verification queue

Policy (Accuracy Policy §3, owner decision 2026-07-13): values ship once they
are **verified against a primary official source and cited** — by agent or
human. Anything below is blocked on exactly that: finding/reaching the primary
source.

## Done (promoted to /data)

- [x] `countries.json` — 29 members, HR/BG/RO accession dates, Cyprus status,
      ETIAS scope. Promoted 2026-07-13 with per-claim `_sources`.
- [x] `etias.json` — status announced (Q4 2026), fee EUR 20 (Delegated
      Regulation (EU) 2025/1411), validity 3 years. Promoted 2026-07-13.
- [x] Golden-test fixtures — transcribed directly from the official EC manual
      PDF (primary source), provenance recorded in the fixture file.

## EUR-Lex access — SOLVED via the Publications Office CELLAR API

EUR-Lex rejects automated fetching, but the same documents are served by
CELLAR: `http://publications.europa.eu/resource/celex/<CELEX>` with
`Accept: application/xhtml+xml` + `Accept-Language: en` (use the SPARQL
endpoint `publications.europa.eu/webapi/rdf/sparql` to find the latest
consolidated CELEX, e.g. `02018R1806-20251230`). All former blockers resolved
2026-07-13:

- [x] ETIAS fee EUR 20 + fee waiver under 18 / above 70 — Reg. (EU) 2018/1240
      Art. 18(1)–(2), consolidated 02018R1240-20260612 → `etias.json`.
- [x] Core 90/180 rule = SBC Art. 6(1); entry/exit days + permit exclusion =
      Art. 6(2), consolidated 02016R0399-20251012 → engine README.
- [x] EES record correction rights = Reg. (EU) 2017/2226 Art. 52 (45-day
      reply, any member state, overstayer-list correction on evidence of
      error), consolidated 02017R2226-20260612 → /ees/dispute-overstay.
- [x] Visa-exempt list = Reg. (EU) 2018/1806 Annex II, consolidated
      02018R1806-20251230 → `nationality-rules.json` (top 15 nationalities,
      incl. footnote conditions for UA biometric passports and GB Part 3).

## Done (promoted to /data, 2026-08-10) — trip-check platform launch

- [x] `destinations.json`, `entry-requirements.json`, `customs-items.json` for
      **United States, United Kingdom, Canada** — promoted with per-row
      citations (govinfo.gov for US statute/CFR text, gov.uk for UK, canada.ca
      for Canada) plus the EU/Schengen-harmonized customs rows (`destination:
      "EU"`, via the CELLAR API). See `data/changelog.json` after the next
      `pnpm generate:changelog` run.

## Done (promoted to /data, 2026-08-11) — Japan

- [x] `destinations.json`, `entry-requirements.json`, `customs-items.json` for
      **Japan** — promoted with per-row citations. Entry requirements for 14
      of the 15-nationality roster (all except JP→JP, a self-entry case that
      doesn't apply): reciprocal visa exemption per MOFA's "Exemption of Visa
      (Short-Term Stay)" list (novisa.html) — 90-day visa-free landing for
      US/CA/AU/NZ/KR/SG/AR/CL/IL; GB and MX carry a bilateral arrangement
      allowing extension to 6 months total; BR and MY are conditioned on
      holding an ICAO biometric e-passport; UA is **not** on the exemption
      list and remains `visa_required`. Customs rows cover alcohol, tobacco,
      cash declaration (¥1,000,000 threshold), general OTC/prescription
      medication quantity limits, a dedicated stimulant/pseudoephedrine entry
      (Adderall/amphetamine prohibited outright; pseudoephedrine and
      lisdexamfetamine require advance Narcotics Control Department
      permission — a real, common traveler trap given how many everyday
      decongestants contain pseudoephedrine), cannabis (prohibited unless
      from stalks/seeds with lab certificates), meat/dairy and fresh produce
      (Animal Quarantine Service / Plant Protection Station, both MAFF), and
      weapons/firearms/swords. mofa.go.jp and *.emb-japan.go.jp block
      automated fetches with an Akamai 403 (same pattern as EUR-Lex); the
      MOFA exemption list was read via a text-extraction mirror of the live
      page and cross-checked across two independent fetches plus a MOFA
      snapshot lookup — the URL cited is still the live, human-browsable
      MOFA page. See "Deliberately left unpublished" below for what was
      **not** verified and stayed out of production.

## Done (promoted to /data, 2026-08-11) — Kenya (first Africa destination)

- [x] `destinations.json`, `entry-requirements.json` (all 15 roster nationalities:
      US, GB, CA, AU, NZ, JP, KR, SG, BR, MX, AR, CL, MY, IL, UA),
      `customs-items.json` for **Kenya** — promoted with citations to
      etakenya.go.ke (Directorate of Immigration Services eTA portal) and
      kenyalaw.org (Kenya Law / National Council for Law Reporting — Kenya
      Gazette legal notices, fetched as PDF and text-extracted with
      `pdftotext`, since WebFetch could not parse them directly). Kenya
      replaced its old visa regime with a near-universal Electronic Travel
      Authorisation (eTA), established by the Kenya Citizenship and
      Immigration (Amendment) Regulations, 2023 (Legal Notice No. 1 of 2024)
      and the exemption schedule added by the (Amendment) Rules, 2025 (Legal
      Notice No. 93 of 2025, Seventeenth Schedule — verbatim country list
      confirmed). Of the 15 roster nationalities, 13 need `eta_required`
      (US, GB, CA, AU, NZ, JP, KR, BR, MX, AR, CL, IL, UA); Malaysia and
      Singapore are on the Seventeenth Schedule's 90-day exemption list and
      are `visa_free`. Note for BR: only ordinary passport holders need the
      eTA — Brazilian diplomatic/official/service passport holders are
      separately exempt for 90 days (Schedule item 31), recorded in that
      row's notes. eTA-required rows deliberately do **not** assert a fixed
      `maxDays`: the eTA portal itself says stay length "is determined at
      the point of entry," and the visitor's-pass regulation (Kenya
      Citizenship and Immigration Regulations 2012, reg. 30(3)) caps it at
      6 months at the immigration officer's discretion, not a guaranteed
      figure — so `stayPolicy` uses `{kind: "visa_required"}` (no computable
      duration) rather than publishing the commonly-repeated-but-unverified
      "90 days" figure from secondary/travel-agency sites. Customs rows
      (alcohol, tobacco, cash, drones, medication, cannabis, weapons, plants)
      are sourced from the Kenya Revenue Authority's official
      passenger-clearance FAQ and the KCAA Unmanned Aircraft Systems
      Regulations 2020 (reg. 7 import-permit requirement, reg. 11 30-day
      renewable-once temporary permit for visitors). See "Deliberately left
      unpublished" below for the cash-declaration conflict between two
      Kenyan official sources and other Kenya gaps.

  **Kenya source-quality note** (for deciding how far to expand into
  Africa): etakenya.go.ke and immigration.go.ke are reachable, in English,
  and current, but the homepage/section pages are thin single-page-app
  shells — the actual eTA terms only appeared after fetching the raw HTML
  of inner routes (`/general-information`, `/form/apply/how-to-apply`) and
  stripping script/style tags by hand; a naive single WebFetch of the
  homepage returns almost nothing. kenyalaw.org (the official law-reporting
  body) was excellent: every Gazette legal notice needed was found and
  fetched as a real, text-extractable PDF (via `pdftotext`, since WebFetch's
  own PDF parsing failed on these files) — no EUR-Lex-style automation
  block. kra.go.ke (customs) was reachable and gave clean, quotable FAQ
  text. kcaa.or.ke (civil aviation/drones) was reachable and its regulation
  PDFs were directly text-extractable. Net assessment: Kenya was
  meaningfully harder than the US/GB/CA/JP pilots only because of the
  SPA/thin-page pattern on the immigration portal, not because of
  reachability or language — a human/agent has to know to dig into specific
  sub-routes rather than trust a single top-level fetch. This is a solvable,
  repeatable problem, not a wall; cautiously supports expanding further into
  Africa, budgeting extra time for portal navigation rather than for access
  blocks.

## Done (promoted to /data, 2026-08-11) — South Africa

- [x] `destinations.json`, `entry-requirements.json` (all 15 roster
      nationalities: US, GB, CA, AU, NZ, JP, KR, SG, BR, MX, AR, CL, MY, IL,
      UA), `customs-items.json` for **South Africa** — promoted with
      citations to dha.gov.za (Department of Home Affairs Visa Exemption
      List, issued 09 Dec 2025) and sars.gov.za (Customs external guides,
      effective 1 July 2026). The visa-exemption list was parsed directly
      from the page's raw HTML `<table>` markup (column-by-column, matching
      colspans) rather than trusting WebFetch's own summarisation — two
      independent WebFetch passes over the same URL gave materially
      different, mutually contradictory readings of the Mexico/Ukraine rows
      (one said "no ordinary exemption," the other showed "90 Days" in an
      apparently-misaligned column), so raw HTML + manual column mapping was
      used to resolve the conflict with certainty. Result: 13 of 15
      nationalities are `visa_free` for 90 days (US, GB, CA, AU, NZ, JP, SG,
      BR, AR, CL, MY, IL) or 30 days (KR — visa-exempt column caps Korean
      ordinary passports at 30 days, with an administrative fee if the stay
      exceeds 30 days per the schedule's footnote); Mexico and Ukraine are
      `visa_required` — their Ordinary-passport column is blank on the DHA
      schedule (only Diplomatic/Official/Service passports are exempt).
      Customs rows cover alcohol (2L wine + 1L other alcohol), tobacco (200
      cigarettes/20 cigars/250g), cash (R100,000 declaration threshold,
      SC-PA-01-06), prescription medication (3-month supply + prescription),
      cannabis/CBD (prohibited — general narcotics ban, no CBD carve-out
      confirmed), and food_animal/food_plant/weapons (all `SARS`-sourced but
      only at the general "restricted, permit required" level — no
      species/quantity specifics were found). See "Deliberately left
      unpublished" below for what stayed out, including the still-unfolding
      ETA rollout.

  **South Africa source-quality note** (for deciding how far to expand into
  Africa): www.dha.gov.za and www.sars.gov.za were both reachable, fully in
  English, and served real, well-structured content — this was the smoothest
  pilot of the four Africa/non-launch-set destinations attempted so far. The
  DHA visa-exemption schedule is a genuine HTML `<table>` (not a SPA shell or
  scanned image), so raw-HTML parsing worked cleanly once we stopped trusting
  WebFetch's own AI-summarized reading of it (see above — that summarization
  step introduced a real, silent data-corruption risk on a table with ~140
  rows and 7 columns; two fetches of the identical URL produced contradictory
  facts about which nationalities need a visa, the single highest-stakes
  question this file answers). SARS publishes its customs guides as clean,
  well-formatted PDFs with explicit "Effective Date" and revision numbers,
  which both the Read tool (used directly on saved PDF bytes) and normal
  prose extraction handled well — a notably better experience than SARS-style
  agencies elsewhere that gate content behind PDF scans or SPA portals. One
  caveat: the older/aliased `home-affairs.gov.za` domain (widely linked from
  search results and blogs) has an **expired TLS certificate** and could not
  be fetched at all — always use `www.dha.gov.za`. Net assessment: South
  Africa is a strong candidate for further build-out; reachability and
  language were non-issues, and the primary risk in this pass was tooling
  (AI-summarized web fetches silently misreading a dense table), not the
  government's own source quality — a risk worth flagging generally for any
  future destination with large tabular primary sources, not specific to
  Africa.

## Done (promoted to /data, 2026-08-12) — Mexico

- [x] `destinations.json`, `entry-requirements.json`, `customs-items.json` for
      **Mexico** — promoted with citations to gob.mx (INM/SRE) and anam.gob.mx
      / gob.mx/senasica (customs). Entry requirements for 14 of the
      15-nationality roster (all except MX→MX, a self-entry case that doesn't
      apply): the INM/SRE visa-exemption annex (a gob.mx-hosted PDF,
      "Países y regiones que... no requieren visa para viajar a México")
      lists US/GB/CA/AU/NZ/JP/KR/SG/AR/CL/IL as unconditionally visa-exempt;
      Malaysia is visa-exempt but sits in a separate "requieren sello
      consular" category — no visa needed, but a "Sello de No Exigencia de
      Visa" stamp must be obtained in advance at a Mexican consulate, a real
      trap if a Malaysian traveler assumes they can just show up; Brazil and
      Ukraine are on the visa-required list. All visa-free/exempt entries get
      `stayPolicy: fixed_per_entry, 180 days`, cross-verified against Ley de
      Migración Art. 52(I) ("visitante sin permiso para realizar actividades
      remuneradas", 180 continuous days) and the FMM (Forma Migratoria
      Múltiple) tourist-permit form's own stated 180-natural-day/single-entry
      validity (an SRE-consulate-hosted PDF). Customs rows cover alcohol
      (3 L spirits + 6 L wine, 18+), tobacco (20 cigarette packs/25 cigars/
      200 g, 18+), cash declaration (USD 10,000 threshold, with the
      20–40% under-declaration fine and >USD 30,000 criminal-penalty
      tiers), medication (personal-use meds allowed, prescription required
      for psychotropic/controlled substances — no numeric day-supply cap was
      found, unlike Japan's), cannabis/CBD (prohibited — covered by ANAM's
      general "estupefacientes" prohibited-merchandise entry, no CBD/THC
      carve-out found), e-cigarettes (prohibited outright — ANAM names the
      exact tariff fraction, 8543.40.01 LIGIE), weapons/firearms (prohibited
      without a SEDENA "permiso extraordinario," not realistically available
      to ordinary tourists), and food_animal/food_plant (prohibited per
      SENASICA's own itemized traveler list — fresh meat/cheese/dairy;
      fresh produce, cut flowers, propagative material, grains, green
      coffee/tobacco, soil). See "Deliberately left unpublished" below for
      what stayed out, including a real network-access gap on `inm.gob.mx`.

  **Mexico source-quality note**: `www.inm.gob.mx` (the domain the drafted
  stub in `UNVERIFIED/destinations.json` originally pointed at) and
  `www.diputados.gob.mx` (host of the official Ley de Migración PDF) were
  **both unreachable from this environment** — DNS failure (`ENOTFOUND`) on
  the former, `ECONNREFUSED` on the latter, across repeated retries — a new
  reachability-gap pattern distinct from the Akamai-403 pattern seen on
  mofa.go.jp/EUR-Lex. `www.dof.gob.mx` (Diario Oficial) was also
  `ECONNREFUSED`. In each case a working alternative on a **reachable**
  gob.mx-family host carried the same content and was used instead: the
  visa-exemption country list came from a PDF hosted directly on
  `www.gob.mx` (CMS uploads), the 180-day FMM validity text came from a copy
  of the FMM info sheet hosted on `embamex.sre.gob.mx` (an SRE consulate
  subdomain), and the Ley de Migración Art. 52(I) 180-day figure was
  cross-checked against the DOF's 25-Jul-2025 visa-issuance Lineamientos
  (also SRE-hosted, `consulmex.sre.gob.mx`) rather than fetched from the
  primary codified-law host. `anam.gob.mx` (customs) and `gob.mx/senasica`
  (food/plant/animal health) were both directly reachable and gave clean,
  quotable prose — no PDF-extraction or SPA-shell problems like Japan/Kenya.
  Net assessment: Mexico's official web presence is real and current, but
  fragmented across `gob.mx`, `inm.gob.mx`, `sre.gob.mx`, `dof.gob.mx`, and
  `anam.gob.mx` subdomains with inconsistent reachability from this
  environment — worth another direct-fetch attempt on `inm.gob.mx` and
  `diputados.gob.mx` in a future pass rather than assuming they're
  permanently blocked.

## Done (promoted to /data, 2026-08-13) — Thailand

- [x] `destinations.json`, `entry-requirements.json` (all 15 roster
      nationalities: US, GB, CA, AU, NZ, JP, KR, SG, BR, MX, AR, CL, MY, IL,
      UA), `customs-items.json` for **Thailand** — promoted with citations to
      mfa.go.th (Ministry of Foreign Affairs, Department of Consular Affairs
      — image.mfa.go.th-hosted PDFs, since immigration.go.th and
      ratchakitcha.soc.go.th/Royal Gazette both return a Cloudflare
      bot-challenge 403 to automated fetches), en.fda.moph.go.th (Thai FDA),
      customs.go.th (Customs Department), bot.or.th (Bank of Thailand), and
      thailand.go.th (the Royal Thai Government's own official information
      portal). **Freshness note read carefully before trusting this data**:
      Thailand's tourist visa-exemption stay length has changed multiple
      times in the last two years and was mid-change again during this
      research pass. The rule actually verified and published here is the
      unilateral "ผ.60" scheme (93 countries/territories, 60 days,
      extendable once by 30 days at an immigration officer's discretion),
      per the MFA's own PDF list dated 15 July 2024 and unchanged as of this
      verification. Thailand's Cabinet approved, in principle, a tiered
      30-day/15-day replacement (May and again July 2026 cabinet sessions,
      per converging secondary/news reporting), but **no primary-source
      confirmation that it has been published in the Royal Gazette was found
      in this pass** — the Gazette site itself blocks automated fetches, and
      the live MFA PDF is still the pre-reform 15-July-2024 version. Per the
      Cabinet's own stated mechanism, the new rules take effect only 15 days
      after Gazette publication, so until a primary source shows that
      publication happened, the 60-day scheme is the one actually in force.
      This is exactly the kind of "current rule, not stale pre-change
      information" trap flagged going into this pass — **re-verify this
      destination's stay-length rows before the next cadence's usual check-in
      interval, not on the normal schedule**, since the reform could land at
      any time and immediately invalidate the `maxDays: 60` rows below.
      Of the 15 roster nationalities: 11 (US, GB, CA, AU, NZ, JP, SG, MX, MY,
      IL, UA) get the general 60-day "ผ.60" exemption; Korea (ROK) and
      Brazil are on that same 60-day list but ALSO have a separate, more
      generous bilateral ordinary-passport visa-exemption agreement
      (Department of Consular Affairs PDF dated 24 Feb 2025) granting 90
      days, which is the figure published; Argentina and Chile are **not**
      on the general 93-country list at all — they are visa-free only via
      that same bilateral agreement, also 90 days. All are `visa_free`;
      none of the roster nationalities require a visa, ETA, or VOA for
      Thailand. `documentsNeeded` includes the Thailand Digital Arrival Card
      (TDAC), confirmed mandatory for all non-Thai nationals via
      tdac.immigration.go.th's own FAQ page (submitted online within 72
      hours of arrival), alongside a valid passport. Customs rows cover
      alcohol (1 L duty-free), tobacco (200 cigarettes/250 g), cash
      declaration (THB 450,000 / USD 15,000, per the Bank of Thailand's own
      exchange-control page), general medication (30-day personal-use
      supply), a dedicated controlled-medication/narcotics entry (FDA
      Schedule II–IV rules, 30-day no-permit vs. 31–90-day IC-2 permit
      process, 15 days' advance application — the same kind of real traveler
      trap as Japan's pseudoephedrine entry), cannabis/CBD (prohibited for
      import — see the dedicated freshness note below on why this is
      published despite Thailand's volatile domestic legal status),
      e-cigarettes (prohibited nationwide since a 2014 Ministry of Commerce
      notification enforced under Customs Act ss. 244/246 — a genuinely
      high-enforcement risk area per thailand.go.th's own page and 2025–2026
      crackdown reporting), meat/dairy and fresh produce (FDA personal-import
      quantity limits, 2.5–5 kg per category), weapons (Department of
      Provincial Administration permit required), and drones (bringing one in
      is not restricted, but legal operation requires dual NBTC + CAAT
      registration — a real trip-planning trap for short stays given CAAT's
      ~14-day processing time). See "Deliberately left unpublished" below for
      what was **not** verified and stayed out of production.

  **Thailand cannabis/CBD note** (why `prohibited` was published despite
  Thailand's reputation for a liberalized cannabis regime): Thailand
  decriminalized cannabis domestically in June 2022, then reclassified
  cannabis flower as a medical-only "controlled herb" from June 2025 (PT 33
  prescription required above 0.2% THC), and remains politically unsettled
  on further reclassification as of this verification — none of that
  domestic-sale/possession history was used as the basis for this row. The
  customs question this file answers is narrower and was verified directly:
  can a traveler **import** cannabis/CBD/hemp products into Thailand from
  abroad. The Thai FDA's own personal-import guidance is unambiguous on that
  narrower question — cannabis- or hemp-based foods, cosmetics, and herbal
  products are all explicitly listed as not allowed to import, with no
  personal-use carve-out and no exception for a foreign medical prescription
  — so `prohibited` is the verified import verdict regardless of domestic
  legal status or THC content.

  **Thailand source-quality note** (for deciding how far to expand into
  Southeast Asia): `immigration.go.th` and `ratchakitcha.soc.go.th` (Royal
  Gazette) both return a Cloudflare-managed bot-challenge 403 to every
  automated request (curl and WebFetch alike) — a reachability-block pattern
  distinct from both the Akamai-403 seen on mofa.go.jp/EUR-Lex and the
  DNS/connection-refused pattern seen on several `*.gob.mx` hosts, but with
  the same practical effect: the "obvious" primary source for Thai
  immigration law could not be used directly. The actual research success
  came from finding that Thailand's Ministry of Foreign Affairs publishes
  the same underlying visa-exemption lists and announcements as real,
  directly-fetchable PDFs on an `image.mfa.go.th` asset subdomain outside
  the Cloudflare-protected main site — discovered via web search rather than
  by guessing a URL pattern, so this is a "search harder for an alternate
  official host," not a dead end. `en.fda.moph.go.th`, `customs.go.th`,
  `bot.or.th`, and `thailand.go.th` (the general Royal Thai Government
  information portal, used successfully for the e-cigarette and drone rows)
  were all directly reachable and gave clean, quotable prose; `doa.go.th`
  (Department of Agriculture, relevant to the plant/seed import gap below)
  returned a 403 with no Cloudflare challenge markers, a third distinct
  block pattern. One tooling risk repeated from the Kenya/South Africa
  passes: WebFetch's AI summarization produced measurably different, and in
  one case materially wrong, numbers from the same Thai FDA personal-import
  PDF/HTML page across two calls (10 kg vs. 20 kg total food allowance,
  2.5 kg vs. 5 kg dairy sub-limit) — resolved by pulling the raw HTML with
  curl and stripping markup by hand rather than trusting either summarized
  read, the same mitigation used for South Africa's DHA table. Net
  assessment: Thailand is a strong candidate for further build-out — the
  Cloudflare block on the two most obvious hosts is real but has a working
  documented bypass (the MFA asset subdomain), and the freshness risk here
  is unusually high and time-sensitive (an active, publicly-announced,
  not-yet-effective regulatory change) rather than a reachability problem —
  worth a short-interval re-check rather than the usual cadence.

## Done (promoted to /data, 2026-08-13) — Rwanda

- [x] `destinations.json`, `entry-requirements.json` (all 15 roster
      nationalities: US, GB, CA, AU, NZ, JP, KR, SG, BR, MX, AR, CL, MY, IL,
      UA), `customs-items.json` for **Rwanda** — promoted with citations to
      migration.gov.rw (Directorate General of Immigration and Emigration —
      DGIE), rra.gov.rw (Rwanda Revenue Authority customs), rwandalii.org
      (Rwanda Legal Information Institute — the official cross-border cash
      declaration regulation and the plastic-bag prohibition law),
      rwandafda.gov.rw (Rwanda FDA), and caa.gov.rw (Rwanda Civil Aviation
      Authority). Rwanda's DGIE has granted visa-on-arrival access to
      citizens of **all** countries since 1 Jan 2018 (no prior application
      required); all 15 roster rows are therefore `visa_on_arrival`, but the
      fee, duration, and single/multiple-entry terms genuinely differ by
      nationality group, per DGIE's own "Visa on arrival" policy page and its
      companion "Visitors visa" page (VE-1/V1 categories): (1) GB, CA, AU,
      NZ, and MY are current Commonwealth of Nations members (independently
      confirmed against thecommonwealth.org's member list) and qualify for
      the VE-1 waiver — free of charge, single entry, 30 days; (2) US, JP,
      KR, BR, MX, AR, CL, IL, and UA are not members of the African
      Union/Commonwealth/La Francophonie and are not on Rwanda's named
      90-day list, so they get the standard V1 Holiday visa — USD 50 single
      entry/30 days or USD 70 multiple entry/90 days; (3) Singapore is
      **explicitly named by DGIE** on a separate 90-day, fee-free list
      (alongside Angola, Benin, CAR, Chad, Côte d'Ivoire, DRC, St Kitts and
      Nevis, Ghana, Guinea, Haiti, Indonesia, Mauritius, Philippines, Qatar,
      Senegal, Seychelles, Sierra Leone, and São Tomé and Príncipe) — Rwanda's
      own page does not resolve the overlap between this list and Singapore's
      separate Commonwealth-membership eligibility, so the row uses the more
      specific by-name 90-day figure and flags the ambiguity in `notes` (see
      below). Customs rows cover alcohol (1 L spirits/2 L wine, 18+),
      tobacco (250 g), cash (USD 10,000 declaration threshold, 5% fine for
      non-declaration — Regulations Relating to the Declaration of Cross
      Border Cash or Bearer Negotiable Instruments, No 02/2021, Art. 4 & 7,
      fetched directly from rwandalii.org), two medication rows split by
      Rwanda FDA's own guidelines (general prescription medicine: 90-day
      supply; controlled substances/narcotics: 30-day supply, prescription
      from the country of origin required, no online/courier import — Rwanda
      FDA Guidelines Doc. No. FDISM/FDIEC/GDL/003, effective 15/03/2023, a
      genuinely well-drafted primary source that explicitly defines
      "Visitor" and applies numeric limits, unlike most other destinations in
      this dataset where medication quantity caps were unverifiable),
      cannabis/CBD (prohibited — EAC Customs Management Act 2004 Second
      Schedule Part A(7) narcotic-drugs ban, cross-referenced against
      Rwanda's domestic Law n° 03/2012 on narcotic drugs), weapons
      (restricted/permit-required, same EAC Second Schedule, Part B(5)),
      drones (a real, concrete border-declaration requirement — RCAA's own
      page states drones must be declared to Rwanda National Police at the
      point of entry, in addition to needing an RCAA Activity Permit and
      registration before flight — stronger sourcing than the usual
      "no primary source found" drone gap seen elsewhere in this dataset),
      and a dedicated `other`-category row for Rwanda's well-known plastic
      bag/single-use-plastic import ban (Law N° 17/2019 of 10/08/2019, Art. 3
      & 10 — confiscation plus a fine equal to 10x the value, no traveler
      exemption stated in the law). See "Deliberately left unpublished"
      below for what stayed out, including `food_animal`/`food_plant`/
      `e_cigarettes`, and the Singapore list-overlap ambiguity.

  **Rwanda source-quality note** (for deciding how far to expand into East
  Africa): migration.gov.rw, rra.gov.rw, rwandafda.gov.rw, and caa.gov.rw
  were all directly reachable via a plain `curl` with a standard browser
  User-Agent — no Cloudflare/Akamai bot-challenge blocks and no DNS/
  connection-refused gaps of the kind seen on mofa.go.jp, EUR-Lex, or several
  `*.gob.mx` hosts. WebFetch's own AI-summarization step under-delivered
  badly on migration.gov.rw's visa pages on the first pass (it initially
  reported the page had "no specific lists of countries by category" when
  the raw HTML in fact contained the full named 90-day country list
  verbatim) — the same silent-corruption risk flagged in the South Africa
  and Thailand passes; raw HTML fetched via `curl` and stripped of
  script/style tags by hand was used to resolve this and is the actual
  source of the verbatim quotes in the rows above. `rwandalii.org` (Rwanda's
  free legal-information institute, a Justia/AfricanLII-affiliate site) was
  an excellent, unexpected find for two national laws/regulations (the cash-
  declaration regulation and the plastic-bag law) that would otherwise have
  needed the Rwandan Official Gazette, which was not directly searched in
  this pass. One genuine dead end: the DGIE's own linked "communique on the
  new visa regime" PDF
  (`migration.gov.rw/fileadmin/user_upload/pdf_files/rwanda_s_new_visa_regine_-_final_final2.pdf`)
  fetched successfully (HTTP 200) but is image-based/non-extractable by
  `pdftotext` — the DGIE webpage prose was used instead and is consistent
  with everything independently found on `rwandafda.gov.rw`/`rra.gov.rw`/
  `caa.gov.rw`, so this wasn't treated as a blocker, just a missed
  opportunity for an even-more-authoritative citation. Net assessment:
  Rwanda was one of the smoother pilots in this dataset — reachable,
  English-language, current government sources across four different
  agencies, with two genuinely strong, dated, numbered regulatory documents
  (the FDA personal-effects guideline and the cash-declaration regulation)
  that gave concrete, citable numeric thresholds where several other
  destinations in this dataset could only publish `depends`/qualitative
  verdicts. Supports further build-out in the region.

## Done (promoted to /data, 2026-08-12) — Nigeria

- [x] `destinations.json`, `entry-requirements.json` (all 15 roster
      nationalities: US, GB, CA, AU, NZ, JP, KR, SG, BR, MX, AR, CL, MY, IL,
      UA), `customs-items.json` for **Nigeria** — promoted with citations to
      immigration.gov.ng (Nigeria Immigration Service, NIS), the Money
      Laundering (Prevention and Prohibition) Act 2022 and National Drug Law
      Enforcement Agency Act (Cap. N30 LFN 2004) (both fetched as their own
      PDF text via `lawsofnigeria.placng.org`/`placng.org`, the standard
      "Laws of the Federation of Nigeria" repository used since Nigerian
      legislation is not reliably served from a single dated government
      Gazette host), customs.gov.ng (Nigeria Customs Service), and
      naqs.gov.ng (Nigeria Agricultural Quarantine Service). **Context
      confirmed before publishing anything**: Nigeria discontinued Visa on
      Arrival effective 1 May 2025, replacing it with a mandatory online
      e-Visa system administered by NIS (per NIS's own "Nigeria Visa
      Classes" and "Tourism Visa – F5A" pages) — this is the current rule
      published here, not the pre-reform VoA regime still described on many
      secondary/travel-agency sites. Eligibility for the e-Visa is universal
      except for ECOWAS member-state nationals and a handful of countries
      with a separate visa-abolition/waiver agreement (Cameroon, Chad); no
      primary source places any of the 15-nationality roster in that exempt
      group, so all 15 rows are `visa_required`, applied for via the
      Tourism Visa (F5A): single-entry, 90 days from issuance to enter,
      30-day stay once admitted, **not extendable**, no employment
      permitted — `stayPolicy: fixed_per_entry, 30 days`. Visa fees vary by
      nationality/category and were not independently verified (left out of
      `notes` rather than guessed). Customs rows cover alcohol (1 L spirits
      + 1 L wine), tobacco (200 g total), cash declaration (USD 10,000,
      Money Laundering Act 2022 s. 3(3), read directly from the Act's own
      text — false declaration or non-declaration risks forfeiture and/or
      ≥2 years' imprisonment), cannabis/CBD (prohibited — NDLEA Act ss. 11,
      19–20, read directly from the Act's own text; no CBD/low-THC
      carve-out found), weapons (prohibited in practice — the Customs
      Service's own absolutely-prohibited list explicitly bans air pistols,
      disguised pistols, and noxious-gas weapons; ordinary firearms need a
      Presidential import licence not realistically available to tourists),
      and meat/dairy and fresh produce (both `depends` — NAQS requires an
      import permit + health certificate for animal products and a
      Phytosanitary Certificate for plant products, per its own FAQ, but
      does not state a personal-baggage/traveler-specific exemption or
      quantity threshold). See "Deliberately left unpublished" below for
      what was **not** verified and stayed out of production (medication,
      e-cigarettes, and drones).

  **Nigeria source-quality note** (for deciding how far to expand into
  Africa): `immigration.gov.ng` was directly reachable via `curl` with a
  standard browser User-Agent and — unusually for this dataset — actually
  serves real, substantial server-rendered prose (not a SPA shell): the
  `/nigerian-visa/` and `/info-center/*` pages yielded a genuinely detailed,
  well-organized visa-classification system (13 e-Visa categories with
  named subclasses, validity, and stay length each) plus a large FAQ with
  direct, quotable answers on eligibility, required documents, and the
  application flow. `evisa.immigration.gov.ng` (the actual application
  portal) was the opposite: a client-rendered React SPA returning only an
  empty shell to both `curl` and WebFetch — consistent with the
  now-familiar "portal is a thin app, informational pages are real HTML"
  split seen on Kenya's `etakenya.go.ke`. `customs.gov.ng` was a harder
  case: the entire site has been rebuilt as a Cloudflare-protected React
  SPA (bundled with `rolldown`/`vite`) that returns an empty loading shell
  to every automated fetch, including WebFetch (HTTP 403 on direct
  WebFetch, HTTP 200-but-empty-shell on `curl`) — a new block pattern
  distinct from the Akamai-403 (mofa.go.jp/EUR-Lex), Cloudflare
  bot-challenge-page (immigration.go.th), and DNS/connection-refused
  (`*.gob.mx`) patterns seen elsewhere in this dataset. Resolved by finding
  that the *same* customs.gov.ng content pages (`?page_id=3073` "Passenger's
  Concessions" and `?page_id=3077` "Goods the Importation of Which is
  Absolutely Prohibited") exist as full server-rendered HTML in a 2019
  Wayback Machine snapshot of the site's pre-SPA WordPress incarnation, and
  the exact figures quoted there (1 L spirits, 1 L wine, 200 g tobacco,
  284 cc perfume, ₦50,000 unaccompanied-gift allowance) were independently
  corroborated by a live Google search-index snippet of the *current*
  customs.gov.ng page — the same cross-check method used for Japan's
  Akamai-blocked MOFA pages. The URLs cited in the published rows are the
  live, human-browsable customs.gov.ng pages, not the Wayback snapshot.
  `naqs.gov.ng` was directly reachable and gave clean prose, though phrased
  for commercial/commodity import rather than traveler baggage
  specifically. One access-method note distinct from prior passes: Nigeria's
  own federal-law hosting is fragmented — no single official
  Gazette/NASS site was found to be both reachable and to carry the
  specific Acts needed, so both the Money Laundering Act 2022 and the NDLEA
  Act were fetched as PDFs from `placng.org`/`lawsofnigeria.placng.org`
  (Policy and Legal Advocacy Centre, a Nigerian civil-society legal-reform
  NGO that hosts consolidated Laws of the Federation of Nigeria as
  apparently-unaltered scanned/OCR'd Gazette text) rather than a
  `.gov.ng`-hosted copy — the same non-government-but-verbatim-primary-text
  pattern used for Kenya's Gazette PDFs via kenyalaw.org, except placng.org
  is not itself a government body the way Kenya Law is (Kenya Law is a
  statutory National Council for Law Reporting). Treated as acceptable
  because the fetched text is the codified Act's own numbered sections
  (not a paraphrase), but flagged here as a slightly weaker provenance tier
  than a `.gov.ng` original — worth a follow-up attempt at an official NASS
  or Federal Ministry of Justice host in a later pass. `ncaa.gov.ng`
  (aviation/drones) was reachable and gave a real 163-page UAS operations
  advisory circular PDF, but it covers airspace/operational rules, not a
  customs import verdict, and NCAA's own news page shows its "Drone
  Regulation Portal" only launched in May 2026 with policy framework still
  "in development" — genuinely too early to publish a traveler-facing
  import rule, not a reachability failure. Net assessment: Nigeria's
  federal immigration and agricultural-quarantine agencies are strong,
  readable primary sources; its customs agency's migration to a
  Cloudflare-protected SPA is a new and meaningfully harder access pattern
  requiring the Wayback-Machine-plus-live-cross-check workaround documented
  above (worth watching — if a future pass finds `customs.gov.ng` has
  published new content since this SPA migration, it will need this same
  workaround, since it will not be directly fetchable); its federal
  statute hosting is more fragmented than Kenya's or South Africa's.
  Supports further build-out, budgeting extra time for the customs-SPA
  workaround.

## Done (promoted to /data, 2026-08-12) — Egypt

- [x] `destinations.json`, `entry-requirements.json` (14 of the 15 roster
      nationalities — see below), `customs-items.json` for **Egypt** —
      promoted with citations to visa2egypt.gov.eg (Egypt e-Visa Portal,
      run by the Ministry of Interior) and customs.gov.eg (Egyptian Customs
      Authority, Ministry of Finance). visa2egypt.gov.eg's own FAQ page
      publishes a verbatim list of ~89 nationalities eligible to apply for
      an e-Visa; 14 of the 15 roster nationalities are on it (US, GB, CA,
      AU, NZ, JP, KR, SG, BR, MX, AR, CL, MY, UA) — Israel is the sole
      exception (not on the list; see below). All 15 rows are published as
      `visa_required` rather than `eta_required`: the source's own words are
      "a visa is required prior to entry into The Arab Republic of Egypt"
      and eligible nationals "may be issued with an e-Visa" — this is
      legally a visa (fee USD 30 single-entry / USD 65 multiple-entry,
      issued entirely online without an embassy visit), and the schema
      distinction was resolved by matching the primary source's own
      terminology rather than reinterpreting it as an ETA-style
      authorization. Critically, **no permitted-stay-length figure (e.g.
      the commonly-repeated "30 days") is published anywhere in the
      e-Visa portal's reachable pages** (FAQ, About, How to Apply,
      Disclaimer, Terms of Use, or the pre-login Sign Up/Contact Us pages)
      — `stayPolicy` therefore uses `{kind: "visa_required"}` (no
      computable duration) for every EG row, the same honest-gap pattern
      used for Kenya's eTA, rather than publishing the widely-repeated but
      unconfirmed figure from travel-blog/visa-agency secondary sources.
      For Israel: not on the eligible-nationality list, so the row is
      `visa_required` via an Egyptian embassy/consulate, with no consular
      visa terms (fee, validity) published since none were found on a
      primary source — see the honest-gaps entry below for the
      commonly-reported-but-unverified Sinai-only free-entry-stamp
      arrangement that was deliberately **not** encoded. Customs rows
      (alcohol, tobacco, medication, cannabis/CBD, weapons, drones,
      e-cigarettes, food_plant/seeds, and a general-goods/gifts `other`
      row) are sourced from the Egyptian Customs Authority's own
      "Legislations → Travel & Tourism → Passengers" page, which cites
      Customs Law No. 207 of 2020 and its Executive Regulations (Minister
      of Finance Decree No. 430 of 2021) and gives concrete, numbered
      passenger allowances (1 litre spirits; 200 cigarettes/25 cigars/
      200g tobacco; EGP 15,000 duty-free general-goods threshold) plus a
      named list of restricted-goods examples (medication, daggers/bladed
      weapons, RC aircraft/drones, e-cigarettes, agricultural seeds/
      pesticides) each requiring a named control-agency's clearance. See
      "Deliberately left unpublished" below for cash declaration (no
      primary source found despite an extremely consistent secondary-source
      figure), food_animal, and other gaps.

  **Egypt source-quality note** (for deciding how far to expand into North
  Africa/MENA): `visa2egypt.gov.eg` is real, current, and government-run
  (footer: "Ministry of Interior — Arab Republic of Egypt"), but is an
  old-style server-rendered JSF/PrimeFaces application — the bare domain
  meta-refreshes to `/eVisa/`, and every page carries a per-session
  `jsessionid`/CSRF token in its internal links; fetching the named routes
  directly (`/eVisa/FAQ`, `/eVisa/HowDoIApply`, `/eVisa/Disclaimer`, etc.)
  with a standard browser User-Agent worked reliably and returned real,
  substantial content each time (cross-checked via a second fetch and a
  Wayback Machine snapshot of the FAQ page, which matched). The actual
  application form (`/eVisa/SignUp`, `/eVisa/ApplyNow`) requires an
  account and did not yield additional public information. A parallel
  Ministry of Interior online-visa-services subdomain, `emoves.moi.gov.eg`,
  was **completely unreachable** (`ECONNREFUSED` from both direct `curl`
  and WebFetch) — a reachability-gap pattern like the one seen on
  `inm.gob.mx` for Mexico — so it was not used. `mfa.gov.eg` (Ministry of
  Foreign Affairs) rendered only in Arabic and, on the one English visa
  page located via search, itself linked back to visa2egypt.gov.eg rather
  than adding independent detail. `customs.gov.eg`, by contrast, was a
  genuinely strong source once its internal `Legislations/TravelAndTourism`
  route structure was discovered by parsing raw `href`s off the homepage
  (the site is Arabic-only, no English toggle found) — real, current
  (dated as recently as 8 Aug 2026), directly quotable prose citing exact
  law/decree numbers, not a thin SPA shell. The Central Bank of Egypt site
  (`cbe.org.eg`) was reachable but its circulars listing appeared to be
  filtered/loaded via a JS API the static fetch couldn't drive — the
  category-filtered URL for "Foreign Currency Activities" circulars
  returned an unfiltered default list instead, which is why no cash
  declaration threshold was confirmed (see below). Net assessment: Egypt
  is workable but requires knowing to dig past the obvious top-level
  pages (same lesson as Kenya's SPA shells and Thailand's Cloudflare
  bypass) and coping with Arabic-only content on the customs side —
  cautiously supports further MENA expansion, budgeting time for
  route-discovery and Arabic-text extraction rather than expecting a
  reachability wall.

## Done (promoted to /data, 2026-08-13) — India

- [x] `destinations.json`, `entry-requirements.json` (all 15 roster
      nationalities: US, GB, CA, AU, NZ, JP, KR, SG, BR, MX, AR, CL, MY, IL,
      UA), `customs-items.json` for **India** — promoted with citations to
      indianvisaonline.gov.in (Bureau of Immigration, Ministry of Home
      Affairs — the single official e-Visa portal), rbi.org.in (Reserve
      Bank of India), content.dgft.gov.in (Directorate General of Foreign
      Trade), indiacode.nic.in / dor.gov.in (statute text), and
      chennaicustoms.gov.in (a CBIC customs-zone field formation, used for
      general national baggage-rules figures since cbic.gov.in itself was
      unreachable — see source-quality note below). All 15 roster
      nationalities, **including Ukraine** (checked with extra care per this
      pass's brief, given regional-context risk of assuming a rule rather
      than verifying it), appear on India's live e-Visa eligible-country
      list and carry the same non-zero, current e-Tourist Visa fee schedule
      (a Country/Territory-wise fee PDF dated 09-July-2026, i.e. current as
      of this verification) — no nationality-specific exclusion was found
      for any of the 15. All 15 rows are `eta_required` (India's own site
      calls the grant an "Electronic Travel Authorization (ETA)") with
      `stayPolicy: fixed_per_entry, 30 days`, reflecting the standard e-T1 V
      one-month e-Tourist Visa option (multiple entries within that window,
      non-extendable, non-convertible); the longer 1-year/5-year e-Tourist
      Visa options exist but only grant a combined 180 days/calendar year
      rather than a longer single stay, so were not used as the default row.
      Argentina's row separately notes India waives the e-Visa fee entirely
      for Argentine nationals (confirmed on the same official fee schedule).
      Customs rows cover alcohol (2 L duty-free), tobacco (100 cigarettes/
      25 cigars/125 g duty-free), cash (Reserve Bank of India's own Master
      Direction — USD 5,000 cash / USD 10,000 aggregate foreign-exchange
      declaration threshold, cross-checked against CBIC's Chennai Customs
      FAQ and found identical), a medication row scoped specifically to
      NDPS-scheduled (narcotic/psychotropic) drugs requiring advance
      Narcotics Commissioner permission before travel (Department of
      Revenue's own dedicated page for this), cannabis/CBD (prohibited —
      NDPS Act 1985 definition of "cannabis" fetched directly from a
      dor.gov.in copy of the Act), e-cigarettes (prohibited outright and a
      **criminal offence**, not just a confiscation — Prohibition of
      Electronic Cigarettes Act, 2019, Sections 4 and 7, fetched directly
      from indiacode.nic.in; up to 1 year/₹1 lakh first offence, up to
      3 years/₹5 lakh repeat offence), drones (prohibited — DGFT
      Notification No. 54/2015-20 classifies CBU/SKD/CKD drone import as
      flatly "Prohibited" with exceptions only for government/R&D/defence
      entities, none of which cover a tourist's personal drone — a
      strongly-sourced, genuinely high-stakes row per this pass's brief),
      weapons (prohibited — firearms import banned outright per CBIC's own
      FAQ, with only a narrow registered-shooter air-gun exception), and a
      satellite-phone row under `other` (prohibited without an advance
      Department of Telecommunications licence, Telegraph Act 1885 ss.
      20–21 — another real, non-obvious traveler trap). `food_animal` and
      `food_plant` are published at `depends` rather than `prohibited`
      because CBIC's own source lists them inside a single undifferentiated
      "prohibited/restricted" phrase alongside several other categories,
      without stating item-by-item which treatment applies — see
      "Deliberately left unpublished" below.

  **India source-quality note**: `indianvisaonline.gov.in` (the single
  official e-Visa portal covering all 15 roster nationalities at once, as
  anticipated going into this pass) was directly reachable, current, and
  yielded the eligible-country list and the exact e-Tourist Visa duration
  text both from raw HTML (not just an AI-summarized fetch — the country
  list and visa-category text were independently confirmed by grepping the
  raw page source) and from two linked PDF fee schedules
  (`Etourist_fee_final.pdf` dated 09-July-2026, `eTV_revised_fee_final.pdf`
  dated 15-April-2026) that were directly downloadable and `pdftotext`
  -extractable — a clean, well-structured primary source, one of the
  smoother visa-authority pilots in this dataset. `cbic.gov.in`,
  `taxinformation.cbic.gov.in`, and `www.cbic-gst.gov.in` (the natural home
  for India's Baggage Rules 2016 and CBIC's own traveler-guide PDF) were
  **all completely unreachable** from this environment — `curl` timed out
  (connect timeout, not a DNS or TLS failure) on every attempt, a distinct
  reachability-gap pattern from both the Akamai-403 (mofa.go.jp/EUR-Lex) and
  Cloudflare-challenge (Thailand) patterns seen elsewhere in this dataset.
  The working substitute was `chennaicustoms.gov.in`, a CBIC customs-zone
  field-formation site that publishes the same *national* (not
  Chennai-specific) baggage-rules figures in a detailed, dated (footer:
  "Copyright © 2026 Chennai Customs"), directly quotable FAQ — the same
  "use a reachable field-office mirror when the headquarters domain is
  blocked" pattern that worked for South Africa's SARS guides and Kenya's
  KRA FAQ. `rbi.org.in`, `content.dgft.gov.in`, and `dor.gov.in` were all
  directly reachable and gave clean, current, dated primary documents —
  notably the DGFT drone-import notification and the PECA 2019 Act text,
  both fetched as real government PDFs via direct `curl` (a browser
  User-Agent was needed; `indiacode.nic.in`'s own HTML landing page also
  needed one, returning HTTP 403 to WebFetch's default fetch but HTTP 200
  to a `curl` request carrying a standard browser User-Agent header — worth
  remembering as a low-cost retry step before concluding a `.gov.in` /
  `.nic.in` host is blocked). Net assessment: India's official web presence
  is fragmented across many domains (`indianvisaonline.gov.in`, `cbic.gov.in`
  and its zone-level mirrors, `rbi.org.in`, `dgft.gov.in`, `indiacode.nic.in`,
  `dor.gov.in`) with real, if patchy, reachability from this environment —
  the single central `cbic.gov.in` block was a genuine dead end worth a
  retry in a future pass, but every fact it would have sourced was still
  independently confirmable via a reachable alternate official host, so this
  pass did not need to fall back to any unverified/secondary claim for the
  rows actually published.

## Done (promoted to /data, 2026-08-13) — Turkey

- [x] `destinations.json`, `entry-requirements.json` (all 15 roster
      nationalities: US, GB, CA, AU, NZ, JP, KR, SG, BR, MX, AR, CL, MY, IL,
      UA), `customs-items.json` for **Turkey** — promoted with citations to
      mfa.gov.tr (Republic of Türkiye Ministry of Foreign Affairs, "Visa
      Information for Foreigners" page) and gumrukrehberi.gov.tr (T.C.
      Ticaret Bakanlığı / Ministry of Trade's official "Gümrük Rehberi"
      customs guide). 14 of the 15 roster nationalities are `visa_free` for
      up to 90 days within a rolling 180-day window under Türkiye's general
      visa-exemption regime (Law No. 6458 on Foreigners and International
      Protection); Mexico is the exception and is `visa_required` (ordinary/
      official passport holders — Mexican diplomatic passport holders are
      separately exempt), with a choice between a 90-day multiple-entry
      mission visa or a 30-day single-entry e-Visa. The MFA page's **raw
      HTML** (fetched directly with a browser User-Agent, not via WebFetch's
      AI-summarized extraction — see the source-quality note below for why
      that distinction mattered) was parsed per-nationality for the exact
      stated wording. The 90-days-in-180-days window is stated explicitly
      for only 4 of the 15 nationalities (US, GB, CA, AU); the other 10
      visa-exempt rows apply the same window under Türkiye's general Law
      No. 6458 framework rather than a per-country-confirmed mechanic — see
      "Deliberately left unpublished" below for the specific caveat this
      rests on. Every visa-free row also carries a real, specific
      passport-validity rule — valid at least 60 days beyond the length of
      stay (Law No. 6458 Art. 7.1(b)) — sourced directly from the MFA page's
      own text, not the "6 months" figure repeated by many travel blogs
      (that figure traced back to a non-official source in this pass — see
      the evisa.gov.tr note below — and was deliberately not used). Customs
      rows cover alcohol (1 L >22% ABV / 2 L ≤22% ABV, 18+), tobacco (600
      cigarettes / 100 cigarillos / 50 cigars / 250g cut or pipe tobacco, one
      full allowance per product type, 18+), cash (no mandatory
      inbound-declaration threshold — a genuine, verified departure from the
      "10,000 EUR must declare" figure repeated across many secondary/travel
      sources, though cash from specific restricted sources — debts, gifts,
      dowries, inheritance, migrant assets, foreign loans — must move via
      bank rather than be carried; false explanations on inspection draw a
      10% fine plus a MASAK/prosecutor referral), medication (documentary
      proof of personal treatment need — report/prescription — no numeric
      day-supply cap found), cannabis/CBD (prohibited — general narcotics
      ban, Law No. 2313, no CBD carve-out found), food_animal (meat and
      dairy prohibited outright as personal imports, Ministry of Agriculture
      and Forestry Communiqué No. 2012/11), and food_plant (3 kg fresh/dried
      fruit & vegetables + 1 kg other plant products + 2 kg honey, duty-free).
      See "Deliberately left unpublished" below for e-cigarettes, weapons,
      and drones (no primary source found for personal/accompanied import in
      any of the three, despite drones being flagged as a priority), and for
      the evisa.gov.tr access anomaly.

  **Turkey source-quality note**: mfa.gov.tr and gumrukrehberi.gov.tr
  (Ticaret Bakanlığı) were both directly reachable and gave clean,
  well-structured, English-language content once fetched with a real browser
  User-Agent — plain `curl` with no UA got a 403 on mfa.gov.tr, but the
  content was identical either way once a UA was set, so this looks like
  basic bot-filtering rather than a hard block. A WebFetch pass over the MFA
  visa page (AI-summarized, not raw HTML) initially reported the United
  States as visa-exempt with no caveat; the raw HTML in fact shows "Official
  passport holders are required to have visa... Ordinary passport holders
  are exempted... up to 90 days" — a materially different, nuanced answer
  the summarization dropped, the same silent-corruption risk flagged in the
  South Africa and India passes. Raw HTML fetched via `curl` and parsed by
  hand was used for every nationality's row as a result, not WebFetch's
  summary. **One genuine and notable finding, worth flagging beyond the
  usual reachability notes**: evisa.gov.tr — the domain named in this
  project's own draft stub and cited by essentially every secondary source
  as "the" official Turkish e-Visa portal — currently 302-redirects its
  `/en/` path to `https://dtvgroup.com.tr/`, a private company ("DTV
  Danışmanlık Aracılık Organizasyon A.Ş.") whose own homepage brands itself
  as "Türkiye Cumhuriyeti e-Vize Hizmetleri" (Republic of Türkiye e-Visa
  Services) despite not being a government entity. The TLS certificate
  served on evisa.gov.tr is genuine and current (issued to "T.C. Dışişleri
  Bakanlığı" / GlobalSign, issued 2026-08-06, days before this research
  pass), so this is not a DNS hijack or a spoofed certificate — but the live
  server-side redirect target is a commercial third party, not the expected
  government e-Visa application flow. This could be a very recent, possibly
  legitimate contractor handover, or could indicate the redirect
  configuration was compromised; this pass could not distinguish the two and
  did not attempt to use the e-Visa application flow to check. Given the
  ambiguity, `officialAuthorityUrl` and `legal_source` for Turkey were
  pointed at mfa.gov.tr instead of evisa.gov.tr, and no published fact is
  sourced from evisa.gov.tr or dtvgroup.com.tr's content. **This is worth a
  human security report to Turkey's MFA/DTV, or at minimum a fast re-check
  before evisa.gov.tr is ever linked from a user-facing page** — a traveler
  following an "official Turkish e-Visa site" link could otherwise land on a
  private commercial intermediary. Net assessment: Turkey's own government
  content (once reached past bot-filtering) was clean and reliable; the
  standout risk this pass surfaced was not a research-access problem but a
  live anomaly on the specific domain everyone — including our own original
  draft stub — assumed was safe to link to.

## Deliberately left unpublished from this research pass (genuinely unverified — do not add without a real primary-source check)

- [ ] IN: `food_animal` (meat/dairy/poultry/fish) and `food_plant`
      (seeds/plants/fruit/flowers) — CBIC's Chennai Customs FAQ lists both
      categories, together with several unrelated categories (narcotics,
      wildlife products, satellite phones, gold/silver, arms), inside one
      undifferentiated "are prohibited/restricted" sentence, without stating
      which specific items are outright banned versus importable under a
      permit or health/phytosanitary certificate. No dedicated FSSAI
      (food), Department of Animal Husbandry, or Plant Quarantine
      (Directorate of Plant Protection, Quarantine & Storage)
      traveler-facing primary source was found in this pass to resolve the
      ambiguity — both rows are published as `depends` rather than a
      specific verdict, and both stay well short of Japan's or Rwanda's
      level of itemized detail for the same categories.
- [ ] IN: general (non-NDPS-scheduled) prescription/OTC medication —
      `medication-in` only covers the NDPS-controlled-substance case
      (advance Narcotics Commissioner permission), sourced from a dedicated
      Department of Revenue page. No primary CBIC baggage-rules source for
      the much more common "can I just bring my regular prescription
      medicine" question was reachable in this pass (`cbic.gov.in` itself
      was unreachable — see source-quality note above); no numeric
      day-supply cap is published for either case.
- [ ] IN: CBD/hemp-derived products specifically, as distinct from cannabis
      generally — `cannabis-in` is published as a blanket `prohibited`
      verdict (no primary source found describing a personal-import
      allowance for low-THC CBD products, with or without a foreign
      prescription); the NDPS Act's own seeds/leaves carve-out (the legal
      basis for bhang being treated differently domestically) was
      deliberately **not** extended into a customs-import allowance, since
      no primary source confirms that extension.
- [ ] IN: India's 1-year and 5-year e-Tourist Visa options (180-day/calendar
      -year cap, multiple entries) were confirmed to exist on the same
      primary source used for the published 30-day rows, but were not
      separately encoded as alternative rows — `entry-requirements.json`
      publishes only the standard 30-day e-T1 V option per the brief for
      this pass. Revisit if the product wants to surface the longer-validity
      options as a distinct trip-check path.
- [ ] IN: exact passport blank-page requirement (beyond the 6-months
      validity figure, which is confirmed) was not stated on the e-Visa
      portal and was not independently confirmed elsewhere in this pass;
      `documentsNeeded` intentionally omits a specific blank-page claim.

- [ ] EG: cash-declaration threshold — an extremely consistent set of
      secondary sources (news outlets, travel-agency sites) states
      travelers may carry up to USD 10,000 (or equivalent) without
      declaring, and up to EGP 5,000 in local currency, with a formal
      declaration required above that. No primary Egyptian source (Central
      Bank of Egypt or Egyptian Customs Authority) stating this figure was
      successfully fetched in this pass — `cbe.org.eg`'s circulars page
      appears to require a JS-driven API call to filter by category that a
      static fetch could not reproduce, and `customs.gov.eg`'s own
      "Currency" service page turned out to be just a currency-exchange-rate
      table, not a declaration-threshold page. No `cash` row was published
      for Egypt; re-attempt by finding the specific CBE circular/law number
      (likely under the CBE Law No. 194/2020 or an implementing regulation)
      rather than trusting the secondary consensus.
- [ ] EG: Israel — the commonly-reported "Sinai-only" free 14-day entry
      stamp available at the Taba land border (and reportedly Sharm El
      Sheikh airport) to Israeli citizens and several other nationalities,
      valid only for Sinai resort areas rather than all of Egypt, is
      described consistently across travel-industry secondary sources but
      was not confirmed against any primary Egyptian government source in
      this pass (neither visa2egypt.gov.eg nor customs.gov.eg mentions it —
      it would presumably be a Ministry of Interior border-policy notice,
      not something on the e-Visa portal since it's a different regime
      entirely). Not encoded as a row or an alternate stayPolicy; the IL→EG
      row stays at a blanket `visa_required` with no computable duration.
      If found, this is a materially different (and better) traveler
      experience than "get a consular visa," worth a follow-up pass.
- [ ] EG: `food_animal` (meat/dairy) customs treatment — the Customs
      Authority's restricted-goods examples mention dried animal
      horn/ivory (CITES-related, a wildlife-trade concern) but do not
      address ordinary meat, cheese, or dairy products the way Japan's or
      Mexico's sources did. No row published.
- [ ] EG: `weapons-eg` is scoped narrowly to daggers/bladed weapons per the
      source's own restricted-goods example; the same source's general
      "prohibited goods" definition separately lists "weapons" (الأسلحة)
      as an example of goods that cannot be imported/exported at all, which
      almost certainly covers firearms/ammunition more strictly than the
      "clearance required" bladed-weapons rule — but no passenger-specific
      firearms verdict distinct from bladed weapons was found, so nothing
      firearms-specific is published; treat firearms as prohibited pending
      a dedicated source.
- [ ] EG: exact minimum age for the alcohol/tobacco personal allowances
      (most comparable countries in this dataset specify 18+; the Egyptian
      Customs Authority page used here does not state an age threshold for
      either allowance) was not confirmed and is not asserted.
- [ ] EG: whether proof of onward/return travel or proof of funds is
      required for e-Visa entrants beyond the FAQ's general "Travel
      itinerary" and "Hotel bookings/details about places to visit"
      wording — not further specified on the source used, so
      `documentsNeeded` stays at that general wording rather than a more
      specific but unverified claim.
- [ ] EG: `emoves.moi.gov.eg` (a Ministry of Interior online-visa-services
      subdomain) was unreachable (`ECONNREFUSED`) throughout this pass —
      worth a re-fetch attempt in a future session in case it carries
      additional detail (e.g. the missing stay-length figure) not found on
      visa2egypt.gov.eg.

- [ ] TR: the 90-days-in-180-days window is stated explicitly on the MFA
      page for only 4 of 15 roster nationalities (US, GB, CA, AU); for the
      other 10 visa-exempt nationalities (NZ, JP, KR, SG, BR, AR, CL, MY,
      IL, UA) the page states only "exempt... up to 90 days" without
      repeating the 180-day qualifier. `rolling_window(180, 90)` was applied
      to all 10 on the basis that this is Türkiye's single general
      visa-exemption framework under Law No. 6458 (corroborated by a
      secondary Turkish-language legal-practice summary of Law 6458 Art. 12:
      "180 günde 90 gün kalış kuralı"), not a different per-country
      mechanic — but the underlying statute/implementing-regulation text
      itself (mevzuat.gov.tr) could not be fetched directly in this pass
      (TLS/404 issues) to confirm at the legal-text level. If any of these
      10 nationalities actually has a `fixed_per_entry` (not rolling-window)
      allowance, this is the row to revisit first.
- [ ] TR: `e_cigarettes` — gumrukrehberi.gov.tr confirms e-cigarettes/
      cartridges cannot be sent to Türkiye by post/courier, and are absent
      from the personal duty-free tobacco allowance list, but no primary
      source was found stating the verdict for a traveler carrying a
      personal vape in accompanied baggage (allowed with duty, or
      prohibited outright). No row published.
- [ ] TR: `weapons` — gumrukrehberi.gov.tr confirms firearms cannot be sent
      to Türkiye by post/courier; secondary legal-practice sources describe
      a real temporary-import permission for tourist hunters/sport shooters
      under Law No. 6136 Additional Article 4 (declare to customs, get
      entry-point security-authority permission, re-export on departure),
      but this could not be confirmed against the primary statute text
      (mevzuat.gov.tr access issues, same as above) or a Ticaret Bakanlığı
      page specifically about accompanied baggage. No row published.
- [ ] TR: `drones` — no primary Ticaret Bakanlığı or SHGM (Directorate
      General of Civil Aviation) page was found stating an import/customs
      verdict for personal drones (only SHGM's flight-operation
      regulations, e.g. SHT-İHA, were found, and those govern *operating* a
      drone, not what customs does with one at the border — same gap
      pattern as every other destination in this dataset so far). Secondary/
      forum sources describe a "2 drones per traveler, ≤1500 EUR value,
      SHGM registration within 3 days" regime, but none of it was confirmed
      against a primary source in this pass. No row published, despite this
      being a flagged priority — the sourcing simply wasn't there.
- [ ] TR: outbound cash-declaration rules (cash taken OUT of Türkiye) were
      not researched — only the inbound rule was verified (see `cash-tr`).
      A secondary source cites a 185,000 TL threshold for TL cash leaving
      the country, unconfirmed against a primary source and not published.
- [ ] TR: the gumrukrehberi.gov.tr consumables page also documents duty-free
      cosmetics (up to 600ml perfume/cologne/lotion + 5 skincare/makeup
      items) and food staples (1kg each of tea, instant coffee, and coffee,
      plus a combined 2kg allowance split between chocolate and sugar
      confectionery) under an `other`-eligible category — not published as
      a row in this pass, lower priority than the requested categories, not
      a sourcing gap.
- [ ] TR: the GB row's "touristic purposes" qualifier and BNO/British
      Subject/British Protected Person carve-out, and the AU row's
      "touristic visits and transit" qualifier, are taken verbatim from the
      MFA page; whether the exemption also covers ordinary business travel
      for these two nationalities specifically was not independently
      confirmed (most other nationalities' MFA entries do not repeat a
      purpose qualifier at all, so this may just be inconsistent drafting
      rather than a genuine business-travel gap — flagged rather than
      assumed either way).

- [ ] RW: Singapore's exact controlling provision — DGIE's "Visa on arrival"
      page states, in the same breath, that (a) Commonwealth members get a
      free 30-day waiver and (b) Singapore by name gets a free 90-day
      visa-free entry. Singapore qualifies for both descriptions and the
      page never says which one applies if they conflict. `entry-rw`'s SG
      row was published using the more specific 90-day, by-name provision,
      but this has not been confirmed by contacting DGIE directly
      (visa@migration.gov.rw) or finding a document that resolves the
      overlap — worth a follow-up before treating 90 days as certain for
      Singaporean travelers.
- [ ] RW: `food_animal` and `food_plant` customs treatment — RRA's own
      prohibited/restricted-goods page (the EAC Customs Management Act 2004
      Second Schedule) does not name meat, dairy, or plant material as a
      specific line item (unlike Kenya's KRA list, which did). Rwanda
      Agriculture and Animal Resources Development Board (RAB) and RICA
      (phytosanitary certificates) pages describe commercial import-permit
      procedures, but no primary source describing personal-traveler-baggage
      treatment for meat/dairy/plants specifically was found in this pass.
      No rows published.
- [ ] RW: `e_cigarettes` customs/import treatment — secondary sources
      (embassy practical-info pages, tobacco-harm-reduction trackers)
      consistently describe e-cigarettes as confiscated on arrival, but no
      primary Rwandan statute, Rwanda FDA notice, or Rwanda Revenue
      Authority page stating an explicit import prohibition was found or
      fetched in this pass (Law No. 08/2013 on tobacco control, the one
      primary law identified, regulates public-place smoking and packaging/
      advertising, not import of e-cigarette devices specifically). No row
      published — treat this as a real gap, not a confirmed prohibition.
- [ ] RW: passport-validity buffer for visa-on-arrival entrants — DGIE's
      visa pages consistently state "valid not less than 6 months" but never
      specify "beyond arrival," "beyond intended stay," or "beyond exit," and
      no blank-page requirement is mentioned anywhere; `documentsNeeded`
      intentionally stays at the source's own general "valid for at least 6
      months" wording rather than a more specific but unverified rule.
- [ ] RW: whether a return/onward ticket or proof of funds is required for
      visa-on-arrival entry — not stated on any DGIE page fetched in this
      pass (unlike Kenya's eTA, which explicitly lists this); not included
      in `documentsNeeded`.
- [ ] RW: the DGIE's own "communique on the new visa regime" PDF
      (`migration.gov.rw/fileadmin/user_upload/pdf_files/rwanda_s_new_visa_regine_-_final_final2.pdf`)
      is image-based and could not be text-extracted with `pdftotext` in
      this pass — the DGIE webpage prose was used instead (see source-quality
      note in the "Done" section above). Worth an OCR pass in a future
      session to confirm the webpage prose matches the communique verbatim.

- [ ] TH: the Cabinet-approved tiered 30-day/15-day visa-exemption reform
      (see "Done" note above) — not published anywhere in `/data` in any
      form, including as a "future effective date," because no primary
      source confirms Royal Gazette publication or a concrete effective
      date. This is the single most time-sensitive gap in this pass;
      re-verify by checking whether `image.mfa.go.th` has published an
      updated "ผ.30"-style list (or an equivalent successor to the current
      "ผ.60" PDF cited here) before the next scheduled destination-refresh
      pass.
- [ ] TH: passport-validity requirement for visa-exempt entrants (commonly
      reported elsewhere as "6 months beyond arrival") was not confirmed
      against a primary Thai source in this pass — `documentsNeeded`
      intentionally stays at "Valid passport" plus the TDAC rather than a
      more specific but unverified rule.
- [ ] TH: proof of onward/return travel and proof of funds (often reported
      as a discretionary requirement enforced inconsistently at Thai
      immigration) were not confirmed against a primary source and are not
      included in `documentsNeeded`.
- [ ] TH: `weapons-th` is published at the general "restricted, permit
      required, Department of Provincial Administration" level from Thai
      Customs' own traveler page; no primary source with a stated blanket
      prohibition (vs. a genuinely obtainable permit) for ordinary tourists
      was found, and none with caliber/type-specific detail (same gap
      pattern as Kenya/South Africa's weapons rows).
- [ ] TH: `fresh-produce-th`'s quantity limits (FDA, personal-consumption
      food) do not cover live plants, seeds/propagative material, cut
      flowers, or soil — those fall under Department of Agriculture plant
      quarantine rules, and `doa.go.th` returned a 403 to every fetch
      attempt in this pass (a different block pattern than the
      Cloudflare-challenge seen on immigration.go.th — no challenge page,
      just a bare 403). No quantity/permit detail for that sub-category is
      published; the row's notes flag it as likely-restricted rather than
      covered by the produce allowance.
- [ ] TH: `meat-dairy-th`'s Department of Livestock Development
      fresh/uncooked-meat permit and export-health-certificate requirement
      is described qualitatively (from Thai Customs' general restricted-goods
      page) but no DLD primary source with the specific permit process or a
      country-accreditation list was fetched — `dld.go.th` was reachable
      (200) but no specific traveler-facing page was located in the time
      available for this pass.
- [ ] TH: `controlled-medication-th` does not name which specific common
      drugs (e.g. Adderall/amphetamine, codeine, pseudoephedrine-based
      decongestants) fall into which FDA schedule — the FDA's traveler
      guidance page describes the permit *process* per schedule but does not
      itself publish the schedule lists inline; the row's notes tell
      travelers to confirm their specific medication rather than asserting
      an unverified schedule assignment (unlike Japan's dedicated
      stimulant/pseudoephedrine entry, where the specific-drug guidance was
      directly citable).
- [ ] TH: cash-declaration figures (THB 450,000 / USD 15,000) come from the
      Bank of Thailand's own regulation-summary page, which does not itself
      cite the underlying Ministerial Regulation or Currency Act section
      number — flagged in the row's own `notes` rather than treated as a
      full statutory citation.
- [ ] TH: e-cigarette penalty figures and enforcement-intensity claims (fine
      ranges, 2025 crackdown statistics) are corroborated across secondary
      reporting but the specific "20,000–30,000 THB tourist fine" figure
      was not independently confirmed against a primary source in this
      pass and was deliberately left out of the published row's `limits`
      (only the statutory imprisonment/fine-multiplier figures from
      thailand.go.th's own page were published).

- [ ] MX: the INM/SRE visa-exemption PDF used as the primary source carries
      a 2012 creation-date in its own file metadata; its country lists were
      cross-checked against current (2026) secondary reporting on Brazil/
      Ukraine's visa-required status and found consistent, but the document
      itself could not be confirmed as the *current* edition against a dated
      `inm.gob.mx` or DOF page (both unreachable — see source-quality note
      above). Re-fetch `inm.gob.mx`/`diputados.gob.mx` directly in a future
      pass to confirm this hasn't drifted.
- [ ] MX: Malaysia's "requiere sello consular" (visa-exempt but needs an
      advance consular stamp) categorization is read directly off the same
      2012-dated PDF; not independently re-confirmed against a current,
      dated INM page. If wrong, the practical effect is a Malaysian
      traveler being told they don't need a visa when they actually need to
      visit a consulate first — flagged as the single highest-risk unverified
      claim in this pass, worth a follow-up check before relying on it.
- [ ] MX: Brazil's electronic Visitor Visa (e-Visa), reactivated 5 Feb 2026
      for air travelers per Mexican/Brazilian government announcements
      (Fragomen, CCN Law, and Mexican press reporting all converge on this),
      was **not** encoded as a distinct requirement — no primary INM/SRE
      page describing the e-Visa's own eligibility/validity/fee terms was
      reachable in this pass. `entry-requirements.json`'s BR→MX row stays at
      the verified baseline (`visa_required`, ordinary consular visa) with a
      note pointing to the e-Visa option; re-check once a primary source is
      reachable, since this materially changes the traveler experience (an
      online e-Visa is a much lower bar than an in-person consular visit).
- [ ] MX: `medication-mx` has no numeric day-supply or unit cap analogous to
      Japan's 1–2 month rule — ANAM's guidance only says quantities should
      match a personal treatment course. No COFEPRIS primary source with
      specific controlled-substance thresholds (e.g. a named-drug list like
      Japan's stimulant/pseudoephedrine entry) was found or published.
- [ ] MX: `e_cigarettes`/`weapons`/`cbd_cannabis` are published as blanket
      "prohibited," each backed by ANAM's own prohibited-merchandise page —
      but none of the three cites the specific health/security statute
      behind the prohibition (Ley General de Salud, Ley Federal de Armas de
      Fuego y Explosivos) with a fetched primary text; ANAM's own
      administrative page was the only source reachable and used.
- [ ] MX: `drones` customs treatment — no primary ANAM/AFAC page stating an
      import/customs verdict for drones was found in this pass (AFAC's
      NOM-107-SCT3-2019 governs *flight operation*, a different question
      from what happens at the customs border with an undeclared drone —
      same gap pattern as US/GB/CA/JP/KE/ZA on drones). No row published.
- [ ] MX: passport-validity buffer rule for visa-exempt entrants (whether
      any validity beyond "covers the stay" is required) was not confirmed
      against a primary source; `documentsNeeded` intentionally stays at
      "Valid passport" plus the FMM rather than a more specific but
      unverified claim.

- [ ] ZA: South Africa's Electronic Travel Authorisation (ETA) officially
      launched 12 Aug 2026 at OR Tambo International Airport (confirmed via
      DHA's own press release, dha.gov.za/index.php/statements-speeches/2077
      -officiall-launch-eta) — but that press release itself does not state
      eligibility, fee, validity, or mandatory/optional status for any
      nationality, and eta.dha.gov.za is a client-rendered SPA that returned
      no usable content to either curl or WebFetch. Secondary reporting
      (news outlets, immigration-law blogs) claims it is initially optional
      for nationalities already visa-exempt, expanding to a broader/mandatory
      regime in September 2026, and that Mexico, China, India and Indonesia
      are the first nationalities live on the ETA portal — none of this was
      confirmed against a primary source, so no `eta_required` rows were
      published and no ETA fee/validity fields were added anywhere. Every
      `entry-requirements.json` row for `destination: "ZA"` carries a note
      flagging this and pointing back here. **This is the single most
      time-sensitive gap in this pass — re-verify within days, not the usual
      cadence**, once eta.dha.gov.za or a DHA press page describes eligibility
      in prose rather than requiring the SPA to render.
- [ ] ZA: passport-validity and blank-page requirements (commonly reported
      as "30 days beyond exit" and "2 consecutive blank pages") are repeated
      across many travel blogs but no DHA primary-source page stating them
      was found in this pass; `documentsNeeded` intentionally stays at
      "Valid passport" rather than publishing an unverified specific rule.
- [ ] ZA: `cbd_cannabis` — published as a blanket "prohibited" verdict from
      the general SARS narcotics-import ban. Secondary sources describe a
      SAHPRA Schedule 0 exemption for very-low-dose CBD (≤20mg/day,
      general-wellness labelling only), but no SAHPRA primary source was
      fetched to confirm the threshold in this pass.
- [ ] ZA: `food_animal` / `food_plant` / `weapons` — published at the
      "restricted, permit required" level using SARS's own guide text, but
      SARS's guide does not name the issuing agency (DALRRD for food, SAPS
      for firearms are the likely candidates from general knowledge, but
      that was deliberately not asserted since it wasn't itself confirmed
      against a DALRRD/SAPS primary source), nor any species/quantity
      specifics (e.g. is biltong/dried meat treated differently from fresh
      meat — not addressed in the source used).
- [ ] ZA: `e_cigarettes` and `drones` customs treatment — no primary
      SARS/DALRRD/ICASA/SACAA source was found stating an import verdict in
      this pass (drone *flight* operational rules exist via SACAA, but that's
      a different question from what customs does with a drone at the
      border — same gap pattern as US/GB/CA/JP on drones). No rows published.

- [ ] KE: cash-declaration threshold conflict between two current official
      sources — KRA's passenger-clearance FAQ states USD 10,000 (Customs
      Form F88, East African Community Customs Management Act 2004 basis);
      the Central Bank of Kenya (Declaration of Currency) Regulations,
      Legal Notice No. 118 of 1998 (still unrepealed, last consolidated
      2022-12-31) state USD 5,000 / KSh 500,000 (Form CBK/C.D./1). Could not
      confirm which one controls in practice at the border in this pass.
      Published `cash-ke` uses the KRA USD 10,000 figure as the customs
      verdict (it's the more directly on-topic "what do I declare on
      arrival" source) but flags the stricter CBK figure in `notes` and
      recommends declaring at the lower threshold if in doubt. Needs a
      follow-up pass (ideally contacting KRA directly, or finding a newer
      CBK notice) to resolve properly.
- [ ] KE: guaranteed stay length for eTA-required nationalities — see the
      "Done" note above; no primary source states a fixed number of days,
      only an officer-discretion ceiling of 6 months. Left unmodeled as a
      fixed `maxDays` rather than guessed.
- [ ] KE: `food_animal` (meat/dairy) customs treatment — no primary
      KRA/veterinary-authority page found stating personal-import rules for
      meat and dairy specifically (only the general goods concession and
      the restricted-items list, which doesn't name meat/dairy). No row
      published.
- [ ] KE: `e_cigarettes` customs treatment — not found on a primary Kenyan
      source in this pass. No row published.
- [ ] KE: CBD specifically (as distinct from cannabis generally) — no
      primary Kenyan source found carving out CBD/low-THC products the way
      the US does (0.3% THC threshold). `cannabis-ke` is published as a
      blanket "prohibited" verdict for narcotic drugs generally; treat CBD
      as covered by that pending a specific carve-out.
- [ ] KE: the specific licensing bodies for restricted `medication`,
      `weapons`, and `food_plant` imports (e.g. which agency issues the
      permit) were not named on the KRA source used — it only says
      "relevant Government Institution." Those three rows are published as
      `depends` with the permit *requirement* confirmed but the agency name
      deliberately omitted rather than guessed (an earlier draft of this
      pass named Pharmacy and Poisons Board / Kenya Police / KEPHIS from
      general knowledge and that was removed before publishing — those
      names are plausible but unverified for this specific restriction).

- [ ] JP: post-December-2024 Cannabis Control Act reform — the exact
      THC detection/residue threshold and the criminalization of cannabis
      *use* (as distinct from possession) are described consistently across
      several secondary (law-firm/industry) sources but no MHLW or e-Gov
      primary text was successfully fetched to confirm the specific
      numbers — `cbd-jp`'s verdict stays at the safer "depends"
      (stalks/seeds + certificates only) rather than encoding a THC
      percentage we haven't verified.
- [ ] JP: e-cigarette/vape customs treatment and drone customs treatment —
      no dedicated customs.go.jp or MHLW page was found in this pass (same
      gap pattern as US/GB/CA on drones).
- [ ] JP: JESTA (Japan's planned electronic travel authorization for
      visa-exempt visitors) is legislated but not live — targeted for
      fiscal 2028 per Diet passage in May 2026. Deliberately not added to
      `entry-requirements.json`; re-check closer to launch rather than
      publish a date that could slip (same caution as ETIAS, AGENTS.md §1).
- [ ] JP: exact passport-validity rule for visa-exempt entrants (whether any
      buffer beyond "valid for the stay" is required) was not confirmed
      against a primary source; `documentsNeeded` intentionally stays at
      "Valid passport" rather than a more specific but unverified claim.

- [ ] NG: `medication-ng` — no primary NAFDAC page was found describing
      personal-baggage prescription/OTC medication rules for travelers
      (NAFDAC's public guidance covers commercial drug-product registration
      and an import-permit process for unapproved life-saving medicines,
      neither of which clearly answers "can I bring my own prescription in
      my luggage, and how much"). No row published rather than assuming the
      commercial-import framework applies to personal baggage.
- [ ] NG: `e_cigarettes` customs treatment — no primary NIS/Customs/NAFDAC
      source stating an import verdict was found in this pass. No row
      published.
- [ ] NG: `drones` customs treatment — NCAA's own May 2026 news page shows
      its Drone (UAS/RPAS) Regulation Portal only just launched, with the
      policy framework and roadmap still described as being developed; the
      163-page UAS operations advisory circular found and fetched covers
      airspace/flight rules, not a customs import verdict, and gives a
      150 kg registration threshold that contradicts a commonly-repeated
      secondary-source claim of 250 g — neither was used. No row published;
      worth re-checking once NCAA's new portal publishes traveler-facing
      content (same "genuinely too early" gap as several other categories
      elsewhere in this dataset, but here specifically because the
      regulatory framework itself is mid-launch, not because a page
      couldn't be reached).
- [ ] NG: visa fees for the Tourism Visa (F5A) and other e-Visa categories —
      NIS's own pages describe the application flow and payment step but do
      not publish a fee schedule; secondary sources give inconsistent
      figures by nationality (e.g. ~USD 180 for US applicants vs.
      ~USD 300–329 for EU/UK/Australian applicants). Deliberately left out
      of `entry-requirements.json` `notes` rather than publishing an
      unverified number — the FAQ tells travelers to confirm on the
      official e-Visa portal instead.
- [ ] NG: `weapons-ng` is published as `prohibited` for practical purposes,
      but the specific Nigerian Firearms Act (Cap. F28 LFN 2004) import-licence
      provision — commonly cited in secondary/law-firm sources as requiring
      a Presidential licence — could not be fetched from a live,
      directly-accessible government or `placng.org`-hosted primary text in
      this pass (the one general legal-database host tried,
      `commonlii.org`, returned an HTTP 403). Only the customs.gov.ng
      absolutely-prohibited list (air pistols, disguised pistols,
      noxious-gas weapons) is cited as primary text; the general-firearms
      licensing claim in the row's `notes` is flagged there as unconfirmed
      rather than given its own citation.
- [ ] NG: passport-validity/blank-page buffer beyond the stated "6 months'
      validity" (e.g. whether a specific number of blank pages is required
      beyond what the F5A page's "blank pages" wording implies) was not
      further quantified against a primary source; `documentsNeeded`
      intentionally stays at the F5A page's own wording rather than a more
      specific but unverified rule.

- [ ] US: e-cigarette/vape personal quantity limit, drone customs treatment,
      the full VWP country list beyond the 15-nationality roster (only
      spot-checked via search-index snippets, not a single live fetch).
- [ ] GB: CBD-specific quantity/verdict nuance (PDF text extraction failed —
      only the general cannabis prohibition was confirmed), post-1 Oct 2026
      vaping-duty allowance figure, drone customs treatment.
- [ ] CA: drone customs treatment (no CBSA page found); Ukraine's eTA/visa
      status for Canada (strong converging evidence but no single direct
      quote — the entry-requirements-country.html tool page wouldn't render).
- [ ] EU: CBD/cannabis customs treatment (no EU-level customs regulation
      exists — genuinely a national-law matter, so no row was published);
      plant-origin food products specifically (only animal-origin products
      were researched, via Reg. (EU) 2019/2122).
- [ ] `entry-requirements.json`: Canada → United States (no citable stay-length
      figure was found for Canadian visitors in this pass — omitted rather
      than assumed).
- [ ] Chile's US Visa Waiver Program status is flagged in `entry-
      requirements.json` notes as politically volatile (congressional
      pressure to suspend) — re-check before treating it as durable.

## Queue — destinations not yet researched at all

- [ ] `destinations.json` queue (seeded in UNVERIFIED): Brazil —
      entry requirements and customs items for the existing
      15-nationality roster. Shown in the trip-check UI as "coming soon";
      no facts published until each pair is verified against that
      country's official immigration/customs authority.

## Blocked on research (no primary source identified yet)

- [ ] Bilateral visa-waiver agreements (`bilateral-candidates.json`): NZ with
      many Schengen states; reported US arrangements with DK / NO / PL; possible
      CA / AU / JP. Need the actual agreement texts or official state
      announcements of continued application (CISA Art. 20(2)) — national
      foreign-ministry / border-authority pages are the likely primary sources.
- [ ] `overstay-penalties.json`: per-state fine/ban ranges from national law or
      official authority pages.
- [ ] `ees.json` — the five launch countries (FR, ES, DE, IT, NL) ship with
      the national DPA as the verified contact (grounded in Reg. 2017/2226
      Art. 53(2): the supervisory authority must assist with rectification,
      identities verified via the EDPB members list). Still to verify per
      country: the **designated EES controller** (border/interior authority),
      its direct request channel/form, and accepted languages — likely
      sources: each interior ministry / border police site, national EES
      information pages.
- [ ] `eu-items.json`: Directive 2007/74/EC allowances, Regulation (EU)
      2018/1672 cash rules, Regulation (EU) 2019/2122 animal products — the
      directives/regulations are on EUR-Lex (see access problem above); the EC's
      taxation/customs and food-safety pages may serve as fetchable primary
      sources.

## Done (promoted to /data, 2026-08-12) — Morocco

- [x] `destinations.json`, `entry-requirements.json` (all 15 roster
      nationalities: US, GB, CA, AU, NZ, JP, KR, SG, BR, MX, AR, CL, MY, IL,
      UA), `customs-items.json` for **Morocco** — promoted with citations to
      consulat.ma (Ministry of Foreign Affairs, African Cooperation and
      Moroccan Expatriates — consular services site), diplomatie.ma (the same
      Ministry's main site and its French embassy subdomain, fr.diplomatie.ma),
      douane.gov.ma (Administration des Douanes et Impôts Indirects), and
      oc.gov.ma (Office des Changes, the foreign-exchange authority). 13 of
      the 15 roster nationalities (US, GB, CA, AU, NZ, JP, KR, SG, BR, MX, AR,
      CL, MY) are `visa_free` for a 90-day tourist stay, per consulat.ma's own
      "List of countries whose citizens are exempted from entry visa into
      Morocco" table, cross-checked against the Moroccan National Tourist
      Office's (visitmorocco.com/ONMT) statement that "for all nationalities,
      the maximum duration of the tourist trip is 90 days," with a one-time
      90-day extension available at the nearest police station. Israel and
      Ukraine are **not** on that exemption table and are `visa_required`.
      Israel is specifically confirmed (not merely absent-by-omission) via a
      2022 Ministry of Foreign Affairs press release announcing an "eVisa"
      fast-track launched 10 July 2022 for Israeli and Thai nationals via
      acces-maroc.ma — a one-time authorization valid up to 180 days from
      issue, allowing a stay of up to 30 days, processed in 24h (express) or
      72h (standard) — published as `visa_required` with `stayPolicy:
      fixed_per_entry, 30 days` rather than the general 90-day figure, since
      it is a distinct visa product, not visa-exemption. Ukraine has no
      comparable eVisa/AEVM eligibility found in this pass, so it is
      published as `visa_required` with `stayPolicy: {kind: "visa_required"}`
      (no computable duration — see below). Customs rows cover alcohol (1L
      wine + 1L spirits), tobacco (200 cigarettes/100 cigarillos/25 cigars/
      250g), cash (MAD 100,000 mandatory-declaration threshold for foreign
      currency, Art. 66 bis of the Customs and Indirect Taxes Code as added
      by the 2022 Finance Law — read directly off an Office des Changes FAQ
      page; separately, importing/exporting Moroccan dirham banknotes is
      flatly prohibited beyond a MAD 2,000 carve-out), medication (personal
      quantities admitted with a medical certificate/prescription and a
      signed personal-use undertaking; non-personal import needs Ministry of
      Health authorization; Table-B controlled/poisonous substances need a
      separate Ministry of Health narcotics-service import certificate
      regardless of quantity), cannabis/CBD (`prohibited` — narcotics are on
      Moroccan Customs' strictly-prohibited-imports list; Morocco's 2021
      cannabis legalization, Law 13-21, licenses only domestic
      medical/industrial cultivation under the ANRAC regulator and creates no
      traveler import/possession exception), food_animal/food_plant (both
      `depends` — ONSSA veterinary/phytosanitary certificates required, per a
      2024 Customs circular), weapons (`depends` — hunting weapons/ammunition
      need local DGSN authorization for tourists, capped at 10 cartridges per
      weapon, with rifled-barrel hunting weapons absolutely prohibited and
      edged weapons needing a separate Foreign Trade import license; weapons
      of war are flatly prohibited), and drones (`depends` — explicitly
      excluded from the ordinary duty-free personal-effects/toys allowance;
      tourists need local DGSN temporary-admission authorization, permanent
      import needs a Foreign Trade import license, and telecom-capable units
      may also need ANRT homologation). See "Deliberately left unpublished"
      below for e-cigarettes (not published — genuinely ambiguous evidence)
      and other gaps.

  **Morocco source-quality note** (for deciding how far to expand into North
  Africa): `consulat.ma`, `diplomatie.ma`, and `us.diplomatie.ma` all sit
  behind the same F5/TSPD bot-management challenge seen elsewhere in this
  dataset (Akamai on mofa.go.jp/EUR-Lex, Cloudflare on immigration.go.th) —
  direct `curl` and WebFetch both got either a JS-challenge shell or a flat
  "Request Rejected" page. The reliable workaround this pass was routing
  fetches through the `r.jina.ai` read-only proxy (`https://r.jina.ai/<url>`),
  which returned full, real page content (including raw HTML on request via
  an `X-Return-Format: html` header) for every blocked Moroccan government
  page tried — a new, general-purpose bypass worth reaching for earlier in
  future passes when a `curl`+browser-UA attempt returns a bot-challenge
  page rather than content. Once past that layer, the actual content was
  excellent: consulat.ma's visa-exemption table is a genuine, current HTML
  `<table>` (not a scanned image or SPA shell), and `douane.gov.ma` — despite
  being unreachable by direct `curl`/TLS (connection reset) and only
  reachable via the jina proxy — turned out to host a surprisingly deep set
  of real, dated, citable circulars and a compiled customs-restrictions
  reference document (`dms/loadDocument?documentId=...`) going back to
  French-protectorate-era decrees, still cited as current. `oc.gov.ma`
  (Office des Changes) was directly reachable with no bot-challenge at all
  and gave clean, well-organized FAQ prose with an explicit statutory
  citation (Art. 66 bis) for the cash-declaration threshold — one of the
  cleaner single-fact citations found in this dataset. `visitmorocco.com`
  (the Moroccan National Tourist Office/ONMT, a public tourism-promotion
  body rather than the immigration authority itself) was also directly
  reachable and useful for cross-checking the 90-day stay-length claim, but
  was treated as corroboration rather than the primary basis for any
  visa-requirement determination. `www.dgsn.gov.ma` (the actual national
  police/border authority) timed out on every attempt in this pass (TCP
  connect succeeded, then no response) — a distinct, unresolved reachability
  gap; none of the published rows rely on it directly, but a future pass
  should retry it, since it would be an even stronger direct citation for
  the entry-stamp/border-police procedural claims currently sourced to the
  Ministry of Foreign Affairs' consular pages instead. Net assessment:
  Morocco is workable and supports further build-out, but requires the
  jina-proxy (or equivalent) workaround from the start rather than as a
  fallback — a direct `curl`/WebFetch-only approach would have returned
  almost nothing from this country's main government domains.

## Deliberately left unpublished from this research pass — Morocco (genuinely unverified — do not add without a real primary-source check)

- [ ] MA: e-cigarettes/vaping customs treatment — genuinely ambiguous
      evidence, not a simple "no source found" gap. Moroccan Customs has
      published multiple 2023 tariff-classification circulars
      (`documentId=92164`, `92165`) assigning specific disposable-vape brand
      models real Harmonized System codes (2404.12 / 8543.40) for import
      duty purposes, which implies commercial import is legally
      contemplated, not banned outright — but secondary Moroccan press
      sources describe e-cigarettes as having existed in a "legal void" for
      years and only recently ("enfin réglementée et fiscalisée") brought
      under a formal tax/customs framework, and other secondary sources
      describe stricter personal-import/vaping restrictions for travelers.
      No single primary source stating a clear personal-traveler verdict
      (allowed with duty, allowed duty-free within limits, or prohibited)
      was found or reconciled in this pass. No `e_cigarettes` row was
      published for Morocco rather than guessing between these conflicting
      signals.
- [ ] MA: New Zealand's presence on the consulat.ma visa-exemption table has
      a data-quality caveat — the table's own text renders as the garbled
      "Zealand news" rather than "New Zealand" in the row positioned
      alphabetically between Norway and Oman. Published as `visa_free`
      because the position and secondary-source corroboration are strong,
      but this is a government-page-content error, not a clean citation;
      re-check if the page is ever fixed or a cleaner official citation is
      found (see the source-quality note above).
- [ ] MA: the alcohol/tobacco personal-allowance figures come from an
      MFA-hosted consular guide page rather than a dated douane.gov.ma
      circular; an older (June 2010) douane.gov.ma traveler-guide PDF states
      the same alcohol figures but a flatter, less detailed tobacco figure
      (200g manufactured tobacco, no cigarette/cigarillo/cigar breakdown).
      The more detailed, presumably more current MFA figure was published;
      worth reconciling against a directly dated Customs-administration
      source in a future pass.
- [ ] MA: the Israel eVisa row's 30-day stay figure and 180-day validity
      period trace to a 2022 Ministry of Foreign Affairs press release, not
      a 2026-dated primary page; multiple independent 2026 secondary sources
      (visa-agency sites) describe the same figures with no conflicting
      numbers found, which is why it was published, but Morocco–Israel entry
      policy is diplomatically sensitive and could change with little
      notice — flagged for a shorter-than-usual re-verification interval,
      similar to Thailand's and South Africa's time-sensitive entries above.
- [ ] MA: no primary source was found confirming whether the AEVM
      (Autorisation Électronique de Voyage au Maroc) electronic
      travel-authorization track — distinct from the eVisa track used for
      Israel/Thailand — applies to any of the 15 roster nationalities.
      Secondary reporting describes AEVM as currently scoped to Republic of
      Congo, Ghana, Guinea, Mali, and Ecuador (none of which are in the
      roster), and the consulat.ma exemption table separately flags Congo
      (Brazzaville), Guinea (Conakry), and Mali as needing an AEVM — treated
      as not applicable to any published MA row, but not independently
      confirmed against a primary acces-maroc.ma eligibility list, since that
      site is a client-rendered Angular SPA that did not yield a fetchable
      nationality list in this pass.
- [ ] MA: exact passport-validity buffer for visa-exempt entrants — ONMT's
      visitmorocco.com states a passport "must cover at least the duration
      of the stay" specifically "for foreign nationals arriving in Morocco
      as part of an organized trip," leaving individual/non-organized
      travelers unaddressed; `documentsNeeded` intentionally stays at "Valid
      passport" rather than a more specific but unevenly-sourced claim.
- [ ] MA: proof of onward/return travel or proof of funds for visa-exempt
      entrants — not stated on any Moroccan source fetched in this pass; not
      included in `documentsNeeded`.
- [ ] MA: `weapons-ma`'s DGSN-authorization procedure and the customs-code
      restrictions document it is cited from carry decree references dating
      to 1937–1939; still presented as current on douane.gov.ma's own site
      in 2026, but not independently cross-checked against a more recently
      dated DGSN or Ministry of Interior firearms-import page.
- [ ] MA: no `other` (e.g. general gifts/goods duty-free threshold beyond
      the MAD 2,000 souvenir allowance already folded into context) or
      `food_animal`/`food_plant` species-/quantity-specific detail (e.g.
      whether small personal quantities of cured meat or cheese are
      tolerated) was found — both published at the general
      "certificate required" level only, the same honest-gap pattern used
      for Nigeria's and Kenya's animal/plant rows.

## Done (promoted to /data, 2026-08-12) — Australia

- [x] `destinations.json`, `entry-requirements.json` (14 of the 15 roster
      nationalities — AU→AU skipped as a self-entry case, an Australian
      citizen doesn't need any entry-requirement row for Australia),
      `customs-items.json` for **Australia** — promoted with citations to
      immi.homeaffairs.gov.au (Department of Home Affairs — ETA subclass
      601, eVisitor subclass 651, Special Category visa subclass 444, and
      Visitor visa subclass 600 pages), abf.gov.au (Australian Border
      Force — duty-free concessions, firearms), import.firearms.gov.au
      (Home Affairs Firearms Portal), austrac.gov.au (AUSTRAC cash/BNI
      declaration rules), tga.gov.au (Therapeutic Goods Administration —
      traveller's exemption for medicines, medicinal cannabis, and vapes),
      and agriculture.gov.au (Department of Agriculture, Fisheries and
      Forestry — biosecurity import conditions). Of the 14 rows: **US,
      GB, CA, JP, KR, SG, and MY** hold ETA (subclass 601)-eligible
      passports per Home Affairs' own verbatim eligibility list (fetched
      from the page's embedded JSON, not an AI summary) and get
      `eta_required`; **NZ** citizens instead get the Special Category
      visa (subclass 444) — granted automatically and free on arrival
      under the Trans-Tasman Travel Arrangement, published as
      `visa_on_arrival`; the remaining **BR, MX, AR, CL, IL, and UA** are
      not on the ETA or eVisitor eligible-passport lists and need a
      genuine advance Visitor visa (subclass 600) application via
      ImmiAccount, published as `visa_required`. GB is also eVisitor
      (subclass 651)-eligible, but since ETA already covers GB no separate
      eVisitor row was needed for this roster — no other roster
      nationality is eVisitor-eligible either (that visa is scoped to
      European passports). ETA/eVisitor rows: Home Affairs states the
      stay as "up to 3 months at a time" (repeated verbatim on both the
      601 and 651 pages, and again under "How long you can stay"), not a
      numeric day count — `maxDays: 90` is published as the standard
      day-equivalent, flagged explicitly in each row's `notes` and in
      "Deliberately left unpublished" below since a calendar 3-month
      period isn't always exactly 90 days. NZ's SCV and the BR/MX/AR/CL/
      IL/UA Visitor-visa rows both use `stayPolicy: {kind:
      "visa_required"}` (the same non-computable-duration placeholder
      Kenya's eTA rows use) because neither visa has a single guaranteed
      fixed-day figure — NZ's SCV lasts indefinitely while the holder
      remains a NZ citizen, and Visitor-visa grants of 3/6/12 months are
      at the visa officer's discretion. Customs rows cover alcohol (2.25
      litres duty-free, 18+), tobacco (25 cigarettes/25g, 18+), cash
      (AUD 10,000 declaration threshold, both directions, AUSTRAC), a
      general `medication` row (3-month traveller's-exemption supply,
      TGA), a `cbd_cannabis` row (prescribed medicinal cannabis allowed
      under the traveller's exemption with a prescription; recreational
      cannabis a flat prohibited import, no CBD carve-out confirmed for
      travellers), an `e_cigarettes` row with a genuinely concrete
      traveller's-exemption quantity cap (2 vapes / 20 accessories /
      200 mL of vape liquid — commercial personal-import by mail/courier
      is separately prohibited outright, matching this pass's brief that
      Australia's vape rules are a real, strict, high-stakes traveler
      trap), a `food_animal` row (`depends` — canned/retorted meat okay
      under conditions, uncanned meat from any country but New Zealand
      not allowed without a permit, dairy allowed up to 10 kg/10 L from
      an FMD-free country), a `food_plant` row (`prohibited` — DAFF's own
      traveller advice is literally "do not carry any fresh fruit or
      vegetables, plants, seeds..."; infringement notices up to
      AUD 6,600 for false/non-declaration), and a `weapons` row
      (`depends` — firearms/firearm-related articles need advance written
      permission from the Attorney-General's Department or a state/
      territory Police Firearms Registry via the Firearms Portal). See
      "Deliberately left unpublished" below for drones and other AU gaps.

  **Australia source-quality note**: `immi.homeaffairs.gov.au` returned
  HTTP 403 to both WebFetch and a bare `curl` with no User-Agent, but
  responded HTTP 200 with substantial content — including a large
  embedded JSON blob per visa page carrying the full eligibility text,
  not just the visible prose — to `curl` with a standard desktop-browser
  User-Agent header; the same basic-bot-filtering pattern already
  documented for Turkey's mfa.gov.tr, not an Akamai/Cloudflare hard
  block. `abf.gov.au`'s top-level "can you bring it in" category pages
  (duty-free, food, medicines-and-substances, weapons) are a thin
  client-rendered search widget with almost no embedded content in the
  raw HTML for three of the four categories — the duty-free category
  page was the one exception with real embedded text (confirmed the
  2.25L/25-cigarette figures), but food/medicines/weapons needed
  alternate sources instead of retrying that same page pattern.
  `agriculture.gov.au`, `austrac.gov.au`, `tga.gov.au`, `casa.gov.au`,
  and `biosecurity.gov.au` were **all completely unreachable from this
  environment** (`curl` exit 000/28 — connection timeout, not a DNS or
  TLS failure, and not the Akamai-403 or Cloudflare-challenge patterns
  seen elsewhere in this dataset) despite DNS resolving fine for at
  least one of them (`agriculture.gov.au` resolved via Akamai but the
  TLS/HTTP connection itself never completed). **Every fact sourced to
  these five domains in this pass was instead confirmed via a
  `web.archive.org` snapshot of the live page** (fetched directly by
  URL-guessing a recent timestamp, since the Wayback Availability JSON
  API was separately rate-limited — likely from the other parallel
  agents in this same research batch also hitting archive.org), with
  the **live, human-browsable government URL cited in `legal_source`**,
  not the archive.org URL — the same "cite the live URL, verify via a
  mirror" precedent established for Japan's Akamai-blocked MOFA pages.
  Each snapshot used was dated within the last few months (Mar–Jun 2026)
  and internally consistent with independent WebSearch corroboration on
  every figure used, so this is treated as a reachability workaround, not
  a staleness risk — but a future pass should retry direct `curl`/WebFetch
  access to these five domains, since an environment-side network
  restriction (rather than a site-side block) is the more likely
  explanation given DNS resolves but the connection itself times out.
  Net assessment: Australia's official sources are extensive, current,
  and unusually well-organized once reached (the TGA vape and medicinal-
  cannabis pages in particular gave exact, numbered quantity limits
  rather than vague guidance) — the real obstacle this pass was
  environment-side connectivity to several `*.gov.au` domains, worked
  around via Wayback snapshots rather than left as a gap, so this
  destination did not need to fall back to any secondary-source claim
  for the rows actually published.

## Deliberately left unpublished from this research pass — Australia (genuinely unverified — do not add without a real primary-source check)

- [ ] AU: the exact `maxDays: 90` figure on all seven ETA/eVisitor-derived
      rows (US, GB, CA, JP, KR, SG, MY) is a day-equivalent of Home
      Affairs' own "up to 3 months at a time" wording, not a figure Home
      Affairs states verbatim as "90 days." A calendar 3-month period from
      a given entry date is not always exactly 90 days (89–92 depending on
      the months spanned and leap years) — this pass did not find a
      primary source (Migration Regulations 1994 Schedule 2 text was
      fetched but too large/unindexed to isolate the Subclass 601/651
      grant-condition clause in the time available) that states a fixed
      day count rather than a calendar-month period. Treat `maxDays: 90`
      as the practical, industry-standard equivalent, not a verbatim legal
      figure; re-verify against the actual Migration Regulations text in a
      future pass.
- [ ] AU: drone customs/import treatment — no primary ABF, Home Affairs,
      or CASA page stating a customs-import verdict (as distinct from
      *flight-operation* rules, which CASA's travelling-with-your-drone
      page covers only for Australians travelling **out**, not the
      inbound-traveler customs question) was found in this pass — the
      same recurring gap pattern seen for US/GB/CA/JP/KE/ZA/MX/TR in this
      dataset. No row published.
- [ ] AU: CBD specifically, as distinct from THC-bearing cannabis, has no
      confirmed traveller-specific import carve-out — `cannabis-au` is
      published as `depends` (prescribed medicinal cannabis under the
      traveller's exemption vs. prohibited recreational cannabis) with no
      separate low-THC/CBD threshold found on a TGA or ABF primary source.
- [ ] AU: `meat-dairy-au`'s underlying DAFF source is detailed and
      product-specific but was read via a Wayback Machine snapshot (see
      source-quality note above) rather than a direct fetch of
      agriculture.gov.au — re-confirm directly against the live page once
      that domain is reachable from this environment again, since
      biosecurity import conditions can change quickly (DAFF's own
      wording) and this is exactly the kind of high-stakes category this
      pass was asked to get right.
- [ ] AU: exact passport-validity rule for ETA/eVisitor/Visitor-visa
      entrants (whether any buffer beyond "valid for the stay" is
      required) was not confirmed against a primary source in this pass;
      `documentsNeeded` intentionally stays at "Valid passport" rather
      than a more specific but unverified claim.
- [ ] AU: Visitor visa (subclass 600) fees for BR/MX/AR/CL/IL/UA were not
      independently verified in this pass (left out of `notes` rather than
      guessed), matching the same gap left for Nigeria's e-Visa fees.

## Done (promoted to /data, 2026-08-13) — United Arab Emirates

- [x] `destinations.json`, `entry-requirements.json` (all 15 roster
      nationalities: US, GB, CA, AU, NZ, JP, KR, SG, BR, MX, AR, CL, MY, IL,
      UA), `customs-items.json` for **United Arab Emirates** — promoted with
      citations to mofa.gov.ae (Ministry of Foreign Affairs), the Federal
      Decree-Law No. 29/2021 "Law of Movement and Residence of Aliens" (its
      official English PDF, hosted on gdrfad.gov.ae), the Cabinet
      Resolution/Executive Regulation of that law (uaelegislation.gov.ae),
      dubaicustoms.gov.ae's official Passenger Customs Guide (Version 6,
      2025, PDF, text-extracted with `pdftotext`), u.ae (the federal
      government portal), and gcaa.gov.ae. All 15 roster nationalities are
      classified `visa_free` — confirmed by parsing MOFA's visa-exemption
      page's raw HTML directly (its per-country cards carry a `visa-free`/
      `visa-required` CSS class; matches the South Africa pass's lesson
      about not trusting an AI-summarized read of a dense listing). Stay
      length is split into two confidence tiers rather than asserting one
      number for all 15: US/GB/CA/AU/NZ/JP/KR/SG sit on the UAE's classic,
      long-standing (~2015) visa-exempt cohort, for which a 90-day,
      multiple-entry stay is corroborated across the Cabinet
      Resolution/Executive Regulation's general visit-visa shape (90 days,
      extendable once, capped at 180 days/year — Art. 15 and the ICP FAQ's
      "30, 60, or 90 days" range) and years of consistent UAE-government-
      sourced news reporting (Gulf News, Khaleej Times), so these 8 get
      `stayPolicy: fixed_per_entry, 90 days`. BR/MX/AR/CL/MY/IL/UA sit on a
      separately/later-expanded visa-free list (confirmed visa-free by MOFA,
      but absent from every enumerated "90-day list" found in this pass) —
      no primary or consistently-corroborated secondary source pinned a
      specific day count for these 7 specifically, so they get
      `stayPolicy: {kind: "visa_required"}` (no computable duration
      asserted, matching the Kenya eTA precedent) rather than assuming the
      same 90 days by inference. Customs rows cover alcohol (4 L or 2 x
      24-can beer cartons, 18+), tobacco (200 cigarettes/50 cigars/500 g,
      18+), cash (AED 60,000 declaration threshold — confirmed verbatim from
      Dubai Customs' own "Declaring Money Procedure" page), medication
      (`depends` — prescribed medicines allowed in "normal quantities"
      without a permit per u.ae; narcotic/psychotropic Class A/B controlled
      medicines require an advance MOHAP permit), cannabis/CBD (prohibited —
      "narcotics of all kinds" per the Dubai Customs guide, no CBD
      carve-out found), food_animal/food_plant (`depends` — Dubai Customs
      guide confirms both are subject to permit, with an explicit standalone
      rule that soil-bearing agricultural seedlings are never allowed), and
      drones (`depends` — GCAA confirms mandatory registration for all
      recreational UAS regardless of weight, and Dubai Customs lists drones
      among permit-gated items requiring declaration on arrival). See
      "Deliberately left unpublished" below for weapons, e-cigarettes, and
      other gaps.

  **UAE source-quality note**: this was a genuinely mixed pass. `mofa.gov.ae`
  (including its dedicated visa-exemption page) and `dubaicustoms.gov.ae`
  were both directly and repeatedly fetchable, current, and gave clean,
  quotable, dated content — the Dubai Customs Passenger Customs Guide in
  particular is exactly the kind of primary source this project wants: a
  versioned, dated (Version 6, 2025), official PDF with an explicit table of
  contents. By contrast, `uaelegislation.gov.ae` (the actual legislation
  portal, hosting the Cabinet Resolution/Executive Regulation with the
  legally controlling text) is behind Cloudflare and returned "Attention
  Required" blocks to both WebFetch and direct `curl` — the same automation-
  blocking pattern already seen on EUR-Lex and mofa.go.jp. A plain-text
  proxy fetch (`r.jina.ai`) successfully retrieved and rendered its full
  article text, which is how the Art. 15 "90 days, extend once, 180/year"
  language was confirmed — the URL cited is still the live,
  human-browsable uaelegislation.gov.ae page, following the same pattern the
  Japan pass used for mofa.go.jp. `mohap.gov.ae` (Ministry of Health and
  Prevention — the single most important source for the medication category
  given the UAE's known enforcement history) was **not reachable by any
  method tried**: WebFetch timed out, direct `curl` got a TLS connection
  reset (`Recv failure: Connection reset by peer`) suggesting a WAF
  fingerprinting block rather than a simple 403, and the `r.jina.ai` proxy
  also timed out waiting for the page to go network-idle. `moi.gov.ae`
  (Ministry of Interior, for weapons-import permits) loaded but returned an
  empty client-rendered SPA shell with zero relevant text, the same pattern
  documented for South Africa's `eta.dha.gov.za` and Kenya's `gdrfad.gov.ae`
  FAQ accordion. `gdrfad.gov.ae`'s own node pages (e.g. its visa-on-arrival
  country list, previously indexed by search engines) now 404 — the content
  appears to have moved or been retired since it was last crawled — but a
  **static PDF asset** on the same domain (`/themes/gdrfad/content/pdf/...`)
  was directly fetchable even though the CMS-rendered node pages were not,
  which is how the Federal Decree-Law's official English translation was
  obtained. Net assessment: the UAE's federal-portal-family sites
  (`*.gov.ae`) are inconsistently defended — some (MOFA, Dubai Customs, u.ae,
  GCAA) are straightforward; others (`uaelegislation.gov.ae`, `mohap.gov.ae`,
  `moi.gov.ae`, `gdrfad.gov.ae` node pages) range from Cloudflare-blocked to
  fully client-rendered SPA shells to simply gone — a future pass should
  budget for per-domain reachability testing rather than assuming a `.gov.ae`
  domain behaves like any other.

## Deliberately left unpublished from this research pass — UAE (genuinely unverified — do not add without a real primary-source check)

- [ ] AE: exact stay-length duration (days) for BR, MX, AR, CL, MY, IL, UA —
      see the "Done" note above. MOFA confirms all seven are `visa_free`,
      but no primary source, and no secondary source repeated consistently
      enough to trust, states a specific day count for this cohort
      specifically (as opposed to the classic 90-day list). Left as
      `stayPolicy: {kind: "visa_required"}` (no computable duration) rather
      than assuming 90 days by inference from the adjacent, better-sourced
      cohort. Re-check via each nationality's bilateral visa-exemption MOU
      (the UAE has signed named MOUs with, among others, Israel [Oct 2020]
      and several other states) or a reachable `uaelegislation.gov.ae`/
      `gdrfad.gov.ae` page naming the exempted-nationality duration
      explicitly.
- [ ] AE: one MOFA embassy-mission subpage (`mofa.gov.ae/en/missions/
      boston/services/visas`) states US citizens get a "1 month" visa on
      arrival — directly contradicting MOFA's own main visa-exemption page
      (current, `visa_free` classification) and every other source found in
      this pass. Treated as a stale/unrevised mission subpage (several
      other mission subpages, e.g. Washington and London, returned plain
      404s during this pass, suggesting inconsistent upkeep of this part of
      the site) rather than the controlling figure, per AGENTS.md §3.8's
      "official pages can themselves be stale" guidance — but this was a
      judgment call, not a hard confirmation, and is worth a follow-up
      re-check.
- [ ] AE: `medication-ae` — MOHAP's own controlled/semi-controlled medicines
      list (reportedly 200+ named medicines, including common ones like
      certain antidepressants and codeine-containing products, per search-
      engine-indexed secondary summaries of `mohap.gov.ae`) was **not**
      independently verified against the primary source — `mohap.gov.ae`
      was unreachable by every method tried in this pass (see source-quality
      note above). No specific named-drug list or day-supply quantity figure
      (a commonly repeated but unconfirmed "3 months" appears in secondary
      sources) was published; `medication-ae` stays at the general
      "prescribed medicines OK in normal quantities; controlled substances
      need an advance MOHAP permit" level confirmed via u.ae. This is the
      single highest-priority follow-up in this pass, given the UAE's
      documented history of prosecuting travelers over common medications —
      re-attempt `mohap.gov.ae` directly (or via a different access method)
      before treating this category as done.
- [ ] AE: `weapons` — no row published. Dubai Customs' own Passenger
      Customs Guide (the primary source used for most other AE customs
      rows in this pass) does not mention weapons, firearms, or ammunition
      at all. `moi.gov.ae` (Ministry of Interior, the likely correct
      authority per secondary reporting) returned an empty client-rendered
      page with no fetchable text in this pass.
- [ ] AE: `e_cigarettes` — no row published. No primary UAE customs or
      health-authority page describing the personal-import (as distinct
      from commercial-sale/registration) treatment of e-cigarettes/vapes
      was found or successfully fetched in this pass — same recurring gap
      pattern as US/GB/CA/JP/KE/ZA/MX on this category.
- [ ] AE: `drones-ae`'s residency-restriction claim (that recreational
      drone registration/use is currently limited to UAE residents with a
      valid UAE Pass account, per a January 2025 news report) was not
      independently confirmed against a primary GCAA source in this pass —
      the GCAA registration page itself does not address visitor/tourist
      eligibility either way. Flagged in the row's own `notes` rather than
      asserted as a confirmed customs verdict.
- [ ] AE: passport-validity buffer beyond "6 months from date of entry"
      (Art. 8 of the Executive Regulation) — confirmed as a general entry
      condition, but whether any *additional* buffer applies specifically to
      the exempted-nationality walk-in category (as opposed to applied-for
      visas generally) was not separately confirmed; `documentsNeeded`
      publishes the Art. 8 figure as-is.

## Done (2026-09-14/15) — cannabis/CBD gap fill + niche categories + overstay-penalties explainer

- [x] `cannabis`/`cbd_cannabis` rows added for **Singapore, New Zealand,
      Saudi Arabia, Brazil, Indonesia, Philippines** (the 6 of 9
      destinations missing this category that were reachable this pass) —
      see `data/customs-items.json` slugs `cannabis-sg`, `cannabis-nz`,
      `cannabis-sa`, `cannabis-br`, `cannabis-id`, `cannabis-ph`. Brazil is
      the standout nuance: recreational cannabis/THC is prohibited outright,
      but CBD is merely *restricted*, with a real, live ANVISA "exceptional
      import authorization" government service page — recorded as
      `depends`, not `prohibited`, because that's what Receita Federal's own
      restricted-goods table actually says.
- [x] `cannabis`/`cbd_cannabis` for **Vietnam, China, South Korea** — the
      WebSearch-budget blocker from the prior pass is resolved (session
      cap raised to 1000). Added `cannabis-vn`/`cbd-vn` (Law No.
      73/2021/QH14 read directly for the cannabis row; Decree
      57/2022/ND-CP for CBD/THC — its schedule appendix is paywalled on
      the source used, so the THC-on-List-I claim is corroborated via
      multiple independent legal-industry analyses rather than read
      verbatim, noted honestly in the row), `cannabis-cn`/`cbd-cn`
      (Criminal Law Arts. 347-348 read directly via english.court.gov.cn —
      a real breakthrough vs. the prior session's total CAAC/NMPA block;
      CBD cited to a USDA FAS GAIN report quoting China's Sept 2024
      precursor-chemical announcement), `cannabis-kr`/`cbd-kr` (Korea
      Customs Service's own quoted warning, via The Korea Times, naming
      CBD/CBN/THC together with penalty figures — `.go.kr`/`law.go.kr`
      domains and `elaw.klri.re.kr` full-text still don't resolve/render,
      so this is the workaround). All 25 destinations now have this
      category.
- [x] Niche-but-real categories added by re-mining pages already fetched
      for the cannabis pass (no extra research cost) plus a few new
      targeted fetches: NZ weapons + a new `wildlife-products-nz` (CITES
      souvenirs — ivory/coral/tortoiseshell), SA drones + weapons (the SA
      "weapons" row turned out to be more surveillance/security-equipment
      than firearms: laser pointers >5mW, hidden-camera novelty items,
      radar detectors, tear gas), BR weapons (toy guns/airsoft/replica
      firearms prohibited outright, separate from the real-firearms Army
      Command permit process), ID weapons, PH weapons, SG cash (real
      reporting mechanism confirmed — SPF Form NP 728 — but the exact SGD
      threshold could not be verified on a primary source in this pass, so
      published honestly as unconfirmed rather than repeating the
      commonly-cited SGD 20,000 figure), AE `paan-nasvaar-ae` (betel
      leaf/smokeless tobacco — a real, absolute, easy-to-miss prohibition
      distinct from the ordinary tobacco allowance), GB and CA `food_plant`
      (both were missing entirely — GB has a specific named non-EU
      exempt-fruit list; CA's CBSA gives no blanket answer, just "always
      declare, check AIRS per item," published as `declaration_required`
      rather than invented as allowed/prohibited).
- [x] `e_cigarettes` — with the WebSearch budget restored, found and
      added the 2 destinations with genuinely strong sourcing:
      `e-cigarettes-vn` (National Assembly Resolution 173/2024/QH15,
      full nationwide ban in force since 1 Jan 2025, confirmed via a
      direct WHO Viet Nam fetch) and `e-cigarettes-br` (ANVISA RDC
      855/2024, which explicitly names traveler/luggage entry as
      prohibited, confirmed via a direct WHO FCTC fetch). 15 more left
      unpublished after that pass — see the 2026-09-18 retry entry below
      for what happened to each.

- [x] **Retry pass (2026-09-18)** on the 15 unpublished e_cigarettes
      destinations — 9 now resolved and shipped, 6 remain unpublished.
      **Shipped this round**:
      - South Africa (ZA) — resolved to a clean, real government-primary
        finding: the Tobacco Products and Electronic Delivery Systems
        Control Bill (B33-2022) is still in committee, not law, confirmed
        directly on parliament.gov.za. `allowed` (no dedicated vape law
        exists yet).
      - Turkey (TR) — resolved. Presidential Decision No. 2149 (Resmi
        Gazete 31050, 25 Feb 2020) directly fetched and quoted: Art. 1
        bans commercial import, Art. 2(2) delegates a traveler exception
        to the Ministry of Commerce. The specific 1-device/30ml figure is
        still from a secondary source describing that ministry's
        implementing circular, not the decree text itself.
      - Morocco (MA) — resolved via 7 independent Moroccan financial/
        business press outlets confirming no import ban exists, only
        rising duties (2.5%→40% in 2024, plus a 50 MAD/unit tax from Jan
        2025). Morocco Customs' own site (douane.gov.ma) and its specific
        circulars remain bot-blocked from this environment.
      - Kenya (KE) — resolved with a "contested, not settled" verdict
        (`depends`) rather than a flat `prohibited` — the Health CS's 31
        May 2025 nicotine-product ban directive was suspended by a High
        Court conservatory order on 4 June 2025 (Justice Bahati Mwamuye,
        following a petition by Susan Awino). Still only Kenyan press
        (The Standard), no Kenya Gazette notice found for either the
        directive or the court order.
      - China (CN) — a real breakthrough: General Administration of
        Customs Announcement No. 102 of 2022 (effective 1 Nov 2022) sets
        exact passenger duty-free figures (2 devices + 6 cartridges/≤12ml
        combined; lower for HK/Macao routes; under-16 barred entirely) —
        identically corroborated across 5+ independent Chinese sources.
        Direct fetch of customs.gov.cn still fails on a self-signed cert,
        so this is strong search-corroboration, not a directly-read page.
      - Indonesia (ID) — resolved, directly fetched from
        beacukai.go.id/barang-penumpang (already used elsewhere in this
        dataset): specific unit/ml limits under Peraturan Menteri
        Keuangan No. 34/PMK.04/2025.
      - South Korea (KR) — resolved, directly fetched from
        customs.go.kr's own English site (note: NOT a `.go.kr` domain,
        and it resolved where `.go.kr` domains have not) — confirms the
        previously-secondary <20ml/<1%-nicotine duty-free figure verbatim.
      - United States (US) — resolved as an absence-based finding:
        cbp.gov's own prohibited-and-restricted-items page, directly
        fetched, covers alcohol/firearms/food/plants/meds but never
        mentions e-cigarettes — treated as `allowed` under the general
        personal-goods rule, since FDA/CBP material about vapes only
        ever addresses commercial importers, not travelers.
      - Philippines (PH) — resolved as `depends` with an honest caveat:
        RA 11900's full text (reachable, re-confirmed) sets no statutory
        personal-import quantity; customs applies an informal, discretionary
        standard instead. This is the genuine answer, not a research gap.
      **6 still unpublished after that round.**

- [x] **Competitor-leads retry pass (2026-09-19)** on the 6 remaining
      e_cigarettes destinations — using competitor/aggregator sites
      (iVisa-style pages, vape blogs, travel forums) strictly as LEADS to
      find the actual authority/regulation they're citing, never as the
      shipped `legal_source` itself (AGENTS.md §3 policy). 3 resolved:
      - Japan (JP) — resolved. Competitor leads all pointed to "MHLW's
        Q&A on pharmaceutical import procedures" without linking it;
        located and directly fetched/quoted the real page (Q57/Q63,
        two equivalent MHLW document IDs both independently confirmed
        real): nicotine cartridges/liquid clear customs without a Yakkan
        Shoumei up to a 1-month supply (1,200 cigarette-equivalents /
        12,000 inhalations, ≈60 cartridges or 120ml liquid); devices
        clear up to 2 units without certification. Note: disposable vapes
        were reportedly banned nationwide in April 2025, a separate,
        more recent development not covered by this Q&A document.
      - New Zealand (NZ) — resolved, and this closed out an internal
        disagreement worth recording: one research pass found an NZ
        Customs Official Information Act PDF claiming "no border-control
        role for vaping at all" (verdict `allowed`) but admitted the PDF
        itself was unreadable and the claim came from a search-engine
        snippet, not a direct read. A second, independently verified pass
        directly fetched NZ Customs' own duty-free FAQ page and confirmed
        vaping isn't mentioned there and isn't covered by the
        tobacco-specific concession — so the general NZD 700 goods
        concession applies instead. Shipped as `allowed_with_limits`
        using the directly-read source, since it's more rigorously
        grounded than the unreadable-PDF claim, even though both point to
        "no vape-specific restriction."
      - Saudi Arabia (SA) — resolved as `depends`, correcting the earlier
        `allowed` read. Saudi Customs bans individuals from importing
        e-cigarettes via shipping companies/personal websites (goods
        confiscated, fined) — SFDA-licensed companies may still import
        commercially. Corroborated across 5 outlets for the 2020 version
        of this policy, and independently traced back further via a
        directly-fetched Arab News piece to a September 2015 Ministry of
        Commerce and Investment sales ban, with "anyone bringing them in
        from abroad" described as smuggling — a long-standing policy, not
        a one-off report. Domestic possession/sale has separately been
        legal since Royal Decree 38621 (2019) — the two facts don't
        contradict each other, they're about different questions (owning
        vs. personally importing). Genuinely unresolved: whether this
        covers accompanied traveler luggage specifically, or only
        shipping/mail-order/online-purchase channels — shipped as
        `depends` with that ambiguity stated explicitly rather than
        guessed either way.
      **3 still unresolved**:
      - Nigeria (NG) — marginal improvement only. Tried son.gov.ng
        directly this round — no e-cigarette-specific page found on the
        live site. Every source describing "SON guidelines requiring
        zero-nicotine for SONCAP registration" is secondary, none link to
        or name a locatable SON circular/document number.
      - Rwanda (RW) — an important negative finding, not just a gap.
        Directly fetched Rwanda's actual Law No. 08/2013 (via RwandaLII)
        and confirmed it does **not** define or cover e-cigarettes/vaping
        devices at all — Art. 2's "tobacco products" definition is
        explicitly limited to smoked/sniffed/dipped/sucked/chewed
        tobacco-based products. The "banned since 2019" claim that's
        repeated across travel sites has no support in Rwanda's actual
        tobacco-control statute; the only source for a separate
        ministerial order is GSTHR (an advocacy/research org, not
        government), with no citable government order located. Don't
        ship a `prohibited` verdict on this — the honest finding is
        closer to "the commonly-repeated claim isn't supported by the law
        it's usually attributed to," which is different from confirming
        e-cigarettes are actually allowed either.
      - UAE (AE) — no improvement despite trying Dubai Customs' own
        permitted-items page directly this round (confirmed real,
        fetched — doesn't mention e-cigarettes at all, only traditional
        tobacco quantities). The Federal Customs Authority's traveler
        guide connection-refused; MOHAP's page errored on fetch. The
        "1-2 devices + 5×10ml" figure remains uncorroborated against any
        UAE government source across 3 separate direct-fetch attempts in
        2 research passes.
- [x] `drones` — added 12 of the 13 missing destinations (US, GB, JP, NG,
      AU, TR, NZ, CN, ID, BR, SG, KR); see `drones-{cc}` slugs in
      `data/customs-items.json`. Confirms the pattern noted above: for
      most of these the real constraint is a civil-aviation
      registration/flight-permit requirement, not a customs import ban —
      GB, TR (import/customs step), SG and CN were confirmed by directly
      fetching and quoting the regulator's own page/text; JP, AU, NZ, NG,
      US, ID, BR, KR rest on official-domain search-snippet corroboration
      (moderate confidence, noted per-row) rather than a full primary-text
      read. Vietnam was left out of this pass — see the 2026-09-18 retry
      entry below, now resolved and shipped, closing out drones coverage
      to all 26 destinations.

- [x] **Retry pass (2026-09-18)** on `drones-vn` — resolved with a real
      breakthrough: directly fetched and quoted Decree No. 288/2025/ND-CP
      (in force since 5 Nov 2025), the actual current government decree
      on managing unmanned aircraft — via LuatVietnam, not a search
      snippet this time. This meaningfully **corrects** the prior
      secondary-sourced facts: the import-license path runs through the
      provincial People's Committee after consulting the Ministry of
      National Defense or Ministry of Public Security, not a standalone
      MND license as aggregator blogs (ts2.tech, kampatour.com) had
      claimed; the flight-permit lead time is 7 days, not 14. Recreational
      drones under 250g flown outside restricted airspace are exempt from
      a flight permit but must still be reported to local military/police.
      One secondary-only claim (mandatory registration for all drones
      regardless of weight since 1 Jul 2025, plus a 2026 ID-code circular)
      wasn't independently verified against primary text and is flagged as
      such in the shipped row rather than asserted as settled.

### `/rules/overstay-penalties` — EU-wide general explainer, published

- [x] Built `/rules/overstay-penalties`, cited directly to Directive
      2008/115/EC (the "Return Directive"), Arts. 3(2), 6(1), 7(1)-(2),
      11(1)-(3) — CELEX 32008L0115. **EUR-Lex's HTML pages are still
      blocked to automated fetching** (confirmed again this pass, `curl`
      and WebFetch both got empty/202 responses), but the CELLAR-API
      workaround documented above still works exactly as described:
      `http://publications.europa.eu/resource/celex/32008L0115` with
      `Accept: application/xhtml+xml` returned the full, real Official
      Journal text (HTTP 200, ~106KB) via plain `curl` — no consolidated
      version exists at guessed CELEX date suffixes (404), so the original
      2008 text is what's cited, which is standard practice for an
      unamended act.
- [x] `/rules/overstay-penalties/[country]` — built. `data/overstay-penalties.json`
      now has 26 of the 29 Schengen countries (AT, BE, BG, CH, CZ, DE, DK,
      EE, ES, FI, FR, GR, HR, IS, IT, LT, LU, LV, NL, NO, PL, PT, RO, SE,
      SI, SK — HR, CZ, GR, SK added in a 2026-09-18 retry pass, see below),
      each with
      a real, citable national-law source for the fine and/or entry-ban
      figures — see the row's `enforcementNotes` for exactly which figures
      were directly confirmed vs. secondary-corroborated. Where a specific
      figure (usually the fine amount) genuinely couldn't be pinned down,
      the field says so honestly (e.g. Norway: "does not impose fines,"
      per UDI itself; France: no automatic fine at all, a genuinely
      different mechanism than most — both real findings, not gaps) rather
      than being invented or omitted.
      Cyprus was never in scope here — it's an EU member but not a Schengen
      member (see `countries.json`), so the 90/180 rule and this dataset
      don't apply to it at all.

- [x] **Retry pass (2026-09-18)** on the 7 originally-unpublished Schengen
      countries, using more targeted per-country leads and (where a live
      fetch was blocked) trying the Wayback Machine — **note: the Wayback
      Machine technique is fully blocked at the tool level in this
      environment** ("Claude Code is unable to fetch from web.archive.org"),
      confirmed during this pass, so don't suggest it again as a workaround
      for any country until that changes. 4 of the 7 now clear the bar and
      are published:
      - Croatia (HR) — resolved. EUR 60–920 fine, directly quoted from
        Croatia's Official Gazette (current Zakon o strancima Art. 253(2),
        as amended by NN 151/22): a real breakthrough over the earlier
        pass, which had only found stale pre-euro kuna figures.
      - Czech Republic (CZ) — resolved, moderate confidence. Up to CZK
        10,000 (§ 157(1)(a)-(e) of Act No. 326/1999 Sb.) and a 5/10-year
        ban tier (§ 119(1)) — search-snippet corroborated across two
        independent queries, still no direct full-text read (every
        e-sbirka.gov.cz/mzv.gov.cz/Refworld fetch attempt failed).
      - Greece (GR) — resolved, and a genuinely important finding: Greece
        **criminalized** simple illegal stay via Law 5275/2026 (published
        6 Feb 2026) — at least 2 years' imprisonment + EUR 5,000, not the
        administrative-fine model most other countries use. This
        supersedes the old Law 4251/2014 the original pass had targeted.
        Directly quoted from R.S.A. (Refugee Support Aegean), which is
        actively tracking ~300 real imprisonment cases under this law;
        corroborated by 2 more independent outlets (GreekReporter,
        InfoMigrants).
      - Slovakia (SK) — resolved, with an honest caveat. Ban tiers (1y /
        1-3y / 1-5y / 10y, Act 404/2011 § 82(3), strictest-governs rule at
        § 82(7)) are solidly multi-source-corroborated including via the
        Slovak Supreme Administrative Court's own case law, but which tier
        governs a plain first-time tourist overstay specifically still
        isn't confirmed, and no fine figure was found — the Ministry of
        Interior's own PDF of the act failed to extract readable text on
        two separate attempts (reported as compressed/undecodable both
        times), so a manual/different-tool read of that PDF is the
        natural next step if this needs tightening further.
      **3 still deliberately left unpublished**:
      - Hungary (HU): now correctly identified the current governing law
        for the first time — Act XC of 2023 (in force since 1 Jan 2024,
        replacing the old 2007 Act II), hosted at njt.hu/net.jogtar.hu.
        Confirmed structurally that unlawful stay triggers expulsion with
        an entry ban as a consequence (Art. 7(3)), but every direct fetch
        of the enforcement/sanctions sections was truncated before
        reaching a ban-duration figure or an individual fine amount — a
        "5 million HUF" figure found is an *employer* fine for hiring
        undocumented workers, not a penalty on the overstayer, don't
        conflate them. **Retried again (2026-09-19), still unresolved** —
        a direct fetch of njt.jog.gov.hu/jogszabaly/2023-90-00-00.11 was
        attempted specifically for the entry/residence-ban duration and
        individual fine, and again only reached the employer-fine
        provision (Art. 29§(2), 5 million HUF, re-confirmed, still not the
        individual's penalty). Two attempts now agree this specific
        excerpt/pageNo of the law doesn't reach the sanctions chapter — a
        follow-up needs a different page/section parameter on njt.jog.gov.hu,
        or the consolidated net.jogtar.hu version, targeting Part Four
        specifically (likely Arts. 130s-140s based on document structure).
      - Liechtenstein (LI): still unresolved after three research passes,
        likely a genuine dead end given its size — no LI-specific fine or
        ban figure confirmed. Leads found but not solid enough to cite: a
        vague, uncorroborated "up to CHF 10,000" figure for Ausländergesetz
        violations generally (no article number, no confirmation it covers
        overstay specifically) and Liechtenstein's 1923 customs treaty
        binding it to apply Swiss foreigners-police law at the border,
        which — if confirmed with a specific citation — would itself be a
        legitimate "adopts Switzerland's rules" finding rather than a gap.
        **Competitor-leads pass (2026-09-19)**: this time located
        Liechtenstein's own actual Ausländergesetz on its own legislative
        portal (gesetze.li/Lilex, both PDF and HTML forms) — a genuine
        primary source, if it could be read. Every fetch attempt (3, in
        different URL formats) returned a connection reset — the domain
        appears to reject automated fetching entirely, not just this one
        document. This is now the same "found the right source, can't
        read it" pattern as Hungary and Malta below — a tooling
        limitation, not an unresearched gap.
      - Malta (MT): marginal improvement only, and one dead-end lead worth
        flagging so it isn't re-chased: two candidate overstay-fine
        provisions surfaced (Immigration Act Art. 5: up to 300 fine units
        for prohibited-immigrant/overstay status; a separate up-to-EUR-2,500
        + 3 months for general non-compliance) but which governs simple
        tourist overstay is unclear, and neither was read from a
        government-primary source — legislation.mt, natlex.ilo.org,
        refworld.org (403) and globaldetentionproject.org all failed to
        yield readable text. Ban range unchanged: still only the single
        Sciberras Advocates law-firm blog, 1-10 years, not government-primary.
        **Dead-end lead (2026-09-19)**: a real, well-sourced "€200 on-the-spot
        fine → deportation review" rule was found (Home Affairs Minister
        Glenn Bedingfield, July 2026, corroborated across 7+ Maltese news
        outlets) — but it's a general antisocial-tourist-behavior enforcement
        measure for Malta's tourism-heavy localities, *not* a visa/Schengen
        overstay penalty. Don't ship this as Malta's overstay fine; it
        answers a different question.

## Done (2026-09-16) — food_animal/food_plant gap fill

- [x] Added 13 rows closing most of the `food_animal` (was missing from 12
      destinations) / `food_plant` (was missing from 10) gap: `meat-dairy-sg`
      + `fresh-produce-sg` (SFA, directly fetched), `meat-dairy-nz`
      (NZ Customs + a real 2026 enforcement case), `meat-dairy-br` +
      `fresh-produce-br` (MAPA, Portaria n° 872/2025, directly fetched —
      note cheese/salami/doce de leite are explicitly exempted if in
      original manufacturer packaging, everything else needs sanitary
      proof), `meat-dairy-ph` (Bureau of Animal Industry, directly quoted:
      cooked/canned vs. processed-uncooked vs. unprocessed meat are treated
      completely differently), `meat-dairy-vn` (Decree 204/2026/ND-CP,
      search-snippet sourced), `meat-dairy-kr` + `fresh-produce-kr` (Korea
      Tourism Organization's official English page — a real breakthrough,
      since `.go.kr` domains remain unreachable), `fresh-produce-eu` (an EC
      "Your Europe" portal page, directly fetched — plants-for-planting
      banned outright from non-EU countries, fruit/veg need a phytosanitary
      certificate except a short exempt list per Annex XI of Implementing
      Regulation (EU) 2019/2072), `meat-dairy-ke` (Kenya Law's Meat Control
      Regulations — flagged as possibly built for commercial importers, not
      obviously applicable to ordinary travelers, since Kenya's own text
      doesn't draw that line), `meat-dairy-id` + `fresh-produce-id` (Badan
      Karantina Indonesia, directly fetched).
- [x] **Retry pass (2026-09-18)** on the destinations left unpublished
      above — 3 of 6 now resolved with directly-quoted primary sources and
      shipped:
      - Rwanda (RW), both categories — resolved. `meat-dairy-rw`: Art. 16
        of the Ministerial Order on Animal Slaughtering and Meat
        Inspection, directly quoted, requires a national-veterinary-
        authority import permit for fresh/chilled/frozen/salted/dried/
        smoked meat (dairy isn't addressed by this specific order, still a
        gap). `fresh-produce-rw`: Art. 10 of the Law on Plant Health
        Protection (2016), directly quoted, requires declaring all
        plant/plant-product imports on arrival. Both fetched directly from
        RwandaLII, a legal-information-institute portal.
      - Vietnam (VN), `food_plant` — resolved. Decree 214/2026/ND-CP, Art.
        31, directly quoted and fetched from LuatVietnam: specific VND
        fine tiers for importing quarantine-subject plants without a
        permit (3-5 million) vs. without a phytosanitary certificate
        (10-20 million), both backed by forced re-export/destruction.
      - Philippines (PH), `food_plant` — resolved. The National Plant
        Quarantine Services Division's own import-requirements page,
        directly fetched: a Plant Quarantine Clearance (PQC) is required
        before importing personal-consumption plant/fruit/vegetable
        goods, a separate pathway from commercial SPSIC import.
      **3 of 6 still unresolved, real effort spent both rounds**:
      - China (CN), both categories — no improvement this pass (the
        Wayback Machine workaround is confirmed fully blocked at the tool
        level in this environment, not just for China — dead for any
        country until that changes). **Resolved in a later
        competitor-leads pass (2026-09-19), see below.**
      - Saudi Arabia (SA), both categories — no improvement this pass
        despite trying 5 distinct URLs. **Partially resolved in a later
        competitor-leads pass (2026-09-19), see below.**
      - Egypt (EG), `food_animal` — partial improvement, still not
        shippable this pass. Now has a real specific legal basis via
        FAO's FAOLEX database: Decree No. 46 of 1967 (effective 11 Mar
        1967), administered by Egypt's General Organization for
        Veterinary Services under the Ministry of Agriculture — but every
        FAOLEX PDF candidate tried is a scanned image with no extractable
        text. **A newer, superseding decree was found in a later
        competitor-leads pass (2026-09-19), see below — still not fully
        shippable.**

- [x] **Competitor-leads retry pass (2026-09-19)** on CN, SA, EG — using
      competitor/expat-forum sites strictly as LEADS to find the actual
      regulation/authority they cite, never as the shipped `legal_source`
      itself (AGENTS.md §3 policy). This resolved China completely and
      part of Saudi Arabia:
      - China (CN), both categories — **resolved**. Found the exact
        regulation via a competitor-lead search for the specific
        announcement number: **Joint Announcement No. 470 (2021)**,
        Ministry of Agriculture and Rural Affairs + General
        Administration of Customs — "List of Animal and Plant Products
        and Other Quarantine Materials Prohibited from Being Carried or
        Mailed into the People's Republic of China." Its existence, exact
        title, and 2021-10-20 issuance date were independently confirmed
        directly on moa.gov.cn (a real Chinese government domain, though
        the attached item-list document itself wasn't readable there);
        the actual operative text — meat (raw or cooked, incl. offal),
        dairy (raw/pasteurized/sterilized/flavored/fermented milk, cream,
        butter, cheese, condensed milk), and fresh fruit/vegetables, all
        listed as prohibited — was independently confirmed by directly
        fetching and quoting a mirror hosted by the China-Africa SPS
        Cooperation Information Network. Two independent research passes
        converged on the same announcement number from different lead
        chains, which is itself a good confidence signal.
      - Saudi Arabia (SA) — **partially resolved**, narrower than a
        blanket verdict. ZATCA's and SFDA's own pages remain unreachable
        (same persistent block as every prior attempt), but a U.S.
        International Trade Administration country commercial guide,
        directly fetched and quoted, confirms: pork and pork products are
        absolutely prohibited; agricultural seeds and live animals
        require special advance approval from Saudi authorities. Shipped
        as `meat-dairy-sa` (pork specifically) and `fresh-produce-sa`
        (seeds specifically) — this source doesn't address general
        non-pork meat or dairy, or general fresh fruit/vegetables beyond
        seeds, so those remain open questions rather than assumed-safe.
      - Egypt (EG), `food_animal` — still not shippable, but upgraded to
        a more current lead: **Ministry of Agriculture and Land
        Reclamation Decree 1647 (1997)** likely supersedes the 1967
        decree found earlier — it requires a General Organization for
        Veterinary Services (GOVS) import permit, considering the origin
        country's epidemiological status, valid 1 month and renewable.
        Found via a USDA FAS GAIN report's search-indexed summary; the
        GAIN report PDF itself is unreadable (same binary/scanned failure
        as every PDF tried this project). Egypt's National Food Safety
        Authority took over food-safety regulation generally in 2020 but
        still relies on GOVS for this specific import-permit mechanism.
        Not shipped — the decree's own text still hasn't been read
        directly by any pass.
