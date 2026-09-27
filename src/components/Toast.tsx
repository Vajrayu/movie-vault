'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

type ToastTone = 'success' | 'error'

type Toast = {
  id: number
  message: string
  tone: ToastTone
}

type ShowToast = (message: string, tone?: ToastTone) => void

const TOAST_DURATION_MS = 3200

const ToastContext = createContext<ShowToast>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

// Lives in the root layout, so a toast survives navigation (e.g. "added" then redirect).
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback<ShowToast>(
    (message, tone = 'success') => {
      nextId.current += 1
      const id = nextId.current

      setToasts((current) => [...current, { id, message, tone }])
      setTimeout(() => dismiss(id), TOAST_DURATION_MS)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-3 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={`vault-toast pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border-[3px] border-[#111123] py-3 pl-3 pr-4 text-sm font-black uppercase leading-5 shadow-[6px_7px_0_#111123,0_18px_28px_rgba(17,17,35,0.22)] ${
              toast.tone === 'success'
                ? 'bg-[#28f277] text-[#111123]'
                : 'bg-[#ff1b8d] text-white'
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-[#111123] bg-white text-base text-[#111123]">
              {toast.tone === 'success' ? '✓' : '!'}
            </span>
            <span className="min-w-0 flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
              className="ml-1 shrink-0 text-lg leading-none opacity-70 transition hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
