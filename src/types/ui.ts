import type { CSSProperties, ReactNode } from 'react'

export type Accent = 'cyan' | 'violet' | 'rose' | 'emerald'
export type Trend = 'up' | 'down' | 'neutral'

export interface MetricProps {
  label: string
  value: string
  delta: string
  accent: Accent
  sparkSeed: number
  sparkColor: string
  trend: Trend
  children?: ReactNode
  style?: CSSProperties
}

export interface SparklineProps {
  seed: number
  color: string
  trend: Trend
  className?: string
}