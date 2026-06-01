import * as Progress from '@radix-ui/react-progress'
import * as Select from '@radix-ui/react-select'
import * as Tabs from '@radix-ui/react-tabs'
import { useQuery } from '@tanstack/react-query'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import {
  AudioWaveform,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  CircleGauge,
  Disc3,
  Music2,
  Scale,
} from 'lucide-react'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as R from 'remeda'
import {
  SpotifyEmbedStrip,
  CmdKHint,
  CommandPalette,
  DspVelocityPanel,
  HeaderVisualizer,
  NowPlayingTicker,
  Card,
  MarketsBarChart,
  Metric,
  TechStackPanel,
  PortfolioPanel,
} from '../../components'
import type { CSSProperties } from 'react'
import { AnimatedNumber, cardHueAt, cn, compact, currency } from '../../lib'
import type { Release } from '../../types'
import { fetchOpsSnapshot } from './api'
import { DSP_COLORS, DSP_FALLBACK } from './dspColors'
import { dspOptions, useDashboardStore } from './store'


function DspBadge({ dsp }: { dsp: string }) {
  const color = DSP_COLORS[dsp as keyof typeof DSP_COLORS] ?? DSP_FALLBACK
  return (
    <span className="inline-flex items-center gap-2">
      <span className="size-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      {dsp}
    </span>
  )
}

function RiskBar({ value }: { value: number }) {
  const hue = value > 60 ? 0 : value > 30 ? 35 : 160
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            background: `hsl(${hue}, 80%, 60%)`,
            boxShadow: `0 0 8px hsla(${hue}, 80%, 60%, 0.5)`,
          }}
        />
      </div>
      <span className="tabular-nums" style={{ color: `hsl(${hue}, 70%, 70%)` }}>{value}%</span>
    </div>
  )
}

const column = createColumnHelper<Release>()

const columns = [
  column.accessor('title', {
    header: 'Release',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.06]">
          <Music2 size={14} className="text-slate-400" />
        </span>
        <div>
          <strong className="block text-white">{row.original.title}</strong>
          <span className="text-xs text-slate-500">{row.original.artist}</span>
        </div>
      </div>
    ),
  }),
  column.accessor('dsp', {
    header: 'DSP',
    cell: (info) => <DspBadge dsp={info.getValue()} />,
  }),
  column.accessor('streams', {
    header: 'Streams',
    cell: (info) => <span className="tabular-nums">{compact.format(info.getValue())}</span>,
  }),
  column.accessor('revenue', {
    header: 'Revenue',
    cell: (info) => <span className="tabular-nums">{currency.format(info.getValue())}</span>,
  }),
  column.accessor('status', {
    header: 'Status',
    cell: (info) => {
      const v = info.getValue()
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
            v === 'Live' && 'bg-emerald-400/10 text-emerald-300',
            v === 'Review' && 'bg-amber-400/10 text-amber-300',
            v === 'Flagged' && 'animate-pulse bg-rose-400/15 text-rose-300',
          )}
        >
          {v === 'Live' && <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_theme(colors.emerald.400)]" />}
          {v === 'Flagged' && <span className="size-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_theme(colors.rose.400)]" />}
          {v}
        </span>
      )
    },
  }),
  column.accessor('risk', {
    header: 'Risk',
    cell: (info) => <RiskBar value={info.getValue()} />,
  }),
]

