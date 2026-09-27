'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useToast } from '@/components/Toast'
import { MOVIES_QUERY_KEY } from '@/hooks/useMovies'
import { getMovieDetails, type TMDBMovieDetails } from '@/hooks/useTMDB'
import { supabase } from '@/lib/supabase'

export default function TMDBMoviePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const showToast = useToast()
  const tmdbId = Number(params.id)
  const isValidTmdbId = Number.isFinite(tmdbId)
  const [movie, setMovie] = useState<TMDBMovieDetails | null>(null)
  const [loading, setLoading] = useState(isValidTmdbId)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadMovieDetails() {
      setLoading(true)
      setError('')

      try {
        const details = await getMovieDetails(tmdbId)

        if (isMounted) {
          setMovie(details)
        }
      } catch {
        if (isMounted) {
          setError('Could not load TMDB movie details.')
          setMovie(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (!isValidTmdbId) {
      return
    }

    loadMovieDetails()

    return () => {
      isMounted = false
    }
  }, [isValidTmdbId, tmdbId])

  async function handleAddToVault() {
    if (!movie || adding) {
      return
    }

    setAdding(true)

    const { data: existingMovie, error: existingMovieError } = await supabase
      .from('movies')
      .select('id')
      .eq('tmdb_id', movie.id)
      .maybeSingle()

    if (existingMovieError) {
      showToast('Could not add movie. Try again.', 'error')
      setAdding(false)
      return
    }

    if (existingMovie) {
      showToast(`${movie.title} is already in your vault`)
      router.push(`/movie/${existingMovie.id}`)
      return
    }

    const { data: insertedMovie, error: insertError } = await supabase
      .from('movies')
      .insert({
        title: movie.title,
        year: movie.release_date.slice(0, 4),
        poster_url: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : '',
        overview: movie.overview,
        tmdb_id: movie.id,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertError || !insertedMovie) {
      showToast('Could not add movie. Try again.', 'error')
      setAdding(false)
      return
    }

    void queryClient.invalidateQueries({ queryKey: MOVIES_QUERY_KEY })
    showToast(`Added ${movie.title} to your vault`)
    router.push(`/movie/${insertedMovie.id}`)
  }

  const detailsError = isValidTmdbId
    ? error
    : 'Could not load TMDB movie details.'

  if (loading) {
    return (
      <main className="vault-page">
        <p className="vault-panel inline-flex rotate-[-1deg] px-5 py-3 text-base font-black">
          Loading TMDB movie...
        </p>
      </main>
    )
  }

  if (detailsError || !movie) {
    return (
      <main className="vault-page">
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="vault-button bg-white"
          >
            Back to Search
          </button>
          <p className="vault-panel inline-flex rotate-[-1deg] px-5 py-3 text-base font-black text-[#ff1b8d]">
            {detailsError || 'Could not load TMDB movie details.'}
          </p>
        </div>
      </main>
    )
  }

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : ''
  const year = movie.release_date.slice(0, 4)
  const rating =
    movie.vote_average == null ? null : movie.vote_average.toFixed(1)

  return (
    <main className="vault-page py-8 sm:py-10">
      <title>{`${movie.title} · Movie Vault`}</title>
      <div className="mx-auto flex max-w-7xl flex-wrap gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="vault-button rotate-[-1deg] bg-white"
        >
          Back to Search
        </button>
        <Link href="/" scroll={false} className="vault-button bg-white">
          Back to movies
        </Link>
      </div>

      <article className="mx-auto mt-7 grid max-w-7xl gap-8 lg:grid-cols-[minmax(280px,430px)_1fr] lg:items-start lg:gap-10">
        <div className="relative h-fit rotate-[-1.5deg] overflow-hidden rounded-[1.35rem] border-[3px] border-[#111123] bg-white p-2 shadow-[10px_12px_0_#111123,0_24px_40px_rgba(17,17,35,0.23)]">
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt={`${movie.title} poster`}
              className="aspect-[2/3] w-full rounded-[1rem] border-[3px] border-[#111123] object-cover"
            />
          ) : (
            <div className="flex aspect-[2/3] w-full items-center justify-center rounded-[1rem] border-[3px] border-[#111123] bg-[#19c9ff] p-6 text-center text-2xl font-black uppercase">
              No Poster
            </div>
          )}
          <div className="absolute right-[-0.75rem] top-[-0.75rem] flex h-16 w-16 rotate-[8deg] items-center justify-center rounded-full border-[3px] border-[#111123] bg-[#19c9ff] text-lg font-black shadow-[5px_6px_0_#111123]">
            TMDB
          </div>
        </div>

        <div className="space-y-7">
          <section className="vault-panel rotate-[0.3deg] space-y-6 p-6 sm:p-8">
            <h1 className="text-5xl font-black uppercase leading-none tracking-normal text-[#111123] sm:text-7xl">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              {year && (
                <p className="text-lg font-black uppercase text-[#111123]/75">
                  {year}
                </p>
              )}
              {movie.runtime != null && (
                <p className="vault-chip bg-[#111123] text-white">
                  {movie.runtime} min
                </p>
              )}
              {rating != null && (
                <p className="vault-chip bg-[#ff1b8d] text-white">
                  TMDB: {rating}
                </p>
              )}
            </div>

            {movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span key={genre} className="vault-chip bg-[#19c9ff] text-[#111123]">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <p className="max-w-4xl text-base font-semibold leading-7 text-[#111123]/85 sm:text-lg sm:leading-8">
              {movie.overview || 'No synopsis available.'}
            </p>
          </section>

          <section className="vault-panel-yellow rotate-[-0.3deg] space-y-5 p-5 sm:p-7">
            <h2 className="text-3xl font-black uppercase leading-none text-[#111123] sm:text-4xl">
              Cast
            </h2>
            <div className="flex flex-wrap gap-2">
              {movie.cast.length > 0 ? (
                movie.cast.map((person) => (
                  <span key={person} className="vault-chip bg-white text-[#111123]">
                    {person}
                  </span>
                ))
              ) : (
                <p className="text-base font-black text-[#111123]/75">
                  No cast available.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void handleAddToVault()}
                disabled={adding}
                className="vault-button bg-[#28f277]"
              >
                {adding ? 'Adding...' : 'Add To Vault'}
              </button>
            </div>
          </section>
        </div>
      </article>
    </main>
  )
}
