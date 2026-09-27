'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { MovieCard } from '@/components/MovieCard'
import { useTMDBSearch } from '@/hooks/useTMDB'
import {
  MOVIE_SORTS,
  useLocalMovieSearch,
  useMovies,
  type MovieSort,
} from '@/hooks/useMovies'
import { homeState } from '@/lib/homeState'

export default function Page() {
  const router = useRouter()
  // Seeded from homeState so search, view, sort and scroll survive a trip to a movie page.
  const [query, setQuery] = useState(homeState.query)
  const [tmdbQuery, setTmdbQuery] = useState(homeState.tmdbQuery)
  const [viewMode, setViewMode] = useState(homeState.viewMode)
  const [sort, setSort] = useState<MovieSort>(homeState.sort)
  const { movies, loading, hasMore, loadMore } = useMovies(sort)
  const localSearch = useLocalMovieSearch(query, sort)
  const tmdbSearch = useTMDBSearch(tmdbQuery)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const scrollRestoredRef = useRef(false)
  const hasSearchQuery = query.trim().length > 0
  const showGlobalResults = tmdbQuery.length > 0
  const globalResults = tmdbSearch.data ?? []
  const globalLoading = tmdbSearch.isFetching
  const localSearchResults = localSearch.data ?? []
  const localSearchLoading = localSearch.isPending
  const displayedMovies = hasSearchQuery ? localSearchResults : movies
  const contentReady = showGlobalResults
    ? !tmdbSearch.isPending
    : hasSearchQuery
      ? !localSearch.isPending
      : movies.length > 0 || !loading

  useEffect(() => {
    Object.assign(homeState, { query, tmdbQuery, viewMode, sort })
  }, [query, sort, tmdbQuery, viewMode])

  // Put the page back where it was once the (usually cached) movies have rendered,
  // then keep recording the position for next time.
  useEffect(() => {
    if (!contentReady || scrollRestoredRef.current) {
      return
    }

    scrollRestoredRef.current = true
    window.scrollTo(0, homeState.scrollY)
  }, [contentReady])

  useEffect(() => {
    function saveScroll() {
      if (scrollRestoredRef.current) {
        homeState.scrollY = window.scrollY
      }
    }

    window.addEventListener('scroll', saveScroll, { passive: true })

    return () => window.removeEventListener('scroll', saveScroll)
  }, [])

  useEffect(() => {
    if (hasSearchQuery || showGlobalResults || loading || !hasMore) {
      return
    }

    const loadMoreNode = loadMoreRef.current

    if (!loadMoreNode) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void loadMore()
        }
      },
      { rootMargin: '600px 0px' }
    )

    observer.observe(loadMoreNode)

    return () => observer.disconnect()
  }, [hasMore, hasSearchQuery, loadMore, loading, showGlobalResults])

  function handleFindMovie() {
    setTmdbQuery(query.trim())
  }

  function renderLocalGrid() {
    return (
      <div className="grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4 lg:gap-8">
        {displayedMovies.map((movie, index) => (
          <MovieCard
            key={String(movie.id ?? index)}
            id={String(movie.id)}
            title={String(movie.title ?? 'Untitled movie')}
            poster_url={String(movie.poster_url ?? '')}
            year={String(movie.year ?? '')}
            user_rating={
              movie.user_rating == null ? null : String(movie.user_rating)
            }
          />
        ))}
      </div>
    )
  }

  function renderLocalList() {
    return (
      <div className="space-y-4">
        {displayedMovies.map((movie, index) => {
          const title = String(movie.title ?? 'Untitled movie')
          const posterUrl = String(movie.poster_url ?? '')
          const year = String(movie.year ?? '')
          const userRating =
            movie.user_rating == null ? null : String(movie.user_rating)

          return (
            <button
              key={String(movie.id ?? index)}
              type="button"
              onClick={() => router.push(`/movie/${String(movie.id)}`)}
              className="vault-panel flex w-full items-center gap-4 p-3 text-left transition duration-200 hover:-translate-y-1 sm:gap-5 sm:p-4"
            >
              <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl border-[3px] border-[#111123] bg-[#111123] sm:h-32 sm:w-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterUrl}
                  alt={`${title} poster`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="line-clamp-2 text-2xl font-black uppercase leading-none text-[#111123] sm:text-3xl">
                  {title}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {year && (
                    <span className="text-sm font-black uppercase text-[#111123]/65">
                      {year}
                    </span>
                  )}
                  {userRating != null && (
                    <span className="vault-chip bg-[#ff1b8d] text-white">
                      Rating: {userRating}
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  function renderTMDBGrid() {
    return (
      <div className="grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4 lg:gap-8">
        {globalResults.map((movie) => (
          <div key={movie.id} className="relative [&_a]:pointer-events-none">
            <MovieCard
              id={movie.id}
              title={movie.title}
              poster_url={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : ''
              }
              year={movie.release_date.slice(0, 4)}
            />
            <button
              type="button"
              onClick={() => router.push(`/tmdb/movie/${movie.id}`)}
              aria-label={`View ${movie.title} TMDB details`}
              className="absolute inset-0 z-10 rounded-[1.25rem]"
            />
          </div>
        ))}
      </div>
    )
  }

  function renderTMDBList() {
    return (
      <div className="space-y-4">
        {globalResults.map((movie) => {
          const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : ''
          const year = movie.release_date.slice(0, 4)

          return (
            <button
              key={movie.id}
              type="button"
              onClick={() => router.push(`/tmdb/movie/${movie.id}`)}
              className="vault-panel flex w-full items-center gap-4 p-3 text-left transition duration-200 hover:-translate-y-1 sm:gap-5 sm:p-4"
            >
              <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl border-[3px] border-[#111123] bg-[#111123] sm:h-32 sm:w-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterUrl}
                  alt={`${movie.title} poster`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="line-clamp-2 text-2xl font-black uppercase leading-none text-[#111123] sm:text-3xl">
                  {movie.title}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {year && (
                    <span className="text-sm font-black uppercase text-[#111123]/65">
                      {year}
                    </span>
                  )}
                  <span className="vault-chip bg-[#19c9ff] text-[#111123]">
                    TMDB
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <main className="min-h-screen text-[#111123]">
      <section className="border-b-[5px] border-[#111123] bg-white px-4 py-4 sm:px-6 lg:px-8">
        <nav className="vault-shell grid items-center gap-4 lg:grid-cols-[1fr_minmax(240px,440px)_1fr]">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 rotate-[-5deg] rounded-2xl border-[3px] border-[#111123] bg-white shadow-[4px_5px_0_#111123]">
              <div className="absolute left-3 top-3 h-7 w-7 rounded-md border-[3px] border-[#111123] bg-[#19c9ff]" />
              <div className="absolute right-1 top-0 flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-[#111123] bg-[#fff70d] text-[10px] font-black">
                +
              </div>
            </div>
            <div>
              <p className="text-2xl font-black uppercase leading-none">
                MOVIE VAULT
              </p>
              <p className="text-xs font-black uppercase tracking-normal">
                Your collection
              </p>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border-[3px] border-[#111123] bg-white px-4 py-3 shadow-[4px_5px_0_#111123]">
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setTmdbQuery('')
              }}
              placeholder="Filter your movies..."
              className="min-w-0 flex-1 bg-transparent text-sm font-black text-[#111123] outline-none placeholder:text-[#111123]/45"
            />
            <span className="relative h-5 w-5 rounded-full border-[3px] border-[#111123] after:absolute after:-bottom-1 after:-right-1 after:h-2 after:w-[3px] after:rotate-[-45deg] after:rounded-full after:bg-[#111123]" />
          </label>

          <div className="flex justify-start gap-3 lg:justify-end">
            {(['grid', 'list'] as const).map((mode) => {
              const isActive = viewMode === mode

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  aria-label={`${mode} view`}
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-[#111123] text-sm font-black uppercase shadow-[4px_5px_0_#111123] transition duration-200 ${
                    isActive
                      ? 'scale-105 bg-[#111123] text-white shadow-[5px_6px_0_#ff1b8d]'
                      : 'bg-white text-[#111123] opacity-55 hover:opacity-100'
                  }`}
                >
                  {mode === 'grid' ? (
                    <span className="grid grid-cols-2 gap-1">
                      <span className="h-2 w-2 rounded-sm bg-current" />
                      <span className="h-2 w-2 rounded-sm bg-current" />
                      <span className="h-2 w-2 rounded-sm bg-current" />
                      <span className="h-2 w-2 rounded-sm bg-current" />
                    </span>
                  ) : (
                    <span className="space-y-1">
                      <span className="block h-1.5 w-6 rounded-full bg-current" />
                      <span className="block h-1.5 w-6 rounded-full bg-current" />
                      <span className="block h-1.5 w-6 rounded-full bg-current" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>
      </section>

      <section className="relative overflow-hidden border-b-[5px] border-[#111123] bg-[#f5e90a] px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <div className="pointer-events-none absolute left-6 top-9 hidden sm:block">
          <span
            className="vault-float flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-[#111123] bg-[#ff1b8d] text-xs font-black text-[#111123] shadow-[5px_6px_0_#111123]"
            style={{ '--vault-rotate': '-4deg' } as CSSProperties}
          >
            FILM
          </span>
        </div>
        <div className="pointer-events-none absolute left-20 bottom-14 hidden md:block">
          <span
            className="vault-float flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-[#111123] bg-[#19c9ff] text-xs font-black text-[#111123] shadow-[5px_6px_0_#111123] [animation-delay:1.4s]"
            style={{ '--vault-rotate': '5deg' } as CSSProperties}
          >
            PLAY
          </span>
        </div>
        <div className="pointer-events-none absolute right-16 top-14 hidden md:block">
          <span
            className="vault-float flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-[#111123] bg-[#fff70d] text-xs font-black text-[#111123] shadow-[5px_6px_0_#111123] [animation-delay:.8s]"
            style={{ '--vault-rotate': '6deg' } as CSSProperties}
          >
            RATE
          </span>
        </div>
        <div className="pointer-events-none absolute right-7 bottom-16 hidden sm:block">
          <span
            className="vault-float flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-[#111123] bg-[#28f277] text-xs font-black text-[#111123] shadow-[5px_6px_0_#111123] [animation-delay:2s]"
            style={{ '--vault-rotate': '-7deg' } as CSSProperties}
          >
            STAR
          </span>
        </div>

        <div className="vault-shell">
          <p className="vault-chip mx-auto mb-6 w-fit rotate-[-1deg] bg-[#111123] text-white">
            Your personal collection
          </p>
          <h1 className="text-6xl font-black uppercase leading-[0.88] tracking-normal text-[#111123] drop-shadow-[6px_6px_0_#19c9ff] sm:text-8xl lg:text-9xl">
            MOVIE VAULT
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-black leading-7 sm:text-2xl">
            Track, rate, and organize your favorite films in the most epic way
            possible.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-[98rem] space-y-9">
          {(hasSearchQuery ? localSearchLoading : loading && movies.length === 0) ? (
            <p className="vault-panel inline-flex rotate-[-1deg] px-5 py-3 text-base font-black">
              Loading movies...
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="pl-1 text-sm font-black uppercase tracking-normal text-[#111123] sm:text-base">
                  {showGlobalResults
                    ? `${globalResults.length} TMDB results`
                    : `${displayedMovies.length} movies`}
                </p>

                {!showGlobalResults && (
                  <label className="flex items-center gap-3 rounded-2xl border-[3px] border-[#111123] bg-white py-2 pl-4 pr-2 shadow-[4px_5px_0_#111123]">
                    <span className="text-xs font-black uppercase">Sort</span>
                    <select
                      value={sort}
                      onChange={(event) => setSort(event.target.value as MovieSort)}
                      className="cursor-pointer bg-transparent text-sm font-black text-[#111123] outline-none"
                    >
                      {MOVIE_SORTS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              {showGlobalResults ? (
                globalLoading ? (
                  <p className="vault-panel inline-flex rotate-[-1deg] px-5 py-3 text-base font-black">
                    Loading movies...
                  </p>
                ) : (
                  <>{viewMode === 'grid' ? renderTMDBGrid() : renderTMDBList()}</>
                )
              ) : (
                <>{viewMode === 'grid' ? renderLocalGrid() : renderLocalList()}</>
              )}

              {hasSearchQuery && !showGlobalResults && (
                <button
                  type="button"
                  onClick={() => void handleFindMovie()}
                  className="inline-flex pl-1 text-sm font-black text-[#111123] underline decoration-[3px] underline-offset-4 transition duration-200 hover:text-[#ff1b8d] sm:text-base"
                >
                  Didn&apos;t find what you&apos;re looking for? Search on TMDB →
                </button>
              )}

              {!hasSearchQuery && !showGlobalResults && (
                <div ref={loadMoreRef} className="h-8">
                  {loading && movies.length > 0 && (
                    <p className="vault-panel inline-flex rotate-[-1deg] px-5 py-3 text-base font-black">
                      Loading movies...
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
