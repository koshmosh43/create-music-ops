import type { CSSProperties } from 'react'
import { useId, useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { compact, currency } from '../lib/formatters'
import {
  MARKETS_CHART_LAYOUT,
  marketBarTheme,
  marketsChartInsetStyle,
  marketsTooltipCursorPath,
} from '../features/dashboard/marketChartTheme'

export type MarketChartRow = {
  market: string
  revenue: number
  streams?: number
}

type ChartRow = MarketChartRow & { index: number }

function MarketsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value?: number; payload?: ChartRow }[]
  label?: string
}) {
  if (!active || !payload?.[0]) return null
  const row = (payload[0].payload ?? { market: label ?? '', revenue: 0, index: 0 }) as ChartRow
  const theme = marketBarTheme(row.index)
  const value = Number(payload[0].value)

  return (
    <div
      className="markets-tooltip"
      style={{ '--tip-accent': theme.accent } as CSSProperties}
    >
      <p className="markets-tooltip__label">{label ?? row.market}</p>
      <p className="markets-tooltip__value">{currency.format(value)}</p>
      {row.streams != null && (
        <p className="markets-tooltip__meta">{compact.format(row.streams)} streams</p>
      )}
    </div>
  )
}

function MarketsTooltipCursor(props: {
  x?: number
  y?: number
  width?: number
  height?: number
  pointerEvents?: string
}) {
  const { pointerEvents, ...box } = props
  return (
    <path
      d={marketsTooltipCursorPath(box)}
      fill="hsl(62 96% 58% / 0.08)"
      stroke="hsl(272 72% 62% / 0.22)"
      strokeWidth={1}
      pointerEvents={pointerEvents}
    />
  )
}

function ChartDefs({ rows, uid }: { rows: ChartRow[]; uid: string }) {
  return (
    <defs>
      <linearGradient id="market-grid-glow" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="hsl(62 96% 58% / 0.12)" />
        <stop offset="100%" stopColor="hsl(272 72% 62% / 0.08)" />
      </linearGradient>

      {rows.map((row) => {
        const t = marketBarTheme(row.index)
        const gid = `market-bar-${uid}-${row.index}`
        return (
          <linearGradient key={row.index} id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={t.top} stopOpacity={0.95} />
            <stop offset="100%" stopColor={t.bottom} stopOpacity={0.5} />
          </linearGradient>
        )
      })}
    </defs>
  )
}

export function MarketsBarChart({ data }: { data: MarketChartRow[] }) {
  const uid = useId().replace(/:/g, '')
  const rows = useMemo(() => data.map((d, index) => ({ ...d, index })), [data])

  const { margin, yAxisWidth, xAxisBand } = MARKETS_CHART_LAYOUT

  return (
    <div className="markets-chart" style={marketsChartInsetStyle() as CSSProperties}>
      <div className="markets-chart__glow" aria-hidden />
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} barCategoryGap="20%" margin={margin}>
          <ChartDefs rows={rows} uid={uid} />
          <CartesianGrid stroke="url(#market-grid-glow)" vertical={false} strokeDasharray="4 10" />
          <XAxis
            dataKey="market"
            height={xAxisBand}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#b2c0d8', fontSize: 10.5, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#90a2c0', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
            tickFormatter={(v) => compact.format(v)}
            width={yAxisWidth}
          />
          <Tooltip
            cursor={<MarketsTooltipCursor />}
            content={<MarketsTooltip />}
            animationDuration={220}
          />
          <Bar
            dataKey="revenue"
            radius={[13, 13, 8, 8]}
            maxBarSize={54}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          >
            {rows.map((row) => (
              <Cell
                key={row.market}
                className="market-bar-cell"
                fill={`url(#market-bar-${uid}-${row.index})`}
                style={{ filter: `drop-shadow(0 10px 18px ${marketBarTheme(row.index).accent}50)` }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
