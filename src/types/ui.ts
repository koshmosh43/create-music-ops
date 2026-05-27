import type { CSSProperties, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import type { StackAccent } from '../lib/stackAccents'

export type Accent = StackAccent
export type MetricViz = 'bars' | 'flow' | 'pulse'
export type Trend = 'up' | 'down' | 'neutral'

export interface MetricProps {
  label: string
  value: ReactNode
  delta: string
  accent?: Accent
  icon: LucideIcon
  viz?: MetricViz
  vizSeed?: number
  trend?: Trend
  index?: number
  children?: ReactNode
  style?: CSSProperties
}

export interface SparklineProps {
  seed: number
  color: string
  trend: Trend
  className?: string
}
