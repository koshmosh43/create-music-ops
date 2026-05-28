import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { coldHueAt } from '../lib/stackAccents'
import { cn } from '../lib/cn'
import { MetricMiniChart } from './MetricMiniChart'
import type { MetricProps } from '../types'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-lemon)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--brand-lemon)] text-[var(--ink-deep)] hover:brightness-110',
        ghost: 'border border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
)

type ButtonProps = ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }

export function Button({ asChild, className, variant, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant }), className)} {...props} />
}

export function Card({ children, className, style, ...props }: ComponentPropsWithoutRef<'section'> & { children: ReactNode }) {
  return (
    <section className={cn('panel-wrap rounded-[1.75rem] p-5 md:p-6', className)} style={style} {...props}>
      {children}
    </section>
  )
}

function MetricIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="metric-card__icon" aria-hidden>
      <span className="metric-card__icon-halo" />
      <Icon className="metric-card__icon-glyph" strokeWidth={1.65} absoluteStrokeWidth />
    </span>
  )
}

export function Metric({
  label,
  value,
  delta,
  accent: _accent,
  icon: Icon,
  viz,
  vizSeed = 1,
  trend = 'up',
  index = 0,
  children,
  style,
}: MetricProps) {
  const hue = coldHueAt(index)

  return (
    <section
      className="metric-card card-surface group relative overflow-hidden transition-all duration-300"
      style={{ '--card-hue': hue, animation: 'stagger-in .5s ease both', ...style } as CSSProperties}
    >
      <div className="relative z-10 flex items-start justify-between gap-2 sm:gap-3">
        <p className="font-display min-w-0 pr-1 text-[16px] color-[lemon] text-[var(--brand-lemon-soft)] leading-snug sm:text-sm">{label}</p>
        <MetricIcon icon={Icon} />
      </div>
      <strong className="relative z-[1] mt-3 block text-3xl font-semibold tabular-nums tracking-tight text-white">{value}</strong>
      <span className="card-surface__delta relative z-[1] mt-3 inline-flex rounded-full px-3 py-1">{delta}</span>
      {viz && (
        <MetricMiniChart variant={viz} seed={vizSeed} hue={hue} trend={trend} />
      )}
      {children}
    </section>
  )
}
