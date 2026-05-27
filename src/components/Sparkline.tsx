import type { SparklineProps, Trend } from '../types'
import { STACK_HEX } from '../lib/stackAccents'

const POINTS = 24
const SVG_SIZE = { w: 96, h: 32 } as const

const trendBias: Record<Trend, number> = {
  up: 0.6,
  down: -0.4,
  neutral: 0,
}

function generatePath(seed: number, trend: Trend): string {
  const { w, h } = SVG_SIZE
  const bias = trendBias[trend]
  
  const points = Array.from({ length: POINTS }, (_, i) => {
    const t = i / (POINTS - 1)
    const noise = Math.sin(seed + i * 1.8) * 0.3 + Math.sin(seed * 2.3 + i * 0.9) * 0.2
    const base = 0.5 - bias * (t - 0.5)
    const y = Math.max(2, Math.min(h - 2, (base + noise * 0.4) * h))
    return `${i === 0 ? 'M' : 'L'}${(t * w).toFixed(1)},${y.toFixed(1)}`
  })
  
  return points.join(' ')
}

export function Sparkline({ seed, color = STACK_HEX.lemon, trend = 'up', className }: SparklineProps) {
  const path = generatePath(seed, trend)
  const gradientId = `spark-${seed}`

  return (
    <svg viewBox={`0 0 ${SVG_SIZE.w} ${SVG_SIZE.h}`} fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${path} L${SVG_SIZE.w},${SVG_SIZE.h} L0,${SVG_SIZE.h} Z`} fill={`url(#${gradientId})`} />
      <path d={path} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
    </svg>
  )
}
