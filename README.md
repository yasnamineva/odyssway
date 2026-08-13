# Odyssway

Trip-compliance platform: **Trip Check** (`/trip-check`) answers "I'm from
⟨nationality⟩, going to ⟨destination⟩, bringing ⟨items⟩ — can I go, for how
long, what do I need, and can I bring it?" across 16 verified destinations
(and growing), built on top of an edge-case-aware Schengen 90/180 calculator,
EES record-correction guides, and an ETIAS launch tracker. **Read `AGENTS.md`
before contributing — the Accuracy Policy (§3) overrides everything else.**

## Layout

```
/apps/web            # Next.js app (App Router, Tailwind v4, next-intl)
/packages/engine     # pure-TS Schengen calculation engine + tests
/content             # MDX guides (en/, later bg/, tr/, sr/…)
/data                # verified rule data (JSON) — the crown jewels
/data/UNVERIFIED     # agent-drafted data awaiting primary-source verification
/scripts             # data validation (CI gate), source change detection
```

## Commands

```bash
pnpm install
pnpm dev             # run the web app (http://localhost:3000)
pnpm test            # unit tests: engine (incl. official EC golden cases) + web
pnpm test:e2e        # browser tests: builds, serves, and drives the real UI
pnpm typecheck
pnpm validate:data   # Accuracy Policy gate (also runs in CI)
pnpm watch:sources   # diff watched official sources, report changes
pnpm build
```

## Testing

Four automated layers, all run by CI on every push (`.github/workflows/ci.yml`):

1. **Engine unit + golden tests** (`pnpm --filter @odyssway/engine test`) —
   61 tests: all four queries, date math (leap years, DST-immunity), presence
   edge cases (permits, bilateral, accession dates), a 300-run property test,
   and the **golden cases**: every worked example from the European
   Commission's official calculator manual must produce identical results.
2. **Web unit tests** (`pnpm --filter web test`) — share-URL encoding/decoding
   (round-trips, legacy links, malformed input), trip-check resolution, PDF
   report lines, and `.ics` reminder generation.
3. **Data validation** (`pnpm validate:data`) — schema-checks /data, rejects
   unverified rows in production and any production reference to UNVERIFIED.
4. **E2E browser tests** (`pnpm test:e2e`) — Playwright drives the real UI
   (local Chrome; Chromium in CI): counting, overstay warnings, Ireland
   exclusion, Bulgaria's 2024 accession boundary, residence-permit exclusion,
   trip planning, share links, reversed-date handling, every route, sitemap,
   and a mobile-viewport overflow check.

Manual spot-check: `pnpm dev`, then compare any scenario against the
[official EU calculator](https://ec.europa.eu/assets/home/visa-calculator/calculator.htm?lang=en)
— results must match.

## Deploying to Vercel

The app is a standard Next.js project inside a pnpm workspace; Vercel
handles this natively:

1. Push the repo to GitHub (`git remote add origin … && git push -u origin main`).
2. In Vercel: **Add New → Project → import the repo**, and set
   **Root Directory = `apps/web`** (Framework: Next.js is auto-detected;
   install runs at the workspace root automatically).
3. Set the environment variables (Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_SITE_URL` — the production origin, e.g. `https://yourdomain.com`
     (used by `sitemap.xml` / `robots.txt`).
   - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — optional; leave unset to ship without
     analytics.
4. Deploy. Every push to `main` redeploys; CI (typecheck, tests, data gate,
   e2e) runs on GitHub Actions in parallel — make Vercel wait on it via
   "Ignored Build Step"/checks if you want gating.

CLI alternative from `apps/web`: `npx vercel login`, then `npx vercel`
(preview) / `npx vercel --prod`.

## Status

(Phase numbers refer to AGENTS.md §12.)

- **Phase 0 (foundation): done.** Engine implements all four queries
  (`status`, `planTrip`, `maxStay`, `nextEntry`), edge-case handling
  (residence permits, bilateral basis, per-date accession), and matches every
  worked example in the European Commission's official calculator manual
  (golden tests). CI runs typecheck + tests + data validation + build.
- **Phase 1 (launch surface): done.** Calculator UI, `/rules/90-180-rule`,
  the `/ees` hub + dispute/data-access guides, `/etias/status`, trust pages,
  disclaimers, schema.org, sitemap, Plausible.
- **Phase 1.5 (general trip-check platform): live and growing.** `/trip-check`
  resolves entry eligibility, stay length, required documents, and customs
  verdicts for **16 verified destinations** (US, GB, CA, Japan, Kenya, South
  Africa, Mexico, Thailand, Rwanda, Nigeria, Egypt, India, Turkey, Morocco,
  Australia, UAE — plus the Schengen Area) across the full 15-nationality
  roster, every fact individually cited. Brazil is next in the queue
  (`data/UNVERIFIED/destinations.json`); the homepage shows a live, computed
  coverage count. `/` is the marketing landing page; `/calculator` remains
  the dedicated Schengen deep-dive.
- **Phase 2 (retention): partially shipped.** Client-only, no-account, no-server
  border-proof PDF export and passport-expiry / 90-day-limit reminders
  (`.ics` download) are live. Email alerts and synced accounts (would need
  Supabase + a GDPR review) are still open — see AGENTS.md §12.

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
