import Link from 'next/link'

type MovieCardProps = {
  id: number | string
  title: string
  poster_url: string
  year: number | string
  user_rating?: number | string | null
}

export function MovieCard({
  id,
  title,
  poster_url,
  year,
  user_rating,
}: MovieCardProps) {
  return (
    <Link
      href={`/movie/${id}`}
      className="block [&:nth-child(4n+1)>article]:rotate-[-1.4deg] [&:nth-child(4n+2)>article]:rotate-[0.8deg] [&:nth-child(4n+3)>article]:rotate-[-0.5deg] [&:nth-child(4n+4)>article]:rotate-[1.2deg]"
    >
      <article className="group relative overflow-hidden rounded-[1.25rem] border-[3px] border-[#111123] bg-white shadow-[6px_8px_0_#111123,0_16px_26px_rgba(17,17,35,0.18)] transition duration-300 ease-out hover:-translate-y-3 hover:rotate-[0.5deg] hover:scale-[1.035] hover:shadow-[10px_13px_0_#111123,0_28px_42px_rgba(17,17,35,0.24)]">
        <div className="relative m-2 mb-0 overflow-hidden rounded-[0.9rem] border-[3px] border-[#111123] bg-[#111123]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster_url}
            alt={`${title} poster`}
            className="aspect-[2/3] w-full rounded-[0.65rem] object-cover transition duration-300 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 rounded-[0.65rem] bg-[linear-gradient(180deg,rgba(245,233,10,0)_50%,rgba(255,27,141,0.28)_100%)] opacity-0 transition duration-300 group-hover:opacity-100" />
        </div>

        {user_rating != null && (
          <p className="absolute right-4 top-[calc(100%-6.5rem)] z-10 flex h-12 w-12 rotate-[-8deg] items-center justify-center rounded-full border-[3px] border-[#111123] bg-white text-sm font-black text-[#111123] shadow-[4px_5px_0_#111123] transition duration-300 group-hover:scale-110 group-hover:bg-[#fff70d]">
            {user_rating}
          </p>
        )}

        <div className="min-h-28 space-y-2 rounded-b-[1rem] bg-white px-4 pb-5 pt-4">
          <h2 className="line-clamp-2 text-lg font-black leading-5 tracking-normal text-[#111123] transition duration-300 group-hover:text-[#ff1b8d] sm:text-xl sm:leading-6">
            {title}
          </h2>
          <p className="text-sm font-black uppercase text-[#111123]/65">
            {year}
          </p>
        </div>
      </article>
    </Link>
  )
}
