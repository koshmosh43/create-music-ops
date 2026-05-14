import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '../lib/cn'
import type { Accent, MetricProps } from '../types'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-cyan-300 text-slate-950 hover:bg-cyan-200',
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

export function Card({ children, className, ...props }: ComponentPropsWithoutRef<'section'> & { children: ReactNode }) {
  return (
    <section
      className={cn('rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/25 backdrop-blur', className)}
      {...props}
    >
      {children}
    </section>
  )
}

const accentStyles: Record<Accent, { gradient: string; glow: string }> = {
  cyan: {
    gradient: 'from-cyan-400/25 via-transparent to-transparent',
    glow: 'shadow-cyan-400/8',
  },
  violet: {
    gradient: 'from-violet-400/25 via-transparent to-transparent',
    glow: 'shadow-violet-400/8',
  },
  rose: {
    gradient: 'from-rose-400/25 via-transparent to-transparent',
    glow: 'shadow-rose-400/8',
  },
  emerald: {
    gradient: 'from-emerald-400/25 via-transparent to-transparent',
    glow: 'shadow-emerald-400/8',
  },
}

export function Metric({ label, value, delta, accent = 'cyan', children, style }: MetricProps) {
  const { gradient, glow } = accentStyles[accent]
  
  return (
    <Card className={cn('group relative min-h-34 overflow-hidden', glow)} style={{ animation: 'stagger-in .5s ease both', ...style }}>
      <div className={cn('pointer-events-none absolute -inset-px rounded-[inherit] bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100', gradient)} />
      <p className="text-sm text-slate-400">{label}</p>
      <strong className="mt-4 block text-3xl font-semibold tabular-nums tracking-tight text-white">{value}</strong>
      <span className="mt-3 inline-flex rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">{delta}</span>
      {children}
    </Card>
  )
}
