import { TrendingDown, TrendingUp } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useMemo } from 'react'
import * as R from 'remeda'
import { DSP_COLORS, DSP_FALLBACK, DSP_PLATFORM_ORDER } from '../features/dashboard/dspColors'
import { coldHueAt, hslAccentHex } from '../lib/stackAccents'
import { compact } from '../lib/formatters'
import { cn } from '../lib/cn'
import type { Release } from '../types'

const PLATFORMS = DSP_PLATFORM_ORDER

function weekSeries(key: string, base: number): number[] {
  const seed = key.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return Array.from({ length: 7 }, (_, i) => {
    const wave = Math.sin(seed * 0.28 + i * 1.05) * 0.11
    const ramp = 0.82 + (i / 6) * 0.22
    return Math.max(1, (base / 7) * ramp * (1 + wave))
  })
}

function velocityPct(series: number[]): number {
  const mid = Math.floor(series.length / 2)
  const prev = R.mean(series.slice(0, mid)) || 1
  const next = R.mean(series.slice(mid)) || 1
  return Math.round(((next - prev) / prev) * 1000) / 10
}

function AreaSpark({ points, color, id }: { points: number[]; color: string; id: string }) {
  const w = 128
  const h = 40
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 6) - 3
    return [x, y] as const
  })
  const line = coords.map(([x, y]) => `${x},${y}`).join(' ')
  const area = `0,${h} ${line} ${w},${h}`
  const gradId = `vel-${id.replace(/\W/g, '')}`

  return (
    <svg width={w} height={h} className="shrink-0" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CrossPlatformBar({ release }: { release: Release }) {
  const seed = release.title.length + release.artist.length
  const weights = PLATFORMS.map((p, i) => {
    const primary = p === release.dsp ? 0.58 : 0.09
    return primary + ((seed + i * 11) % 9) / 100
  })
  const total = weights.reduce((a, b) => a + b, 0)

  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
      {PLATFORMS.map((p, i) => {
        const pct = (weights[i] / total) * 100
        if (pct < 4) return null
        const color = DSP_COLORS[p] ?? DSP_FALLBACK
        return (
          <div
            key={p}
            className="h-full transition-[flex-grow] duration-500"
            style={{ flexGrow: pct, background: color, boxShadow: p === release.dsp ? `0 0 8px ${color}80` : undefined }}
            title={`${p} ~${Math.round(pct)}%`}
          />
        )
      })}
    </div>
  )
}

export function DspVelocityPanel({ releases }: { releases: Release[] }) {
  const { platforms, rising } = useMemo(() => {
    const velocityReleases = R.filter(releases, (r) => r.title !== 'Neon Drift')
    const grouped = R.groupBy(velocityReleases, (r) => r.dsp)
    const platforms = R.pipe(
      R.entries(grouped),
      R.map(([name, items]) => {
        const streams = R.sumBy(items, (r) => r.streams)
        const series = weekSeries(name, streams)
        return {
          name,
          streams,
          catalog: items.length,
          velocity: velocityPct(series),
          series,
          color: DSP_COLORS[name as keyof typeof DSP_COLORS] ?? DSP_FALLBACK,
        }
      }),
      R.filter((p) => p.name !== 'TikTok'),
      R.sortBy([(p) => p.streams, 'desc']),
    )

    const rising = R.pipe(
      releases,
      R.filter((r) => r.title !== 'City Static'),
      R.sortBy([(r) => r.streams, 'desc']),
      R.take(3),
    )

    return { platforms, rising }
  }, [releases])

  return (
    <div className="flex flex-col gap-4">
      {platforms.map((p) => {
        const up = p.velocity >= 0
        const hue = coldHueAt(PLATFORMS.indexOf(p.name as (typeof PLATFORMS)[number]))
        const spark = hslAccentHex(hue)
        return (
          <article
            key={p.name}
            className="vel-card card-surface group/vel"
            style={{ '--card-hue': hue } as CSSProperties}
          >
            <div className="mb-2.5 flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: 'var(--card-accent)', boxShadow: '0 0 10px color-mix(in srgb, var(--card-accent) 80%, transparent)' }}
                />
                <div>
                  <span className="block text-xs font-semibold text-white">{p.name}</span>
                  <span className="text-[10px] text-slate-500">{p.catalog} releases · {compact.format(p.streams)} streams</span>
                </div>
              </div>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums',
                  up ? 'card-surface__delta bg-transparent' : 'bg-rose-400/12 text-rose-300',
                )}
              >
                {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {up ? '+' : ''}
                {p.velocity}% WoW
              </span>
            </div>
            <div className="flex items-end justify-between gap-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-600">7d listen velocity</p>
              <AreaSpark points={p.series} color={spark} id={p.name} />
            </div>
          </article>
        )
      })}

      {rising.length > 0 && (
        <div className="border-t border-white/[0.06] pt-3">
          <p className="vel-section-label mb-2.5">Cross-platform lift</p>
          <ul className="flex flex-col gap-2.5">
            {rising.map((r, i) => {
              const lift = 8 + ((r.title.length + r.streams) % 22)
              const hue = coldHueAt(i + 2)
              return (
                <li
                  key={r.title}
                  className="vel-card card-surface"
                  style={{ '--card-hue': hue } as CSSProperties}
                >
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <span className="truncate text-[11px] font-medium text-slate-200">{r.title}</span>
                    <span className="card-surface__delta shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold">+{lift}%</span>
                  </div>
                  <CrossPlatformBar release={r} />
                  <p className="mt-1 text-[9px] text-slate-600">Primary · {r.dsp} · estimated multi-DSP mix</p>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
