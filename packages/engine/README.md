# @borderline/engine

Pure-TypeScript Schengen 90/180 calculation engine. **Zero framework
dependencies** (only `zod`, for the data schemas) so it can later power a
mobile app or API unchanged.

## API

```ts
import { status, planTrip, maxStay, nextEntry } from "@borderline/engine";

status(trips, "2026-07-12");            // days used / remaining on a date
planTrip(trips, entry, exit);           // is this future trip compliant? first violating day?
maxStay(trips, entry);                  // longest compliant stay from an entry date
nextEntry(trips, desiredStay, from);    // earliest entry allowing an N-day stay
```

All functions optionally take an `EngineContext` carrying **verified** rule
data (`countries`, `bilateralAgreements`). Dates are ISO `YYYY-MM-DD` strings;
all arithmetic is date-only (integer epoch days — no local-timezone `Date`
math, see `src/date.ts`).

Unverified or unknown scenarios throw `CannotComputeError` — the engine
never silently guesses (Accuracy Policy, AGENTS.md §3.6).

## Rules encoded, with legal sources

| # | Rule | Where | Legal source |
|---|------|-------|--------------|
| 1 | Max 90 days of presence within **any** rolling 180-day window `[D − 179, D]`, both bounds inclusive; no fixed reset | `engine.ts` (`WINDOW_DAYS`, `MAX_DAYS_IN_WINDOW`, `countInWindow`) | **Regulation (EU) 2016/399 (Schengen Borders Code), Art. 6(1)**: "no more than 90 days in any 180-day period, which entails considering the 180-day period preceding each day of stay" — verified against the consolidated text of 12 Oct 2025 ([CELEX 02016R0399-20251012](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02016R0399-20251012), retrieved via the Publications Office CELLAR API on 2026-07-13). Restated in the [EC calculator manual](https://ec.europa.eu/assets/home/visa-calculator/docs/short_stay_schengen_calculator_user_manual_en.pdf) §1. |
| 2 | Entry day and exit day both count as days of stay | `presence.ts` (inclusive expansion) | **SBC Art. 6(2)**: "the date of entry shall be considered as the first day of stay … the date of exit shall be considered as the last day of stay" (consolidated text, verified 2026-07-13). |
| 3 | Days under a residence permit or long-stay (D) visa in the **issuing** state do not consume the allowance; days in other Schengen states do | `presence.ts` (`residence_permit_issuing_state`) | **SBC Art. 6(2)**: "Periods of stay authorised under a residence permit or a long-stay visa shall not be taken into account in the calculation…" (consolidated text, verified 2026-07-13). |
| 4 | 90 days of uninterrupted absence always allows a fresh 90-day stay (used as the termination bound for `nextEntry`) | `engine.ts` (`findNextEntryDay`) | Same manual, §1. |
| 5 | Bilateral visa-waiver extensions (CISA Art. 20(2)) may exclude a post-allowance stay in one state — **only** for a `verified` agreement row; anything else refuses to compute | `presence.ts` (`bilateral_agreement`) | Convention Implementing the Schengen Agreement, Art. 20(2), as described in the manual §2. Per-agreement terms live in `data/bilateral-agreements.json`; the agreement's own day limit is **not** enforced by the engine yet (UI must surface `caveats` + `howToInvoke`). |
| 6 | Days in non-Schengen countries never count; Schengen membership is resolved **per date** via `schengenSince` (historic accessions) | `presence.ts` (`non_schengen_country`, `pre_accession_days`) | Manual §1 (Cyprus/Ireland/UK excluded; IS/LI/NO/CH included). Membership data lives in `data/countries.json`, verified against primary official sources (per-claim citations in its `_sources`). |
| 7 | Unknown country codes, missing/unverified bilateral agreements → explicit `CannotComputeError`, never a guess | `presence.ts`, `errors.ts` | Accuracy Policy (AGENTS.md §3). |

## Tests

- `test/golden.kom.test.ts` — **golden tests**: the worked examples from the
  European Commission's official calculator user manual (provenance in
  `test/fixtures/kom-cases.json`). The engine matches the official calculator
  on all of them.
- `test/date.test.ts` — date-only arithmetic: leap years, DST-immunity,
  malformed/nonexistent dates.
- `test/presence.test.ts` — overlap merging, same-day trips, permit/bilateral
  exclusions, per-date accession handling, fail-loud paths.
- `test/engine.test.ts` — all four queries incl. 180-day boundary straddles.
- `test/property.test.ts` — property: removing a day of presence never
  decreases `remaining` (seeded PRNG, 300 runs).

Run with `pnpm test`.

## Caveats / not yet implemented

- Bilateral-agreement stays are excluded from the 90/180 count but their own
  duration limit is not enforced (no verified numeric limits in data yet).
- The engine does not model visa-sticker limits shorter than 90/180 (same
  limitation as the official calculator).
- EU/EEA/CH dual citizens: out of engine scope by design — the UI detects this
  from the nationality picker and explains that 90/180 does not apply
  (AGENTS.md §6.4.2).
