@AGENTS.md

# Movie Vault: context for Claude

Read this first whenever working on Movie Vault. Keep it up to date: add a line to the **Log** at the end of each session, and update **Status** when something ships.

## What it is
A personal movie tracker web app (desktop-first). Log movies I've seen or want to see, rate them, add notes, tag a mood, and manage a watchlist. Movie data comes from TMDB. Owner: Yuvaraj. It's a learning project for shipping real products with AI-assisted development, and a portfolio piece (tracked as project #3 in `../PROJECTS.md`).

The original brief is `docs/IA.md`, the feature spec is `docs/features.md`, and the target UI is `docs/UI/*.png` (visual references in `docs/references/`). **Check these before building or changing a feature.**

## Status
- **Version:** 0.1.0, deployed on Vercel: https://movie-vault-orpin.vercel.app/
- **Built:** movie list (grid/list toggle, infinite scroll, 20 per page, sort by name / recently added / rating / year, default name A–Z; search, view, sort and scroll position survive visiting a movie and coming back), search bar that filters saved movies and falls back to "Search on TMDB →", TMDB preview page with "Add to vault" (de-dupes on `tmdb_id`), movie detail page with star rating, notes, watched status.
- **Next (from PROJECTS.md):** rewrite README as a case study. Later: user accounts, TV shows/series.
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
- Rows are typed as `Record<string, unknown>` everywhere. A proper `Movie` type would be a good cleanup.

## Design language
Bold "neo-brutalist" pop style: yellow dotted background, thick `#111123` ink borders (3–5px), hard offset shadows (`shadow-[4px_5px_0_#111123]`), heavy uppercase type (font-black), slight rotations on cards, and pink/cyan/green/purple accents. Colours are CSS vars in `globals.css` (`--vault-ink`, `--vault-yellow`, `--vault-pink`, `--vault-cyan`, `--vault-green`, `--vault-purple`), but most components hardcode the hex values. Reuse the `vault-panel`, `vault-chip`, `vault-button`, `vault-shell`, `vault-page` and `vault-float` classes. Posters use plain `<img>` (with the eslint disable), not `next/image`.

## Known gaps / tech debt
1. **Mood and Rewatchable don't save.** They're UI-only state on the detail page. They aren't loaded from or written to Supabase, and mood always resets to "loved". Needs columns (`mood`, `rewatchable`) plus load/save wiring.
2. **No filter, no mood sort.** Sorting by name / recently added / rating / year is done. Filtering (watched status, mood) isn't, and mood can't be sorted until it's saved (gap 1).
3. **Search is one mode.** The brief describes a Search/Find toggle. The build does local filter first, then a "Search on TMDB" link.
4. **Duplicates:** `supabase/2026-09-27-dedupe-movies.sql` removes 107 duplicate rows and adds unique indexes. Delete this line once it has been run.
5. **Rating scale mismatch:** see Data model (stored /10, UI shows 5 stars).
6. **Security:** no auth, so whoever has the anon key can read and write the table (check Supabase RLS). The TMDB key is `NEXT_PUBLIC_`, so it's exposed in the browser. Fine for a personal project, but fix it (server route or proxy) before adding accounts.
7. Detail pages don't use React Query yet.
8. `test.txt` is an empty file committed at the repo root. It can be deleted.
9. README is still the create-next-app boilerplate. It's due to become a case study.

## Project tracker
Yuvaraj tracks all builds in `../Projects.xlsx` (Projects + Release Log sheets) and `../PROJECTS.md` (markdown mirror). Update **both** when status, version, live URL or next step changes, and add a Release Log row per release. Bump `version` in `package.json` on each release.

## Git / GitHub
- Remote: https://github.com/Vajrayu/movie-vault, branch `main`. Vercel deploys from `main`.
- Commit author email must be the GitHub no-reply address `54944373+Vajrayu@users.noreply.github.com` (set in this repo's local git config). **Never commit with the personal Gmail.** Commits before Sep 2026 used the Mac's local hostname address.
- Only commit or push when Yuvaraj asks.

## Log
- 2026-09-27: Added this CLAUDE.md, `.env.example` and VS Code recommended extensions. Set the repo's git author email to the GitHub no-reply address. Type check and lint were clean at the time. Moving development to VS Code + Claude Code.
- 2026-09-27: Fixed the home list: added explicit ordering (unordered paging was dropping edited movies and repeating rows), a sort control (default name A–Z), React Query caching plus `homeState` so back navigation keeps scroll, search, view and sort, and cache sync after edits/adds. Tab title is now "Movie Vault". Removed TMDB debug logging. Found 107 duplicate DB rows (mostly import copies). Wrote `supabase/2026-09-27-dedupe-movies.sql`; not run yet. Added the live URL.
