import { useSyncExternalStore } from 'react'

import type { MovieSort, WatchedFilter } from '@/hooks/useMovies'

// Home page UI state that should survive visiting a movie and coming back.
// Kept in memory for client-side navigation and mirrored to sessionStorage, so it also
// survives a full reload in the same tab (a refresh, or the hard reload Next.js does
// when a new deploy lands mid-session).
export type HomeUiState = {
  query: string
  tmdbQuery: string // the search last sent to TMDB; empty when showing the vault
  viewMode: 'grid' | 'list'
  sort: MovieSort
  watched: WatchedFilter
}

const DEFAULT_STATE: HomeUiState = {
  query: '',
  tmdbQuery: '',
  viewMode: 'grid',
  sort: 'title',
  watched: 'all',
}

const STORAGE_KEY = 'movie-vault:home'

let state = DEFAULT_STATE
let scrollY = 0
let loaded = false
let persistTimer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === 'undefined') {
    return
  }

  loaded = true

  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')

    if (saved) {
      state = { ...DEFAULT_STATE, ...saved.state }
      scrollY = Number(saved.scrollY) || 0
    }
  } catch {
    // Storage blocked or corrupt: fall back to defaults.
  }
}

function persist() {
  clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ state, scrollY }))
    } catch {
      // Storage unavailable: state still lives in memory for this session.
    }
  }, 150)
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => listeners.delete(listener)
}

function getSnapshot() {
  load()
  return state
}

// The server (and the hydration pass) always render the defaults; React then
// re-renders with the saved state, so there's no hydration mismatch.
function getServerSnapshot() {
  return DEFAULT_STATE
}

export function useHomeState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function setHomeState(changes: Partial<HomeUiState>) {
  load()
  state = { ...state, ...changes }
  persist()
  listeners.forEach((listener) => listener())
}

export function getSavedScroll() {
  load()
  return scrollY
}

export function saveScroll(y: number) {
  scrollY = y
  persist()
}
