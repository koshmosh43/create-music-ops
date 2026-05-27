import { Command, Disc3, Music2, Search, SlidersHorizontal } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../lib/cn'
import type { OpsSnapshot } from '../features/dashboard/schema'
import { type DspFilter, useDashboardStore } from '../features/dashboard/store'
import { DSP_COLORS, DSP_FALLBACK } from '../features/dashboard/dspColors'
import { STACK_HEX } from '../lib/stackAccents'

type Action = {
  id: string
  label: string
  hint: string
  icon: typeof Music2
  color?: string
  onSelect: () => void
}

export function CommandPalette({
  data,
  onSelectDsp,
  onSelectTab,
}: {
  data: OpsSnapshot | undefined
  onSelectDsp: (dsp: DspFilter) => void
  onSelectTab: (tab: string) => void
}) {
  const open = useDashboardStore((s) => s.cmdkOpen)
  const closeCmdk = useDashboardStore((s) => s.closeCmdk)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const store = useDashboardStore.getState()
        store.cmdkOpen ? store.closeCmdk() : store.openCmdk()
      }
      if (e.key === 'Escape' && useDashboardStore.getState().cmdkOpen) {
        e.preventDefault()
        closeCmdk()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeCmdk])

  useEffect(() => { setActive(0) }, [query])

  const run = useCallback((fn: () => void) => { fn(); closeCmdk(); setQuery('') }, [closeCmdk])

  const actions = useMemo<Action[]>(() => {
    const list: Action[] = [
      { id: 'tab-ops', label: 'Go to Operations', hint: 'Navigate', icon: SlidersHorizontal, color: STACK_HEX.lemon, onSelect: () => run(() => onSelectTab('operations')) },
      { id: 'tab-mkt', label: 'Go to Markets', hint: 'Navigate', icon: SlidersHorizontal, color: STACK_HEX.lilac, onSelect: () => run(() => onSelectTab('markets')) },
      ...(['All', 'Spotify', 'Apple Music', 'YouTube', 'TikTok', 'Amazon'] as DspFilter[]).map((d) => ({
        id: `dsp-${d}`,
        label: d === 'All' ? 'All DSPs' : d,
        hint: 'Filter',
        icon: Disc3,
        color: d === 'All' ? DSP_FALLBACK : DSP_COLORS[d as keyof typeof DSP_COLORS],
        onSelect: () => run(() => onSelectDsp(d)),
      })),
    ]
    if (data) {
      for (const r of data.releases) {
        list.push({
          id: r.id,
          label: `${r.title} — ${r.artist}`,
          hint: r.dsp,
          icon: Music2,
          color: DSP_COLORS[r.dsp],
          onSelect: () => run(() => onSelectDsp(r.dsp as DspFilter)),
        })
      }
    }
    return list
  }, [data, onSelectDsp, onSelectTab, run])

  const q = query.toLowerCase()
  const results = q ? actions.filter((a) => a.label.toLowerCase().includes(q) || a.hint.toLowerCase().includes(q)) : actions.slice(0, 8)

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[active]) { e.preventDefault(); results[active].onSelect() }
  }, [results, active])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50" onKeyDown={handleKey}>
      <div
        className="absolute inset-0 bg-black/70"
        style={{ animation: 'cmd-fade-in .12s ease' }}
        onClick={closeCmdk}
      />

      <div
        className="absolute left-1/2 top-[16%] w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-3xl border border-white/[0.08] bg-slate-950 shadow-2xl"
        style={{ animation: 'cmd-scale-in .18s cubic-bezier(.16,1,.3,1)', boxShadow: '0 0 80px hsl(62 96% 58% / 0.08), 0 24px 60px rgba(0,0,0,.5)' }}
      >
        <div className="relative flex items-center gap-3 px-5 py-4">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--brand-lilac)]/30 to-transparent" />
          <Search size={20} className="shrink-0 text-[var(--brand-lemon)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search releases, DSPs, actions..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
          <kbd className="hidden items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-500 sm:inline-flex">ESC</kbd>
        </div>

        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="flex flex-col items-center gap-2 py-10 text-slate-500">
              <Music2 size={24} className="text-slate-600" />
              <span className="text-sm">No results found</span>
            </li>
          )}
          {results.map((a, i) => (
            <li key={a.id}>
              <button
                onClick={a.onSelect}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm outline-none transition-all',
                  i === active ? 'bg-white/[0.06] text-white' : 'text-slate-400 hover:text-slate-200',
                )}
              >
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-xl transition-all"
                  style={{
                    background: i === active ? `${a.color ?? STACK_HEX.lemon}18` : 'rgba(255,255,255,.04)',
                    boxShadow: i === active ? `0 0 12px ${a.color ?? STACK_HEX.lemon}25` : 'none',
                  }}
                >
                  <a.icon size={15} style={{ color: a.color ?? '#94a3b8' }} />
                </span>
                <span className="flex-1 truncate">{a.label}</span>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ background: `${a.color ?? STACK_HEX.lemon}15`, color: a.color ?? '#94a3b8' }}
                >
                  {a.hint}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* footer */}
        <div className="flex items-center gap-4 border-t border-white/[0.06] px-5 py-2.5 text-[11px] text-slate-600">
          <span className="inline-flex items-center gap-1"><kbd className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5">↑↓</kbd> navigate</span>
          <span className="inline-flex items-center gap-1"><kbd className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5">↵</kbd> select</span>
          <span className="inline-flex items-center gap-1"><kbd className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5">esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}

export function CmdKHint() {
  const openCmdk = useDashboardStore((s) => s.openCmdk)
  return (
    <button type="button" onClick={openCmdk} className="quick-actions-btn group">
      <Search size={14} strokeWidth={2} className="quick-actions-btn__icon" />
      <span className="quick-actions-btn__label hidden sm:inline">Quick actions</span>
      <kbd className="quick-actions-btn__kbd">
        <Command size={10} strokeWidth={2} />K
      </kbd>
    </button>
  )
}
