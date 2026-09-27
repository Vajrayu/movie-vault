import type { MovieSort, WatchedFilter } from '@/hooks/useMovies'

// Home page UI state that should survive visiting a movie and coming back.
// It lives at module level, so it persists across client-side navigation and
// resets on a full page reload (which also keeps the server render in sync).
export const homeState = {
  query: '',
  tmdbQuery: '', // the search last sent to TMDB; empty when showing the vault
  viewMode: 'grid' as 'grid' | 'list',
  sort: 'title' as MovieSort,
  watched: 'all' as WatchedFilter,
  scrollY: 0,
}
