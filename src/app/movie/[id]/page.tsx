'use client'

import Link from 'next/link'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import type { PostgrestError } from '@supabase/supabase-js'

import { Poster } from '@/components/Poster'
import { useToast } from '@/components/Toast'
import { syncSavedMovie, type Movie } from '@/hooks/useMovies'
import { supabase } from '@/lib/supabase'

function getFirstMovieValue(movie: Movie, keys: string[]) {
  for (const key of keys) {
    const value = movie[key]

    if (value != null && String(value).trim() !== '') {
      return String(value)
    }
  }

  return null
}

function getFirstMovieRawValue(movie: Movie, keys: string[]) {
  for (const key of keys) {
    const value = movie[key]

    if (value != null && String(value).trim() !== '') {
      return value
    }
  }

  return null
}

function normalizePlatformValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizePlatformValue(item))
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const nestedProviders = record.flatrate ?? record.providers ?? record.results

    if (nestedProviders != null) {
      return normalizePlatformValue(nestedProviders)
    }

    return normalizePlatformValue(
      record.provider_name ?? record.name ?? record.platform ?? record.provider,
    )
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim()

    if (trimmedValue.startsWith('[') || trimmedValue.startsWith('{')) {
      try {
        return normalizePlatformValue(JSON.parse(trimmedValue) as unknown)
      } catch {
        return [trimmedValue]
      }
    }

    return trimmedValue
      .split(/[,|]/)
      .map((platform) => platform.trim())
      .filter(Boolean)
  }

  return []
}

