# Borderline (working name)

Schengen compliance product: an edge-case-aware 90/180 calculator, EES
record-correction guides, an ETIAS launch tracker, and an EU customs item
checker. **Read `AGENTS.md` before contributing — the Accuracy Policy (§3)
overrides everything else.**

## Layout

```
/apps/web            # Next.js app (App Router, Tailwind v4, next-intl)
/packages/engine     # pure-TS Schengen calculation engine + tests
/content             # MDX guides (en/, later bg/, tr/, sr/…)
/data                # human-verified rule data (JSON) — the crown jewels
/data/UNVERIFIED     # agent-drafted data awaiting human verification
/scripts             # data validation (CI gate), source change detection
```

## Commands

```bash
pnpm install
pnpm dev             # run the web app
pnpm test            # engine tests, incl. official EC golden cases
pnpm typecheck
pnpm validate:data   # Accuracy Policy gate (also runs in CI)
pnpm watch:sources   # diff watched official sources, report changes
pnpm build
```

## Status

- **Phase 0 (foundation): done.** Engine implements all four queries
  (`status`, `planTrip`, `maxStay`, `nextEntry`), edge-case handling
  (residence permits, bilateral basis, per-date accession), and matches every
  worked example in the European Commission's official calculator manual
  (golden tests). CI runs typecheck + tests + data validation + build.
- **Phase 1 (launch surface): started.** Client-side calculator UI with
  URL-shareable state lives at `/` and `/calculator`, including a country
  picker backed by `data/countries.json` (non-Schengen stays excluded,
  BG/RO/HR accession dates handled per-date). Remaining: content pages,
  `/etias/status` page (data is ready), schema.org, sitemap, Plausible domain
  config.

## Verification workflow (short version)

Owner decision 2026-07-13: **source verification, no human review pass.**
Every production value must be checked against a primary official source
(EUR-Lex, europa.eu institutions, national authorities) and cited, with
`verified_at` + `verified_by` (`agent:<model>` or a human) and per-claim
`_sources`. Values supported only by secondary sources, or whose primary
source is unreachable, stay in `data/UNVERIFIED/` with
`status: "needs_verification"` and are excluded from the build.
`scripts/validate-data.ts` enforces all of this in CI. Details:
`data/README.md`.
