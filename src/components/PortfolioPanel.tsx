import type { CSSProperties } from 'react'
import {
  Database,
  PenTool,
  Gauge,
  Keyboard,
  LayoutDashboard,
  Palette,
  ShieldCheck,
  Sparkles,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import { STACK_HUES } from '../lib/stackAccents'

type Layer = {
  id: string
  label: string
  role: string
  icon: LucideIcon
  items: { name: string; tag?: string }[]
}

type Pillar = {
  label: string
  detail: string
  icon: LucideIcon
}

const PILLARS: Pillar[] = [
  { label: 'Dashboards', detail: 'Tables · charts · metrics', icon: Gauge },
  { label: 'Design system', detail: 'Tokens · Radix · patterns', icon: Palette },
  { label: 'Data contracts', detail: 'GraphQL · Zod · Query', icon: ShieldCheck },
  { label: 'Ship quality', detail: 'Perf · a11y · edge cases', icon: Workflow },
]

const PORTFOLIO_LAYERS: Layer[] = [
  {
    id: 'ship',
    label: 'Build & ship',
    role: 'job fit',
    icon: LayoutDashboard,
    items: [
      { name: 'Operations grid — TanStack Table, risk, status', tag: 'table' },
      { name: 'Markets chart — Recharts, glow, tooltips', tag: 'viz' },
      { name: 'DSP velocity — sparklines, WoW deltas', tag: 'dsp' },
      { name: 'AI review notes from validated payload', tag: 'ai' },
    ],
  },
  {
    id: 'design',
    label: 'Figma → production',
    role: 'fidelity',
    icon: PenTool,
    items: [
      { name: 'panel-wrap / card-surface token layers', tag: 'tokens' },
      { name: 'stackAccents — one hue source for DSP UI', tag: 'system' },
      { name: 'Brand palette — lemon · lilac', tag: 'tone' },
      { name: 'Syne · DM Sans · JetBrains Mono', tag: 'type' },
    ],
  },
  {
    id: 'data',
    label: 'Data & contracts',
    role: 'boundary',
    icon: Database,
    items: [
      { name: 'GraphQL snapshot + Zod parse', tag: 'schema' },
      { name: 'React Query — cache & loading states', tag: 'fetch' },
      { name: 'Remeda — group / sort / filter', tag: 'calc' },
      { name: 'DSP filter syncs metrics, table, chart', tag: 'sync' },
    ],
  },
  {
    id: 'craft',
    label: 'Component craft',
    role: 'library',
    icon: Keyboard,
    items: [
      { name: '⌘K palette — tabs, DSP, releases', tag: 'cmdk' },
      { name: 'Radix tabs / select / progress', tag: 'radix' },
      { name: 'Spotify ↔ Zustand ↔ hero canvas', tag: 'state' },
      { name: 'prefers-reduced-motion + code-split chunks', tag: 'perf' },
    ],
  },
]

function PortfolioNode({ layer, index }: { layer: Layer; index: number }) {
  const Icon = layer.icon
  const variant = 'card-surface'
  const iconClass = 'card-surface__icon'

  return (
    <article
      className={`tech-node ${variant} group/node`}
      style={{ '--card-hue': STACK_HUES.lemon } as CSSProperties}
    >
      <span className="tech-node__index font-mono">{String(index + 1).padStart(2, '0')}</span>
      <div className="tech-node__head">
        <span className={`tech-node__icon ${iconClass}`}>
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

export function PortfolioPanel() {
  return (
    <section
      className="tech-stack portfolio-panel panel-wrap"
      aria-labelledby="portfolio-panel-title"
    >
      <div className="portfolio-panel__glow" aria-hidden />
      <div className="tech-stack__mesh portfolio-panel__mesh" aria-hidden />

      <header className="tech-stack__header portfolio-panel__header">
        <div className="portfolio-panel__intro">
          <p className="label-caps text-slate-500">Why this demo</p>
          <h2 id="portfolio-panel-title" className="ui-title mt-1 text-2xl text-white md:text-[1.65rem]">
            Mapped to the <span className="animated-gradient-text">Senior Front End</span> role
          </h2>
          <p className="ui-meta panel-heading__sub mt-2 max-w-xl text-[11px] leading-5">
            Built to show my fit for Create Music Group - distribution-scale dashboards, pixel-level UI craft,
            validated GraphQL contracts, and shared component patterns in a fast-moving product environment.
          </p>
        </div>
        <ul className="portfolio-panel__tags" aria-label="Role alignment">
          {['Internal tooling', 'Pixel-perfect', 'React 19 stack'].map((tag) => (
            <li key={tag} className="portfolio-panel__tag hero-badge">
              {tag}
            </li>
          ))}
        </ul>
      </header>

      <ul className="portfolio-panel__pillars" aria-label="Responsibility coverage">
        {PILLARS.map(({ label, detail, icon: Icon }, i) => (
          <li
            key={label}
            className="portfolio-panel__pillar"
            style={{ '--card-hue': STACK_HUES.lilac } as CSSProperties}
          >
            <span className="portfolio-panel__pillar-icon">
              <Icon size={14} strokeWidth={1.75} />
            </span>
            <span>
              <span className="portfolio-panel__pillar-label">{label}</span>
              <span className="portfolio-panel__pillar-detail">{detail}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="tech-stack__grid">
        {PORTFOLIO_LAYERS.map((layer, i) => (
          <PortfolioNode key={layer.id} layer={layer} index={i} />
        ))}
      </div>

      <footer className="tech-stack__footer font-mono">
        <span className="text-slate-600">Label Engine · DSP · royalties · distribution</span>
        <span className="text-slate-500">speculative · 2026</span>
      </footer>
    </section>
  )
}
