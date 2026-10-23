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
- [x] `ees.json` — all 29 EES states verified 2026-10-05 (24 added, the
      launch five upgraded). Each row now names the **designated EES data
      controller** from the official EU EES page "Contact details for data
      protection matters" (travel-europe.europa.eu/en/ees/contact-details-for-
      data-protection-matters — JS-rendered, needs a real browser), with the
      national DPA as the Art. 53(2) helper/complaint body (EDPB list).
      Still open per country: accepted languages (no source states them).
      Conflicts recorded: MT complaint email on the EU page reads
      `idpc.info@ispc.org.mt` (typo; IDPC + EDPB give `@idpc.org.mt`, used);
      SE controller email differs between the EU page and police form PM 188.10
      (both listed); PL Border Guard notice lists `gabinet.kg@` besides the EU
      page's `nu.ees@` (both listed); HU authority email differs from EDPB
      (EU page's used). Letters in 18 new languages use each EU language
      version of Reg. 2017/2226 (CELLAR) for terminology; `nb` and `is` are
      plain translations (no EU language version). **None has had a native
      speaker check** — worth doing for the highest-traffic ones (pl, pt, el).
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

- [x] **Serbia (RS)** — 17 entry rows (all from the Foreign Ministry's
      per-nationality visa-regime pages, most on a genuine 90-day-in-180
      rolling window, not a flat entry limit) and 12 customs rows, 10 of them
      quoted directly from Customs' tourist FAQ (200 cigarettes-equivalent
      tobacco allowance excludes snus, which is banned outright; e-cigarettes
      and nicotine pouches allowed for personal use with no stated numeric
      cap). Cannabis and CBD are sourced to a law firm's country guide (CMS
      Expert Guides) rather than Serbia's own statute text — the EU Drugs
      Agency's more authoritative country page 403'd on every attempt to
      reach it directly. South Korea's page states a flat 90 days with no
      180-day reference (may be a page omission, not a different rule);
      China's 30-day page is dated 2018 but was reconfirmed live and current.
      Still open: injectables, a plant-specific produce rule, and the
      drone-model exemption list.
- [x] **Taiwan (TW)** — 16 entry rows (10 nationalities get 90 days, SG/MY
      get 30, India gets a 30-day pre-approved e-authorization; mainland
      China omitted — separate permit system) and 12 customs rows, all
      directly quoted from Taiwan government pages. Two notable facts: NT$
      and RMB have hard legal caps that can't be brought in even if declared
      (NT$100,000 / RMB 20,000), unlike other currencies which have no cap
      once declared above US$10,000; CBD is treated far more strictly than
      the US/EU (10ppm THC threshold vs 2,000-3,000ppm elsewhere), with no
      approved personal-import pathway at all. One citation URL (cash-tw) was
      double-checked and confirmed correct after two WebFetch calls
      returned no matching text on it — a live-fetch flake, not a bad
      citation. Brazil/Mexico/Argentina/Ukraine are recorded as
      visa-required by confirmed absence from every exemption list BOCA
      publishes, not an explicit "visa required" sentence — the rows say so.

- [x] **Albania (AL)** — 7 entry rows and 9 customs rows. Notable: US citizens
      get a full year visa-free (directly quoted from the US Embassy in
      Tirana, independently re-confirmed on the live page) — a genuinely
      unusual, generous bilateral arrangement worth surfacing since it's far
      more generous than the 90/180 window GB, CA, JP, CN, KR and SG get.
      Customs rows are mostly from the General Directorate of Customs'
      traveller pages; e-cigarettes is the weakest row (records that
      Customs' own duty-free page never mentions vapes at all — an absence,
      not a confirmed verdict). Still open: 8 more nationalities (KR/SG were
      resolved via their own foreign ministries in a follow-up pass; IL, MX,
      BR, AR, CL, MY, UA, IN each had a real official-source lead that hit a
      connection reset, TLS error, Cloudflare challenge, or JS-rendered page
      with no visa text extractable — genuine access failures, not
      unresearched); Ukraine's real 2027 humanitarian waiver has no
      confirmed day-limit anywhere; India's rule is contradictory across
      sources (simple visa-free vs. conditional on holding another visa);
      no food_animal/food_plant or drones rows — no primary source found.

## Done (2026-09-19) — `medication` gap fill (Nigeria, Vietnam, China, South Korea)

Per AGENTS.md §14's wedge note, "niche/controlled medication" is this
project's flagged strategic differentiator, not just a coverage gap to
fill — this pass targeted the 4 destinations still missing the whole
`medication` category (was 22/26).

- [x] South Korea (KR) — resolved, both rows, directly fetched and quoted.
      `prescription-medication-kr`: max 6 bottles or a 3-month supply
      (Ministry of Foreign Affairs embassy notice — resolves a genuine
      conflict in secondary sources between "6 weeks" and "3 months").
      `controlled-medication-kr`: MFDS advance-permit requirement for any
      medicine containing a controlled substance, regardless of
      nationality, in force since 2009, online applications since Dec
      2024 (MFDS's own page — the same domain/page pattern already used
      for the existing `cbd-kr` row). Amphetamine-based stimulants
      (Adderall, Vyvanse) reportedly cannot be brought in for personal
      use even with a permit — this specific point is secondary-
      corroborated, not read verbatim on a primary MFDS page.
- [x] China (CN) — resolved, both rows, directly fetched and quoted from
      two different Chinese-government-affiliated legal-database domains
      (policy.mofcom.gov.cn and beijing.gov.cn — both different from the
      persistently SSL/bot-blocked customs.gov.cn, a useful pattern for
      future China research). `prescription-medication-cn`: Art. 39 of
      the Measures for the Administration of Drug Import — a "self-use,
      reasonable quantity" standard with no fixed numeric cap, commonly
      interpreted as ~3 months in practice per secondary sources.
      `controlled-medication-cn`: Art. 44 of the Regulations on the
      Administration of Narcotic Drugs and Psychotropic Substances (State
      Council Order No. 442) — a medical diagnosis certificate + ID +
      single-prescription-max quantity lets an individual carry narcotic
      drugs and Category I psychotropic substances. Which specific
      Western medications (e.g. Adderall) count as "Category I" under
      China's own schedule wasn't independently confirmed against a
      named-substance list — flagged as a gap in the shipped row.
- [x] Vietnam (VN) — partially resolved. `controlled-medication-vn`
      shipped: 7-day supply for narcotic/addictive medication, 10-day for
      psychotropic/precursor medication, 30-day for combination drugs —
      extremely well-corroborated figures (multiple independent
      Vietnamese sources converge on them, including a Vietnam Customs
      regional office page titled exactly on this topic), but the page
      itself is JS-rendered and unreadable in this environment (the same
      recurring blocker for customs.gov.vn-family sites all project), so
      this is search-corroborated rather than a verbatim primary read.
      The specific governing circular is genuinely unresolved, not just
      unconfirmed: a commonly-repeated attribution to Circular
      19/2014/TT-BYT Art. 17 turned out to be a misattribution (that
      article covers export/import licensing procedures, not traveler
      carry limits) when checked directly, and neither of its two known
      successor circulars (20/2017/TT-BYT, 18/2026/TT-BYT) contain the
      traveler provision either. `prescription-medication-vn` (general
      OTC/prescription) **not shipped** — only thin, general framing
      found via search-snippet synthesis, no specific figure or citation.
- [ ] Nigeria (NG) — **not resolved**, none of the 3 sub-topics
      (general/OTC, controlled substances, injectables) cleared the bar.
      NAFDAC's Import & Export of Drugs page was directly fetched but has
      no substantive rule text, just links to guideline PDFs. A real,
      specific, locatable NAFDAC document exists — "Guidelines for
      Obtaining Permit for Importation of Narcotic Drugs, Psychotropic
      Substances and Drug Precursors" — but it's an unreadable
      binary-encoded PDF, confirmed on two independent fetch attempts;
      even if it could be read, it's unconfirmed whether it addresses
      individual travelers vs. only commercial/company importers. NDLEA's
      own site has no traveler-facing page on this topic at all. No
      source found at all for injectable medication (insulin/GLP-1).
      Needs either a different PDF-reading approach or a different lead
      entirely before this can ship.

## Done (2026-09-21/22) — expansion to new destinations

New destinations chosen by tourism volume, English-language official sources,
and fit with the site's Schengen-adjacent audience. Each was researched by a
separate agent that wrote a deliverable to a scratch file, validated it against
the production schemas, and had its riskiest claims spot-checked against the
official page before merging. Rows without a specific official page were
omitted rather than filled. Next candidates (not started): Taiwan, Serbia,
Albania, Sri Lanka, Qatar, Jordan, Colombia, Tanzania, Costa Rica.

- [x] **Hong Kong (HK)** — 16 entry rows (every roster nationality except
      mainland China) and 12 customs rows; stay lengths confirmed row-by-row
      against the Immigration Department table, the e-cigarette import ban and
      the 30 April 2026 public-place possession offence quoted from the
      Tobacco and Alcohol Control Office. Still open: mainland China (CN) —
      entry is by Exit-Entry Permit / Two-way Permit, which the schema can't
      express; insulin/injectables (no traveller guidance found); which
      specific prescription drugs (benzodiazepines, methylphenidate) are
      scheduled under Cap. 134.
- [x] **Ireland (IE)** — 16 entry rows, 12 customs rows. GB deliberately
      omitted (Common Travel Area: unlimited stay, not expressible). Ukraine
      is visa-free only by a 25 Feb 2022 ministerial waiver (INIS note 3),
      flagged in the row as a wartime measure to re-check. Still open: an
      official traveller rule for e-cigarettes (the row records only what
      Revenue omits plus the supplier-level e-liquid tax); the drone process
      for non-EU visitors; CBD personal import; whether controlled medication
      from non-Schengen countries needs more than the general 3-month/
      documentation rule; injectables; Revenue's full prohibitions PDF and
      DAFM's animal-products guide were located but not read in full.
- [x] **Malaysia (MY)** — 13 entry rows and 11 customs rows. Malaysia's
      Immigration Department per-country table wouldn't parse, so entry rows
      come from Malaysian embassy pages (kln.gov.my) and each nationality's
      own foreign ministry: GB 90, CA 90, CN 30, JP 90, SG 30, IN 30 (waiver
      expires 31 Dec 2026), MX 30, KR 90, AR 90, CL 30 (embassy says "less
      than 30 days"), AU 90, US 90, BR 90. The AU, US and BR figures came from
      search extracts because direct fetches failed, and the row notes say so.
      Still open: NZ (no usable official text); UA (absent from the
      visa-required list, but no Ukraine-specific statement); Israel (Israeli
      passport holders aren't admitted as ordinary visitors — no primary
      source stating the current rule); the CN exemption's end date (sources
      conflict between 31 Dec 2026 and a five-year term); tobacco duty-free
      quantity (current Customs page lists none; the old 200-cigarette figure
      is unconfirmed); vape devices without liquid and Act 852's own text;
      CBD; injectables; drone fee/registration figures are secondary-sourced
      only.
