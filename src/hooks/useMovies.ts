'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PostgrestError } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

export type Movie = Record<string, unknown>

const PAGE_SIZE = 20

async function fetchMovieBatch(pageToFetch: number) {
  const from = pageToFetch * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  return supabase.from('movies').select('*').range(from, to)
}

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [error, setError] = useState<PostgrestError | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadInitialMovies() {
      const { data, error } = await fetchMovieBatch(0)

      if (!isMounted) {
        return
      }

      if (error) {
        setError(error)
      } else {
        const batch = data ?? []

        setMovies(batch)
        setHasMore(batch.length === PAGE_SIZE)
        setPage(0)
      }

      setLoading(false)
    }

    loadInitialMovies()

    return () => {
      isMounted = false
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) {
      return
    }

    setLoading(true)
    setError(null)

    const nextPage = page + 1
    const { data, error } = await fetchMovieBatch(nextPage)

    if (error) {
      setError(error)
      setLoading(false)
      return
    }

    const batch = data ?? []

    setMovies((currentMovies) => [...currentMovies, ...batch])
    setHasMore(batch.length === PAGE_SIZE)
    setPage(nextPage)
    setLoading(false)
  }, [hasMore, loading, page])

  return { movies, loading, hasMore, page, error, loadMore }
}
