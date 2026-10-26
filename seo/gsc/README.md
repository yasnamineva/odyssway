# Search Console exports (kept local, never committed)

The repository is public, so everything in this folder except this README is
git-ignored. Put each monthly export in its own folder: `seo/gsc/YYYY-MM/`.

How to export (Google Search Console → odyssway.com):

1. Performance → Search results.
2. Date: last 28 days. Search type: Web.
3. Export (top right) → Download CSV. You get a .zip with `Queries.csv`,
   `Pages.csv`, `Countries.csv`, `Devices.csv` and others.
4. Unzip it into `seo/gsc/YYYY-MM/` (e.g. `seo/gsc/2026-10/`).

Then ask for the monthly ranking routine (GROWTH_AND_ROADMAP.md §5.1): the
agent turns the CSVs into a work list, starting with striking-distance pages
(position 11–20).
