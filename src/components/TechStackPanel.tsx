import type { CSSProperties } from 'react'
import { Box, Braces, Cpu, Layers2, LineChart, Shapes, Table2, type LucideIcon } from 'lucide-react'
import { cardHueAt } from '../lib/stackAccents'

type Layer = {
  id: string
  label: string
  role: string
  icon: LucideIcon
  items: { name: string; tag?: string }[]
}

const LAYERS: Layer[] = [
  {
    id: 'runtime',
    label: 'Runtime',
    role: 'shell',
    icon: Cpu,
    items: [
      { name: 'React 19', tag: 'ui' },
      { name: 'TypeScript', tag: 'strict' },
      { name: 'Vite', tag: 'build' },
    ],
  },
  {
    id: 'surface',
    label: 'Surface',
    role: 'design system',
    icon: Shapes,
    items: [
      { name: 'Tailwind v4', tag: 'css' },
      { name: 'Radix UI', tag: 'a11y' },
      { name: 'Lucide', tag: 'icons' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    role: 'contracts',
    icon: Braces,
    items: [
      { name: 'React Query', tag: 'cache' },
      { name: 'Zustand', tag: 'state' },
      { name: 'Zod', tag: 'schema' },
      { name: 'GraphQL', tag: 'api' },
    ],
  },
  {
    id: 'viz',
    label: 'Viz',
    role: 'density',
    icon: LineChart,
    items: [
      { name: 'Recharts', tag: 'charts' },
      { name: 'TanStack Table', tag: 'grid' },
      { name: 'Remeda', tag: 'calc' },
    ],
  },
]

function StackNode({ layer, index }: { layer: Layer; index: number }) {
  const Icon = layer.icon
  return (
    <article
      className="tech-node card-surface group/node"
      style={{ '--card-hue': cardHueAt(index) } as CSSProperties}
    >
      <span className="tech-node__index font-mono">{String(index + 1).padStart(2, '0')}</span>
      <div className="tech-node__head">
        <span className="tech-node__icon card-surface__icon">
          <Icon size={15} strokeWidth={1.75} />
        </span>
        <div>
          <h3 className="ui-title text-sm text-white">{layer.label}</h3>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">{layer.role}</p>
        </div>
      </div>
      <ul className="tech-node__chips">
        {layer.items.map((item) => (
          <li key={item.name} className="tech-chip">
            <span>{item.name}</span>
            {item.tag && <span className="tech-chip__tag">{item.tag}</span>}
          </li>
        ))}
      </ul>
    </article>
  )
}

export function TechStackPanel() {
  return (
    <section className="tech-stack panel-wrap" aria-labelledby="tech-stack-title">
      <div className="tech-stack__mesh" aria-hidden />
      <div className="tech-stack__rail" aria-hidden>
        <Box size={12} />
        <span className="tech-stack__rail-line" />
        <Layers2 size={12} />
        <span className="tech-stack__rail-line" />
        <Table2 size={12} />
      </div>

      <header className="tech-stack__header">
        <div>
          <p className="label-caps text-slate-500">Tech stack</p>
          <h2 id="tech-stack-title" className="ui-title mt-1 text-2xl text-white">
            Stack parity
          </h2>
          <p className="ui-meta panel-heading__sub mt-1 max-w-md text-[11px] leading-5">
            React 19 · TypeScript · Vite · Tailwind · Radix · React Query · GraphQL · Zod · Zustand · TanStack · Recharts
          </p>
        </div>
      </header>

      <div className="tech-stack__grid">
        {LAYERS.map((layer, i) => (
          <StackNode key={layer.id} layer={layer} index={i} />
        ))}
      </div>

      <footer className="tech-stack__footer font-mono">
        <span className="text-slate-600">matches posting · production-ready patterns</span>
        <span className="text-slate-500">CMG · 2026</span>
      </footer>
    </section>
  )
}