export function Dashboard() {
  const dsp = useDashboardStore((s) => s.dsp)
  const setDsp = useDashboardStore((s) => s.setDsp)
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['ops-snapshot'],
    queryFn: fetchOpsSnapshot,
    refetchInterval: 30_000,
  })
  const [activeTab, setActiveTab] = useState('operations')
  const handleSelectTab = useCallback((tab: string) => setActiveTab(tab), [])
  const opsTabsRef = useRef<HTMLDivElement>(null)
  const [tabThumb, setTabThumb] = useState({ x: 0, w: 0 })

  const measureTabThumb = useCallback(() => {
    const list = opsTabsRef.current
    if (!list) return
    const active =
      list.querySelector<HTMLButtonElement>('[data-state="active"]') ??
      list.querySelector<HTMLButtonElement>(`[data-value="${activeTab}"]`) ??
      list.querySelector<HTMLButtonElement>('.ops-tabs__trigger')
    if (!active || active.offsetWidth < 1) return
    setTabThumb({ x: active.offsetLeft, w: active.offsetWidth })
  }, [activeTab])

  useLayoutEffect(() => {
    measureTabThumb()
    const id = requestAnimationFrame(() => measureTabThumb())
    const list = opsTabsRef.current
    if (!list) return () => cancelAnimationFrame(id)
    const ro = new ResizeObserver(measureTabThumb)
    ro.observe(list)
    return () => {
      cancelAnimationFrame(id)
      ro.disconnect()
    }
  }, [activeTab, measureTabThumb, data])

  const filtered = dsp === 'All'

  const releases = useMemo(
    () =>
      R.pipe(
        data?.releases ?? [],
        R.filter((r) => filtered || r.dsp === dsp),
        R.sortBy([(r) => r.risk, 'desc']),
      ),
    [data?.releases, filtered, dsp],
  )

  const filteredStreams = useMemo(() => R.sumBy(releases, (r) => r.streams), [releases])
  const filteredRevenue = useMemo(() => R.sumBy(releases, (r) => r.revenue), [releases])
  const highRisk = useMemo(() => R.filter(releases, (r) => r.risk >= 40).length, [releases])

  const streamTarget = filtered ? data?.metrics.monthlyStreams ?? 0 : filteredStreams
  const revenueTarget = filtered ? data?.metrics.royaltyForecast ?? 0 : filteredRevenue
  const claimsTarget = filtered ? data?.metrics.claimQueue ?? 0 : highRisk
  const payoutTarget = data?.metrics.payoutReadiness ?? 0

  const chartData = useMemo(
    () =>
      filtered
        ? (data?.territories ?? [])
        : R.pipe(
            releases,
            R.groupBy((r) => r.artist),
            R.entries(),
            R.map(([artist, items]) => ({
              market: artist.split(' ').pop() ?? artist,
              streams: R.sumBy(items, (i) => i.streams),
              revenue: R.sumBy(items, (i) => i.revenue),
            })),
            R.sortBy([(d) => d.revenue, 'desc']),
          ),
    [filtered, data?.territories, releases],
  )

  const table = useReactTable(
    useMemo(
      () => ({ data: releases, columns, getCoreRowModel: getCoreRowModel() }),
      [releases],
    ),
  )

  if (isLoading || !data) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--ink-deep)] text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <Disc3 size={32} className="animate-spin text-[var(--brand-lemon)]" />
          <span className="text-sm">Loading music ops...</span>
        </div>
      </main>
    )
  }

  const filteredCount = !filtered ? releases.length : null
  const dspBadgeColor =
    !filtered ? (DSP_COLORS[dsp as keyof typeof DSP_COLORS] ?? DSP_FALLBACK) : DSP_FALLBACK

  return (
    <>
    <CommandPalette data={data} onSelectDsp={setDsp} onSelectTab={handleSelectTab} />
    <main className="app-canvas min-h-screen overflow-hidden px-5 py-6 text-[var(--ink)] md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">

        <header className="hero-shell group/header relative isolate overflow-hidden rounded-[2rem] p-6 pb-10 max-md:backdrop-blur-none backdrop-blur md:p-10 md:pb-14">
          <div className="hero-shell__mesh" aria-hidden />
          <div className="hero-shell__border" aria-hidden />
          <div className="hero-shell__scrim" aria-hidden />
          <HeaderVisualizer />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="hero-badge label-caps inline-flex items-center gap-2 rounded-full px-3 py-1.5">
                <Disc3 size={13} className="animate-[spin_4s_linear_infinite]" /> Built EXCLUSIVELY for Create Music Group
              </span>
            </div>
            <h1 className="font-display mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.02em] text-white md:text-[3.4rem] md:leading-[1.05]">
              <span>Royalty, catalog, and </span>
              <span className="animated-gradient-text">DSP intelligence</span>
              <span> for fast music teams.</span>
            </h1>
          </div>
        </header>

        <NowPlayingTicker />

        <SpotifyEmbedStrip />

        <section className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: filtered ? 'Monthly streams' : `${dsp} streams`,
              target: streamTarget,
              format: (n: number) => compact.format(Math.round(n)),
              delta: filtered ? '+14.2% vs forecast' : `${releases.length} releases`,
              accent: 'lemon' as const,
              icon: AudioWaveform,
              viz: 'bars' as const,
              vizSeed: 3,
              trend: 'up' as const,
            },
            {
              label: filtered ? 'Royalty forecast' : `${dsp} revenue`,
              target: revenueTarget,
              format: (n: number) => currency.format(Math.round(n)),
              delta: filtered ? '+8.6% MoM' : `of ${currency.format(data.metrics.royaltyForecast)} total`,
              accent: 'lilac' as const,
              icon: CircleDollarSign,
              viz: 'flow' as const,
              vizSeed: 11,
              trend: 'up' as const,
            },
            {
              label: 'Claim queue',
              target: claimsTarget,
              format: (n: number) => String(Math.round(n)),
              delta: `${highRisk} urgent releases`,
              accent: 'lilac' as const,
              icon: Scale,
              viz: 'pulse' as const,
              vizSeed: 19,
              trend: 'neutral' as const,
            },
          ].map((m, i) => (
            <Metric
              key={m.label}
              label={m.label}
              value={<AnimatedNumber value={m.target} format={m.format} />}
              delta={m.delta}
              accent={m.accent}
              icon={m.icon}
              viz={m.viz}
              vizSeed={m.vizSeed}
              trend={m.trend}
              index={i}
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}

          <Metric
            label="Payout readiness"
            value={<AnimatedNumber value={payoutTarget} format={(n) => `${Math.round(n)}%`} />}
            delta="On track for cycle close"
            accent="lilac"
            icon={CircleGauge}
            index={3}
            style={{ animationDelay: '240ms' }}
          >
            <Progress.Root
              className="relative z-[1] mt-5 h-2.5 overflow-hidden rounded-full border border-white/10 bg-black/30"
              value={data.metrics.payoutReadiness}
            >
              <Progress.Indicator
                className="h-full rounded-full bg-[linear-gradient(90deg,hsl(62_96%_52%),hsl(272_72%_58%))] shadow-[0_0_18px_hsl(62_96%_55%_/_0.35)] transition-transform duration-500"
                style={{ transform: `translateX(-${100 - data.metrics.payoutReadiness}%)` }}
              />
            </Progress.Root>
          </Metric>
        </section>

        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="grid gap-6 xl:grid-cols-[1fr_24rem]">
          <Card className="min-w-0">
            <div className="mb-5 flex flex-col gap-4">
              <section className="rounded-[1.75rem] p-5 md:p-6 min-w-0">
                <div className="ops-toolbar">
                  <Tabs.List
                    ref={opsTabsRef}
                    className="ops-tabs inline-flex w-fit rounded-full border border-white/12 bg-[linear-gradient(135deg,hsl(272_72%_62%_/_0.22),hsl(62_96%_58%_/_0.18))] p-1 shadow-[0_0_24px_hsl(272_72%_62%_/_0.18)]"
                  >
                    <span
                      aria-hidden
                      className={cn('ops-tabs__thumb', tabThumb.w > 0 && 'ops-tabs__thumb--ready')}
                      style={{ width: tabThumb.w, transform: `translateX(${tabThumb.x}px)` }}
                    />
                    {['operations', 'markets'].map((tab) => (
                      <Tabs.Trigger key={tab} value={tab} className="ops-tabs__trigger">
                        {tab}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>
                  <CmdKHint />
              <Select.Root value={dsp} onValueChange={setDsp}>
                <Select.Trigger
                  className={cn(
                    'dsp-select-trigger inline-flex min-w-[10rem] items-center justify-between gap-3 rounded-full border font-mono px-4 py-2 text-sm transition-colors',
                    dsp !== 'All'
                      ? 'border-white/15 bg-white/[0.06] text-white'
                      : 'border-white/10 bg-white/[0.04] text-white',
                  )}
                  style={
                    dsp !== 'All'
                      ? ({
                          borderColor: `color-mix(in srgb, ${DSP_COLORS[dsp as keyof typeof DSP_COLORS] ?? DSP_FALLBACK} 40%, transparent)`,
                          boxShadow: `0 0 20px color-mix(in srgb, ${DSP_COLORS[dsp as keyof typeof DSP_COLORS] ?? DSP_FALLBACK} 18%, transparent)`,
                        } as CSSProperties)
                      : undefined
                  }
                >
                  <Select.Value className="dsp-select-trigger__value min-w-0 truncate" />
                  <span className="dsp-select-trigger__end">
                    {filteredCount !== null && (
                      <span
                        className="dsp-select-badge grid size-5 place-items-center rounded-full text-[10px] font-bold text-[var(--ink-deep)]"
                        style={{
                          background: dspBadgeColor,
                          boxShadow: `0 0 12px color-mix(in srgb, ${dspBadgeColor} 50%, transparent)`,
                        }}
                      >
                        {filteredCount}
                      </span>
                    )}
                    <Select.Icon className="dsp-select-trigger__icon">
                      <ChevronDown size={16} strokeWidth={2} />
                    </Select.Icon>
                  </span>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content
                    position="popper"
                    sideOffset={8}
                    className="z-[200] overflow-hidden rounded-2xl border border-white/12 bg-[rgba(46, 35, 56, 0.76)] p-1.5 text-sm text-white shadow-2xl backdrop-blur-md"
                  >
                    <Select.Viewport className="p-0.5">
                      {dspOptions.map((option) => (
                        <Select.Item
                          key={option}
                          value={option}
                          className="relative cursor-pointer rounded-xl px-3 py-2.5 outline-none data-[highlighted]:bg-white/10 data-[highlighted]:text-white"
                          style={
                            option !== 'All'
                              ? ({ '--dsp-accent': DSP_COLORS[option as keyof typeof DSP_COLORS] ?? DSP_FALLBACK } as CSSProperties)
                              : undefined
                          }
                        >
                          <Select.ItemText>
                            {option !== 'All' ? <DspBadge dsp={option} /> : 'All DSPs'}
                          </Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
              </div>
            </section>
            </div>
            

            <Tabs.Content value="operations" className="ops-tabs-panel">
              {releases.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
                  <Music2 size={32} />
                  <p className="text-sm">No releases match this filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {table.getHeaderGroups().map((group) => (
                        <tr key={group.id}>
                          {group.headers.map((header) => (
                            <th key={header.id} className="border-b border-white/10 px-3 py-3 font-medium">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="group/row border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-3 py-4 text-slate-300">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Tabs.Content>

            <Tabs.Content value="markets" className="ops-tabs-panel">
              <p className="ui-meta panel-heading__sub mb-4 text-xs">
                {filtered ? 'Revenue by territory' : `Revenue by artist on ${dsp}`}
              </p>
              <div className="h-[26rem]">
              {chartData.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
                  <Music2 size={32} />
                  <p className="text-sm">No data for this filter.</p>
                </div>
              ) : (
                <MarketsBarChart data={chartData} />
              )}
              </div>
            </Tabs.Content>
          </Card>

          <div className="flex flex-col gap-4">
            <Card className="flex flex-col gap-4 overflow-visible">
              <h2 className="panel-heading__title label-caps">Platform velocity</h2>
              <p className="ui-meta panel-heading__sub text-[11px] leading-5">WoW listen trends & cross-platform lift from catalog</p>
              <DspVelocityPanel releases={data.releases} />
            </Card>

            <Card className="flex flex-col gap-4">
              <header>
                <p className="label-caps text-slate-500">Pipeline</p>
                <h2 className="ui-title mt-1 text-xl text-white">AI review notes</h2>
                <p className="ui-meta panel-heading__sub mt-1 text-[11px] leading-5">Validated from GraphQL payload</p>
              </header>
              <div className="flex flex-col gap-3">
                {data.insights.slice(0, 1).map((insight, i) => (
                  <article
                    key={insight}
                    className="tech-node card-surface group/node"
                    style={{ '--card-hue': cardHueAt(i) } as CSSProperties}
                  >
                    <span className="tech-node__index font-mono">{String(i + 1).padStart(2, '0')}</span>
                    <div className="tech-node__head">
                      <span className="tech-node__icon card-surface__icon">
                        <CheckCircle2 size={15} strokeWidth={1.75} />
                      </span>
                      <div>
                        <h3 className="ui-title text-sm text-white">Insight</h3>
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">graphql</p>
                      </div>
                    </div>
                    <p className="relative z-[1] text-sm leading-6 text-slate-300">{insight}</p>
                  </article>
                ))}
              </div>
            </Card>
          </div>
        </Tabs.Root>

        <TechStackPanel />
        <PortfolioPanel />
      </div>
    </main>
    </>
  )
}
