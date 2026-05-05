**Project brief: Movie Vault**

I want to build and ship a personal web app called Movie Vault. It's a movie tracker — I can log movies I've seen or want to see, rate them, add notes, and manage my watchlist. Desktop-first web app. Here's everything you need to know:

* * *

**What I want to build**

A single-screen web app with two main views:

**Screen 1 — Movie list**

-   Displays all my saved movies
-   Toggle between list view and grid view
-   A dual-mode search bar:
    -   Search mode: filters my existing saved movies in real time as I type
    -   Find mode: same bar, switches to search TMDB's database for new movies to add
-   Sort and filter options (by date added, rating, watched status, mood)

**Screen 2 — Movie detail page**

-   Reached by clicking any movie in the list, OR instantly after adding from TMDB
-   Shows: poster, title, year, synopsis (all pulled from TMDB)
-   User-editable fields: star rating, personal notes, watched status, mood tag, rewatchable toggle

**Add flow**

-   User switches to Find mode in the search bar
-   Types a movie name, TMDB results appear
-   User clicks a result → movie is instantly added to their list and the detail page opens
-   No confirmation modal, no interruptions

* * *

**Tech stack I want to use**

-   Next.js (frontend framework)
-   Tailwind CSS (styling)
-   Supabase (database and auth)
-   TMDB API (movie data)
-   Vercel (deployment)
-   GitHub (version control)