'use client'

export type TMDBMovie = {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  overview: string
}

export type TMDBMovieDetails = TMDBMovie & {
  runtime: number | null
  genres: string[]
  vote_average: number | null
  cast: string[]
}

type TMDBSearchResponse = {
  page?: number
  results?: Array<{
    id: number
    title?: string | null
    poster_path?: string | null
    release_date?: string | null
    overview?: string | null
  }>
  total_pages?: number
  total_results?: number
}

type TMDBMovieDetailsResponse = {
  id: number
  title?: string | null
  poster_path?: string | null
  release_date?: string | null
  overview?: string | null
  runtime?: number | null
  genres?: Array<{
    id: number
    name?: string | null
  }>
  vote_average?: number | null
  credits?: {
    cast?: Array<{
      id: number
      name?: string | null
    }>
  }
}

function getTMDBRequestInit(apiKey: string): {
  searchParams: URLSearchParams
  requestInit: RequestInit
} {
  const isBearerToken = apiKey.startsWith('eyJ')
  const searchParams = new URLSearchParams()

  if (!isBearerToken) {
    searchParams.set('api_key', apiKey)
  }

  return {
    searchParams,
    requestInit: {
      cache: 'no-store',
      headers: isBearerToken ? { Authorization: `Bearer ${apiKey}` } : undefined,
    },
  }
}

export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  const trimmedQuery = query.trim()

  console.log('[TMDB search] searchMovies called', { query: trimmedQuery })

  if (!trimmedQuery) {
    console.log('[TMDB search] searchMovies returning empty results for empty query')
    return []
  }

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY

  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_TMDB_API_KEY')
  }

  const { searchParams, requestInit } = getTMDBRequestInit(apiKey)
  searchParams.set('query', trimmedQuery)

  console.log('[TMDB search] Requesting TMDB search', {
    query: trimmedQuery,
    authMode: apiKey.startsWith('eyJ') ? 'bearer' : 'api_key',
  })

  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?${searchParams.toString()}`,
    requestInit
  )

  console.log('[TMDB search] TMDB response received', {
    ok: response.ok,
    status: response.status,
  })

  if (!response.ok) {
    throw new Error('Failed to search TMDB movies')
  }

  const data = (await response.json()) as TMDBSearchResponse
  console.log('[TMDB search] TMDB API response body', {
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    rawResultsCount: data.results?.length ?? 0,
    sampleResults: data.results?.slice(0, 3).map((movie) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
    })),
  })

  const results = (data.results ?? []).map((movie) => ({
    id: movie.id,
    title: movie.title ?? '',
    poster_path: movie.poster_path ?? null,
    release_date: movie.release_date ?? '',
    overview: movie.overview ?? '',
  }))

  console.log('[TMDB search] searchMovies returning results', {
    count: results.length,
  })

  return results
}

export async function getMovieDetails(id: number): Promise<TMDBMovieDetails> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY

  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_TMDB_API_KEY')
  }

  const { searchParams, requestInit } = getTMDBRequestInit(apiKey)
  searchParams.set('append_to_response', 'credits')

  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?${searchParams.toString()}`,
    requestInit
  )

  if (!response.ok) {
    throw new Error('Failed to load TMDB movie details')
  }

  const data = (await response.json()) as TMDBMovieDetailsResponse

  return {
    id: data.id,
    title: data.title ?? '',
    poster_path: data.poster_path ?? null,
    release_date: data.release_date ?? '',
    overview: data.overview ?? '',
    runtime: data.runtime ?? null,
    genres:
      data.genres
        ?.map((genre) => genre.name ?? '')
        .filter((genre) => genre.trim() !== '') ?? [],
    vote_average: data.vote_average ?? null,
    cast:
      data.credits?.cast
        ?.slice(0, 8)
        .map((person) => person.name ?? '')
        .filter((name) => name.trim() !== '') ?? [],
  }
}
