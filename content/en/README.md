# /content/en

MDX guides land here in Phase 1+ (`/rules/90-180-rule`, `/ees/*`, guides).
Every page must map to a row in AGENTS.md §7's table, cite its legal source,
and show "Last verified: {date}". No filler posts.

`blog/` is the one exception AGENTS.md §13.7 allows explicitly: each post's
metadata (`apps/web/lib/blog.ts`) must carry a real `legal_source` and
`verifiedAt` tied to an actual change in our own data — a post that doesn't
trace to a citation doesn't ship.
