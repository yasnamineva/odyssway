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

## Blocked on EUR-Lex access (blocks a page automation can't finish)

EUR-Lex rejects automated fetching (HTML and PDF endpoints return empty to
non-browser clients). These need either a manual copy-paste of the article
text or an alternate official mirror:

- [ ] ETIAS fee-exemption age brackets — confirm Regulation (EU) 2018/1240
      Art. 18 wording (reported: fee waived under 18 / over 70; authorisation
      still required). Until confirmed, `etias.json` ships with `exemptions: []`
      and the /etias/status page must not mention age brackets.
- [ ] Exact article/paragraph of Regulation (EU) 2016/399 defining the 90/180
      short stay (engine README currently cites the EC manual's restatement,
      which is official but secondary to the regulation).
- [ ] EES Regulation (EU) 2017/2226 — articles granting record access/
      rectification rights (needed for `ees.json` and template letters).

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
