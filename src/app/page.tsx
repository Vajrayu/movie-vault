'use client'

import { useState, type CSSProperties } from 'react'
import { MovieCard } from '@/components/MovieCard'
import { useMovies } from '@/hooks/useMovies'

export default function Page() {
  const { movies, loading, hasMore, loadMore } = useMovies()
  const [searchMode, setSearchMode] = useState<'search' | 'find'>('find')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <main className="min-h-screen text-[#111123]">
      <section className="border-b-[5px] border-[#111123] bg-white px-4 py-4 sm:px-6 lg:px-8">
        <nav className="vault-shell grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
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

          <div className="grid gap-3 sm:grid-cols-[auto_minmax(240px,440px)]">
            <div className="flex rounded-2xl border-[3px] border-[#111123] bg-white p-1 shadow-[4px_5px_0_#111123]">
              {(['search', 'find'] as const).map((mode) => {
                const isActive = searchMode === mode

                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSearchMode(mode)}
                    className={`rounded-xl px-4 py-2 text-sm font-black uppercase transition duration-200 ${
                      isActive
                        ? 'scale-105 bg-[#111123] text-white shadow-[2px_3px_0_#19c9ff]'
                        : 'bg-white text-[#111123] opacity-55 hover:opacity-100'
                    }`}
                  >
                    {mode}
                  </button>
                )
              })}
            </div>

            <label className="flex items-center gap-3 rounded-2xl border-[3px] border-[#111123] bg-white px-4 py-3 shadow-[4px_5px_0_#111123]">
              <input
                type="search"
                placeholder="Filter your movies..."
                className="min-w-0 flex-1 bg-transparent text-sm font-black text-[#111123] outline-none placeholder:text-[#111123]/45"
              />
              <span className="relative h-5 w-5 rounded-full border-[3px] border-[#111123] after:absolute after:-bottom-1 after:-right-1 after:h-2 after:w-[3px] after:rotate-[-45deg] after:rounded-full after:bg-[#111123]" />
            </label>
          </div>

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
          {loading && movies.length === 0 ? (
            <p className="vault-panel inline-flex rotate-[-1deg] px-5 py-3 text-base font-black">
              Loading movies...
            </p>
          ) : (
            <>
              <p className="pl-1 text-sm font-black uppercase tracking-normal text-[#111123] sm:text-base">
                {movies.length} movies
              </p>

              <div className="grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4 lg:gap-8">
                {movies.map((movie, index) => (
                  <MovieCard
                    key={String(movie.id ?? index)}
                    id={String(movie.id)}
                    title={String(movie.title ?? 'Untitled movie')}
                    poster_url={String(movie.poster_url ?? '')}
                    year={String(movie.year ?? '')}
                    user_rating={
                      movie.user_rating == null
                        ? null
                        : String(movie.user_rating)
                    }
                  />
                ))}
              </div>

              {hasMore && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loading}
                  className="vault-button bg-[#ff1b8d] text-white"
                >
                  {loading ? 'Loading...' : 'Load more'}
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
