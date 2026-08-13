# /data — verified rule data (the crown jewels)

Every file here is production rule data. **Nothing lands in this directory
unless every value has been checked against a primary official source, with
the source cited** (Accuracy Policy, AGENTS.md §3 — owner decision 2026-07-13:
source verification, no human editorial review pass).

- Primary sources only: EUR-Lex / Official Journal, europa.eu institution
  pages, national government authorities. Blogs/news/SEO sites are never a
  basis — only a way to locate the primary source.
- Schemas: `packages/engine/src/schemas.ts` (Zod).
- CI gate: `scripts/validate-data.ts` fails the build on schema violations,
  on any row with `status !== "verified"`, and on any production code
  referencing `data/UNVERIFIED/`.

## Workflow for new/changed rules

1. Research the value; locate the primary official source.
2. If the primary source is reachable and confirms the value: write it here
   directly with `legal_source`, per-claim `_sources` entries (URL + date
   checked), `verified_at: <today>`, `verified_by` (`agent:<model>` or a human
   name), `status: "verified"`.
3. If only secondary sources support it, or the primary source can't be
   reached (e.g. EUR-Lex blocks automation): draft it in `data/UNVERIFIED/`
   with `status: "needs_verification"` and add the blocker to
   `data/UNVERIFIED/TODO.md`. The build excludes this directory.
4. When two official sources conflict, the legally controlling text
   (regulation / Official Journal) wins; record the conflict in `_sources`.
5. `pnpm validate:data` must pass. The §11 source watcher re-flags values when
   watched official pages change; re-check and bump `verified_at`.

## Files (see AGENTS.md §5 for schemas)

| File | Status |
|---|---|
| `countries.json` | **live** — verified 2026-07-13 |
| `etias.json` | **live** — verified 2026-07-13 (fee-exemption ages pending, see TODO) |
| `nationality-rules.json` | **live** — top 15 visa-exempt nationalities, verified 2026-07-13 (Reg. 2018/1806 Annex II consolidated) |
| `ees.json` | **live** — FR/ES/DE/IT/NL with DPA contacts (Art. 53(2) basis); designated controllers pending (see TODO) |
| `destinations.json` | **live** — 16 destinations: US, GB, CA, JP, KE, ZA, MX, TH, RW, NG, EG, IN, TR, MA, AU, AE. Brazil queued next (see `UNVERIFIED/destinations.json` + TODO) |
| `entry-requirements.json` | **live** — full 15-nationality roster × all 16 destinations above (232 rows, per-row citations) |
| `customs-items.json` | **live** — destination-keyed customs verdicts for the same 16 destinations plus the `"EU"` harmonized-Schengen sentinel (148 rows, per-row citations) |
| `bilateral-agreements.json` | not started — candidates in `UNVERIFIED/bilateral-candidates.json` |
| `overstay-penalties.json` | not started |
| `eu-items.json` | not started |
