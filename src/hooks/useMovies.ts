'use client'

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'

export type Movie = Record<string, unknown>

export type MovieSort = 'title' | 'recent' | 'rating' | 'year'

export type WatchedFilter = 'all' | 'watched' | 'unwatched'

export const MOVIE_SORTS: { id: MovieSort; label: string }[] = [
  { id: 'title', label: 'Name (A–Z)' },
  { id: 'recent', label: 'Recently added' },
  { id: 'rating', label: 'Your rating' },
  { id: 'year', label: 'Release year' },
]

export const WATCHED_FILTERS: { id: WatchedFilter; label: string }[] = [
  { id: 'all', label: 'All movies' },
  { id: 'watched', label: 'Watched' },
  { id: 'unwatched', label: 'Not watched' },
]

const PAGE_SIZE = 20

// Every query under this key holds movie rows; used to patch or refetch them after an edit.
export const MOVIES_QUERY_KEY = ['movies'] as const

// Without an explicit order Postgres returns rows in physical order, which shifts
// whenever a row is updated, so paginated results skip and repeat movies.
// `id` is the tiebreaker that keeps pages stable (and stands in for "date added").
function filteredMovies(watched: WatchedFilter, head = false) {
  const query = supabase
    .from('movies')
    .select('*', head ? { count: 'exact', head: true } : undefined)

  if (watched === 'watched') {
    return query.eq('watched', true)
  }

  // Some rows have watched = null; treat those as not watched.
  if (watched === 'unwatched') {
    return query.not('watched', 'is', true)
  }

  return query
}

function orderedMovies(sort: MovieSort, watched: WatchedFilter) {
  const query = filteredMovies(watched)

  switch (sort) {
    case 'recent':
      return query.order('id', { ascending: false })
    case 'rating':
      return query
        .order('user_rating', { ascending: false, nullsFirst: false })
        .order('title', { ascending: true })
        .order('id', { ascending: true })
    case 'year':
      return query
        .order('year', { ascending: false, nullsFirst: false })
        .order('title', { ascending: true })
        .order('id', { ascending: true })
    default:
      return query.order('title', { ascending: true }).order('id', { ascending: true })
  }
}

async function fetchMovieBatch(
  sort: MovieSort,
  watched: WatchedFilter,
  pageToFetch: number
) {
  const from = pageToFetch * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const { data, error } = await orderedMovies(sort, watched).range(from, to)

  if (error) {
    throw error
  }

  return (data ?? []) as Movie[]
}

export function useMovies(sort: MovieSort, watched: WatchedFilter) {
  const query = useInfiniteQuery({
    queryKey: [...MOVIES_QUERY_KEY, 'list', sort, watched],
    queryFn: ({ pageParam }) => fetchMovieBatch(sort, watched, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
  })

  return {
    movies: query.data?.pages.flat() ?? [],
    loading: query.isPending || query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    error: query.error,
    loadMore: query.fetchNextPage,
  }
}

// Total rows matching the filter, so the header shows the whole collection size
// rather than however many pages have loaded so far.
export function useMovieCount(watched: WatchedFilter) {
  return useQuery({
    queryKey: [...MOVIES_QUERY_KEY, 'count', watched],
    queryFn: async () => {
      const { count, error } = await filteredMovies(watched, true)

      if (error) {
        throw error
      }

      return count ?? 0
    },
  })
}

export function useLocalMovieSearch(
  searchQuery: string,
  sort: MovieSort,
  watched: WatchedFilter
) {
  const trimmedQuery = searchQuery.trim()

  return useQuery({
    queryKey: [...MOVIES_QUERY_KEY, 'search', trimmedQuery, sort, watched],
    queryFn: async () => {
      const { data, error } = await orderedMovies(sort, watched).ilike(
        'title',
        `%${trimmedQuery}%`
      )

      if (error) {
        throw error
      }

      return (data ?? []) as Movie[]
    },
    enabled: trimmedQuery.length > 0,
    placeholderData: keepPreviousData,
  })
}

// Call after a movie is saved: patches it into every cached list straight away (so going
// back shows the edit with no flash), then refetches in the background in case the edit
// changed where the movie sorts.
export function syncSavedMovie(queryClient: QueryClient, savedMovie: Movie) {
  const replace = (movie: Movie) =>
    movie.id === savedMovie.id ? savedMovie : movie

  queryClient.setQueriesData<InfiniteData<Movie[]> | Movie[] | number>(
    { queryKey: MOVIES_QUERY_KEY },
    (cached) => {
      if (!cached) {
        return cached
      }

      if (typeof cached === 'number') {
        return cached
      }

      if (Array.isArray(cached)) {
        return cached.map(replace)
      }

      return { ...cached, pages: cached.pages.map((page) => page.map(replace)) }
    }
  )

  void queryClient.invalidateQueries({ queryKey: MOVIES_QUERY_KEY })
}
