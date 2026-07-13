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

## Blocked on research (no primary source identified yet)

- [ ] Bilateral visa-waiver agreements (`bilateral-candidates.json`): NZ with
      many Schengen states; reported US arrangements with DK / NO / PL; possible
      CA / AU / JP. Need the actual agreement texts or official state
      announcements of continued application (CISA Art. 20(2)) — national
      foreign-ministry / border-authority pages are the likely primary sources.
- [ ] `overstay-penalties.json`: per-state fine/ban ranges from national law or
      official authority pages.
- [ ] `ees.json`: per-state EES data-access authority, channel, form, timeline
      (start with FR, ES, DE, IT, NL) — national DPA / border authority pages.
- [ ] `eu-items.json`: Directive 2007/74/EC allowances, Regulation (EU)
      2018/1672 cash rules, Regulation (EU) 2019/2122 animal products — the
      directives/regulations are on EUR-Lex (see access problem above); the EC's
      taxation/customs and food-safety pages may serve as fetchable primary
      sources.
