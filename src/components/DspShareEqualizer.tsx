import { cn } from '../lib/cn'
import { DSP_COLORS } from '../features/dashboard/dspColors'

const BAR_COUNT = 9

function barHeights(seed: string, pct: number) {
  const out: number[] = []
  for (let i = 0; i < BAR_COUNT; i++) {
    const v = (seed.charCodeAt(i % Math.max(seed.length, 1)) + i * 11 + pct * 3) % 50
    out.push(32 + v + pct * 0.15)
  }
  return out
}

function Ring({ pct, color, dspKey }: { pct: number; color: string; dspKey: string }) {
  const circum = 2 * Math.PI * 14
  const dash = (pct / 100) * circum
  const safe = dspKey.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')
  const filterId = `ring-glow-${safe}`

  return (
    <svg width="52" height="52" viewBox="-8 -8 64 64" className="shrink-0 overflow-visible">
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`${filterId}-grad`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={1} />
          <stop offset="100%" stopColor={color} stopOpacity={0.45} />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="14" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="4" />
      <circle
        cx="24"
        cy="24"
        r="14"
        fill="none"
        stroke={`url(#${filterId}-grad)`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circum}`}
        transform="rotate(-90 24 24)"
        filter={`url(#${filterId})`}
      />
    </svg>
  )
}

function EqBars({ seed, pct, color }: { seed: string; pct: number; color: string }) {
  const heights = barHeights(seed, pct)
  return (
    <div
      className={cn(
        'relative flex h-12 w-full items-end justify-between gap-0.5 overflow-visible rounded-xl px-1.5 pb-1.5 pt-2',
        'bg-gradient-to-b from-white/[0.07] to-white/[0.02] ring-1 ring-inset ring-white/[0.08]',
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-50"
        style={{
          background: `radial-gradient(100% 80% at 50% 100%, ${color}28, transparent 65%)`,
        }}
      />
      {heights.map((h, i) => (
        <div key={i} className="flex h-full min-h-0 flex-1 flex-col justify-end overflow-visible px-[1px]">
          <div
            className="eq-bar w-full min-h-[5px] rounded-full"
            style={{
              height: `${Math.min(92, h)}%`,
              background: `linear-gradient(to top, ${color} 0%, ${color}bb 45%, transparent 100%)`,
              boxShadow: `0 0 14px ${color}60, 0 -4px 16px ${color}40`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

export function DspShareEqualizer({ items }: { items: { name: string; pct: number }[] }) {
  return (
    <div className="flex flex-col gap-4 overflow-visible">
      {items.map(({ name, pct }) => {
        const color = DSP_COLORS[name] ?? '#67e8f9'
        return (
          <div
            key={name}
            className="flex w-full flex-col gap-2.5 overflow-visible rounded-2xl border border-white/[0.06] bg-black/20 p-3"
          >
            <div className="flex items-center gap-3">
              <Ring pct={pct} color={color} dspKey={name} />
              <div className="min-w-0">
                <span className="block text-xs font-semibold text-white">{name}</span>
                <span
                  className="mt-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-medium tabular-nums"
                  style={{ background: `${color}20`, color, boxShadow: `0 0 20px ${color}35` }}
                >
                  {pct}%
                </span>
              </div>
            </div>
            <EqBars seed={name} pct={pct} color={color} />
          </div>
        )
      })}
    </div>
  )
}
