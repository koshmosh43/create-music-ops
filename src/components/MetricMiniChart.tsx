import { useId, useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
} from 'recharts'
import { STACK_HEX, metricToneAt } from '../lib/stackAccents'
import { cn } from '../lib/cn'
import type { MetricViz, Trend } from '../types'

type Props = {
  variant: MetricViz
  seed: number
  hue: number
  trend?: Trend
  className?: string
}

function trendBias(trend: Trend) {
  if (trend === 'up') return 0.55
  if (trend === 'down') return -0.45
  return 0
}

function barSeries(seed: number, n = 9) {
  return Array.from({ length: n }, (_, i) => ({
    i,
    v: 0.28 + (Math.sin(seed * 0.7 + i * 1.35) * 0.35 + Math.sin(seed * 1.9 + i * 0.55) * 0.25 + 0.6) * 0.55,
  }))
}

function lineSeries(seed: number, trend: Trend, n = 14) {
  const bias = trendBias(trend)
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    const wave = Math.sin(seed + t * 8) * 0.12 + Math.sin(seed * 2.1 + t * 14) * 0.08
    return { i, v: 0.25 + t * 0.55 * (0.5 + bias) + wave + 0.15 }
  })
}

function pulseSeries(seed: number, n = 16) {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    return { i, v: 0.5 + Math.sin(seed * 1.4 + t * 12) * 0.32 * (0.4 + t * 0.6) }
  })
}

export function MetricMiniChart({ variant, seed, hue: _hue, trend = 'up', className }: Props) {
  const uid = useId().replace(/:/g, '')
  const lemonFirst = metricToneAt(seed) === 'lemon'
  const fillTop = lemonFirst ? STACK_HEX.lemon : STACK_HEX.lilac
  const fillDeep = lemonFirst ? STACK_HEX.lilac : STACK_HEX.lemon
  const stroke = fillTop

  const data = useMemo(() => {
    if (variant === 'bars') return barSeries(seed)
    if (variant === 'pulse') return pulseSeries(seed)
    return lineSeries(seed, trend)
  }, [seed, trend, variant])

  const fillId = `metric-fill-${uid}`
  const barId = `metric-bar-${uid}`

  return (
    <div className={cn('metric-card__viz', className)} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        {variant === 'bars' ? (
          <BarChart data={data} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
            <defs>
              <linearGradient id={barId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fillTop} stopOpacity={0.95} />
                <stop offset="100%" stopColor={fillDeep} stopOpacity={0.35} />
              </linearGradient>
            </defs>
            <Bar
              dataKey="v"
              fill={`url(#${barId})`}
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
              maxBarSize={10}
            />
          </BarChart>
        ) : variant === 'pulse' ? (
          <LineChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 2 }}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={fillDeep}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              opacity={0.45}
            />
            <Line
              type="monotone"
              dataKey="v"
              stroke={stroke}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        ) : (
          <AreaChart data={data} margin={{ top: 6, right: 2, left: 2, bottom: 0 }}>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fillTop} stopOpacity={0.42} />
                <stop offset="100%" stopColor={fillDeep} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={stroke}
              strokeWidth={1.75}
              fill={`url(#${fillId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