export default function MoviePage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const queryClient = useQueryClient()
  const showToast = useToast()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<PostgrestError | null>(null)
  const [userRating, setUserRating] = useState('')
  const [notes, setNotes] = useState('')
  const [watched, setWatched] = useState(false)
  const [mood, setMood] = useState('loved')
  const [rewatchable, setRewatchable] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function fetchMovie() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .single()

      if (!isMounted) {
        return
      }

      if (error) {
        setError(error)
        setMovie(null)
      } else {
        setMovie(data)
        setUserRating(data.user_rating == null ? '' : String(data.user_rating))
        setNotes(data.notes == null ? '' : String(data.notes))
        setWatched(data.watched === true)
      }

      setLoading(false)
    }

    fetchMovie()

    return () => {
      isMounted = false
    }
  }, [id])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)

    const ratingValue = userRating === '' ? null : Number(userRating)
    const { data, error } = await supabase
      .from('movies')
      .update({
        user_rating: Number.isNaN(ratingValue) ? null : ratingValue,
        notes,
        watched,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      showToast('Could not save changes. Try again.', 'error')
    } else {
      setMovie(data)
      setUserRating(data.user_rating == null ? '' : String(data.user_rating))
      setNotes(data.notes == null ? '' : String(data.notes))
      setWatched(data.watched === true)
      showToast(`Saved ${String(data.title ?? 'movie')}`)
      syncSavedMovie(queryClient, movie ?? data, data)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <main className="vault-page">
        <p className="vault-panel inline-flex rotate-[-1deg] px-5 py-3 text-base font-black">
          Loading movie...
        </p>
      </main>
    )
  }

  if (error || !movie) {
    return (
      <main className="vault-page">
        <p className="vault-panel inline-flex rotate-[-1deg] px-5 py-3 text-base font-black text-[#ff1b8d]">
          Movie not found.
        </p>
      </main>
    )
  }

  const title = String(movie.title ?? 'Untitled movie')
  const posterUrl = String(movie.poster_url ?? '')
  const overview = String(movie.overview ?? '')
  const year = String(movie.year ?? '')
  const tmdbId = getFirstMovieValue(movie, ['tmdb_id', 'tmdbId'])
  const rating = movie.user_rating ?? movie.rating
  const criticRatings = [
    {
      name: 'IMDb',
      logo: '/logos/imdb.svg',
      value: getFirstMovieValue(movie, [
        'imdb_rating',
        'imdbRating',
        'imdb_score',
        'imdbScore',
        'imdb',
      ]),
    },
    {
      name: 'Rotten Tomatoes',
      logo: '/logos/rotten-tomatoes.svg',
      value: getFirstMovieValue(movie, [
        'rotten_tomatoes_rating',
        'rottenTomatoesRating',
        'rotten_tomatoes',
        'rottenTomatoes',
        'rt_rating',
        'rtRating',
      ]),
    },
    {
      name: 'TMDB',
      logo: '/logos/tmdb.svg',
      value: getFirstMovieValue(movie, [
        'tmdb_rating',
        'tmdbRating',
        'tmdb_score',
        'tmdbScore',
        'vote_average',
        'voteAverage',
      ]),
    },
  ].filter((source) => source.value != null)
  const streamingIcons = [
    {
      name: 'Netflix',
      logo: '/streaming/netflix.svg',
      aliases: ['netflix'],
    },
    {
      name: 'Prime Video',
      logo: '/streaming/prime-video.svg',
      aliases: ['prime video', 'amazon prime', 'amazon prime video', 'prime'],
    },
    {
      name: 'Disney+',
      logo: '/streaming/disney-plus.svg',
      aliases: ['disney+', 'disney plus', 'disney'],
    },
    {
      name: 'Hulu',
      logo: '/streaming/hulu.svg',
      aliases: ['hulu'],
    },
    {
      name: 'Max',
      logo: '/streaming/max.svg',
      aliases: ['max', 'hbo max'],
    },
    {
      name: 'Apple TV+',
      logo: '/streaming/apple-tv.svg',
      aliases: ['apple tv+', 'apple tv', 'apple'],
    },
    {
      name: 'Paramount+',
      logo: '/streaming/paramount-plus.svg',
      aliases: ['paramount+', 'paramount plus', 'paramount'],
    },
    {
      name: 'Peacock',
      logo: '/streaming/peacock.svg',
      aliases: ['peacock'],
    },
  ]
  const streamingValue = getFirstMovieRawValue(movie, [
    'streaming_platforms',
    'streamingPlatforms',
    'streaming',
    'platforms',
    'available_on',
    'availableOn',
    'watch_providers',
    'watchProviders',
    'providers',
  ])
  const streamingNames = normalizePlatformValue(streamingValue).map((platform) =>
    platform.toLowerCase(),
  )
  const streamingPlatforms = streamingIcons.filter((platform) =>
    platform.aliases.some((alias) =>
      streamingNames.some((name) => name.includes(alias)),
    ),
  )
  const numericRating = Number(userRating)
  const selectedStars = Number.isFinite(numericRating)
    ? Math.max(0, Math.min(5, Math.round(numericRating)))
    : 0
  const moods = [
    { id: 'happy', label: 'Happy', icon: '☺', color: 'bg-[#fff70d]' },
    { id: 'meh', label: 'Meh', icon: '⊙', color: 'bg-[#19c9ff]' },
    { id: 'sad', label: 'Sad', icon: '☹', color: 'bg-[#7c3aed] text-white' },
    { id: 'loved', label: 'Loved It', icon: '♡', color: 'bg-[#ff1b8d] text-white' },
    { id: 'epic', label: 'Epic', icon: 'ϟ', color: 'bg-[#28f277]' },
  ]

  return (
    <main className="vault-page py-8 sm:py-10">
      <title>{`${title} · Movie Vault`}</title>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-wrap gap-3">
          <Link href="/" scroll={false} className="vault-button rotate-[-1deg] bg-white">
            Back to movies
          </Link>
          {tmdbId && (
            <Link href={`/tmdb/movie/${tmdbId}`} className="vault-button bg-white">
              Movie Details
            </Link>
          )}
        </div>
      </div>

      <article className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(280px,430px)_1fr] lg:items-start lg:gap-10">
        <div className="relative h-fit rotate-[-1.5deg] overflow-hidden rounded-[1.35rem] border-[3px] border-[#111123] bg-white p-2 shadow-[10px_12px_0_#111123,0_24px_40px_rgba(17,17,35,0.23)]">
          <Poster
            src={posterUrl}
            title={title}
            className="aspect-[2/3] w-full rounded-[1rem] border-[3px] border-[#111123] object-cover"
          />
          <div className="absolute right-[-0.75rem] top-[-0.75rem] flex h-16 w-16 rotate-[8deg] items-center justify-center rounded-full border-[3px] border-[#111123] bg-[#19c9ff] text-xl font-black shadow-[5px_6px_0_#111123]">
            MV
          </div>
        </div>

        <div className="space-y-7">
          <section className="vault-panel rotate-[0.3deg] space-y-6 p-6 sm:p-8">
            <h1 className="text-5xl font-black uppercase leading-none tracking-normal text-[#111123] sm:text-7xl">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-lg font-black uppercase text-[#111123]/75">
                {year}
              </p>

              {rating != null && (
                <p className="vault-chip bg-[#ff1b8d] text-white">
                  Rating: {String(rating)}
                </p>
              )}
            </div>

            {criticRatings.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                {criticRatings.map((source) => (
                  <div
                    key={source.name}
                    className="flex items-center gap-2 rounded-full border-[3px] border-[#111123] bg-white px-3 py-2 shadow-[3px_4px_0_#111123]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={source.logo}
                      alt={`${source.name} logo`}
                      className="h-5 w-auto shrink-0"
                    />
                    <span className="text-sm font-black text-[#111123]">
                      {source.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {streamingPlatforms.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {streamingPlatforms.map((platform) => (
                  <div
                    key={platform.name}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-[2px] border-[#111123] bg-white shadow-[2px_3px_0_#111123]"
                    title={platform.name}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={platform.logo}
                      alt={`${platform.name} logo`}
                      className="h-7 w-7 rounded-full"
                    />
                  </div>
                ))}
              </div>
            )}

            <p className="max-w-4xl text-base font-semibold leading-7 text-[#111123]/85 sm:text-lg sm:leading-8">
              {overview}
            </p>
          </section>

          <form
            onSubmit={handleSubmit}
            className="vault-panel-yellow rotate-[-0.3deg] p-5 sm:p-7"
          >
            <div className="space-y-6 rounded-[1rem] border-[3px] border-[#111123] bg-white p-5 shadow-[5px_6px_0_#111123] sm:p-6">
              <h2 className="text-3xl font-black uppercase leading-none text-[#111123] sm:text-4xl">
                Control Panel
              </h2>

              <div className="space-y-3">
                <p className="text-xs font-black uppercase text-[#111123]">
                  Your rating
                </p>
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isActive = star <= selectedStars

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(String(star))}
                        aria-label={`${star} star rating`}
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] text-3xl font-black shadow-[4px_5px_0_#111123] transition duration-200 hover:-translate-y-1 ${
                          isActive
                            ? 'scale-105 border-[#111123] bg-[#111123] text-[#fff70d] shadow-[5px_6px_0_#ff1b8d,0_12px_18px_rgba(17,17,35,0.2)]'
                            : 'border-[#111123] bg-white text-[#111123] opacity-70 shadow-[3px_4px_0_#111123]'
                        }`}
                      >
                        ★
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-black uppercase text-[#111123]">
                  Mood
                </p>
                <div className="flex flex-wrap gap-3">
                  {moods.map((moodOption) => {
                    const isActive = mood === moodOption.id

                    return (
                      <button
                        key={moodOption.id}
                        type="button"
                        onClick={() => setMood(moodOption.id)}
                        className={`rounded-2xl border-[3px] px-5 py-3 text-sm font-black uppercase shadow-[4px_5px_0_#111123] transition duration-200 hover:-translate-y-1 ${
                          moodOption.color
                        } ${
                          isActive
                            ? 'scale-105 border-[#111123] shadow-[6px_7px_0_#111123,0_14px_20px_rgba(17,17,35,0.2)]'
                            : 'border-[#111123]/75 opacity-65 shadow-[3px_4px_0_#111123]'
                        }`}
                      >
                        <span className="mr-2 text-base leading-none">
                          {moodOption.icon}
                        </span>
                        {moodOption.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-xs font-black uppercase text-[#111123]">
                  Notes
                </span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={5}
                  placeholder="What did you think?"
                  className="min-h-40 w-full resize-y rounded-[1.35rem] border-[2px] border-[#111123]/80 bg-white px-5 py-4 text-base font-semibold leading-7 text-[#111123] outline-none shadow-[3px_4px_0_#111123] transition placeholder:text-[#111123]/40 focus:-translate-y-0.5 focus:border-[3px] focus:border-[#111123] focus:bg-[#fffdf0] focus:ring-4 focus:ring-[#19c9ff]/30"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setWatched((currentWatched) => !currentWatched)}
                  className={`rounded-full border-[3px] px-6 py-4 text-sm font-black uppercase shadow-[4px_5px_0_#111123] transition duration-200 hover:-translate-y-1 ${
                    watched
                      ? 'scale-[1.03] border-[#111123] bg-[#19c9ff] shadow-[6px_7px_0_#111123]'
                      : 'border-[#111123]/75 bg-white opacity-65 shadow-[3px_4px_0_#111123]'
                  }`}
                >
                  {watched ? '✓ Watched' : 'Watched'}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setRewatchable((currentRewatchable) => !currentRewatchable)
                  }
                  className={`rounded-full border-[3px] px-6 py-4 text-sm font-black uppercase shadow-[4px_5px_0_#111123] transition duration-200 hover:-translate-y-1 ${
                    rewatchable
                      ? 'scale-[1.03] border-[#111123] bg-[#28f277] shadow-[6px_7px_0_#111123]'
                      : 'border-[#111123]/75 bg-white opacity-65 shadow-[3px_4px_0_#111123]'
                  }`}
                >
                  {rewatchable ? '✓ Rewatchable' : 'Rewatchable'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="vault-button bg-[#28f277]"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </article>
    </main>
  )
}
