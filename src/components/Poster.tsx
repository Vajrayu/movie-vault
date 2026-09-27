type PosterProps = {
  src: string
  title: string
  className?: string
}

// Poster image, or a labelled placeholder when the movie has no poster
// (an empty src makes the browser re-request the page).
export function Poster({ src, title, className = '' }: PosterProps) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={`${title}: no poster`}
        className={`flex items-center justify-center bg-[#19c9ff] p-2 text-center text-xs font-black uppercase text-[#111123] ${className}`}
      >
        No poster
      </div>
    )
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={`${title} poster`} className={className} />
}
