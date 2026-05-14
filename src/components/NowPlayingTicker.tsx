import { Disc3 } from 'lucide-react'
import type { Release } from '../features/dashboard/schema'

export function NowPlayingTicker({ releases }: { releases: Release[] }) {
  const items = releases.filter((r) => r.status === 'Live').slice(0, 6)
  if (!items.length) return null

  const track = (r: Release) => `${r.artist} — ${r.title}`
  const doubled = [...items, ...items]

  return (
    <div className="relative overflow-hidden rounded-full border border-white/[0.06] bg-white/[0.02]">
      <div className="flex items-center gap-6 whitespace-nowrap py-2 pl-4 pr-8 animate-[marquee_32s_linear_infinite]">
        {doubled.map((r, i) => (
          <span key={`${r.id}-${i}`} className="inline-flex items-center gap-2 text-xs text-slate-400">
            <Disc3 size={12} className="shrink-0 animate-[spin_3s_linear_infinite] text-cyan-300/60" />
            <span>{track(r)}</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400/80">{r.dsp}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
