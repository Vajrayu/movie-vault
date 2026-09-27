@AGENTS.md

# Movie Vault: context for Claude

Read this first whenever working on Movie Vault. Keep it up to date: add a line to the **Log** at the end of each session, and update **Status** when something ships.

## What it is
A personal movie tracker web app (desktop-first). Log movies I've seen or want to see, rate them, add notes, tag a mood, and manage a watchlist. Movie data comes from TMDB. Owner: Yuvaraj. It's a learning project for shipping real products with AI-assisted development, and a portfolio piece (tracked as project #3 in `../PROJECTS.md`).

The original brief is `docs/IA.md`, the feature spec is `docs/features.md`, and the target UI is `docs/UI/*.png` (visual references in `docs/references/`). **Check these before building or changing a feature.**

## Status
- **Version:** 0.1.0 in `package.json`, deployed on Vercel: https://movie-vault-orpin.vercel.app/ (live build includes the 2026-09-27 fixes; no version bump yet).
- **Built:** movie list (grid/list toggle, infinite scroll, 20 per page, sort by name / recently added / rating / year, default name A–Z; watched / not watched filter; header shows the total count for the current filter; search, view, sort and scroll position survive visiting a movie and coming back), search bar that filters saved movies and falls back to "Search on TMDB →", TMDB preview page with "Add to vault" (de-dupes on `tmdb_id`), movie detail page with star rating, notes, watched status.
- **Next (from PROJECTS.md):** run the duplicate cleanup SQL and fix the data items in Known gaps; save mood/rewatchable; fix the rating scale; rewrite README as a case study. Later: user accounts, TV shows/series.
- See **Known gaps** below for what's still missing against the spec.

## Stack
- Next.js **16.2** App Router, React 19, TypeScript. **This Next.js version is newer than your training data. Read `node_modules/next/dist/docs/` before using a Next.js API** (see AGENTS.md).
- Tailwind CSS v4 (CSS-first config in `src/app/globals.css`, no tailwind.config file).
- Supabase (`@supabase/supabase-js`), called directly from client components with the anon key. No auth yet.
- TMDB API, called directly from the browser.
- `@tanstack/react-query` (provider in `src/app/providers.tsx`) caches the home list, local search and TMDB search. Detail pages still fetch with hand-rolled `useState`/`useEffect`. After writing to `movies`, call `syncSavedMovie` or invalidate `MOVIES_QUERY_KEY` so the cached list doesn't go stale.
- Hosted on Vercel, repo at https://github.com/Vajrayu/movie-vault.

## Commands
```
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
npx tsc --noEmit # type check
```
Env vars go in `.env.local` (gitignored). Copy `.env.example`. You need `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_TMDB_API_KEY`. The TMDB key can be a v3 API key or a v4 read token (starts with `eyJ`). `useTMDB.ts` handles both. The same vars must be set in Vercel.

## Where things live
```
src/app/page.tsx                   home: header, search bar, grid/list toggle, hero, movie list, TMDB results (all client-side)
src/app/movie/[id]/page.tsx        detail page for a saved movie (Supabase row id); edit + save
src/app/tmdb/movie/[id]/page.tsx   preview of a TMDB movie (TMDB id) + "Add to vault"
src/app/layout.tsx, providers.tsx  root layout (Geist fonts), React Query provider
src/app/globals.css                Tailwind import, --vault-* colour tokens, vault-* utility classes
src/components/MovieCard.tsx       poster card used in grid views
src/hooks/useMovies.ts             Supabase via React Query: sorted infinite list (useMovies), useLocalMovieSearch, syncSavedMovie (cache update after edits)
src/hooks/useTMDB.ts               TMDB: searchMovies, getMovieDetails, useTMDBSearch (cached)
src/lib/supabase.ts                Supabase client
src/lib/homeState.ts               home page UI state (search, view, sort, scroll) kept in memory across navigation
supabase/                          one-off SQL scripts to run by hand in the Supabase SQL editor
public/logos, public/streaming     rating-site and streaming-service logos
docs/                              brief, feature spec, UI mockups, references
```

## Routes and add flow
- `/` → click a saved movie → `/movie/[id]` (Supabase `id`).
- Type in search → local results. Click "Search on TMDB →" → TMDB results. Click one → `/tmdb/movie/[tmdbId]` → **Add to vault** → insert → redirect to `/movie/[id]`.
- The brief wanted "click a TMDB result → instantly added, no interruptions". The current build goes through a preview page first. Treat that as a deliberate change unless Yuvaraj says otherwise.

## Data model (Supabase table `movies`)
There's no schema file or migrations in the repo. This is inferred from the code, so confirm in the Supabase dashboard before changing it:
- Actual columns (checked 2026-09-27): `id`, `title`, `year` (int), `language`, `type`, `genres`, `poster_url`, `runtime`, `overview`, `credits`, `tmdb_rating`, `imdb_rating`, `rt_rating`, `streaming` (comma-separated text), `watched`, `user_rating`, `notes`, `tmdb_id`, `created_at`.
- Most rows came from a bulk import: only ~30 have `tmdb_id`/`created_at`, so "recently added" sorts by `id`, not `created_at`.
- `user_rating` in the data is **out of 10**, but the detail page's star picker is 1–5. One row (Avengers: Endgame) has 3000.

## Design language
Bold "neo-brutalist" pop style: yellow dotted background, thick `#111123` ink borders (3–5px), hard offset shadows (`shadow-[4px_5px_0_#111123]`), heavy uppercase type (font-black), slight rotations on cards, and pink/cyan/green/purple accents. Colours are CSS vars in `globals.css` (`--vault-ink`, `--vault-yellow`, `--vault-pink`, `--vault-cyan`, `--vault-green`, `--vault-purple`), but most components hardcode the hex values. Reuse the `vault-panel`, `vault-chip`, `vault-button`, `vault-shell`, `vault-page` and `vault-float` classes. Posters use plain `<img>` (with the eslint disable), not `next/image`.

## Known gaps / tech debt
Last reviewed 2026-09-27, after the sorting / filter / list-state fixes were deployed.

**Waiting on Yuvaraj**
1. **Duplicates still in the database.** `supabase/2026-09-27-dedupe-movies.sql` removes 107 duplicate rows (538 → 431) and adds unique indexes on `tmdb_id` and `(lower(title), year)`. It hasn't been run yet; run it in the Supabase SQL Editor (Claude isn't allowed to bulk-delete live rows), then delete this item. After it runs, adding a movie whose title + year already exist fails with "Could not add movie."
2. **Data fixes by hand:** Avengers: Endgame has `user_rating` 3000; Oceans 11 has year 2013 (should be 2001); Shutter Island keeps rating 2 after the dedupe (its duplicate had 7), so change it if 7 was right.
3. **Not browser-tested:** scroll restore on back and edits showing on the list straight away were only checked by type check, lint, build and data queries. Click through them on the live site.
4. **`../Projects.xlsx` is behind** `../PROJECTS.md` (live URL, status, next steps, release notes). It was open in Excel, so it wasn't edited.