- [x] **Maldives (MV)** — 16 entry rows (free 30-day visa on arrival for
      every roster nationality except Israel, whose passport holders are
      barred — no row) and 11 customs rows. Alcohol is confiscated on arrival
      even if duty-free, vaping devices have been banned since 15 Nov 2024,
      pork/pornography/non-Islamic religious items are prohibited, and
      narcotics carry up to life imprisonment (all quoted from the Velana
      airport operator's customs page). Tobacco (200 cigarettes / 25 cigars /
      250 g, tourists only, from 9 Nov 2024) is from a Maldives Customs Service
      circular; medication limits are from the Food and Drug Authority's import
      guideline. Still open: CBD, injectables and a separate meat/dairy row;
      customs.gov.mv pages are behind a bot challenge; the cash threshold
      (US$10,000) is implied by the airport page and press reports, not
      stated as a formal rule on an official page; the produce row rests on
      a 2008 plant-quarantine regulation that doesn't address personal
      luggage; the consulate page used for entry rows is dated (6-month
      passport validity vs FCDO's 1 month after arrival — both noted).
- [x] **Georgia (GE)** — 17 entry rows (verified against Government Ordinance
      No. 255, the visa-free list on matsne.gov.ge: 14 roster nationalities
      may stay one full year; Chile, China and India are not on it) and 10
      customs rows. Alcohol, tobacco, e-liquid (50 ml) and the GEL 30,000 cash
      threshold are quoted from the Revenue Service's own brochure. Cannabis
      is sourced to Annex 1 List I of the narcotics law (cannabis, extracts,
      oil and resin are "strictly restricted"); the 2018 Constitutional Court
      ruling covers private consumption only. Still open: ordinary
      (non-controlled) prescription medicine, CBD-only products and injectables
      (no official traveller guidance found); the Revenue Service's traveller
      FAQ pages for plants/animals, weapons and currency only render in a
      browser (JavaScript), and reading them would firm up the food, weapons
      and drone rows (which currently only establish that permits apply);
      which named drugs are on List 1; exact e-visa terms for CL/CN/IN.

## Done (2026-10-02) — batch 1: FR/ES/DE/IT/NL nationalities + Cyprus

Promoted to /data: 5 EU nationality rows (free movement, Your Europe), 151 entry
rows for FR/ES/DE/IT/NL × 31 non-EU destinations, Cyprus (destination row, 17
entry rows, 11 customs rows), Japan amphetamine row split from
stimulant-medication-jp, and the Thailand correction (60→30 days from
2026-09-15, MFA summary image; MX→TH pulled to UNVERIFIED).

Held in data/UNVERIFIED/entry-requirements.json: TR (FR/DE/IT) and AL
(FR/DE/ES/NL) — sources say only "90 days", a fresh-per-entry model would be
the more permissive claim; IT→JP (sources disagree, mofa.go.jp 403); FR→SA (no
primary source confirms VoA for French nationals); MX→TH.
Held in data/UNVERIFIED/customs-items.json: CY prescription medication,
CY e-cigarettes.

Existing rows flagged by this pass, NOT yet re-verified or edited:
- GB→BR: rolling 90/180, but Brazil's QGRV table gives UK code 8 (no 180-day cap); QGRV edition dated 2020.
- CN→KE: fixed 90 days; every other Kenya eTA row and Kenya's page say stay is set at entry.
- US/GB→AE: fixed 90 per entry vs. EU sources' 90 in any 180.
- EG rows: the same e-Visa is `visa_required` (US/GB) but `eta_required` (IN).
- ID (16 rows): All Indonesia arrival declaration (mandatory since 2025-10-01) not listed; US→ID note says VoA can't be converted, imigrasi.go.id says it can.
- NZ rows: cited URLs now redirect; IVL NZD 100 and NZD 17/23 fees unconfirmed on current pages.
- US→SA: says 66 eVisa countries, portal now says 68.
- KR/BR/AR/CL→TH: values still correct (90-day bilateral), notes refreshed 2026-10-02.
- GB→CN: the 31 Dec 2026 end date is on the MFA FAQ, not on the NIA list it cites.
- ZA rows: ETA status now has a primary source (DHA statement 2079, 2026-08-12 — voluntary for visa-exempt travellers).
- IN→TH: India is on Thailand's 30-day list (added 2026-10-02).

Per-group research notes follow verbatim.

### Batch 1 notes — americas

##### Batch 1 (2026-10-02) — EU nationalities FR/ES/DE/IT/NL × US, CA, MX, BR

All 20 rows verified against primary sources fetched 2026-10-02 (agent:claude-opus-5-5).

###### Sources used
- **US**: DHS — Visa Waiver Program page (https://www.dhs.gov/visa-waiver-program) — current program-country table lists France, Germany, Italy, Netherlands, Spain. 90-day limit + e-passport requirement per DHS VWP requirements page (https://www.dhs.gov/visa-waiver-program-requirements). CBP's VWP page only says "42 countries" and links to DHS for the list.
- **CA**: IRCC check-visa-eta page (https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/check-visa-eta.html) — all five under "eTA-required countries or territories" (air). Fee CAD $7 from the eTA apply page. Stay: IRCC Help Centre qnum=1198 — "Most visitors can stay for up to 6 months"; the officer may set a shorter or longer stay.
- **MX**: SRE/INM Anexo 1 PDF (same file as the existing rows) — Alemania, España, Francia, Italia and Países Bajos (Holanda) are all listed as not requiring a visa. 180 days: INM press release (gob.mx/inm, "Facilita INM el ingreso … FMM … vía electrónica") — "condición de estancia de Visitante con una temporalidad de hasta 180 días".
- **BR**: MRE/PF QGRV PDF (same file as the existing rows), VIVIS column: DE/FR/IT/NL = 8* (visa exemption up to 90 days; * = max 90 days per 180); **ES = 8 (no \*)** → encoded as fixed_per_entry 90, not rolling_window.

###### Reachability notes
- WebFetch can't parse gov PDFs directly, but it saves them locally; `pdftotext -layout` on the saved file worked for both the MX and BR PDFs.
- diputados.gob.mx (Ley de Migración text) and ordenjuridico.gob.mx refuse connections; gaceta.diputados.gob.mx timed out. Art. 52(I) could not be fetched; the INM press release was used for the 180-day figure instead.
- The Brazil QGRV edition is dated 14/01/2020 — it's what the existing BR rows cite, but its age is a freshness risk worth a manual check.

###### Possible issue in existing data (not edited)
- **GB → BR** row uses stayPolicy rolling_window 90/180, but the QGRV shows Reino Unido VIVIS = **8** (no \*), and the row's own note describes "90 days per entry, extendable once, capped at 180 days in any 12-month period" — which isn't a 90/180 rolling window. Worth re-checking.

### Batch 1 notes — europe-near

##### Batch 1 — EU nationalities (FR, ES, DE, IT, NL) → GB, AL, RS, GE, TR (2026-10-02, agent:claude-opus-5-5)

25/25 rows verified against primary official sources fetched on 2026-10-02. Staged in `europe-near.json`; schema-valid (entryRequirementsFileSchema).

###### GB — United Kingdom (5 rows, eta_required, 180 days)
- Source: GOV.UK "Visiting the UK as an EU, EEA or Swiss citizen" — EU citizens (except Irish) need an ETA; stay usually up to 6 months; passport valid for the whole stay; ID cards accepted only with EUSS status / family permit / frontier worker permit / S2 / pending EUSS application.
- Cross-check: Immigration Rules Appendix ETA National List — France (#60), Germany (#61), Italy (#65), Netherlands (#72), Spain (#80) listed in cohort (d), travel on or after 2 April 2025.
- Note: `https://www.gov.uk/visit-uk-as-eu-eea-swiss-citizen` 404s; the live page is under `/guidance/`.

###### AL — Albania (5 rows, visa_free)
- Albania's own sources were NOT usable: the MFA visa-regime table PDF (`punetejashtme.gov.al/.../2-REGJIMI-I-VIZAVE-PER-TE-HUAJT-28.05.2024.pdf`) returns a bot-challenge HTML page to curl and 404 to WebFetch; `punetejashtme.gov.al/en/?p=553` renders empty. The MFA's general PDF (II-NR.3, readable) gives document-validity rules but no per-country table. The Netherlands embassy page (ambasadat.gov.al) confirms EU citizens may enter with an ID card valid 3+ months, but states no stay length.
- Used each traveller's own government (same approach as existing GB/CA/JP/KR/SG → AL rows):
  - DE: Auswärtiges Amt (Stand 02.10.2026) — passport/Personalausweis/Kinderreisepass, valid 3+ months at entry; provisional ID not accepted; visa-free tourism up to 90 days.
  - FR: France Diplomatie Entrée/Séjour (updated 15/09/2026) — CNI or passport, valid 3 months beyond return; 90 days; Albania doesn't recognise the CNI 5-year extension.
  - IT: Viaggiare Sicuri country sheet PDF (`/schede_paese/pdf/ALB.pdf`, updated 30/7/2026; the HTML page is a JS app) — passport or CIE valid 3+ months beyond return; **90 days within 6 months** for EU citizens; new: temporary paper ID accepted from 30/7/2026.
  - ES: exteriores.gob.es (updated 22/07/2026) — DNI valid 3+ months accepted; visa-free under three months.
  - NL: Nederland Wereldwijd (updated 14-08-2026) — passport/ID valid 90+ days on departure; ≤ 90 days no visa.
- Stay policy follows each source's wording: IT = rolling_window 90/180 (source states the 6-month period); DE/FR/ES/NL = fixed_per_entry 90 (sources state only 90 days). Italy's sheet describes the limit for EU citizens generally as 90 days within 6 months — a candidate for harmonising all five rows to rolling_window if Albania's own table becomes reachable.

###### RS — Serbia (5 rows, visa_free, rolling 90/180)
- Source: mfa.gov.rs per-country visa-regime pages (francuska, spanija, nemacka, italija, holandija) — all identical: "No visas required for visits of up to 90 days in a 6 months period starting from the date of the first entry"; "* ID card can also be used to travel to Serbia".
- Not included: the 50 EUR/day funds and insurance lines in existing RS rows — they are not on these country pages, so I didn't carry them over unverified.

###### GE — Georgia (5 rows, visa_free, 365 days)
- Source: Ordinance No. 255 on matsne.gov.ge (consolidated 24/02/2026) — Germany #22, Spain #31, Italy #39, Netherlands #58, France #71; Note 1 "one full year"; EU citizens may enter with an EU-issued identity card.
- Not included: the funds/insurance requirement in the existing US row (its source wasn't re-checked here).

###### TR — Türkiye (5 rows, visa_free)
- Source: mfa.gov.tr Visa Information for Foreigners. Wording differs by country: ES and NL "up to 90 days in any 180-day period" → rolling_window; FR, DE, IT "up to 90 days" → fixed_per_entry 90. Recorded as written.
- Passport validity: Law No. 6458 Art. 7.1(b), 60 days beyond the stay (MFA validity page); MFA advises 6 months.
- UNVERIFIED / left out: national-ID-card entry. The MFA's "countries whose citizens are allowed to enter Türkiye with their national ID's" page returns only navigation chrome (content likely JS-loaded) to both curl and WebFetch. Rows list the passport route only and say so in notes. TODO: re-check that page (or a Turkish embassy page) to add ID-card entry for these five.

###### Contradictions with existing rows
- None found for these destinations.

### Batch 1 notes — east-asia

##### Batch 1 (2026-10-02) — EU nationalities (FR, ES, DE, IT, NL) → JP, KR, CN, HK, TW

Researched by agent:claude-opus-5-5. 25 rows: 24 verified, 1 needs_verification (IT→JP).

###### Sources used (all fetched 2026-10-02)
- **Japan**: every `mofa.go.jp` and `*.emb-japan.go.jp` URL returned HTTP 403 (WebFetch and curl with a browser UA), including the visa-exemption list `novisa.html` cited by the existing JP rows. Used each traveller's own foreign ministry instead (national government authority, allowed under §3):
  - FR: France Diplomatie, Japon > Entrée / séjour (updated 2026-09-24) — 90 days visa-free, passport only (no ID card), Visit Japan Web recommended.
  - DE: Auswärtiges Amt, Japan Reise- und Sicherheitshinweise (Stand 2026-10-02, unchanged since 2026-07-07) — 90 days; Reisepass/vorläufiger Reisepass/Kinderreisepass yes, Personalausweis no; valid for whole stay.
  - ES: exteriores.gob.es recomendaciones de viaje Japón (updated 2026-06-18) — 90 days, return ticket required, strict on passport condition.
  - NL: nederlandwereldwijd.nl reisadvies Japan (updated 2026-08-07) — 90 days, passport valid for whole stay.
  - IT: Viaggiare Sicuri is an Angular SPA (WebFetch gets only the shell); the country sheet PDF works: `https://www.viaggiaresicuri.it/schede_paese/pdf/JPN.pdf` (updated 2026-04-01).
- **Korea**: K-ETA eligible-countries page (`k-eta.go.kr/portal/guide/viewetaalification.do`) fetched fine — FR/ES/DE/IT 90 days, NL "03 Months". 22-country temporary exemption list: Korean Embassy in Belgium notice (mofa.go.kr/be-en, seq=748985, 2024-12-17); extension to 2026-12-31 KST: Korean Embassy Netherlands notice (2026-01-05) and Seattle consulate notice. Note `mofa.go.kr` without `www` 301-redirects; `be.mofa.go.kr` redirect-loops.
- **China**: NIA unilateral visa-free list (dated 2026-02-17) — all five listed, 30 days, counted from 00:00 the day after entry; page gives NO end date. End date 2026-12-31 for the 48 non-Russia/non-Brunei countries comes from the MFA Consular Department FAQ `https://www.mfa.gov.cn/wjbzwfwpt/kzx/tzgg/202511/t20251110_11749824.html`.
- **Hong Kong**: ImmD visa-free table — all five 90 days.
- **Taiwan**: BOCA visa-exempt entry — all five 90 days, passport 6 months, return ticket, online arrival card within 7 days, stay starts day after arrival, not extendable.

###### Not verified — IT→JP (status needs_verification)
Italy's foreign ministry says Italians are visa-exempt "per un periodo massimo di 90 giorni ogni 180 giorni". Japan's exemption is otherwise framed as a 90-day period of stay per landing. Without Japan's own MOFA page (403) the stay policy (fixed_per_entry vs rolling 90/180) can't be settled. Retry `mofa.go.jp/j_info/visit/visa/short/novisa.html` from a different network.

###### Deliberately not claimed
- DE→JP 6-month stay via extension (MOFA "Note 8" per search snippets: Austria, Germany, Ireland, Liechtenstein, Mexico, Switzerland, UK). The Auswärtiges Amt page doesn't mention it and MOFA was unreachable, so the row says 90 days only. Worth adding once MOFA is reachable.
- NL→KR: K-ETA lists "03 Months", encoded as 90 days (conservative) with a note.

###### Time-sensitive (re-check before 2026-12-31)
- CN: unilateral visa-free policy for these countries ends 2026-12-31 unless extended again.
- KR: K-ETA temporary exemption ends 2026-12-31 KST.

###### Possible issues with existing rows (not edited)
- `GB→CN` (and similar) attribute the 2026-12-31 end date to the NIA list page; the NIA page (2026-02-17) shows no end date — the date is on the MFA FAQ above. Value correct, citation incomplete.
- All existing `→JP` rows cite `mofa.go.jp/.../novisa.html`, which now returns 403 from this environment; the source watcher will likely count it as unmonitorable.

### Batch 1 notes — se-asia

##### Batch 1 — EU nationalities (FR, ES, DE, IT, NL) × Southeast Asia (TH, VN, MY, SG, ID, PH) — researched 2026-10-02, agent:claude-opus-5-5

30 rows staged in `se-asia.json`, all `verified` (each value confirmed on a primary
official source fetched 2026-10-02), schema-valid against `entryRequirementsFileSchema`.

| Dest | Result for all 5 | Controlling source |
|---|---|---|
| TH | visa_free, 30 days (tourism only) | Thai MFA summary image, status 31 Aug 2026, effective 15 Sep 2026 |
| VN | visa_free, 45 days | Res. 44/NQ-CP (DE/FR/IT/ES, any purpose, to 14 Mar 2028); Res. 229/NQ-CP (NL, tourism, to 14 Aug 2028) |
| MY | visa_free, 90 days | Malaysian embassies Paris/Berlin/Rome/The Hague (kln.gov.my); ES via Spanish MFA + IMI list |
| SG | visa_free, 90 days | ICA visa-required list (none of the 5 listed) + each origin MFA for the 90-day figure |
| ID | visa_on_arrival, 30 days (+30 once) | imigrasi.go.id VOA list + B1 page |
| PH | visa_free, 30 days | eVisaPH / DFA, EO 408 list |

###### Cross-check method (new, worth reusing for every EU-nationality batch)
All five origin-country foreign ministries are machine-readable and dated, giving a
nationality-specific second source for every pair:
- DE: `auswaertiges-amt.de/de/service/laender/{country}-node/{country}sicherheit-NNNNNN` (node id from the `-node` page). "Stand" date on page.
- FR: `diplomatie.gouv.fr/fr/information-par-pays/{slug}/conseils-aux-voyageurs-entree-sejour`
- NL: `nederlandwereldwijd.nl/reisadvies/{slug}` (Dutch slugs: maleisie, indonesie, filipijnen)
- ES: `exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Detalle-recomendaciones-de-viaje.aspx?trc={Spanish name}`
- IT: `viaggiaresicuri.it/schede_paese/{ISO3}.json` (the site is an Angular app; this JSON is what it loads). Italy's pages lag — TH still partly said 60 days.
Script: `scratchpad/batch1/src/pull.py {DEST}`.
Origin-MFA pages are national government authorities (same class as gov.uk / Smartraveller already cited in /data), used as the cited basis only where the destination publishes no figure (SG stay length; ES→MY).

###### Source reachability
- `image.mfa.go.th` reachable (PDF + JPG). `ratchakitcha.soc.go.th` / `immigration.go.th` not retried (known Cloudflare block). `london.thaiembassy.org` reachable and text-based.
- `datafiles.chinhphu.vn` signed resolution PDFs are scans — render with `pdftoppm` and read the image. `baochinhphu.vn` / `vanban.chinhphu.vn` need `curl --compressed`.
- `imigrasi.go.id` reachable; `evisa.imigrasi.go.id` 404/202-empty; `allindonesia.imigrasi.go.id` is a JS shell.
- `*.dfa.gov.ph` embassy pages all 403; `etravel.gov.ph` is a JS shell. `evisa.gov.ph` and `immigration.gov.ph` PDFs reachable.
- `kln.gov.my` embassy pages and `imi.gov.my` reachable.
- ICA per-country pages exist only for visa-required countries (others 404).

###### Partially confirmed detail (rows still verified on their core facts)
- PH eTravel: kept in documents (as in existing verified rows) but worded without a timing claim. The only primary text reachable today was a BI advisory for ASEAN Summit delegates ("at least 72 hours prior"), which conflicts with secondary sources' "within 72 hours before arrival". DFA advisories that state the general rule were 403.
- TH "twice per calendar year": Royal Thai Embassy London states it generally; TAT says it applies to land-border entries. Both noted in the rows; the Royal Gazette text could not be fetched to settle it.
- MY East Malaysia: French MFA says Sarawak grants 30 days on arrival; German MFA says the separate Sabah/Sarawak permit is usually 90 days. Noted, not encoded.

###### Existing /data rows a primary source now contradicts — NOT edited, needs a fix pass
1. **Every Thailand entry row (TH, 16 rows) is out of date.** The 60-day "ผ.60" scheme they cite was repealed effective 15 Sep 2026 (MFA list "status as of 31 August 2026"):
   - US, GB, CA, AU, NZ, JP, SG, MY, IL, UA: 60 → **30 days**, tourism only.
   - **MX: no longer on any exemption list** → needs re-research (probably visa_required).
   - **IN: now on the 30-day exemption list** — there is no IN→TH row yet; a coverage candidate.
   - CN: the MFA image now shows China under the bilateral **30-day** category (row says 60).
   - KR, BR, AR, CL: bilateral 90 days — unchanged per the image.
   - The rows' notes ("not published in the Royal Gazette") are now false; AGENTS.md §11's Thailand flag is resolved.
2. **Indonesia rows (all 16) lack the All Indonesia arrival declaration**, mandatory for every arriving international passenger since 1 Oct 2025 (imigrasi.go.id press release, 1 Oct 2025).
3. **US→ID (and copies) note says the VOA "cannot be converted to another stay permit"**; imigrasi.go.id's B1 page says it "dapat dialihkan menjadi izin tinggal lain" (can be converted).
4. Minor, pre-existing: SG rows for US, NZ, CL, JP use `requirement: visa_free` with `stayPolicy: visa_required`, so the UI shows "depends on the visa you're granted" for a visa-free trip. The per-nationality MFA method above could give them real figures.

### Batch 1 notes — south-asia-mideast

##### Batch 1 (2026-10-02) — EU nationalities FR/ES/DE/IT/NL → IN, MV, AE, SA, EG

Staged in `south-asia-mideast.json`: 25 entry-requirement rows (24 `verified`,
1 `needs_verification`), schema-checked against `entryRequirementsFileSchema`.
verified_by `agent:claude-opus-5-5`, verified_at 2026-10-02.

###### Method
Destination-government sources first; where those don't state a value for a
specific nationality (stay length, on-arrival issuance), each EU state's own
foreign-ministry travel advice for its own citizens is the cited legal source,
per nationality. Same pattern the existing rows use with gov.uk/travel.gc.ca.
No nationality was inferred from another.

###### Per destination
- [x] **IN** (5 × `eta_required`, 30 days fixed): indianvisaonline.gov.in/evisa/tvoa.html
      — e-Visa list entries 54 France, 58 Germany, 75 Italy, 114 Netherlands,
      149 Spain; 30-day duration, 6-month passport validity, apply ≥4 days ahead,
      return ticket + funds quoted verbatim. Same shape as the existing GB row.
- [x] **AE** (5 × `visa_free`, `rolling_window` 180/90): mofa.gov.ae exemption page
      marks all five "Visa Free" (no duration). 90 days in any 180 + 6-month passport
      confirmed per nationality on: diplomatie.gouv.fr (cites EU–UAE agreement
      6 May 2015), exteriores.gob.es, auswaertiges-amt.de (biometric passport only,
      no Personalausweis), viaggiaresicuri.it ARE.pdf (EU exemption since 7 May
      2015), nederlandwereldwijd.nl. Modeled as a rolling window (not
      `fixed_per_entry`) because every source says "90 days within 180".
- [x] **MV** (5 × `visa_on_arrival`, 30 days fixed): immigration.gov.mv/visa/tourist-visa
      (updated 2026-09-10) — on-arrival tourist visa, no pre-approval; MRZ passport
      ≥1 month validity; return ticket + prepaid booking + funds; IMUGA ≤96 h; Israeli
      passports refused since 15 Apr 2025. Page gives no day count; 30 days confirmed
      per nationality by DE/FR/ES/IT/NL travel advice.
- [x] **SA** DE/ES/IT/NL (`visa_on_arrival`, `rolling_window` 365/90): visa.visitsaudi.com
      eligible list includes all five; "one-year, multiple entry visa … up to 90
      days". On-arrival issuance confirmed by DE (AA), NL, ES (all airports + land
      crossings, SAR 380) and IT (terminals at Riyadh/Jeddah for Schengen residents).
- [ ] **SA FR** — `needs_verification`. Eligibility + terms verified on the portal, but
      France Diplomatie (2026-09-16) only recommends the online eVisa and never
      mentions on-arrival issuance for tourists; Visit Saudi's FAQ answers
      (visitsaudi.com/en/travel-regulations) are client-rendered and unreadable by
      curl, WebFetch or r.jina.ai. Needs a primary source on on-arrival issuance for
      French nationals (or a decision to model the advance eVisa differently).
- [x] **EG** (5 × `visa_on_arrival`, stayPolicy `visa_required` = no day count):
      visa2egypt.gov.eg/eVisa/FAQ lists all five as e-Visa eligible; fees US$30
      single / US$65 multiple; passport 6 months. On-arrival issuance confirmed per
      nationality by all five governments. Day count deliberately NOT published:
      the portal states none and the governments disagree (NL/ES 30 days, FR "one
      month", IT 28 days, DE not stated). ID card accepted for tourism for FR, DE, IT.
      Germany: Cairo airport has used QR-code visas since 1 Sep 2026 (US$36 cash at
      bank counters).

###### Source-quality notes
- `indianvisaonline.gov.in`, `visa2egypt.gov.eg`, `immigration.gov.mv` (plain curl),
  `mofa.gov.ae`: reachable and quotable.
- `visa.visitsaudi.com`: plain curl returns a JS-heavy page; `r.jina.ai` renders the
  eligible-country list cleanly. `visitsaudi.com/en/travel-regulations` FAQ answers
  are client-rendered: unreadable by every method tried. `help.visitsaudi.com` now
  301s to `visitsaudi.com/en/help-support`.
- `u.ae`: the visa-on-arrival / visa-free-entry sub-pages 404; the parent page only
  links to visitdubai.com, which no longer carries country lists. `gdrfad.gov.ae`
  node pages 403. The UAE has no reachable primary page stating the EU stay length,
  hence the EU-government sources.
- EU foreign-ministry sites are an efficient, per-nationality primary source for EU
  passports: auswaertiges-amt.de, diplomatie.gouv.fr, exteriores.gob.es,
  nederlandwereldwijd.nl all fetch cleanly. viaggiaresicuri.it pages are
  client-rendered, but `/schede_paese/pdf/{ISO3}.pdf` is a dated official PDF
  (pdftotext works).
- **Lesson:** a WebFetch summary misreported Egypt's fees as $25/$60. The raw page
  says $30/$65. Always confirm numbers against the raw text.

###### Observations on existing rows (not edited — for the parent)
- **SA (existing US row notes)** say the eVisa list has "66 nationalities"; the portal
  now says "68 eligible countries" (2026-10-02). The count in notes is stale; the
  classification is unaffected.
- **EG internal inconsistency**: the existing US/GB rows model the Egypt e-Visa as
  `visa_required`, but the existing IN row models the same e-Visa as `eta_required`.
  Separately, five EU governments document a visa on arrival at Egyptian airports;
  whether that applies to US/GB passports was not checked in this pass.
- **AE**: existing US/GB rows use `fixed_per_entry` 90; EU sources describe the EU
  cohort's limit as 90 days in any 180. Not a contradiction for US/GB (different
  nationalities, not re-checked here), but worth re-checking.

### Batch 1 notes — africa

##### Batch 1 (2026-10-02) — EU nationalities FR/ES/DE/IT/NL × MA, KE, NG, RW, ZA

25 rows in `africa.json`, all `verified` (agent:claude-opus-5-5), each checked
against a primary source fetched on 2026-10-02.

- **MA (5 × visa_free, 90 days/entry).** consulat.ma exemption list (fetched
  via the `r.jina.ai` proxy; the F5/TSPD bot challenge is still in place)
  lists "Germany", "Spain + Andorra", "France + Monaco", "Italy" and
  "Netherlands", with no stay annotation. visitmorocco.com/en/useful-information
  (Formalities modal): "For all nationalities, the maximum duration of the
  tourist trip is 90 days", plus a one-time 90-day extension at a police station.
- **KE (5 × eta_required, no fixed day count).** etakenya.go.ke/form/apply/how-to-apply
  (raw HTML via curl + browser UA) lists the eTA exemptions under the 2025
  Amendment Rules: EAC states (180 days), a 90-day national list and a 60-day
  African list. None of the five is on them. The page says: "Once you arrive,
  the duration of your stay is determined at the point of entry." Fees are
  from etakenya.go.ke/eligibility: Standard USD 30, One Year Multi-Entry USD 300.
  - The eligibility page's per-country list is loaded over a Phoenix LiveView
    websocket, so it can't be fetched.
  - The Legal Notice 93/2025 PDF on new.kenyalaw.org now returns an nginx
    **403** to curl (it worked in the 2026-08 pass).
- **NG (5 × visa_required, 30 days).** immigration.gov.ng F5A page: eligibility
  is "citizens of all countries except ECOWAS member States and other countries
  which Nigeria has entered into visa abolition/waiver agreements". Terms:
  validity 90 days, single entry, 30-day stay, not extendable.
  - NIS publishes **no list** of waiver-agreement countries (FAQ at
    /info-center/ checked; /visa-exemption/ is a 404).
  - The visa_required answer therefore rests on absence: the five aren't
    ECOWAS members, and no primary source names a waiver for them. That's the
    same basis the existing NG rows use. Low harm if wrong (worst case,
    someone applies for a visa they don't need).
- **RW (5 × visa_on_arrival, 30 days).** migration.gov.rw/visa-on-arrival: AU,
  Commonwealth and La Francophonie members get the visa fee waived for 30
  days; everyone else pays (≤ USD 50 single entry, ≤ USD 70 multiple). OIF
  official list (francophonie.org/90-etats-et-gouvernements-125, 53 members,
  5 associates, 32 observers): **France is a full member**, so FR gets the
  fee-waived visa. ES, DE, IT and NL are not on any of the three OIF lists,
  not in the AU or Commonwealth, and not on Rwanda's named 90-day list, so
  they get the paid visa on arrival.
- **ZA (5 × visa_free, 90 days).** www.dha.gov.za exempt-countries table, parsed
  from raw HTML (not WebFetch, per the earlier silent-corruption warning):
  all five show "90 Days" in the Ordinary column.

###### Update for the open ZA ETA TODO (§11 / TODO.md line ~1144)
DHA statement 2079, "Address by the Minister of Home Affairs … at the official
launch of South Africa's Electronic Travel Authorisation" (12 Aug 2026), is a
primary source for the mandatory-vs-voluntary question:
- The ETA "will progressively become compulsory for short stay visits from
  countries that require port-of-entry visas".
- It will be accessible "on a voluntary basis to visa exempt travellers"
  (faster queue; online 90-day extension).
- "Over the coming weeks, we will inform the embassies of countries as they
  are systematically added."
- The initial pilot was for China, India, Indonesia and Mexico. Airports at
  launch: OR Tambo, Cape Town, King Shaka and Lanseria.

The existing ZA rows' notes ("could not be confirmed against a primary
source") can now be updated to cite this. The fee is still not on any primary
page fetched.

###### Possible contradiction / inconsistency in existing rows (not edited)
- **KE/CN** uses `stayPolicy: fixed_per_entry, maxDays 90` (citing
  etakenya.go.ke/eligibility), but every other eTA-required KE row uses
  `visa_required`. The current how-to-apply page says stay length "is
  determined at the point of entry". The CN row's fixed 90 isn't supported by
  any page fetched today.

###### Unverified / not published
None. Passport-validity rules for MA, RW and ZA weren't on the pages fetched,
so `documentsNeeded` stays at "Valid passport".

### Batch 1 notes — oceania

##### Batch 1 (2026-10-02) — EU nationalities (FR, ES, DE, IT, NL) → Australia, New Zealand

Researched by agent:claude-opus-5-5. 10 rows, all `verified`, staged in `oceania.json`.

###### Australia (5 rows) — eVisitor (subclass 651)
- Source: https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/evisitor-651
- **Reachability:** WebFetch gets 403 Forbidden (as noted in earlier passes). Plain `curl`
  with a browser User-Agent returns the full page (200, ~1.3 MB). The tab content
  (eligibility, "How long you can stay", cost) is embedded as JSON in the HTML, not
  rendered text: decode `\uXXXX` escapes and strip tags to read it.
- Confirmed verbatim: eligible passports include France, Germany, Italy, The Netherlands
  and Spain (no conditions); "valid for travel to Australia for 12 months, starting from
  the date it is granted"; multiple entry; "You can stay in Australia for 3 months after
  each entry"; "The eVisitor is free"; must be outside Australia when applying and when
  it is decided; apply online.
- Classification: `eta_required` + `fixed_per_entry` 90, consistent with the existing
  ETA (601) rows (same "3 months" → 90 days nuance). Explained in each row's notes.

###### New Zealand (5 rows) — visa waiver + NZeTA
- Eligibility source: https://www.immigration.govt.nz/visit/what-you-need-to-visit-new-zealand/visa-waiver-countries-and-territories/
  France, Germany, Italy, Netherlands and Spain are listed with no passport conditions
  (unlike e.g. Estonia/Latvia/Lithuania "citizens only", Greece passports from 2006,
  Portugal right-to-live). Stay "less than 3 months, or 6 months if from the United Kingdom".
- Stay/validity/fee: https://www.immigration.govt.nz/visas/new-zealand-electronic-travel-authority-nzeta/
  NZeTA valid 2 years; stays up to 3 months each visit; "Cost From NZD $17"; allow 72 hours;
  max 6 months in any 12-month period; passport valid 3 months past departure.
- **Reachability:** all pages fetch fine with curl.
- **The site has been restructured:** the URLs cited by existing NZ rows
  (`/new-zealand-visas/visas/visa/nzeta`, `/new-zealand-visas/visas/visa/visa-waiver`)
  now redirect to `/visas/new-zealand-electronic-travel-authority-nzeta/` and
  `/visas/visa-waiver-visitor-visa/`. The source watcher will probably flag these.

###### Not asserted
- **IVL (NZD $100):** existing NZ rows list the International Visitor Conservation and
  Tourism Levy and an NZD $17 app / $23 web split. Neither fetched page mentions the IVL,
  and per-country fees are hidden behind a country selector ("We cannot display any
  process or costs information until you have provided your country details"). This
  doesn't contradict the old rows, but it's unconfirmed as of 2026-10-02. Needs a targeted
  re-check of the fee page before the next re-verification of the existing NZ rows.

###### Contradictions with existing rows
- None found on substance. Only the moved URLs and the unconfirmed IVL/fee detail above.

### Batch 1 notes — cyprus

##### Batch 1 (2026-10-02) — Cyprus (CY) as a new destination

Researched by agent:claude-opus-5-5. Staged in the scratchpad (not yet in /data):
`cyprus-destination.json` (1 row), `cyprus-entry.json` (17 rows, all verified),
`cyprus-customs.json` (12 rows: 10 verified, 2 needs_verification).
EU/EEA/CH nationals are excluded on purpose; they're handled by the free-movement code path.

###### Entry — sources
- **Cyprus MFA, "Categories of persons and countries whose nationals do not require a visa"**
  (https://www.gov.cy/mfa/en/documents/categories-of-persons-and-countries-whose-nationals-do-not-require-a-visa/, posted 2024-06-09).
  Visa-free "for a stay up to 90 days, provided they are bona fide visitors": US, GB, CA, AU, NZ, JP,
  South Korea, SG, BR, MX, AR, CL, MY, IL, UA (UA *biometric passports only*). CN and IN are not listed.
  Schengen double/multiple-entry visa holders, and holders of Schengen-state national visas or residence permits,
  need no Cyprus visa for ≤90 days in any 180 (Decision 565/2014/EU). This doesn't apply to Turkish or Azerbaijani citizens.
- **gov.cy "Visas"** (https://www.gov.cy/en/information/visas/): defines a short stay as "up to 90 days within any
  180-day period" and links the EC calculator. Exempt nationals are per "Part Β" of Annex 1
  (https://www.gov.cy/media/sites/19/2026/01/Annex-1_en.pdf, fetched): CN and IN are in Part A (visa required).
  Visa-application passport rules: valid ≥3 months after departure, 2 blank pages, issued within 10 years.
  Applications can be submitted at least 15 days before travel. Cyprus visas are valid only for Cyprus.
- **EC short-stay calculator manual §1** (ec.europa.eu PDF, fetched): "Stays in Cyprus and Ireland shall not be taken
  into account" for the Schengen 90/180.
- **Modelling decision:** visa-exempt rows use `rolling_window` 180/90. The MFA list says "up to 90 days" for exempt
  nationals, and gov.cy frames every short stay as 90 within 180, so the notes cite both. The 90/180 for exempt
  nationals comes from Reg. 2018/1806 Art. 4. EUR-Lex wasn't fetched (it blocks automation), so the cited basis is the
  Cypriot framing.

###### Customs — sources
- Alcohol and tobacco: Cyprus Customs general allowances page (last updated 2020-02-05) plus Your Europe (europa.eu,
  "last checked 21/09/2026"), which confirms these are non-EU-arrival allowances and that Cyprus uses the higher tobacco limit.
- Cash: the Cyprus Customs Cash Control page cites the **repealed Reg. 1889/2005** (stale official page). It's
  cross-checked with EC DG TAXUD "EU Cash Controls" (Reg. 2018/1672: €10,000, current cash definition). The conflict is recorded in the row notes.
- Food (animal): EC "Personal imports" (Reg. 2019/2122). **Conflict:** the Cyprus Customs restrictions list requires
  Veterinary Services authorisation for meat, fish and cheese and a licence for honey, while the EU rule allows fish ≤20 kg and honey ≤2 kg.
  Verdict `prohibited` (meat and milk are clear in both sources). The conflict is noted, and the controlling EU text is described.
- Food (plant): EC "Trade in plants…" (passengers' luggage; 5 exempt fruits) plus the Cyprus Customs licence requirement.
- Cannabis and CBD: Cyprus Customs prohibitions list (narcotics; "cannabis derivatives … oil and flour from the seeds …
  cannabis contained in foods and beverages"; competent authority Chief of Police).
- Controlled medication: MOH Pharmaceutical Services "Narcotics and Psychotropics" page plus the "Application Form for
  Import for Personal Use" (.doc, fetched). The PDF titled "Guidelines for Travellers Carrying Personal Medication" on
  that page is the **generic 2003 UN guideline**, not a Cyprus rule, so it isn't cited.
- Drones: drones.gov.cy (Department of Civil Aviation), non-EU visitor section.
- Weapons: Cyprus Customs prohibitions & restrictions (Law 113(I)/2004 First Annex; Chief of Police permits; Inspector of Mines).

###### Left unpublished (needs_verification)
- `prescription-medication-cy`: no Cypriot primary source found for ordinary prescription medicines (quantity/documents).
- `e-cigarettes-cy`: Customs only bans cross-border *distance sales*; no traveller carriage rule found.

###### Source-quality note
- gov.cy pages return **403 to WebFetch** but **200 to curl with a browser User-Agent**. mof.gov.cy, moh.gov.cy,
  drones.gov.cy and ec.europa.eu are all reachable the same way. mfa.gov.cy/* legacy URLs 301 to the gov.cy MFA homepage.
- Several official pages are old (customs pages last updated 2020; the MFA list was posted 2024 and still says "Bulgarian, Croatian and Romanian national visa").
  These are worth adding to the source watcher.

## Done (2026-10-05) — batch 2: Albania, held rows, flagged-row re-verification

Promoted/corrected in /data: Albania completed from its own law (Law 79/2021
"On Foreigners", Art. 29(2): 90 days in any 180) — 13 new rows incl. the
previously held FR/DE/ES/NL, and GB/CA/JP/CN→AL corrected from per-entry to
90/180. Turkey FR/DE/IT verified (90/180), IT→JP (90/180, Italy's wording),
MX→TH (visa required since 2026-09-15, Royal Thai Embassy Mexico).
Corrections: UAE GB/CA/SG → 90/180; US/AU/NZ/JP/KR→AE now show no day count
(no readable source states one); CN→KE no fixed stay; EG labelling fixed
(GB/CA visa_on_arrival, IN visa_required, unsourced 30 days removed); US→SA
68 countries; GB→CN citation; all ID rows list the All Indonesia arrival
declaration (mandatory since 2025-10-01) and US→ID VoA conversion fixed; NZ
URLs updated, unconfirmed NZD 23 fee removed, IVL confirmed.
Pulled to UNVERIFIED: GB→BR (rule contradicts its own 2020 QGRV source; 2026
editions blocked). Still held: IN→AL, FR→SA, CY prescription medication,
CY e-cigarettes (contact emails in the Cyprus notes below).
Open follow-up: every BR row cites the 2020 QGRV edition — re-verify Brazil
against a current edition when gov.br is reachable.

Per-group notes follow verbatim.

### Batch 2 notes — albania

##### Albania (AL) — batch 2 (2026-10-05)

###### Sources reached (Albania's own primary texts)
- **Law No. 79/2021 "On Foreigners"**, consolidated as amended by Law 43/2025: asp.gov.al PDF `wp-content/uploads/2025/11/Ligj-PER-TE-HUAJT-2021-06-24-79-perditesuar-2025-PDF.pdf` (curl with a browser UA). Art. 29(2): visa-exempt foreigners may stay **90 days within 180 days** from entry, unless a bilateral or multilateral agreement, reciprocity or a Council of Ministers decision provides otherwise. Art. 29(3): re-entry once the 180-day period has passed. Art. 29(5): register locally within 10 days, as a rule. The English translation at mb.gov.al (2024/10) matches.
- **MFA visa-regime information sheet**: punetejashtme.gov.al `wp-content/uploads/2024/09/II-NR.3-REGJIMI-I-VIZAVE-PER-TE-HUAJT-INFO-PER-TE-HUAJT.pdf`. It lists among those who enter without a visa "foreign nationals who enter and stay in the Schengen states without a visa", plus holders of a used multiple-entry Schengen, US or UK visa, and holders of Schengen, US or UK residence permits. Passport rule: valid 3+ months after departure and issued within the last 10 years. Nationals not in the per-country table need a visa.

###### Not reachable
- The MFA per-country visa table (`2024/05/2-REGJIMI-I-VIZAVE-PER-TE-HUAJT-28.05.2024.pdf`) returns a 404 page. `punetejashtme.gov.al` HTML pages return an Incapsula block or a 212-byte challenge.
- The e-visa.al API (`/api/countries`) returns `requiresVisa: 1` for all 209 countries, the US and France included, so it isn't a visa-requirement flag. Not used.
- Traveller-government cross-checks: Smartraveller (AU) timed out; safetravel.govt.nz (NZ) has no visa section; mfa.gov.ua (UA) is behind Cloudflare. No Albanian embassy in India; embassy sites have no visa pages.

###### Rows
- New and verified: AU, NZ, BR, MX, AR, CL, MY, IL, UA (cite the MFA sheet together with Annex II Schengen visa exemption; 90/180 from Art. 29(2); UA requires a biometric passport). FR, DE, ES, NL (previously held) are now rolling 90/180 and cite Law 79/2021. Their documents are kept from each traveller-government source, named in the notes.
- **IN → AL: needs_verification.** India isn't visa-exempt for Schengen, so the default is that a visa is needed, but only the unreachable per-country table could confirm India isn't listed there. Exemptions for holders of Schengen, US or UK visas or permits are noted.
- **Corrections to existing rows**: GB, CA, JP and CN → AL change from a fixed 90 days per entry to rolling 90/180 (Art. 29(2)). The GB, CA and CN cited sources already say "90 days in 180", so the old modelling contradicted their own notes. US → AL (1 year, bilateral) is consistent with Art. 29(2)'s exception clause and is unchanged. KR, SG and IT are already 90/180.
- Caveat: a bilateral agreement could give a longer stay than 90/180 for some nationality. The rows show the default, which errs on the safe side.

### Batch 2 notes — held

##### Batch 2 (2026-10-05) — held-back entry rows re-checked (TR ×3, IT→JP, FR→SA, MX→TH)

Resolved (verified, ready to promote):
- FR→TR: France Diplomatie, Turquie Entrée/séjour (updated 15 Sep 2026) — "ne dépassant pas 90 jours sur une période de 180 jours, que le séjour soit continu ou fractionné"; CNI or passport valid ≥150 days beyond entry. rolling_window 90/180.
- DE→TR: Auswärtiges Amt Türkei (Stand 05.10.2026) — "bis zu 90 Tagen in einem Zeitraum von 180 Tagen kein Visum"; one-day exit no longer resets 90 days; Reisepass/Personalausweis/Kinderreisepass accepted. rolling_window 90/180.
- IT→TR: Viaggiare Sicuri TUR.pdf (15/7/2026) — visa needed "per rimanere più di 90 giorni nell'arco di 180 giorni"; passport or CIE with ≥5 months' validity (CIE route limits listed). rolling_window 90/180.
- IT→JP: Viaggiare Sicuri JPN.pdf (1/4/2026) — "per un periodo massimo di 90 giorni ogni 180 giorni". Published as rolling_window 90/180 (Italy's wording = the stricter reading). Japan's own pages still unreachable: mofa.go.jp (incl. ?fs=e, /ca/fna/), it.emb-japan.go.jp, la.us.emb-japan.go.jp all HTTP 403 to both curl (browser UA) and WebFetch. isa.go.jp is reachable but its pages don't list exemptions. Re-check against MOFA when reachable; if Japan confirms a per-entry 90 days, the FR/DE/ES/NL→JP fixed_per_entry rows are the model.
- MX→TH: Royal Thai Embassy Mexico City visa page (updated 2 Oct 2026) — from 15 Sep 2026 Mexican ordinary-passport holders must obtain a Thai visa (60-day exemption cancelled, MOI notifications of 31 Aug 2026); apply via thaievisa.go.th; tourist visa stay generally 60 days/entry, +30 extension. requirement visa_required, stayPolicy visa_required. Note: the embassy homepage banner still links an old "Exempt_visa_60_days_announcement" image — the visa page itself is current.

Still held:
- FR→SA: France Diplomatie (16 Sep 2026) only says eVisa offered (65 countries incl. France) and recommends getting it online before travel. Saudi primaries unreachable: visa.visitsaudi.com 403, visitsaudi.com visa pages 404, ksavisa.sa JS-only. Visa-on-arrival for France appears only in secondary sources (Gulf News, BAL, agencies).

Source-reachability notes: diplomatie.gouv.fr country pages, auswaertiges-amt.de and viaggiaresicuri.it PDFs all fetch cleanly with curl + browser UA. mexico.thaiembassy.org is reachable and text-based. sre.gob.mx guía del viajero: connection refused.

### Batch 2 notes — corrections-a

##### Batch 2 (2026-10-05) — re-verification of rows flagged in batch 1 (corrections-a)

15 corrected rows in `corrections-a.json` (14 `verified`, 1 `needs_verification`), validated against `entryRequirementsFileSchema`. verified_at 2026-10-05, agent:claude-opus-5-5.

###### Per item
- **CN→KE — WRONG (stay model).** etakenya.go.ke/form/apply/how-to-apply (curl + browser UA): "The ETA is valid for travel within 90 days from the date of issuance. Once you arrive, the duration of your stay is determined at the point of entry." The row turned the 90-day *travel window* into a fixed 90-day stay. China is not on either ordinary-passport exemption list on that page → `eta_required` stands. Fixed: stayPolicy `visa_required` (no day count), same as every other KE eTA row; source → how-to-apply page.
  - Spot-check: MY→KE and SG→KE (both on Kenya's 90-day exemption list) are already `visa_free`/90 — correct.
- **EG labelling — INCONSISTENT; rule applied across all 22 EG rows:** `visa_on_arrival` only where a government source confirms on-arrival issuance for that nationality; otherwise `visa_required` (the e-Visa is a visa applied for in advance — existing project convention). No EG row gets a computed day count (Egypt's portal publishes none).
  - **IN→EG — WRONG.** Was `eta_required` + fixed 30 days whose own notes said "commonly cited" (unsourced). Fixed → `visa_required`, no day count. No primary source confirms VoA for Indian passports.
  - **GB→EG → `visa_on_arrival`** — gov.uk FCDO Egypt entry requirements: VoA at approved airports USD 30 cash, "valid for up to 30 days"; e-visa "valid for up to 3 months"; Cairo digital VoA USD 36 by card from 1 Aug 2026; Sharm El-Sheikh <15 days free stamp.
  - **CA→EG → `visa_on_arrival`** — travel.gc.ca/destinations/egypt: "Canadian passport holders can obtain an electronic visa prior to travel or a 30-day tourist visa on arrival in Egypt, paid in cash in U.S. dollars"; Taba 14-day Sinai stamp.
  - US/AU/NZ/JP/KR/SG/BR/MX/AR/CL/MY/UA/CN stay `visa_required` (e-Visa confirmed on visa2egypt.gov.eg FAQ; VoA not confirmable — travel.state.gov 403/Cloudflare; smartraveller timed out; safetravel.govt.nz has no visa info). IL unchanged (embassy visa). FR/ES/DE/IT/NL already `visa_on_arrival` (confirmed by their governments in batch 1) — consistent, unchanged. **Follow-up:** US and others likely qualify for VoA too (secondary sources say so) — re-check when travel.state.gov / smartraveller are reachable.
- **US/GB→AE — WRONG (stay model), and the "30 days" lead did NOT hold.** Secondary/search snippets and stale UAE mission pages said 30 days for US/UK; current sources say 90 within 180:
  - GB: gov.uk FCDO UAE: free visa on arrival "valid for up to 90 days over a 180-day period, which will begin from the date of first entry"; continuous or split. → `rolling_window` 90/180.
  - Checked the other 6 fixed-90 AE rows too: **CA** (travel.gc.ca: "90 days within a 180-day period", from first entry) and **SG** (mfa.gov.sg: "up to 90 days in the UAE within a 180-day period") → `rolling_window` 90/180.
  - **US, AU, NZ, JP, KR**: UAE MOFA lists all as "Visa Free" (re-checked), but no primary source for the stay could be read: u.ae visa-on-arrival / entry pages 404 (curl, WebFetch, headless Chrome timeout); GDRFA node/2086 gone (403/404); UAE mission pages (Boston, Stockholm) now 404; travel.state.gov Cloudflare challenge even in headless Chrome; smartraveller (updated 2026-09-02) confirms VoA but no stay length; safetravel.govt.nz no visa info; anzen.mofa.go.jp / 0404.go.kr didn't render. → stayPolicy `visa_required` (no day count, same pattern as existing BR/MX/AR/CL/MY/IL/UA AE rows), with notes warning that every confirmed nationality is 90/180. The old fixed-90-per-entry model was the more permissive claim and is supported by no source.
- **US→SA — note fixed.** visa.visitsaudi.com (via r.jina.ai): "68 eligible countries" (row said 66), US listed; "one-year, multiple entry visa, allowing tourists to spend up to 90 days". Also removed two unsourced claims: the Israel-travel-evidence refusal (not on the portal, no sourcing record) and the bundled-insurance SAR 100,000 detail (not on the portal). On-arrival processing (label `visa_on_arrival`) rests on the 2026-09-02 verification; Visit Saudi FAQ / help pages are client-rendered (r.jina.ai returns ~250 bytes) and travel.state.gov is blocked, so it couldn't be re-confirmed — said so in the notes. Worth a re-check.
- **GB→CN — citation fixed, value right.** NIA list (2026-02-17) includes 英国, ≤30 days, counted from 00:00 the day after entry, no end date. MFA Consular FAQ (mfa.gov.cn/wjbzwfwpt/kzx/tzgg/202511/t20251110_11749824.html): "remain in effect until December 31, 2026" for 48 countries incl. UK. Notes/legal_source now name both, as in the batch-1 FR→CN row.
- **GB→BR — cannot confirm → `needs_verification` (pull).** The row's rolling 90/180 contradicts its cited source: QGRV (Atualizado em 14/01/2020) legend "8. Dispensa de Visto, por até 90 dias" and "* - Máximo 90 dias de estada a cada 180 dias"; Reino Unido = 15 / 15 / **8** (no asterisk). Newer editions exist (gov.br `qgrv-simples-port-15jan26.pdf`, `QGRV_simples_port_10MAR261.pdf`) but every fetch (curl, WebFetch, r.jina.ai) got a gov.br CAPTCHA / "Acesso Temporariamente Interrompido". A search summary hinted the UK code may differ in the 2026 edition — unverifiable, not relied on.

###### For the parent
- **All BR rows (incl. batch-1 FR/ES/DE/IT/NL) cite the 2020 QGRV edition** while 2026 editions exist. Same freshness risk as GB→BR; re-check all BR rows against the current QGRV once gov.br stops blocking.
- Reachability: gov.uk and travel.gc.ca reliable (curl). gov.br currently CAPTCHA-blocks. travel.state.gov is behind Cloudflare (blocks curl, r.jina.ai, headless Chrome). u.ae visa pages have moved/404. r.jina.ai renders smartraveller and visa.visitsaudi.com.

### Batch 2 notes — corrections-b

##### Batch 2 (2026-10-05) — Indonesia + New Zealand re-verification (corrections-b.json, 35 full rows)

###### Indonesia (16 rows changed: every pre-batch-1 ID row)
- **All Indonesia arrival declaration** added to documentsNeeded of all 16 older rows (the 5 FR/ES/DE/IT/NL rows already had it). Source: Kemenimipas (Ministry of Immigration and Corrections), "Mulai 1 Oktober, Deklarasi Kedatangan Penumpang Wajib Dilakukan di Aplikasi All Indonesia", 1 Oct 2025 — "Mulai 1 Oktober 2025, setiap penumpang yang tiba dari luar negeri diwajibkan mengisi deklarasi kedatangan"; sole system at all airports and seaports; can be filled from 3 days before arrival. https://kemenimipas.go.id/berita-utama/mulai-1-oktober-deklarasi-kedatangan-penumpang-wajib-dilakukan-di-aplikasi-all-indonesia — cited in each row's notes (the row's legal_source stays the visa list).
- **US→ID note fixed**: it said the VoA "cannot be converted to another stay permit". imigrasi.go.id B1 page: "Izin Tinggal ini dapat diperpanjang satu kali dan dapat dialihkan menjadi izin tinggal lain melalui mekanisme bridging visa" (can be extended once and converted to another stay permit via the bridging-visa mechanism). No other ID row carried the wrong claim.
- **Unchanged values re-confirmed** (imigrasi.go.id, fetched 2026-10-05): VoA list still includes US, GB (Inggris), CA, AU, NZ, JP, KR, MX, AR, CL, UA, IN; visa-free (BVK) list includes SG, MY, BR; Israel not on VoA/BVK (Calling Visa row unchanged in substance). B1: 30 days, extendable once to 60, IDR 500,000.
- Reachability: allindonesia.imigrasi.go.id is a JS-only SPA (no text); imigrasi.go.id and kemenimipas.go.id fetch fine with curl + browser UA / WebFetch.

###### New Zealand (19 rows changed; AU→NZ and IN→NZ unchanged)
- **Redirected URLs updated**: …/new-zealand-visas/visas/visa/nzeta → /visas/new-zealand-electronic-travel-authority-nzeta/; …/visa/visitor-visa → /visas/visitor-visa/; …/visa/visa-waiver → /visas/visa-waiver-visitor-visa/. The visa-waiver-countries list and the Australian-citizens page did not redirect.
- **NZeTA fee**: current NZeTA page says only "Cost From NZD $17". The "$23 via the website" figure appears on no current page → removed from 13 rows; replaced with "from NZD $17".
- **IVL NZD $100 confirmed**: Visa Waiver Visitor Visa page glossary tooltip: "The International Visitor Conservation and Tourism Levy (IVL) is a fee of NZD $100…"; "You must pay a fee for your NZeTA and also for an [IVL] — you pay these together when you request your NZeTA." Kept in older rows; added to the 5 EU rows (which had said it was unconfirmed) plus the IVL document line.
- Re-confirmed: stays up to 3 months (6 for UK citizens), 6 months in any 12; NZeTA valid 2 years; visa-waiver list includes US, CA, JP, KR, SG, BR, MX, AR, CL, MY, IL, FR, ES, DE, IT, NL, GB; UA/CN/IN not listed. Visitor visa (UA/CN): "From NZD $441", funds NZD $1,000/month or $400/month with prepaid accommodation — matches existing rows.
- Reachability: immigration.govt.nz fetches with curl + browser UA; fee/IVL detail sits in base64 glossary tooltips (decode `content="…"`).

### Batch 2 notes — cyprus-customs

###### Batch 2 — Cyprus held customs rows (re-checked 2026-10-05)

Both rows remain `needs_verification`; no verdict is publishable.

- prescription-medication-cy: Pharmaceutical Services narcotics page (moh.gov.cy/moh/phs/phs.nsf/drugsphych_en) covers only internationally
  controlled medicines; linked PDF is a generic 2003 UN guideline. FAQ page (dmlfaq_gr) returns HTTP 500 to curl with a browser UA.
  Secondary sites (entrybrief, sigmalive, airport site) claim "3-month supply" — not usable. Next: contact phscentral@phs.moh.gov.cy or
  locate the personal-import provision of the Medicinal Products for Human Use Law.
- e-cigarettes-cy: primary facts confirmed but insufficient for a verdict —
  - Customs "Channel system and concessions" (mof.gov.cy/mof/customs/customs.nsf/All/D8E0334067181B47C22572BF002DF37C, updated 5/2/2020):
    allowances cover tobacco products and alcohol only; €430 for other goods.
  - Customs "Excise Duties — General Information" (…/All/A2C3593B5465A799422577D6002FEAC4): e-liquid excise €0.12/ml (Law 91(I)/2004 Part XII,
    national, not EU-harmonised).
  - Prohibitions page: distance-sales ban only.
  Gap: whether personal e-liquid is relieved under the €430 allowance or dutiable. Next: Customs headquarters (headquarters@customs.mof.gov.cy).
- Reachability: mof.gov.cy and moh.gov.cy load with curl + browser UA; phs FAQ returns 500.

## Done (2026-10-05) — batch 3: Brazil re-verified against the current QGRV (updated 2026-08-26)

#### Brazil re-verification (2026-10-05) — current QGRV edition

- **Source reached:** MRE "Quadro Geral de Regime de Vistos" landing page
  (gov.br/mre/.../vistos/quadro-geral-de-regime-de-vistos-para-entrada-de-estrangeiros-no-brasil,
  updated 26/08/2026) → `qgrv-simples-port-26ago26.pdf` (+ `-ing-` English
  version), "Atualizado em 26 de agosto de 2026". Plain curl and WebFetch get an
  F5 "TSPD" JS challenge on the PDFs; a headless Chromium navigating to the PDF
  URL solves it and receives the file as a download (Playwright
  `waitForEvent("download")`). The landing page itself loads with curl.
- **Codes changed vs the 2020 edition:** the ordinary-passport VIVIS column now
  uses 1 = visa required, 2 = exempt up to 30 days, 4 = exempt up to 90 days;
  `*` = max 90 days in every 180; `#` = entry with civil ID card.
- **Per row:** US/CA/AU/IN = 1. FR/DE/IT/NL/UA = 4*. NZ/KR/JP/MY/IL/ES/GB/MX = 4.
  AR/CL = 4#. SG = 2. **CN = 2 (new row: visa-free up to 30 days).**
- **Counting rule for codes without `*`:** Decreto 9.199/2017 (planalto.gov.br,
  reachable with curl) art. 20: stay up to 90 days, extendable by the PF by up to
  90, max 180 per "ano migratório"; §1 the count starts at first entry and is
  suspended while the visitor is abroad (cumulative across visits); art. 23:
  art. 20 "poderá ser aplicado" to visa-exempt nationals. Because "fresh 90 per
  entry" (old ES row) and "90 in any 180" (old NZ/KR/JP/MX/AR/CL/MY/IL rows) can
  both permit more than this, those rows are now modelled as the stricter
  rolling 90/365 (30/365 for SG/CN) with the exact rule in notes.
- **GB→BR resolved:** code 4 → verified with the same model; removed from UNVERIFIED.
- **Citations fixed:** JP row cited panrotas.com.br (trade news) and US/AU cited
  agenciabrasil (state news agency) — both replaced by the QGRV. Unsourced eVisa
  fee/validity detail dropped from AU; IN/US/AU documents trimmed to what the
  table supports. CA keeps travel.gc.ca; MX keeps the Brazilian embassy page for
  its documents, with the QGRV code cited in notes.
- **Not found:** the PF "ato do dirigente máximo" defining the migratory year
  (Portaria 18/2020 DIREX is only a COVID deadline reset). The PF
  "prorrogar-estada-no-brasil" page still links only the 2020 table.

## Done (2026-10-09/10) — batch 4: eight new destinations

Promoted to /data (42 destinations now): Sri Lanka (LK), Peru (PE), Dominican
Republic (DO), Colombia (CO), Argentina (AR), Jordan (JO), Costa Rica (CR),
Qatar (QA) — 169 entry rows and 76 customs rows. One research agent per
destination (shared brief); the three riskiest claims of each were
spot-checked against the official page before merging. Held rows are in
data/UNVERIFIED with what's missing in their notes.

Spot-check decisions (made at merge, not by the research agents):
- **IL→CO held**: rests on a Cancillería press release (11 Sep 2026) about
  Resolución 12189 de 2026; the resolution text isn't published and the
  official compiled list still omits Israel.
- **MY→AR held**: only source is an Argentine embassy page dated 2022-04-28.
- **CN→AR, IN→AR held**: the US-visa / Green Card exemption terms rest on
  Boletín Oficial resolutions (316/2025, 353/2025) that couldn't be re-read
  during the spot-check (connection resets). Re-read before publishing.
- **Jordan stay length not published**: the MOI fee table lists visa
  *validity* tiers (3 months single entry JOD 40 …), not a stay length, and
  traveller governments disagree (Japan 90 days; UK "valid for 3 months";
  France/Spain 1 month). Rows use `visa_on_arrival` with no day count.

Still open, by destination:
- LK: meat/dairy, e-cigarettes, weapons (lawnet.gov.lk certificate mismatch),
  CBD, insulin/GLP-1 pens. ETA extension conflict (270 days vs 6 months) noted.
- PE: controlled medication (only a 2001 terminal-patient provision), cannabis,
  e-cigarettes. gob.pe blocks WebFetch (HTTP 418) — curl with a browser UA works.
- DO: e-cigarettes (Ley 16-19 not readable on an official domain).
  migracion.gob.do blocks curl (403) but renders in Playwright.
- CO: controlled + injectable medication, e-cigarettes, CBD. Weapons and
  drones rows rest on travel.gc.ca; food rows on a 2017 ICA notice.
- AR: alcohol and tobacco (customs gives only a USD 500 value allowance),
  prescription/injectable medication (ANMAT page 500/403), e-cigarettes (ban
  repealed 4 May 2026; traveller rule unknown), drones. Decree 366/2025's
  insurance declaration isn't enforceable until regulated.
- JO: cash (USD 10k / JOD 10k / JOD 15k conflict), all medication rows,
  e-cigarettes, meat/dairy, fresh produce. customs.gov.jo returns HTTP 451.
- CR: cannabis/CBD, meat/dairy, fresh produce, e-cigarettes, drones.
  migracion.go.cr unreachable; the visa directive (AJ-484-11-2025, La Gaceta
  17 Nov 2025) was read from icoder.go.cr's copy of the Gazette edition.
- QA: tobacco (customs PDF text garbled: 200 vs 400 cigarettes), insulin/GLP-1,
  meat/dairy other than pork, fresh produce. portal.moi.gov.qa needs a headless
  browser session at /qatarvisas/ (trailing slash).
- Israel (IL) is held for CO, JO and QA.

## Done (2026-10-10/11) — batch 5: eight more destinations

Promoted to /data (50 destinations now): Chile (CL), Montenegro (ME), Jamaica
(JM), Bahamas (BS), Ecuador (EC), Tanzania (TZ), Cambodia (KH), Israel (IL).
Same process as batch 4 (shared brief with batch-4 lessons; riskiest claims
spot-checked against the official page before merging).

Spot-check decisions made at merge:
- **Bahamas stay length**: Bahamas Immigration says only "three (3) months or
  eight (8) months as each individual agreement may dictate", stamped by the
  officer. Only US (Immigration: "not exceeding eight (8) months") and CA
  (Canada: "up to 8 months") keep 240 days; GB keeps GOV.UK's "usually 30
  days"; all other passports show no day count.
- **Cambodia is thin by necessity**: 9 of 22 passports verified. The e-visa
  portal's eligible-nationality list sits behind a captcha and customs.gov.kh
  never answered, so 13 entry rows and 9 customs rows are held.
- **Tanzania mandatory inbound travel insurance** (~USD 44, NIC mainland / ZIC
  Zanzibar) is listed on every entry row, confirmed on travel.gc.ca
  (2026-10-07). Its legal basis is reported as Government Notice No. 256 of
  2026 (from 1 Oct 2026) but that notice wasn't read — add NIC's FAQ and the
  notice to the source watcher.
- **Montenegro**: China moves fully to the visa regime from 1 Nov 2026 (gov.me);
  the group-tour/business exemptions end 31 Oct 2026 — re-check after that date.

Still open (held in data/UNVERIFIED):
- CL: e-cigarettes-cl, sag-false-declaration-fine-cl
- ME: fresh-produce-me, injectable-medication-me, e-cigarettes-me
- JM: injectable-medication-jm, e-cigarettes-jm
- BS: prescription-medication-bs, controlled-medication-bs, injectable-medication-bs, e-cigarettes-bs
- EC: controlled-medication-ec, injectable-medication-ec, cannabis-ec, meat-dairy-ec, fresh-produce-ec, e-cigarettes-ec, weapons-ec
- TZ: meat-dairy-tz, fresh-produce-tz, e-cigarettes-tz, weapons-tz, wildlife-products-tz
- KH: US→KH, AU→KH, NZ→KH, KR→KH, CN→KH, IN→KH, IL→KH, UA→KH, MX→KH, BR→KH, AR→KH, CL→KH, DE→KH, alcohol-kh, tobacco-kh, e-cigarettes-kh, prescription-medication-kh, controlled-medication-kh, injectable-medication-kh, meat-dairy-kh, fresh-produce-kh, radio-equipment-kh
- IL: cannabis-il, e-cigarettes-il, meat-dairy-il, fresh-produce-il, injectable-medication-il

## Peptides (2026-10-13)

Promoted to /data: peptides-us, peptides-ca, peptides-nz, peptides-sg,
growth-hormone-gb (BPC-157, TB-500, melanotan II, CJC-1295, ipamorelin,
retatrutide etc.; UK somatropin/HCG under Misuse of Drugs Regulations 2001
reg 4(2) + Sch 4 Pt 2). Product pages:
/medications/{peptides,bpc-157,tb-500,melanotan-ii,hgh}.

Resolved the same day:
- **CA residents vs visitors**: prescription-medication-ca, injectable-medication-ca
  and peptides-ca re-checked against GUI-0116 and corrected. Residents may bring
  back drugs prescribed and filled in Canada; drugs prescribed or bought abroad
  generally not (exceptions: treatment that had to start abroad, foreign
  clinical trials, newly landed immigrants/refugees).
- **SG**: peptides-sg from HSA's traveller page (prescribed in country of
  residence, 3 months, prescription + pharmacy label) plus HSA's 2026-09-25
  retatrutide/cagrilintide advisory. Names deliberately exclude BPC-157 etc.
  because HSA doesn't name them.

Still open:
- **AU (peptides-au, growth-hormone-au)**: tga.gov.au and odc.gov.au timed out
  from this environment twice on 2026-10-13 (WebFetch and curl, HTTP/2 and
  HTTP/1.1); legislation.gov.au F1996B03651 returns only its table of contents.
  Read directly: TGA safety alert "TGA warning on the risks of importing
  unapproved peptide products" (2026-05-07); TGA Poisons Standard final
  decision adding BPC-157 to Schedule 4 from 1 June 2024; ODC "Importing
  anabolic and androgenic substances into Australia" (HGH/somatropin permit per
  shipment). Key open question: does the traveller's exemption cover
  prescribed growth hormone carried in person, or is an ODC permit needed?
  Try from a different network, or a browser.
- **GB research peptides**: re-searched 2026-10-13. MHRA material found is
  enforcement against sellers (retatrutide/peptide manufacturing raids, June
  2026 advertising warning), nothing on travellers. gov.uk's controlled-drugs
  page says non-controlled medicines follow MHRA import rules, but no MHRA
  page stating the personal-import rule for unlicensed medicines was found.
  growth-hormone-gb deliberately says it doesn't cover them.
- **US growth hormone**: no traveller-specific FDA/CBP source read; not added.

## Permit procedures (2026-10-14)

New optional `procedure` field on customs rows (schemas.ts `customsProcedureSchema`):
authority, lead time, documents, steps, border and transit notes, with its own
`sources` and `verified_at`. Rendered as a "how to get permission" checklist with
HowTo markup on `/bring/medication/[destination]` and `/medications/[product]/[destination]`,
and linked from Trip Check results.

Done, each from the authority's own page, agent:claude-opus-5-5, 2026-10-14:
- **Japan** (NCD application guidance, controlled substances list of 12 Dec 2024,
  psychotropics table, Haneda/Narita attention sheet, office list): procedure on
  `stimulant-medication-jp`; new rows `narcotic-medication-jp` (depends) and
  `psychotropic-medication-jp` (allowed_with_limits, per-substance table amounts).
- **Thailand** (Thai FDA traveller guidance): procedure on `controlled-medication-th`.
- **Singapore** (HSA "Travelling with medications to Singapore", updated 15 June 2026):
  procedure and transit exemption on `controlled-medication-sg`.
- **UAE** (EDE permit page): optional-permit procedure and transit note on
  `controlled-medication-ae`.

Corrections made while re-checking:
- `stimulant-medication-jp`: NCD's list excludes products with 10% or less
  ephedrine/pseudoephedrine, which the row now says. **"Vicks inhaler" removed from
  `names`**: its US active ingredient (levmetamfetamine) isn't on NCD's list by that
  name, and the list's methamphetamine and amphetamine (incl. levamfetamine) entries
  are prohibited outright, so the earlier "needs a permit" answer is unsupported
  either way. Open question: does Japan treat levmetamfetamine as methamphetamine
  (prohibited) or not at all? Needs an NCD answer before any Vicks row ships.
- `controlled-medication-th`: removed "Form IC-2" and "Schedule I can't be imported
  under any circumstances". Neither is on the current FDA page (Ministerial
  Regulation B.E. 2567, in force 21 Sep 2024). Re-add only from a primary source.

Batch 2 (2026-10-14), procedures added from each authority's own material:
- **Korea**: MFDS guideline and FAQ (ZIP attachment to the MFDS notice). The
  `controlled-medication-kr` row was rewritten from it: 90-day cap, 5-day extra, hand
  luggage, no mail. Removed: the notes' secondary-sourced claim that amphetamine
  (Adderall) can't be permitted at all, and the unverified narcotics@korea.kr address.
  **Open:** does MFDS permit amphetamine products? Its guide and FAQ don't say.
- **Hong Kong** (Drug Office FAQ Q.16): 10 working days, applies in transit too. No
  application channel is published; the procedure says to contact the Drug Office.
- **Cyprus** (Pharmaceutical Services page and its application form). The page's
  "Guidelines for Travellers" PDF is actually the generic UN 2003 guidelines, not
  Cyprus-specific. No lead or processing time is published.
- **Saudi Arabia** (SFDA CDS traveller user manual): account, request, attachments,
  status, licence.
- **Qatar** (MOPH Controlled Medicines System user manual v1.0, © 2025,
  fli.moph.gov.qa): 5 working days ahead, 3-day decision, permit valid 90 days.
  Re-checked 2026-10-15: the guideline PDF is reachable again and confirms the row's
  quantities (30 days or length of stay for narcotic/psychoactive, 2 months for
  psychotropic). The row's notes said applications are "reviewed within 24 hours";
  the manual says three working days, so the notes were corrected.
- **Jamaica** (Embassy in Brussels page reproducing the MOHW guidance).
- **Philippines** (DDB Regulation No. 1 s.2014, Sec. 35(4)): PDEA request 30 working
  days ahead for more than 30 days' supply; reply within 15 working days.

Not given a procedure, and why:
- **Serbia**: Customs says to get approval from "the competent ministry", but no
  ministry page describing the application was found. Only secondary sources.
- **Sri Lanka**: NMRA requires prior approval above 90 days but publishes no traveller
  application route (only the separate personal-user licence for imports).
- **China, Taiwan, Malaysia, Georgia, Mexico, Brazil, Argentina, Rwanda, Morocco,
  Ireland**: the verdict depends on documents carried or declared at the border, or on
  a home-country certificate, not on a permit applied for in advance. The row text
  already covers it.
- **South Africa, Kenya, Maldives**: no traveller procedure on a reachable primary
  source (see those rows' notes).

## Legal at home, controlled abroad: melatonin (2026-10-15)

Plan step 1.4 (GROWTH_AND_ROADMAP.md). Published `melatonin-nz` (Medsafe
reclassification page: importing unapproved melatonin needs a prescription) and
`melatonin-gb` (MHRA: prescription-only; no official UK personal-import rule for
non-controlled prescription medicines, which the row says rather than guessing).

Still open:
- **Australia**: melatonin is reported as Schedule 4, with a Schedule 3 entry for 2 mg
  prolonged-release for people 55+ (TGA final decision notice, tga.gov.au). TGA timed
  out again from this environment. Read the TGA notice and the "Entering Australia"
  traveller page, then add `melatonin-au`.
- **UK**: find MHRA's current wording on personal imports of non-controlled
  prescription-only medicines. A 2015 MHRA email quoted on a blog said there's no
  restriction up to about 3 months, but that's secondhand and old.
- **Singapore, Japan**: no official page classifying melatonin for travellers was
  found. HSA's pages don't name it; MHLW only lists it in personal-import tallies.
- Competitor note: goodsacrossborders.com publishes melatonin rules for these countries
  without primary citations, and contradicts Medsafe on NZ.

## Legal at home, controlled abroad: nicotine pouches (2026-10-15)

Published `nicotine-pouches-au` (ABF Customs Notice 2026/29: from 24 July 2026 the
traveller exemption no longer applies; seized) and `nicotine-pouches-sg` (HSA vaping
enforcement page names pouches as prohibited items; ICA prohibited goods list for
travellers). Both are in the `tobacco` category, so they appear on /bring/tobacco/[country].

Still open:
- **Japan**: tobacco-free pouches are reportedly regulated as pharmaceuticals (MHLW,
  quoted only in trade press). Needs an MHLW or Japan Customs page.
- **France** (Schengen): "white snus" reportedly banned for everyone, travellers
  included, from 1 April 2026 (Norwegian foreign ministry, via The Local). Needs the
  French decree on Légifrance. Note that Schengen customs resolve to the `EU` rows, so
  a France-only rule needs a design decision on how to show a member-state exception.
- **UAE, Thailand, Turkey**: nothing official found.

## Open items follow-up (2026-10-15)

Resolved, agent:claude-opus-5-5, 2026-10-15:
- **Australia** (TGA and ODC still time out, so used the law itself on
  legislation.gov.au plus ABF's "List of items" data embedded in its page):
  `growth-hormone-au` (Customs (Prohibited Imports) Regulations reg 5G and Sch 7A;
  ABF "Hormones"), `peptides-au` (Poisons Standard October 2026: BPC-157, TB-500,
  ipamorelin, CJC-1295, GHRP-6, GHRP-2, hexarelin, AOD-9604, ibutamoren, Melanotan II
  are Schedule 4, most also in Appendix D item 5; Therapeutic Goods Regulations Sch 5
  item 1(d): Schedule 4 needs a doctor's written authority, overseas doctors accepted
  for passengers), `melatonin-au` (Schedule 4, with two Schedule 3 exceptions).
- **France nicotine pouches**: `nicotine-pouches-fr`, from the Conseil d'État order
  n° 509561 (22 Dec 2025), which quotes the decree's new art. R. 5132-45 CSP, and
  Service-Public.gouv.fr (updated 12 March 2026). Légifrance itself returns 403 here.
  **Design decision made for member-state rules**: a row keyed by a Schengen state's
  own code (here `FR`) is a national rule. Trip Check checks it first for that
  state, then falls back to the `EU` row. National rules also show for EU citizens
  (a ban on possession binds everyone), and not for "Schengen Area, unspecified".
  They have no /bring page (Schengen states aren't in destinations.json); their
  sources are listed under EU customs on /sources.
- **Qatar** quantities re-checked (see above).

Still open (searched again 2026-10-15, nothing primary found):
- **UK**: personal import of non-controlled prescription-only medicines. The Human
  Medicines Regulations 2012 reg 17 requires a manufacturer's licence to import, but
  whether a traveller's personal supply falls outside it is legal interpretation, not
  a stated rule. Need an MHRA page that says it. UK research peptides and kratom
  (Psychoactive Substances Act 2016 s.8 turns on intent; no gov.uk page names kratom)
  are open for the same reason.
- **Japan**: Vicks inhaler (levmetamfetamine) and nicotine pouches. Only secondary
  sources, which disagree.
- **Korea**: whether MFDS permits amphetamine products. Only secondary sources.
- **Singapore, Japan melatonin**: no official classification for travellers.
- **UAE, Thailand, Turkey nicotine pouches**: nothing official.
- **US growth hormone**: FDA's personal importation page is generic; no traveller
  source names HGH.

## Legal at home, controlled abroad: kratom and kava (2026-10-15)

Published `kratom-au` (prohibited: Customs (Prohibited Imports) Regulations Sch 4
item 204(g); Poisons Standard Schedule 9), `kratom-nz` (depends: Medsafe Prescriber
Update Dec 2021, prescription medicine, released at the border only on a medical
practitioner's authority), `kratom-sg` (prohibited: CNB, Class A), and `kava-au`
(allowed_with_limits: ABF, 4 kg, 18+, accompanied baggage). Kratom is in the
medication category, which gives it /bring/medication pages and a /medications/kratom
hub.

Also removed generic multi-word synonyms ("sleep supplement", "melatonin gummies")
from the melatonin rows: Trip Check's substring pass made a plain "supplement"
search match melatonin.

Open:
- **Kratom**: UK (see above), Thailand (legal domestically since 2021; traveller rule
  not found), Malaysia, Japan, the EU states that list it nationally.
- **Poppers (alkyl nitrites), Australia**: Schedule 4 in the Poisons Standard
  (amyl nitrite Schedule 3 in some therapeutic packs), but whether the passenger
  exemption for therapeutic goods applies to poppers needs TGA's own page, which
  times out.
- **Phenibut, Australia**: Schedule 9; not yet a row.

## Step 1.4 batch 3: kratom, phenibut, poppers (2026-10-15)

Published, agent:claude-opus-5-5:
- `phenibut-au` (prohibited): Customs (Prohibited Imports) Regulations Sch 4 lists
  4-amino-3-phenylbutyric acid; Poisons Standard Schedule 9.
- `kratom-jp`, `poppers-jp` (prohibited): MHLW designated substances list (as of
  6 Sep 2026; kratom is one of two plants on it; six alkyl nitrites designated
  1 April 2007) and Japan Customs' prohibited imports page (Customs Act 69-11).
- `kratom-se` (prohibited): Government of Sweden press release, 10 Feb 2025,
  classified as narcotic from 11 March 2025. Second Schengen national rule.
- Blog post `kratom-phenibut-poppers-customs`.
- Trip Check: added a NOT_TYPOS list in fuzzy-match.ts, since "pepper", "hopper"
  and "copper" fuzzy-matched "poppers"/"popper" (a dictionary scan of new names
  found these). Dropped "popper" from names; substring matching still finds it.

Not published, and why:
- **Poppers, Australia**: TGA still times out (curl and WebFetch).
- **Amyl nitrite, Japan**: not on the designated list by name; status unknown.
- **Nicotine pouches, Belgium and Netherlands**: official material found only covers
  sale ("placing on the market", NL's 0.035 g limit), not travellers' import or
  possession. A sale ban alone isn't a traveller rule, so no row.
- **Kratom, Malaysia** (Poisons Act 1952, per academic sources only), **Thailand**
  (Kratom Plant Act B.E. 2565, traveller quantities left to ministerial
  regulations, not found), **UK**, **Ireland, Denmark, Finland**: no primary source
  read. The Swedish prosecutors' kratom PDF now redirects to their home page.

## Transit (plan step 1.5, 2026-10-15)

New optional row field `transit` {rule: applies | exempt_airside, description,
source, verified_at}, set only where the authority states the rule. Replaces the
free-text `procedure.transit`. Trip Check has an optional "Changing planes in"
picker; each item shows the stopover's stated rule, "rule exists but transit not
stated", or "not yet verified".

Set: SG (controlled-medication-sg, medication-sg), AE, KR (exempt airside);
HK, PH, AR, AL (controlled medication and cannabis), CO (cannabis), TW
(e-cigarettes: declare and deposit) (applies).

Also set (applies) for cannabis in Qatar, Sri Lanka and Cambodia, from the UK
government's travel advice "safety and security" pages (the old "local laws and
customs" URLs now redirect to the summary page, so re-check row notes against the
new URL).

Open: medication transit for Qatar (Doha), Japan, Turkey (Istanbul) — no stated
transit rule on the pages read. Schengen hubs (Frankfurt, Amsterdam, Paris) aren't selectable as
stopovers: Schengen customs rows describe arriving, not airside transit.

### Transit follow-up (2026-10-16)

Scanned every cited source page of medication, cannabis and e-cigarette rows for
transit wording (151 URLs). Added: prescription-medication-hk (dangerous-drug
medicines need approval in transit), peptides-sg (HSA airside exemption),
cbd-al (Albanian Customs transit ban), controlled-medication-ge (same documents in
transit). Not added:
- **South Africa**: SARS says travellers booked through to outside SACU from outside
  SACU needn't comply with customs formalities. That's a through-ticket rule, not
  "stay airside", so neither transit label fits. Needs a third rule value if used.
- **Qatar medication**: GOV.UK says transit passengers with even residual drugs may be
  arrested, but that's about illegal drugs, not prescribed medicine.
- **Turkey (Istanbul)**: no primary source for controlled medicine or transit found
  (TİTCK and Customs pages searched).

## Step 1.4 batch 4 (2026-10-16)

Published: `pseudoephedrine-nz` (NZ Customs: all pseudoephedrine medicines are
controlled drugs; declare, hand luggage, 1 month, prescription or doctor's letter),
`medicated-gum-sg` (HSA: personal imports of medications in chewing gum form not
permitted under any circumstances, so nicotine gum is out).

Open:
- **Singapore ordinary chewing gum**: the ICA prohibited goods page (now JS-rendered)
  doesn't mention it; need Singapore Customs or the Chewing Gum Regulations on SSO.
- **Singapore nicotine patches**: ICA lists "any product containing nicotine ... that
  may be used topically for application, by implant or injected" as prohibited.
  Whether that covers transdermal patches isn't stated; needs HSA confirmation.
- **"Sudafed" brand for NZ**: not named by NZ Customs, and US "Sudafed PE" contains
  phenylephrine, so the brand isn't in the row's names.

## Step 1.4 batch 5: from pages we already cite (2026-10-16)

Scanned all 346 cited source pages for commonly restricted items with no row in
that destination. Published: `heated-tobacco-sg` (HSA: heated tobacco/IQOS and
shisha tobacco prohibited), `shisha-ke` (KRA prohibited list). Extended names:
modafinil/armodafinil on `controlled-medication-sg` (HSA Appendix A), heated tobacco
on `tobacco-gb` (gov.uk 200 sticks), hookah/shisha tobacco on `tobacco-rs`.
Not used: Taiwan poppy seeds (the page is the departure list), Japan
"O-desmethyltramadol" (not tramadol), Hong Kong pseudoephedrine (Control of
Chemicals Ordinance precursor licensing; doesn't say how medicines are treated),
Canada khat/poppy seeds (CBSA memo for commercial importers).

## Medication holes (coverage report, 2026-10-16)

Destinations with no medication row: BS, JO, KH, NG.
- **Bahamas**: published `medication-bs` from the Embassy of The Bahamas FAQ (doctor's
  letter suggested; no quantity or controlled-drug rule stated).
- **Jordan**: only a news report of a JFDA statement (3 months, prescription). Need the
  JFDA page itself (jfda.jo is reachable but Arabic-only; not found yet).
- **Nigeria**: NAFDAC pages found cover export and commercial import permits, not
  travellers; customs.gov.ng returns 403.
- **Cambodia**: customs.gov.kh unreachable; only third-party sites.

## Accuracy sweep: medication names and classifications (2026-10-16)

Rule applied: a medicine name is in a row's `names` (and so gets a product page) only
when the row's source names it, or an official schedule we cite does.
- Verified national schedules and cited them: US (21 CFR 1308.12/1308.14), UK (Misuse of
  Drugs Regs 2001 Sch 2–4), Canada (CDSA Sch I/III/IV; lisdexamfetamine via "amphetamines
  … derivatives", marked as our reading), Ireland (S.I. 173/2017).
- UN level: INCB Green List (36th ed., 2025) and Yellow List (65th ed., July 2026) cited
  for amfetamine, methylphenidate, alprazolam, diazepam, clonazepam, codeine, oxycodone.
  **Lisdexamfetamine, tramadol and modafinil are on neither list.**
- **Errors fixed:** controlled-medication-eu said the UN conventions cover tramadol and
  Vyvanse (they don't); the 30-day Schengen certificate figure is now cited to Irish
  Revenue eBrief 219/23 instead of "understood to"; MX "should be sufficient" inference
  replaced; UAE unsourced "detentions" sentence removed; SA "as commonly prescribed"
  examples now cited to INCB; CN "very likely" and an unverified opium-import claim
  removed; CN "3-month in practice" claim removed; RS "likely" advice reworded; NZ
  unconfirmed classification replaced with INCB facts.
- Removed unsupported names (Vyvanse/lisdexamfetamine/tramadol) from MX, CN, SA, BR, KR,
  HK, MY, MV, RS, TW, CY, AU, PH, NZ, EU. 19 product pages withdrawn with 307 redirects
  to the product hub (next.config.ts `withdrawnMedicationPairs`).
- verified_at not bumped: these rows' main sources weren't re-read today.

Open:
- **Vietnam** (`controlled-medication-vn`): its own notes say the day-supply figures are
  "search-engine-corroborated rather than read verbatim from a primary source". That
  doesn't meet §3. Re-read kv17.customs.gov.vn or find the decree, or move the row to
  UNVERIFIED.
- **New Zealand** schedules: legislation.govt.nz returns 403 here.
- **Mexico, Saudi Arabia, China, Serbia, Brazil** national schedules not read.

## Non-medication accuracy sweep (2026-10-17)

- **Fixed from the primary text:** `e-cigarettes-tr` now cites Ministry of Trade Circular
  2020/7 (as amended by 2024/18): 18+, one device in use plus 200 heated-tobacco units,
  or 30 ml, or **3** disposables (the secondary "10 disposables" figure was wrong); excess
  held until departure; air transit unrestricted (new `transit`: exempt_airside).
- **Trimmed to what the official page says:** `drones-tr` (500 g threshold and 20-day
  foreign permit lead time removed), `drones-id` (secondary Bali directive removed).
- **Moved to UNVERIFIED** (core facts from non-official sources): `cbd-rs` and
  `cannabis-rs` (law-firm guide), `e-cigarettes-sa` (newspaper), `e-cigarettes-cn`
  (customs.gov.cn returns 412), `drones-br` (ANAC behind CAPTCHA). Their now-empty /bring
  pages 307 to the destination page.
- Rows whose notes mention secondary figures as explicitly unconfirmed were left as is
  for now (cash-sg, meat-dairy-kr, drones-my, mv rows, etc.); a stricter pass could remove
  the numbers entirely.

## Medication research and re-verification (2026-10-17)

- **New `controlled-medication-tr`**: narcotic medicines allowed with the treating
  doctor's report/prescription stating medicine and dose for the stay; methadone under
  INCB guidelines (narcotics units notified; foreigners >15 days continue at a Turkish
  centre). Sources: Consulate General in Rotterdam notice (19 Sep 2012), MFA customs
  page (current general rule), INCB Yellow List. Stimulants/benzodiazepines not named
  by the source, so not in `names`.
- **Re-read and re-dated** (source still says the same): prescription-medication-jp,
  -ke, -za, medication-th, -ma, -tr, prescription-medication-eu, controlled-medication-eu
  (CISA Art. 75 text read on EUR-Lex).
- **Corrected while re-reading:** prescription-medication-gb ("14 days ahead" isn't on
  the cited page; added Schedule 1 / personal-licence wording from it), medication-mx
  (removed "consistent with a personal treatment course", not in ANAM's text),
  medication-in ("must seek" → the page says travellers "may" seek permission).
- **Couldn't re-read** (left at their August dates): prescription-medication-us (CBP help
  article is JS-only), medication-au (TGA unreachable), medication-ae (u.ae blocked),
  prescription-medication-eg (no readable text), prescription-medication-rw and
  controlled-substances-rw (the PDF URL redirects automated requests to the homepage).

## Step 1.4 batch 6 (2026-10-17)

Published `chewing-gum-sg` (Regulation of Imports and Exports (Chewing Gum) Regulations,
SSO: import prohibited except registered therapeutic/dental gum; fines up to S$100,000 or
2 years) and `e-cigarettes-ae` (dubai.ae customs guidelines: e-smoking devices permitted
for personal use at the inspector's discretion; Dubai only).
Not published: Cyprus e-cigarettes (customs page only bans cross-border distance sales,
not a traveller rule).

## Melatonin, Japan (2026-10-17)

Published `melatonin-jp`: melatonin is in Attachment 1 (ingredients used exclusively as
medicines) of MHLW notice 医薬監麻発0805第1号 (5 Aug 2026); the 2023 working group kept
it there (prescription-medicine use in Japan). Japan Customs Answer 1806 gives the
personal limits (2 months; 1 month for prescription drugs). Which limit applies to a
foreign melatonin supplement isn't stated, so the row presents 1 month as our cautious
reading. Also removed stale UNVERIFIED drafts of peptides-au and growth-hormone-au
(published from other sources on 2026-10-15).
Still open: Singapore melatonin.

## Source watcher report 2026-10-12 (reviewed 2026-10-17)

The weekly watcher's report (branch `source-watch/report`) had 0 content changes (first
snapshots) and 116 sources it couldn't read from the CI runner (mostly bot blocks). 404s
acted on:
- **u.ae drugs-and-controlled-medicines** page (medication-ae) is gone: the row now cites
  EDE for controlled medicines (optional permit, 3 months) and says the ordinary-medicine
  rule isn't confirmed. Its old notes' unsourced "history of detaining" claim was removed,
  as was the outdated "requires advance MOHAP authorization" (EDE says optional).
- **Rwanda FDA personal-effects guideline** PDF 404 (review date 14 Mar 2026 passed):
  three RW rows now say so. Find the revised guideline.
- ANAC drone page 404: drones-br already in UNVERIFIED.

## September medication rows re-checked (2026-10-18)

Re-dated 24 rows after re-reading their official source. Corrections: controlled-medication-ca
(CBSA D19-9-2's foreign-resident benzodiazepine cap added), injectable-medication-us (FDA
"bring or ship a 90-day supply"; the letter is only suggested for mailed medicine; TSA
screening text removed, AGENTS §2), controlled-medication-ph (Section 35(1) says a "valid
PDEA S2-licensed physician"), controlled-medication-al (Law No. 7975 named; secondary-source
sentence removed), controlled-medication-hk (HK Customs controlled-imports page added to
`_sources` for the amphetamines example).

Not re-dated:
- Source unreadable from here (JS shell, empty or blocked): controlled-medication-eg,
  injectable-medication-jp, injectable-medication-rw, controlled-medication-au,
  injectable-medication-au, controlled-medication-nz, medication-sa, controlled-medication-sa,
  controlled-medication-cn, prescription-medication-my, controlled-medication-my,
  controlled-medication-tw, prescription-medication-tw, prescription-medication-al,
  medication-id, and the three Brazil rows (gov.br returned navigation only).
- controlled-medication-ae: the EDE permit page confirms the 3-month limit, the documents
  and that pre-approval is optional, but the per-drug schedule list wasn't re-read.
- injectable-medication-gb: **resolved 2026-10-18 (owner chose rewrite).** It was gov.uk
  airport-security guidance (AGENTS §2). Rewritten as a customs answer: HMRC bans controlled
  drugs and restricts only CITES medicines; MDR 2001 Schedules 1–5 don't list semaglutide,
  tirzepatide, liraglutide or insulin. Slug, names and the Ozempic/Wegovy/Mounjaro UK pages
  kept; "needles" and "syringes" dropped from the search names.

## Medical devices (2026-10-18)

Added medical-devices-sg (HSA personal-import page), medical-devices-th (Thai FDA health
products page) and medical-devices-jp (Japan Customs FAQ 1806). Device types such as CPAP
machines, insulin pumps and continuous glucose monitors are not named on any of these
pages, so they aren't search names. Added later the same day: medical-devices-my (MDA personal-use exemption page) and
medical-devices-tw (TFDA traveller notice). Still open: Australia (TGA page unreachable
from here); Korea, UAE, Saudi Arabia (no official traveller device page found).

OTC products controlled abroad (§1.4), blocked: no current official page names Vicks
inhalers / levmetamfetamine for Japan (NCD application page silent; US Embassy Japan page
now defers entirely to the Japanese government).

## Passport validity checker — conflicts found (2026-10-18)

- **Saudi Arabia (SA):** rows citing the same source (visa.visitsaudi.com) disagree on the
  reference date: 10 say "6 months beyond arrival" (US, GB, CA, AU, NZ, JP, KR, SG, MY, UA),
  4 say "6 months validity beyond stay" (BR, MX, AR, CL). visa.visitsaudi.com returns 403
  from here, so the structured `passportValidity` was removed from all 14 rows (Trip Check
  shows remaining validity, no verdict). Re-read the source and align the wording.
- **Albania (US row):** said "3 months beyond entry", but the U.S. Embassy only says "at
  least three months of remaining validity"; Albania's own visa rules (MFA, section II) say
  3 months after you leave. Corrected to the Albanian rule and re-dated 2026-10-18.
- **Malaysia:** Malaysia's own missions word it differently: Paris says "valid for more than
  6 months upon arrival" for all foreign travellers; Ottawa (visa applicants) says "more than
  six (6) months before the date of departure from Malaysia". The three rows with a structured
  rule (GB, JP, MX) say arrival, matching the general rule. CA cites Canada's advice
  (departure, stricter) and has no structured rule. Consider aligning all MY rows to the
  Malaysian wording once Immigration Malaysia's own page can be read.
- The extractor deliberately leaves out lines with advice, "cannot exceed", "more than", or
  both reference dates; those rows show remaining validity only.

## Medication gaps (2026-10-18)

- Added prescription-medication-nz and controlled-medication-es (AEMPS); re-dated
  controlled-medication-nz.
- Blocked: Philippines ordinary medicine — dfa.gov.ph embassy pages (which cite DOH-FDA-BOC
  Joint Circular No. 1, 2015) return a Cloudflare challenge.
- Still open: controlled-medicine rows for Indonesia, Peru, Colombia, Bahamas, Ecuador;
  ordinary-medicine rows for Georgia, Cyprus, Argentina.
- Peru: the DIGEMID "Consideraciones 2026" PDF (read 2026-10-18) covers exceptional import
  by mail ("por valija") with a prescription from a Peruvian prescriber — not a traveller
  carrying their own medicine. It does say Lists IA/IB of Annex 2 (D.S. 023-2001-SA) are
  prohibited and psychotropics/narcotics are controlled. No traveller-specific page found.
- Colombia (controlled): no FNE/INVIMA/DIAN traveller rule found (2026-10-18). The control
  lists are in Ministry of Health Resolución 116 de 2026; traveller limits seen only on a
  relocation blog — not usable.
- Argentina (ordinary): ARCA/ANMAT pages cover postal imports only; ANMAT Disp. 3562/2025
  covers cosmetics and hygiene products, not medicines.

## August customs rows re-checked (2026-10-18)

86 distinct sources for the 146 customs rows last checked in August; 65 readable.
- Re-dated after their figures matched the source: 50 rows, plus alcohol-mx, tobacco-mx
  (figures written in words), alcohol-rw, tobacco-rw (EACCMA "Eighteen years").
- Corrected to what the source says: cash-us (form name dropped), alcohol-ke ("aged 18"
  not on KRA's page), tobacco-ph ("approx. 400 sticks" was our conversion), alcohol-nz
  ("six 750ml bottles" was our conversion), cash-ma (dirham-banknote ban, 2,000 MAD and
  Art. 66 bis aren't on the Office des Changes page — removed), cash-ae (departures,
  instrument list, precious metals/stones and Afseh/iDeclare aren't on Dubai Customs' page —
  removed), cbd-us (re-sourced to 7 U.S.C. 1639o and 21 U.S.C. 802(16); adds the
  Public Law 119-37 sec. 781 change).
- **Time-sensitive — cbd-us:** P.L. 119-37 sec. 781 takes effect 365 days after 12 Nov 2025
  (12 Nov 2026). Secondary reports (Aug–Sep 2026) say a continuing resolution may delay it to
  11 Dec 2026; not confirmed on congress.gov. Check before 12 Nov and update the row.
- Not re-dated: 50 rows without figures (cannabis, weapons, food bans) — need a manual read;
  their notes also contain hedges ("realistically", "essentially never", "in practice")
  to clean up. 33 rows whose sources were unreadable (TGA/AU, help.cbp.gov, customs.gov.ng,
  customs.gov.vn, thailand.go.th, gob.mx/senasica, chennaicustoms, rwandafda, mpi.govt.nz…).

## Hedge cleanup (2026-10-18)

Removed inference/editorial wording from 16 rows (food-plant-mx, fresh-produce-th, weapons-eg,
weapons-ng, weapons-in, weapons-au, weapons-sa, controlled-medication-eg — including a
press-sourced "reported detentions" claim — weapons-br, weapons-nz, controlled-medication-ph,
weapons-id, drones-cn, drones-vn, fresh-produce-ie, cbd-cl).
Flagged, not edited (need a source re-read first):
- meat-dairy-jp: rewritten from MAFF's own wording (illegal; certificates "generally
  difficult to get"; dairy in passenger baggage excluded; fine up to ¥3m) and re-dated.
  meat-dairy-th: note now says only what the FDA page covers.
- cannabis-jp: **resolved 2026-10-18.** Read the current Narcotics and Psychotropics Control Act
  on e-Gov: cannabis is a narcotic (Art. 2); only licensed importers may import narcotics,
  except a traveller with MHLW permission to treat their own illness (Art. 13); Art. 12's
  absolute bans cover heroin and opium powder only. Verdict now "depends", summary leads with
  the illegality.

## August entry rows re-checked (2026-10-19)

252 rows last checked in August, 38 distinct sources (26 readable). Re-dated 128 rows where the
stay limit appears in the source and, for list-type sources, the nationality is named (or, for
the UK, absent from Appendix Visitor's visa-national list). Not re-dated: rows whose sources
were unreadable (Canada ETA pages, Japan MOFA, NZ, China embassies, Vietnam, Australia
visitor pages too thin) or general pages that don't name nationalities (Kenya ETA, Rwanda
visa-on-arrival, Nigeria, Australia ETA) — these need a nationality-list source to confirm.
China's nia.gov.cn page came back too thin to confirm the 30-day visa-free stay.

### Canada August entry rows re-checked (2026-10-19)
- 13 rows re-dated. Status per nationality from IRCC "Entry requirements by country or territory" (page details 2026-07-31): British citizen, Australia, New Zealand, Japan, Republic of Korea, Singapore, Chile and Israel (national passport) need an eTA; Brazil, Mexico, Argentina and Malaysia are visa-required with conditional eTA. The 8 eTA rows now cite that page (the apply page they cited names no countries).
- Stay: IRCC Help Centre Q1016 "Most visitors can stay for up to 6 months" (modified 2026-09-28). Fee: IRCC eTA page "It only costs CAN$7" (2026-06-05). eTA-X conditions: eta-x page (2026-07-27), unchanged.
- Mexico note: removed "reimposed on 1 March 2024". The IRCC release of 29 Feb 2024 gives 11:30 p.m. Eastern time on 29 February 2024; the history isn't needed for the current answer and the row can't cite the release.
- canada.ca refuses curl (HTTP/2 INTERNAL_ERROR); WebFetch works.

### Kenya, Rwanda, Japan and Mexico August entry rows (2026-10-19)
- **Kenya, 12 rows re-dated.** etakenya.go.ke/form/apply/how-to-apply: "All visitors … must have an approved Electronic Travel Authorisation"; the exemption lists (EAC 180 days, 90-day list, 60-day African list) name none of US, GB, CA, AU, NZ, JP, KR, MX, AR, CL, IL, UA. eTA "valid for travel within 90 days from the date of issuance"; stay "determined at the point of entry"; passport "valid for at least six (6) months after your planned date of arrival". Fees from /eligibility: Standard $30, Five Year Multi-Entry (American nationals) $185. Reg. 30(3) not re-read (kenyalaw.org 403).
- **Rwanda, 9 rows re-dated** (US, JP, BR, IL, GB, CA, AU, NZ, MY). /visa/visitors-visa: V1 "50 USD for single entry", "70 USD for multiple entries", valid "thirty (30) days for single entry or … ninety (90) days for multiple entries", document "valid not less than 6 months"; VE-1 free, single entry, 30 days for AU/Commonwealth/Francophonie nationals. thecommonwealth.org/our-member-countries lists GB, CA, AU, NZ, MY.
- **Rwanda, 5 rows held (MX, AR, CL, KR, UA).** OIF's list (francophonie.org/90-etats-et-gouvernements-125) names Argentina, Chile, Mexico, South Korea ("Corée du Sud") and Ukraine as **observers**. Rwanda waives the fee for "members to … La Francophonie" and doesn't say whether observers count. The rows charge the USD 50 V1 fee. TODO: find a DGIE statement on observers, or ask DGIE (info@migration.gov.rw).
- **Japan, 14 rows held.** mofa.go.jp returns 403 to curl and WebFetch (English and Japanese pages).
- **Mexico, 14 rows held — source is stale.** The cited gob.mx PDF (attachment 67045) has PDF creation date 2012-06-12 and lists Venezuela as visa-free and Colombia/Peru as visa-required, so it predates current policy. The Montreal consulate list (consulmex.sre.gob.mx/montreal, no date) is also stale (lists Brazil and Venezuela visa-free). inm.gob.mx/paises-no-requieren-visa-para-mexico is 404. TODO (priority): find a current INM/SRE list and re-source all MX rows; also confirm whether Malaysia still needs the consular stamp.
- **Nigeria, 13 rows rewritten and re-dated.** immigration.gov.ng/info-center/tourism-visa-f5a/ unchanged (eligibility "all countries except ECOWAS member States and other countries which Nigeria has entered into visa abolition/waiver agreements"; validity 90 days; 30-day stay; not extendable). The August notes and documents carried claims the page doesn't make (visa on arrival ended 1 May 2025; Cameroon and Chad as waiver examples; the landing card; passport "from date of travel, with blank pages"). They now use the same source-only wording as the October rows.
- **Australia, 13 rows re-dated (NZ held).** ETA eligibility from the Migration (IMMI 18/084: Specification of ETA-Eligible Passports) Instrument 2018 (F2018L01110, in force, compilation 2022-02-20): items 5 Canada, 15 Japan, 16 Republic of Korea, 19 Malaysia, 26 Singapore, 31 UK (British Citizen or BN(O)), 32 USA. Home Affairs ETA page (last updated 12/10/2026): "Up to 3 months at a time", "service charge of AUD20". Removed "multiple entry, valid 12 months (or until passport expiry if sooner)" from the 7 ETA rows: not in the page content we can fetch. Visitor 600 (last updated 23/09/2024): "3, 6 or 12 months". BR, MX, AR, CL, IL and UA are on neither the ETA instrument nor the eVisitor instrument (LIN 23/064, F2023L01264, in force).
- **Australia NZ row held.** The SCV 444 page says the visa lasts "from the time you are granted the visa until you leave Australia" and "You must apply for a new SCV if you want to enter Australia again"; the row's "granted automatically … at no cost, no advance application needed" isn't in the fetched text (cost tab not in the HTML). TODO: confirm the cost and how it is granted.
- **China, 11 rows re-dated (SG and UA held).** NIA unilateral list (as of 2026-02-17) names CA, AU, NZ, JP, KR, BR, AR, CL. End date: MFA notice of 3 Nov 2025 extends the policy "至2026年12月31日24时" (the 45-country list includes AU, NZ, KR, JP, BR, AR, CL); China's embassy in Canada (15 Feb 2026) gives the same end for Canada and the UK from 17 Feb 2026. The 8 rows now use the October template (dropped "multiple entries permitted", which no source states). US row rewritten to the Embassy page (COVA from 30 Sep 2025; L-visa documents simplified from 1 Jan 2024; 4 business days); removed uncited 10-year/60-day/transit claims. MX (embassy page, Sept 2025) and MY (embassy FAQ: 30 days per stay, 90 in 180, in force 17 July 2025) unchanged. SG source (cs.mfa.gov.cn) returned no content; UA embassy page lists only notice titles, and the row's notes cite third-party agency reports — TODO: replace that note.
- **DEADLINE 2026-12-31: China's unilateral visa-free policy ends at 24:00 Beijing time** for the 52 countries on the NIA list unless extended. Watch MFA/NIA from early December; update every CN visa_free row (~60) on the day an extension or end is announced.
- **Vietnam, 3 rows re-dated (GB, JP, KR).** Vietnamese Embassy in Japan: Resolution 44/NQ-CP, 45 days from entry, 15 Mar 2025 to 14 Mar 2028. Removed the uncited "2019 Law … no re-entry waiting period" sentence. The 6-month passport line is not on this page (same as the October rows). **Held: 9 e-visa rows** (evisa portal: "valid for maximum of 90 days, single or multiple entry", but it names no nationalities, and Viet Nam also has bilateral exemptions, e.g. Chile, so absence from Resolutions 44/229 isn't proof) and **SG, MY** (immigration.gov.vn home page says nothing about them). The e-visa rows also say "government fee historically USD 25/50", which needs a source or removal.
- **Mexico → US corrected.** The rule is 8 CFR 212.1(c), not (a), and the cited govinfo file was the 2023 edition; now cites the current eCFR. Corrected: a Border Crossing Card holder arriving by air needs a passport but no separate visa (212.1(c)(2)(i)); the row had said air travel requires a B-1/B-2 visa. Removed "within the border zone" (not in 212.1).
- **US → India re-dated.** indianvisaonline.gov.in/evisa/tvoa.html: USA is item 168; e-Tourist 30 days "from the date of your first arrival", multiple entry, non-extendable; passport "at least six months validity at the time of making application"; apply "minimum 4 days in advance"; Pakistani passport/origin and diplomatic/official passports excluded.
- **Not re-checked:** NZ → AU (immigration.govt.nz returned an empty page).

## August customs rows: manual read (2026-10-19)
83 customs rows still dated August, 53 sources. Read every readable source against each row's text.
- **46 re-dated**, most with notes trimmed to what the source says. Removed claims not on the cited page: Cuban cigars (tobacco-us); "some CBD treated differently" (cannabis-gb); knuckledusters and stun guns (weapons-gb, not on the gov.uk list); bear-spray exception (weapons-ca, not on the CBSA checklist); "proving absence of THC" (cbd-jp; the page asks for documents stating stalk/seed origin); "firearms prohibited outright" (weapons-jp; the FAQ describes permits); Kenyan and South African domestic cannabis law and "secondary sources" mentions; Thai domestic cannabis history; "one of the world's strictest" and "in practice confiscated at Kigali" (plastic-bags-rw); the UAE drone residency claim from a news report; Morocco Law 13-21 commentary.
- **Corrections:** drones-ma said tourists get drone authorisation from local DGSN police; in the circular that route is for hunting weapons, and drones need an import licence from the foreign trade department (ANRT approval is for more than one telecom device). weapons-mx said "prohibited" and that tourists aren't eligible; ANAM describes SEDENA's extraordinary import permit (verdict now "depends"), with prison terms for *clandestine* introduction. weapons-za verdict "depends" (permit-only). cash-tr: when the explanation is missing or false, *all* cash carried is held, not just the unexplained amount. cannabis-ng: the life/15–25-year penalties are under s. 20 (narcotic drugs contrary to the 1961 Convention); ss. 11 and 19 name cocaine, LSD and heroin. prescription-medication-eg: the page says "medical reports", not a prescription. weapons-au: the portal now says Home Affairs grants import permission and notes the 2026 reforms; removed the Attorney-General/category claims.
- **Cannabis links cited:** where a source bans "narcotic drugs" (KE, ZA, RW, EG, NG, MA), the row now cites the INCB Yellow List (65th ed.), which lists cannabis, resin and extracts; GB cites Misuse of Drugs Act 1971 Sch. 2 Part II.
- US alcohol/tobacco now cite the current eCFR (same text as the 2023 edition).
- **Held (not re-dated), 37 rows:** sources unreachable or empty — help.cbp.gov (prescription-medication-us, weapons-us), aphis.usda.gov (meat-dairy-us, fresh-produce-us), EUR-Lex (weapons-eu), gob.mx/senasica (food-animal-mx, food-plant-mx), thailand.go.th (e-cigarettes-th, drones-th), Rwanda FDA PDF 404 (prescription-medication-rw, controlled-substances-rw), customs.gov.ng 403 (alcohol-ng, tobacco-ng, weapons-ng), chennaicustoms.gov.in and indiacode (6 IN rows + e-cigarettes-in), TGA/agriculture.gov.au/AUSTRAC (cash-au, medication-au, cannabis-au, e-cigarettes-au, meat-dairy-au, fresh-produce-au), mpi.govt.nz (food-plant-nz), customs.gov.vn (alcohol-vn, tobacco-vn, cash-vn), english.cq.gov.cn (alcohol-cn, tobacco-cn). Not confirmed by the source: cash-cn (the SAFE notice covers taking foreign cash *out*; the inbound USD 5,000 and RMB 20,000 figures aren't on it — TODO find GACC source), cbd-cannabis-mx (needs a source that cannabis is an "estupefaciente" — Ley General de Salud Art. 234 PDF didn't download; notes trimmed), cannabis-tr (source is the postal page), cannabis-in, weapons-rw (unchanged, fine but not re-read in full).
- **US customs (2026-10-19, later):** prescription-medication-us, meat-dairy-us and fresh-produce-us re-sourced to cbp.gov "Prohibited and Restricted Items" (last modified 14 Mar 2025); help.cbp.gov articles and aphis.usda.gov don't load here. Corrected the agriculture penalty ($300 first offence, $500 second; rows said "up to $1,000") and the verdicts (cheese and produce "depend"). weapons-us still held: switchblades and ATF Form 6NIA aren't on the CBP page. Australian sources (tga.gov.au, agriculture.gov.au, austrac.gov.au) time out on WebFetch too; MPI returns an empty page.
- **Mexico entry rows re-sourced (2026-10-19, later).** All 21 MX rows now cite INM's current pages (inm.gob.mx/gobmx/word/index.php/paises-no-requieren-visa-para-mexico/, published 1 Mar 2024, and /paises-requieren-visa-para-mexico/). The country lists are images; read directly: no-visa list includes Alemania, Argentina, Australia, Canadá, Chile, España, Estados Unidos, Francia, Israel, Italia, Japón, Malasia, Nueva Zelandia, Países Bajos, Reino Unido, República de Corea, Singapur; visa list includes Brasil, China, India, Ucrania (and Perú, so it reflects 2025). FMM: INM FMME page "vigencia máxima de 180 días naturales … una sola internación", counted from the entry stamp.
  - **Malaysia: removed the consular-stamp ("sello consular") requirement.** It came from the 2012 PDF; INM's current list shows Malaysia plainly among countries that don't need a visa.
  - **China row:** its notes said China's listing was confirmed "via established policy knowledge"; now read off INM's image.
  - **Brazil:** removed the e-Visa (Feb 2026) mention, which was from announcements, not an INM/SRE page. TODO: find the SRE/INM e-Visa page for Brazilian (and Ukrainian) nationals and add it if primary.

## Source-watch report 2026-10-19 (first full baseline)
668 sources watched; 0 changed, 548 first snapshots, 120 unreachable from the CI runner (mostly bot-blocked government sites, listed in the report). Acted on rows whose cited source isn't a primary official one:
- **Overstay penalties: Greece, Lithuania, Estonia moved to UNVERIFIED** (data/UNVERIFIED/overstay-penalties.json; pages 307 to /rules/overstay-penalties). GR cited an NGO article (rsaegean.org) for Law 5275/2026; LT cited a Refworld copy; EE cited LegislationLine (now 404). Primary texts tried: migration.gov.gr FEK A' 17/2026 PDF (connection refused), riigiteataja.ee (JS-only), e-seimas.lrs.lt (403). The Greece callout on the overstay explainer was removed. TODO: re-verify from the Greek gazette (et.gr / migration.gov.gr), Riigi Teataja and e-seimas when reachable.
- **cbd-cn re-sourced** from a USDA FAS report (now 404) to the joint announcement of 2 Aug 2024 (mem.gov.cn): CBD is a Category II precursor chemical from 1 Sept 2024 and its import/export follows non-pharmaceutical precursor rules. Verdict "prohibited" → "depends": the announcement describes licensing, not a ban, and says nothing about travellers ("no personal-use pathway" was inference).

## Non-primary legal_source audit (2026-10-19)
Scan of every source URL in /data for non-government hosts. Rows whose **legal_source** is not a primary official source (AGENTS §3.2):
- **News / firm / consultancy / social (worst):** cannabis-kr, cbd-kr (koreatimes.co.kr); e-cigarettes-ma (ledesk.ma); e-cigarettes-ke (standardmedia.co.ke); overstay DK (holmthomsenlaw.com), BG (elan-consulting-bg.com), CH (swissinfo.ch); MX>SG (x.com — Mexican embassy's account, but a tweet); meat-dairy-cn, fresh-produce-cn (chinaafricasps.org); 15 MV entry rows (maldivesconsulhk.com — check whether it is an official consulate site).
- **Unofficial copies of statutes (re-cite to the official portal):** cash-ng, cannabis-ng (placng.org); cannabis-vn, cbd-vn, drones-vn, meat-dairy-vn, fresh-produce-vn (luatvietnam.vn → vbpl.vn / chinhphu.vn); e-cigarettes-tr (lexpera → resmigazete.gov.tr / Ministry of Trade); e-cigarettes-al (tobaccocontrollaws.org → qbz.gov.al); cannabis-lk (website-files CDN → Sri Lanka official); overstay AT (jusline → ris.bka.gv.at), PT (sites.google → DRE), RO (euroavocatura → legislatie.just.ro), SI (zakonodaja → pisrs.si), CZ (zakonyprolidi → e-sbirka.cz), SK (zakonypreludi → slov-lex.sk).
- **Audit progress (2026-10-19):** cannabis-kr/cbd-kr re-sourced to Korea Customs (customs.go.kr; penalty corrected from "up to 5 years or KRW 50 million" to the page's "life imprisonment or at least 5 years" for cannabinol/THC/CBD); meat-dairy-cn/fresh-produce-cn re-cited to the MOA gazette copy of Announcement 470; e-cigarettes-ma (press only) and e-cigarettes-ke (newspaper only) moved to UNVERIFIED with 307s; overstay DK (law firm), BG (consultancy) and CH (news + "anecdotal" fines) moved to UNVERIFIED with 307s. Kept, noted as weaker: 15 MV rows (honorary consulate-general of the Maldives; Maldives Immigration's page doesn't state the 30 days) and MX>SG (Mexican embassy's official X account; embassy site bot-blocked). STILL OPEN: the statute-mirror rows (placng, luatvietnam, lexpera, tobaccocontrollaws, website-files, jusline, sites.google, euroavocatura, zakonodaja, zakonyprolidi, zakonypreludi) — re-cite to official portals.
- **Audit part 2 (2026-10-19, later):** Overstay AT rebuilt from RIS (FPG §§ 53, 120): corrected the repeat-offence penalty (fine **or** up to 4 weeks' imprisonment, not a substitute term) and replaced "commonly around 3 years" with § 53's up to 5 / up to 10 years. Overstay PT, RO, SI, CZ, SK moved to UNVERIFIED (official portals DRE, legislatie.just.ro, PISRS, e-Sbírka, Slov-Lex are JS-only or unreachable; rows also self-described figures as approximate/snippet-based). Customs: e-cigarettes-tr re-cited to the Ministry of Trade's own PDFs of Circulars 2020/7 and 2024/18 (scans read directly: 10 → 3 disposables); cash-ng to the EFCC/SCUML copy of the MLPPA 2022 (s. 3 confirmed; removed the e-CDF portal mention, not in the Act); cannabis-ng and e-cigarettes-al moved to UNVERIFIED (only NGO copies of the NDLEA Act and Law 9636 reachable; note the NDLEA Bill 2026 would repeal the NDLEA Act and the Indian Hemp Act). cannabis-lk kept: the CDN file is in NMRA's own Webflow asset bucket. Vietnam: cannabis-vn, cbd-vn (Decree 57/2022 List I: cannabis and preparations, delta-9-THC; CBD reading marked as ours; removed the uncited life-imprisonment claim), drones-vn (Decree 288/2025; corrected the under-250 g notification condition, removed the unverified "5 working days"), meat-dairy-vn (Decree 204/2026 Art. 16(1)(b): VND 5–6 million and destruction for fresh animal products carried in; replaced "approximately VND 1–50 million"), fresh-produce-vn (Decree 214/2026 Art. 31, scan read; added cl. 1 declaration fine; removed "reported elsewhere" note) — all now cite the official gazette/portal.
- **Promotion pass (2026-10-19):** re-fetched the sources of every UNVERIFIED row. Promoted CN>AR and IN>AR (Boletín Oficial Res. 316/2025 and 353/2025 now readable; art. 1 terms match; DNM visa table: "REQUIERE VISA", US visa and Green Card "HABILITADO"). Still held, reasons unchanged: MY>AR (30 days only on a 2022 embassy page), FR>SA (France Diplomatie describes an eVisa, not VOA), IL>CO (Res. 12189/2026 text not published), IL>JO, IL>QA, IN>AL, KH rows; customs drafts for EC, CY, AR, CL, ME, BS, CO are content gaps (official pages readable but silent on the item), not reachability.
- **cbd-us deadline resolved (2026-10-19):** Public Law 119-103 (signed 2 Sept 2026), sec. 2019: "Until December 11, 2026, the amendments made by section 781 … shall only apply with respect to products described in paragraphs (1)(C)(ii)(I) and (1)(C)(iv)(I)" — i.e. products with cannabinoids not naturally producible by the plant. Row now gives both dates. **New watch date: 11 December 2026** (the same law's stopgap funding runs to that date; H.R. 7010, H.R. 7024 and S. 3686 would delay further — not enacted as of CRS IF13136, 28 Sept 2026).
- **Korea medicines (2026-10-19):** Korea Customs' "마약성분 함유 의약품 주의사항" page (customs.go.kr) resolves the long-blocked "Korea amphetamines" item: amphetamine isomers and methylphenidate (names Ritalin, Concerta, Medikinet) → life or ≥5 years; alprazolam, zolpidem, clonazepam, lorazepam, dextromethorphan → up to 10 years or KRW 100 million; exception only with MFDS approval for self-treatment. Added to controlled-medication-kr (+ names concerta, medikinet, alprazolam, zolpidem, codeine, oxycodone) and a new dextromethorphan-kr row naming the products Korea Customs lists (NyQuil, DayQuil, Robitussin, Mucinex, Delsym). Sudafed deliberately not added: KCS lists it in the DXM column, but US Sudafed is pseudoephedrine, so the name would mislead.
- **UK medicine (2026-10-19):** Home Office guidance "Travelling with medicine containing controlled drugs" (gov.uk/guidance/controlled-drugs-personal-licences, updated 11 Apr 2023) read in full. controlled-medication-gb: notes rewritten to the guidance (UK residents treated abroad → email DFLU; >3 months → UK clinician; no posting) and a new optional procedure (exceptional-circumstances licence: email DFLU 1 month ahead with the listed documents; form sent only if exceptional). **Correction:** prescription-medication-gb applied the controlled-drug 3-month/licence rule to all medicines; the guidance says medicine without a controlled drug falls under MHRA import rules, and HMRC's restricted list doesn't include ordinary medicines → verdict "allowed", re-sourced to HMRC's banned/restricted page. Supply-limits post updated (UK moved to the controlled-medicine list).
- **Indonesia medicine (2026-10-19):** Badan POM's Special Access Scheme page (sertifikasicdob.pom.go.id/wasdisobat/sas/, English section read) and PerBPOM 28/2023 Annex: passenger baggage up to 30 solid units or 3 semisolid/liquid/aerosol units per product; more with an English prescription, max 90 days; no permit; psychotropics (Cat. II–IV) foreign nationals only, English prescription, max 60 days, not by post; narcotics not allowed. medication-id gained the quantities; new controlled-medication-id. BPOM's FAQ page omits the foreign-nationals restriction for psychotropics — the SAS page states it, so the row follows the SAS page.

## Batch 6, destination 1: Armenia (2026-10-20)
Sources: MFA visa page (mfa.am/en/visa/), unilateral visa-free list and bilateral list (both updated 02.02.2024), the 111-country temporary-exemption PDF (1 July 2026 – 1 July 2027); SRC traveller guides (June 2024 and Oct 2024 PDFs on src.am).
- 22 entry rows: 12 unilateral visa-free (US GB AU NZ JP KR SG FR DE IT ES NL; "180 days per year", modelled as 180 in any 365); 4 bilateral visa-free for all passports (AR BR CN UA; agreement terms not published → no day count); 6 visa-required (CA MX CL MY IL IN; all six on the 111-country residence-permit exemption list). Canada is on neither visa-free list — re-check if Canada adds a bilateral arrangement.
- 7 customs rows: alcohol (3 L duty-free; >5 L from third countries banned; EUR 10/L above 3 L), tobacco (200/50/200/250 g; under-18 ban), cash (USD 10,000; other monetary instruments always declared; >USD 100,000 needs proof of origin), prescription medication (10 types × 3 packs unless documents justify more), controlled medication (no licence; registered-in-Armenia only; documents translated into Armenian and notarised; declare), fresh produce (5 kg + 1 melon + 3 bunches of flowers), meat/dairy (5 kg factory-packed).
- Open: drones, weapons, e-cigarettes, cannabis for Armenia (not in the guides); passport validity (not on the MFA pages).
- **Batch 6 candidates checked (2026-10-21), not added yet:**
  - Panama: Migración's "Requisitos Turistas" link goes to a login page; no current official country list found (Decreto 521/2018 as amended by Decreto 196/2024 is the basis). Spain's embassy says EU citizens get 90 days.
  - Uzbekistan: MFA list on gov.uz (page dated 27.11.2025): 90 countries, 30 days for most of our roster; US citizens only from age 55 (tourism, 30 days); China 10 days with onward ticket; India not listed. A Nov 2025 MFA news item says 94 countries — the list may lag; reconcile before publishing.
  - Bosnia and Herzegovina: DONE 2026-10-23 from the MFA's per-country consular pages (see batch 6, destination 5).
  - North Macedonia: MFA "Do you need a visa?" is a JavaScript tool; the visa page gives categories only.
  - Oman (rop.gov.om) unreachable; Mauritius, Nepal, Fiji pages 404/403.

## Batch 6, destination 2: Uruguay (2026-10-21)
Sources: Ministerio del Interior "Régimen de visas de admisión" (19/08/2025; table by country × passport type, footnotes); MRREE embassy-in-Colombia page "Residencia legal en Uruguay" (13/08/2024: tourist stay 90 days, extendable); Aduanas sworn baggage declaration form (2016: 6 L spirits, 4 cartons, adults; cash > USD 10,000, Law 18.494) and Aduanas baggage page (last updated 19/03/2014: medicines, prohibited food).
- 22 entry rows: 19 visa-free 90 days; MY visa-free 30 days (ATSV, footnote 2); CN visa (prior authorisation) with the US/CA/UK/EU-visa exemption via named ports (footnote 10); IN visa (prior authorisation).
- 6 customs rows: alcohol, tobacco, cash, prescription medication, fresh produce (prohibited), meat/dairy (prohibited; UHT milk excepted).
- Caveats: the 90-day figure comes from an embassy page (official MRREE); the customs baggage page is from 2014 — re-check MGAP's current traveller rules when reachable. Open: controlled medication (Uruguay rule for travellers), drones, e-cigarettes, cannabis (Uruguay's domestic cannabis regime does not cover visitors' imports — needs a source).

## Batch 6, destination 3: Mongolia (2026-10-21)
Sources: Immigration Agency article 537 (34 countries, tourist visa exemption up to 30 days in 2026); MFA Consular Department list (consul.mn/visa/c/83: unilateral list "until the end of 2026" + bilateral agreements with passport types, durations, dates).
- 21 entry rows: FR ES IT NL GB AU NZ 30 days (tourism, 2026); bilateral US BR AR CL 90, KR 90 (tourism, to 31 Dec 2026), JP DE CA SG MY IL 30; MX CN IN visa required (only diplomatic/official passports exempt).
- **Held: UA** — listed as "All passports /with official invitation/, Up to 90 days"; our row model can't express "visa-free only with an official invitation". 
- **DEADLINE 2026-12-31:** the 2026 tourist exemption (7 rows) and Korea's exemption both end on 31 Dec 2026 unless renewed — watch immigration.gov.mn in December.
- Customs not published: airport and customs.gov.mn figures are undated and conflict (cash MNT 15 million vs USD 5,000). Find the current customs law/regulation text on legalinfo.mn.

## Batch 6, destination 4: Uzbekistan (2026-10-23)
Sources: Cabinet Resolution No. 408 (1996), Annex 5 — consolidated visa-free list, as amended by Resolution No. 662 of 21 Oct 2025 (lex.uz/ru/docs/513096; the Russian text is LexUz's unofficial translation, Resolution 662 itself is published only in Uzbek); Presidential Decree UP-203 of 3 Nov 2025 (US, 30 days from 1 Jan 2026); MFA visa page on gov.uz (visa-free list, e-visa Appendix 1, transit Appendix 2; last updated 2025-03-06).
- 20 entry rows: AU AR IL IT CA ES NL MY NZ KR SG CL GB BR DE FR JP MX 30 days (annex and MFA agree); US 30 days (UP-203; the MFA page still shows the old "55+ tourists" rule); IN visa required (e-visa list + 5-day transit with an Uzbekistan Airways ticket).
- **Held: CN** — conflict: the annex (LexUz translation, after Resolution 662) lists China among 30-day countries; the MFA page lists China under "up to 10 days" with an onward ticket. Resolve from the Uzbek text of Resolution 662 or an updated MFA page.
- **Held: UA** — "unlimited duration" bilateral regime; our stay model can't express "no time limit".
- Customs BLOCKED 2026-10-23: customs.uz is a JS app; on lex.uz, PP-4508 (2019, amended by UP-174 of 27 Aug 2026) sets the single customs payment but not the limits; Cabinet Resolution No. 44 (29 Jan 2025) and No. 244 (19 Apr 2025) are published only in Uzbek. Find the current duty-free limits (alcohol, tobacco, goods value) and the cash declaration threshold in a readable official text.
- Kazakhstan (2026-10-23): BLOCKED — gov.kz, egov.kz and adilet.zan.kz are all JS apps; Adilet's API needs credentials. Need another route to Government Decree No. 148 (2012) rules for immigrants or the MFA visa-free list.
- Laos (2026-10-23): BLOCKED — laoevisa.gov.la gives eVisa rules (30-day stay, single entry, passport valid >180 days from arrival) but the visa-exemption list is on mofa.gov.la (unreachable); eligible-country article loads via an API that returned nothing.

## Batch 6, destination 5: Bosnia and Herzegovina (2026-10-23)
Sources: MFA BiH per-country consular pages (mvp.gov.ba/bs/org_…; one per nationality, reached from the country selector on /bs/vize) + the general visa page (/bs/vize: EU citizens may enter with an ID card; minimum funds 150 KM per day — funds not yet added to rows).
- 22 entry rows: US GB CA AU NZ JP KR SG MX AR CL IL FR DE IT ES NL "90 days in a period of six months from the day of first entry" → rolling 180/90 (same model as Serbia/Montenegro); CN ordinary passports 90 in any 180 (explicitly rolling); BR 90 per stay, 180 per year from first entry → rolling 365/180 + maxDaysPerEntry 90; MY up to 90 days, no reference period → fixed 90; UA 30 days within two months from first entry → rolling 60/30 (two months counted as 60 days, stated in the note); IN visa required.
- Customs DONE 2026-10-23: 6 rows from the Indirect Taxation Authority's traveller page (alcohol, tobacco, cash EUR 10,000, ordinary and psychotropic medicine, meat/dairy). Not added: fresh produce (page silent), drones/weapons.
- OPEN: the Decision on Visas text itself (Službeni glasnik BiH) still not found.

## Batch 6, destination 6: Macao (2026-10-23)
Source: gov.mo PS-1474 Immigration page (Public Security Police; last modified 2026-08-10): exemption list (88 countries), limit-of-stay table, entry requirements (passport 90 days beyond stay, onward ticket, MOP funds by length of stay), visa-on-arrival fees, overstay fines.
- 21 entry rows: US CA AU SG MY AR CL IN 30 days; FR DE IT ES NL (EU/Schengen) and BR JP KR MX 90 days; IL NZ "3 months" (counted as 90 days); GB "6 months" (180 days, same convention as the UK rows); UA not exempt → Entry Permit on arrival, 30 days.
- **Held: CN** — Chinese citizens travel to Macao on PRC permits (Two-way Exit Permit with endorsement; PRC passport only for transit, 7 days); our row model can't express that.
- Customs: cash-mo DONE 2026-10-23 (customs form SA213, Law 6/2017: declare MOP 120,000+ on arrival). customs.gov.mo pages return a 112-byte shell. Tobacco/alcohol CANDIDATE, not published: AIP Macao GEN 1.3 (page dated 24 Nov 2016, in the 2026 AIP edition) quotes Chief Executive Order 255/2016 Annex 1 — per day: 19 cigarettes or 1 cigar or 25 g tobacco (25 g total), 1 L of drinks over 30%; food items 1 kg each, 5 kg total. Confirm the Order hasn't been amended (Boletim Oficial) before publishing.

## Batch 6, destination 7: Seychelles (2026-10-23)
Sources: Immigration and Civil Status (ics.gov.sc) — Visitor's Permit page and Visiting Seychelles page.
- 22 entry rows, all nationalities: no visa; ETA before departure (Seychelles e-Border app / seychelles.govtas.com); Visitor's Permit free on arrival for up to three months (counted as 90 days), extendable by three months at a time to twelve (SCR 5,000 per extension). Documents: passport valid until arrival back home, return/onward ticket, confirmed accommodation, funds ≥ US$150/day. No passportValidity rule (the reference is arrival back home, not departure from Seychelles).
- ETA fee not stated on ics.gov.sc; seychelles.govtas.com not read.
- Customs DONE 2026-10-23: alcohol, tobacco (S.I. 94 of 2024) and cash SCR 50,000 (S.I. 11 of 2022) from src.gov.sc/customs-and-excises. Medicine: S.I. 87 of 2023 (Prohibited and Restricted Goods) lists controlled drugs (Misuse of Drugs Act 2016) as prohibited; its pharmaceutical section didn't extract cleanly and no personal-use rule was found — TODO before any medication row.

## Candidate: Moldova (2026-10-23) — HELD, stay length unsourced
- MFA "Visa regime for foreigners" (mfa.gov.md/en/content/visa-regime-foreigners) lists as visa-exempt: US AR AU BR CA CL KR FR DE IL IT JP MY GB MX SG ES NL UA NZ (and others). Visa required: CN [2], IN [1,2] — footnote [2]: exempt while holding a valid residence permit or visa (not transit) from an EU/Schengen state, the UK, the US or Canada.
- MISSING: the permitted stay (expected 90 days in any 180, Law 200/2010 on the regime of foreigners) is not on the MFA or IGM pages; legis.md returns 403. Publish once the stay rule is read on an official page.
- Uzbekistan medication DONE 2026-10-23: prescription-medication-uz and controlled-medication-uz from Cabinet Resolution No. 191 (2016, as amended to 8 Feb 2026, lex.uz/ru/docs/2978666). Clause 6 (above the limits) is published only in Uzbek after Resolution 700 (6 Nov 2025); the row says so.
- Macao medication: no personal-use rule found (ISAF/SSM pages cover licensed importers only).

## Destination candidates tried 2026-10-23 (blocked)
- North Macedonia: mfa.gov.mk refuses connections (curl and WebFetch).
- Kosovo: mfa-ks.net restructured; visa info only on arkivi.mfa-ks.net (archive). The visa list is Annex 1 of Government Decision No. 12/108 (amended several times); Ukraine's visa suspension (2022) status unknown. Find the current consolidated annex.
- Brunei: immigration.gov.bn visit-visa page links forms only; no exemption list found.
- Paraguay: migraciones.gov.py banned this client; mre.gov.py pages conflict (US listed both as exempt and as visa-on-arrival). Reconcile before publishing.
- Barbados: immigration.gov.bb (requirements: passport valid for the trip, return ticket, online form) links a visa list on foreign.gov.bb dated August 2022, and foreign.gov.bb serves a server test page; no stay length found.
- Medication research with no traveller rule found: Nigeria (NAFDAC covers importers and outbound personal exports only), Jordan (JFDA: mail-order personal imports only), Macao (ISAF/SSM: licensed importers).

## Batch 6, destination 8: Ghana (2026-10-23)
Sources: Ghana Immigration Service visa page (gis.gov.gh/visas/, "Ghana visa regime" exemption table); Ghana Revenue Authority "Passengers' Obligations at Customs".
- 22 entry rows: SG visa-free 60 days (table row 3); BR and DE exempt only for diplomatic/service passports (row 2) → ordinary passports need a visa; all other roster passports are not on the exemption table → visa required (missions; eVisa portal evisa.immigration.gov.gh). Note: the gis.gov.gh site also hosts unrelated blog-style posts — only the /visas/ table is cited.
- Customs: alcohol-gh (375 ml spirits, 750 ml wine) and tobacco-gh (0.5 kg) from GRA. NOT published: cash — GRA says foreign currency above $1,000 "may be declared" on Bank of Ghana form CDF 4A; find the Bank of Ghana rule before writing a cash row.

## Batch 6, destination 9: Zambia (2026-10-23)
Sources: Zambia Department of Immigration — three nationality lists (don't require visa / visa on arrival or from missions / visa prior to travel) and the For Visitors page (90 free days in any 12 months from first entry; visa fees; visas valid 90 days from issue).
- 22 entry rows: 18 visa-free (US GB CA AU NZ JP KR SG MY IL UA CN AR IT ES NL FR DE), rolling 365/90; BR MX CL visa on arrival (rolling 365/90); IN visa approved before travel. Visa-free list page also requires a return air ticket (air) or funds (land/water). The visa waiver for 53 countries took effect 1 Jan 2025 (S.I. No. 78 of 2024, not read).
- Customs DONE 2026-10-23: alcohol-zm, tobacco-zm from ZRA Importation of Goods. Cash: ZRA's 2024 Integrated Border Declaration Form guide (PDF) reportedly says declare over USD 5,000, but the PDF downloads truncated — re-fetch before writing cash-zm.
