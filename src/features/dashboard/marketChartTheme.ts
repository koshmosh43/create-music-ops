import { STACK_HEX, metricToneAt } from '../../lib/stackAccents'

export const CHART_GRADIENT = {
  lemon: STACK_HEX.lemon,
  lilac: STACK_HEX.lilac,
} as const

export const MARKETS_CHART_LAYOUT = {
  margin: { top: 10, right: 6, left: 2, bottom: 6 },
  yAxisWidth: 52,
  xAxisBand: 28,
  plotRadius: 10.4,
} as const

function roundedTopBandPath(x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w / 2, h)
  return [
    `M ${x + rad} ${y}`,
    `H ${x + w - rad}`,
    `Q ${x + w} ${y} ${x + w} ${y + rad}`,
    `V ${y + h}`,
    `H ${x}`,
    `V ${y + rad}`,
    `Q ${x} ${y} ${x + rad} ${y}`,
    'Z',
  ].join(' ')
}

export function marketsTooltipCursorPath(props: {
  x?: number
  y?: number
  width?: number
  height?: number
}) {
  const { x = 0, y = 0, width = 0, height = 0 } = props
  return roundedTopBandPath(x, y, width, height, MARKETS_CHART_LAYOUT.plotRadius)
}

export function marketsChartInsetStyle(): Record<string, string> {
  const { margin, yAxisWidth, xAxisBand } = MARKETS_CHART_LAYOUT
  return {
    '--markets-inset-top': `${margin.top}px`,
    '--markets-inset-right': `${margin.right}px`,
    '--markets-inset-bottom': `${margin.bottom + xAxisBand}px`,
    '--markets-inset-left': `${margin.left + yAxisWidth}px`,
    '--markets-plot-radius': `${MARKETS_CHART_LAYOUT.plotRadius}px`,
  }
}

export type MarketBarTheme = {
  top: string
  bottom: string
  accent: string
}

export function marketBarTheme(index: number): MarketBarTheme {
  const lemonFirst = metricToneAt(index) === 'lemon'
  return {
    top: lemonFirst ? CHART_GRADIENT.lemon : CHART_GRADIENT.lilac,
    bottom: lemonFirst ? CHART_GRADIENT.lilac : CHART_GRADIENT.lemon,
    accent: lemonFirst ? CHART_GRADIENT.lemon : CHART_GRADIENT.lilac,
  }
}