**Product gaps against the spec**
5. **Mood and Rewatchable don't save.** They're UI-only state on the detail page. They aren't loaded from or written to Supabase, and mood always resets to "loved". Needs columns (`mood`, `rewatchable`) plus load/save wiring. Mood filter/sort depends on this.
6. **Rating scale mismatch:** ratings are stored out of 10 but the detail page's picker is 1–5 stars, so a 7 or 8 shows as 5 stars and saving rewrites it to /5.
7. **Search is one mode.** The brief describes a Search/Find toggle. The build does local filter first, then a "Search on TMDB" link.
8. **"Recently added" sorts by `id`,** because most rows have no `created_at`.

**Tech debt**
9. **Security:** no auth, so whoever has the anon key can read and write the table (check Supabase RLS). The TMDB key is `NEXT_PUBLIC_`, so it's exposed in the browser. Fine for a personal project, but fix it (server route or proxy) before adding accounts.
10. Detail pages still fetch with `useState`/`useEffect`, not React Query.
11. Local search sends a Supabase query on every keystroke (no debounce).
12. Rows are typed as `Record<string, unknown>`; a proper `Movie` type would be a good cleanup.
13. `test.txt` is an empty file committed at the repo root. It can be deleted.
14. README is still the create-next-app boilerplate. It's due to become a case study.
15. Version is still 0.1.0 even though the fixes above are deployed. Bump `package.json` (e.g. 0.2.0) and the tracker when cutting the release.

## Project tracker
Yuvaraj tracks all builds in `../Projects.xlsx` (Projects + Release Log sheets) and `../PROJECTS.md` (markdown mirror). Update **both** when status, version, live URL or next step changes, and add a Release Log row per release. Bump `version` in `package.json` on each release.

## Git / GitHub
- Remote: https://github.com/Vajrayu/movie-vault, branch `main`. Vercel deploys from `main`.
- Commit author email must be the GitHub no-reply address `54944373+Vajrayu@users.noreply.github.com` (set in this repo's local git config). **Never commit with the personal Gmail.** Commits before Sep 2026 used the Mac's local hostname address.
- Only commit or push when Yuvaraj asks.

## Log
- 2026-09-27: Added this CLAUDE.md, `.env.example` and VS Code recommended extensions. Set the repo's git author email to the GitHub no-reply address. Type check and lint were clean at the time. Moving development to VS Code + Claude Code.
- 2026-09-27: Fixed the home list: added explicit ordering (unordered paging was dropping edited movies and repeating rows), a sort control (default name A–Z), React Query caching plus `homeState` so back navigation keeps scroll, search, view and sort, and cache sync after edits/adds. Tab title is now "Movie Vault". Removed TMDB debug logging. Found 107 duplicate DB rows (mostly import copies). Wrote `supabase/2026-09-27-dedupe-movies.sql`; not run yet. Added the live URL.
- 2026-09-27: Added the watched / not watched filter (rows with `watched` = null count as not watched). The list header now shows the total count for the filter (`useMovieCount`), or the number of matches when searching, instead of how many rows have loaded.
- 2026-09-27: Reorganised Known gaps (waiting on Yuvaraj / product / tech debt) and brought Status and PROJECTS.md up to date.
