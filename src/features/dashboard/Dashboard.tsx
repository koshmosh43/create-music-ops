import * as Progress from '@radix-ui/react-progress'
import * as Select from '@radix-ui/react-select'
import * as Tabs from '@radix-ui/react-tabs'
import { useQuery } from '@tanstack/react-query'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Bot, CheckCircle2, ChevronDown, Code2, Database, Disc3, Layers, Music2, Palette, RefreshCw, Zap } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import * as R from 'remeda'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  SpotifyEmbedStrip,
  CmdKHint,
  CommandPalette,
  DspShareEqualizer,
  HeaderVisualizer,
  NowPlayingTicker,
  Sparkline,
  Card,
  Metric,
} from '../../components'
import { cn, useAnimatedNumber, compact, currency, formatTime } from '../../lib'
import type { Release } from '../../types'
import { fetchOpsSnapshot } from './api'
import { DSP_COLORS } from './dspColors'
import { dspOptions, useDashboardStore } from './store'


const CHART_FILLS = ['#67e8f9', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#fb923c']

function DspBadge({ dsp }: { dsp: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="size-2 rounded-full" style={{ background: DSP_COLORS[dsp] ?? '#67e8f9', boxShadow: `0 0 6px ${DSP_COLORS[dsp] ?? '#67e8f9'}` }} />
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
  const { data, isLoading, dataUpdatedAt, isFetching, refetch } = useQuery({
    queryKey: ['ops-snapshot'],
    queryFn: fetchOpsSnapshot,
    refetchInterval: 30_000,
  })
  const [activeTab, setActiveTab] = useState('operations')
  const handleSelectTab = useCallback((tab: string) => setActiveTab(tab), [])

  const filtered = dsp === 'All'
  const releases = R.pipe(
    data?.releases ?? [],
    R.filter((r) => filtered || r.dsp === dsp),
    R.sortBy([(r) => r.risk, 'desc']),
  )

  const filteredStreams = R.sumBy(releases, (r) => r.streams)
  const filteredRevenue = R.sumBy(releases, (r) => r.revenue)
  const highRisk = R.filter(releases, (r) => r.risk >= 40).length

  const animStreams = useAnimatedNumber(filtered ? data?.metrics.monthlyStreams ?? 0 : filteredStreams)
  const animRevenue = useAnimatedNumber(filtered ? data?.metrics.royaltyForecast ?? 0 : filteredRevenue)
  const animClaims = useAnimatedNumber(filtered ? data?.metrics.claimQueue ?? 0 : highRisk)
  const animPayout = useAnimatedNumber(data?.metrics.payoutReadiness ?? 0)

  const chartData = filtered
    ? data?.territories ?? []
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
      )

  const table = useReactTable({ data: releases, columns, getCoreRowModel: getCoreRowModel() })

  const dspShareItems = useMemo(
    () =>
      data
        ? R.pipe(
            data.releases,
            R.groupBy((r) => r.dsp),
            R.entries(),
            R.map(([name, items]) => ({ name, pct: Math.round((items.length / data.releases.length) * 100) })),
            R.sortBy([(d) => d.pct, 'desc']),
          )
        : [],
    [data],
  )

  if (isLoading || !data) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <Disc3 size={32} className="animate-spin text-cyan-300" />
          <span className="text-sm">Loading music ops...</span>
        </div>
      </main>
    )
  }

  const filteredCount = !filtered ? releases.length : null

  return (
    <>
    <CommandPalette data={data} onSelectDsp={setDsp} onSelectTab={handleSelectTab} />
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#164e63_0,#020617_34rem)] px-5 py-6 text-slate-100 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">

        {/* ── header ── */}
        <header className="group/header relative isolate overflow-hidden rounded-[2rem] bg-white/[0.06] p-6 pb-10 shadow-2xl shadow-cyan-950/20 backdrop-blur md:p-10 md:pb-14">
          <div className="pointer-events-none absolute -inset-[1px] rounded-[inherit] border border-transparent" style={{ background: 'linear-gradient(var(--angle, 0deg), rgba(103,232,249,.35), rgba(167,139,250,.25), rgba(244,114,182,.25), rgba(103,232,249,.35)) border-box', mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', animation: 'border-rotate 8s linear infinite' }} />
          <HeaderVisualizer />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
                <Disc3 size={14} className="animate-[spin_4s_linear_infinite]" /> Create Music Ops
              </span>
              <CmdKHint />
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              <span className="text-white">Royalty, catalog, and </span>
              <span className="animated-gradient-text">DSP intelligence</span>
              <span className="text-white"> for fast music teams.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              A senior frontend case study: polished internal tooling, validated API contracts, responsive data density, and clean component architecture.
            </p>
          </div>
        </header>

        {/* ── now playing ticker ── */}
        {data && <NowPlayingTicker releases={data.releases} />}

        <SpotifyEmbedStrip />

        {/* ── metrics ── */}
        <section className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: filtered ? 'Monthly streams' : `${dsp} streams`,
              value: compact.format(Math.round(animStreams)),
              delta: filtered ? '+14.2% vs forecast' : `${releases.length} releases`,
              accent: 'cyan' as const,
              sparkSeed: 1,
              sparkColor: '#67e8f9',
              trend: 'up' as const,
            },
            {
              label: filtered ? 'Royalty forecast' : `${dsp} revenue`,
              value: currency.format(Math.round(animRevenue)),
              delta: filtered ? '+8.6% MoM' : `of ${currency.format(data.metrics.royaltyForecast)} total`,
              accent: 'violet' as const,
              sparkSeed: 7,
              sparkColor: '#a78bfa',
              trend: 'up' as const,
            },
            {
              label: 'Claim queue',
              value: String(Math.round(animClaims)),
              delta: `${highRisk} urgent releases`,
              accent: 'rose' as const,
              sparkSeed: 13,
              sparkColor: '#f472b6',
              trend: 'down' as const,
            },
          ].map((m, i) => (
            <Metric key={i} {...m} style={{ animationDelay: `${i * 80}ms` }}>
              <Sparkline seed={m.sparkSeed} color={m.sparkColor} trend={m.trend} className="absolute bottom-3 right-3 h-8 w-24 opacity-60" />
            </Metric>
          ))}

          <Card className="group relative min-h-34 overflow-hidden" style={{ animation: 'stagger-in .5s ease both', animationDelay: '240ms' }}>
            <div className="pointer-events-none absolute -inset-px rounded-[inherit] bg-gradient-to-br from-cyan-400/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <p className="text-sm text-slate-400">Payout readiness</p>
            <strong className="mt-4 block text-3xl font-semibold tabular-nums text-white">{Math.round(animPayout)}%</strong>
            <Progress.Root className="mt-5 h-2 overflow-hidden rounded-full bg-white/10" value={data.metrics.payoutReadiness}>
              <Progress.Indicator
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-200 shadow-[0_0_12px_theme(colors.cyan.400/50%)] transition-transform"
                style={{ transform: `translateX(-${100 - data.metrics.payoutReadiness}%)` }}
              />
            </Progress.Root>
            <Sparkline seed={19} color="#67e8f9" trend="up" className="absolute bottom-3 right-3 h-8 w-24 opacity-40" />
          </Card>
        </section>

        {/* ── content ── */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="grid gap-6 xl:grid-cols-[1fr_24rem]">
          <Card className="min-w-0">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Tabs.List className="inline-flex w-fit rounded-full border border-white/10 bg-black/20 p-1">
                {['operations', 'markets'].map((tab) => (
                  <Tabs.Trigger
                    key={tab}
                    value={tab}
                    className="rounded-full px-4 py-2 text-sm capitalize text-slate-300 transition-colors data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-lg"
                  >
                    {tab}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <Select.Root value={dsp} onValueChange={setDsp}>
                <Select.Trigger
                  className={cn(
                    'inline-flex items-center justify-between gap-3 rounded-full border px-4 py-2 text-sm transition-colors',
                    dsp !== 'All'
                      ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100'
                      : 'border-white/10 bg-white/[0.04] text-white',
                  )}
                >
                  <Select.Value />
                  {filteredCount !== null && (
                    <span className="grid size-5 place-items-center rounded-full bg-cyan-300 text-[10px] font-bold text-slate-950">
                      {filteredCount}
                    </span>
                  )}
                  <Select.Icon><ChevronDown size={16} /></Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-1 text-sm text-white shadow-xl">
                    <Select.Viewport>
                      {dspOptions.map((option) => (
                        <Select.Item key={option} value={option} className="cursor-pointer rounded-xl px-3 py-2 outline-none data-[highlighted]:bg-cyan-300 data-[highlighted]:text-slate-950">
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

            <Tabs.Content value="operations">
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

            <Tabs.Content value="markets">
              <p className="mb-4 text-xs text-slate-500">
                {filtered ? 'Revenue by territory' : `Revenue by artist on ${dsp}`}
              </p>
              <div className="h-[26rem]">
              {chartData.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
                  <Music2 size={32} />
                  <p className="text-sm">No data for this filter.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap="18%">
                    <defs>
                      {CHART_FILLS.map((c, i) => (
                        <linearGradient key={i} id={`bar-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={c} stopOpacity={1} />
                          <stop offset="100%" stopColor={c} stopOpacity={0.35} />
                        </linearGradient>
                      ))}
                      {CHART_FILLS.map((c, i) => (
                        <filter key={`g${i}`} id={`glow-${i}`}>
                          <feGaussianBlur stdDeviation="6" result="blur" />
                          <feFlood floodColor={c} floodOpacity="0.4" />
                          <feComposite in2="blur" operator="in" />
                          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      ))}
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
                    <XAxis dataKey="market" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => compact.format(v)} />
                    <Tooltip
                      cursor={{ fill: 'rgba(103,232,249,.06)' }}
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.12)', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,.6)', color: '#e2e8f0' }}
                      labelStyle={{ color: '#cbd5e1', fontWeight: 600, marginBottom: 4 }}
                      itemStyle={{ color: '#67e8f9' }}
                      formatter={(v) => [currency.format(Number(v)), 'Revenue']}
                    />
                    <Bar dataKey="revenue" radius={[10, 10, 0, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={`url(#bar-${i % CHART_FILLS.length})`} filter={`url(#glow-${i % CHART_FILLS.length})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              </div>
            </Tabs.Content>
          </Card>

          {/* ── sidebar ── */}
          <div className="flex flex-col gap-4">
            {/* DSP distribution */}
            <Card className="flex flex-col gap-4 overflow-visible">
              <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">DSP share</h2>
              <DspShareEqualizer items={dspShareItems} />
            </Card>

            {/* AI review notes */}
            <Card className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-200 shadow-inner shadow-violet-500/10">
                  <Bot size={20} />
                </span>
                <div>
                  <h2 className="font-semibold text-white">AI review notes</h2>
                  <p className="text-sm text-slate-400">Validated from GraphQL payload</p>
                </div>
              </div>
              {data.insights.map((insight, i) => (
                <article
                  key={insight}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
                >
                  <div
                    className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(135deg, ${['rgba(103,232,249,.12)', 'rgba(167,139,250,.12)', 'rgba(244,114,182,.12)'][i % 3]} 0%, transparent 60%)`,
                    }}
                  />
                  <CheckCircle2 className="relative mb-3 text-cyan-200" size={18} />
                  <span className="relative">{insight}</span>
                </article>
              ))}
            </Card>
          </div>
        </Tabs.Root>

        {/* ── tech stack ── */}
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -inset-[1px] rounded-[inherit] border border-transparent" style={{ background: 'linear-gradient(var(--angle, 0deg), rgba(103,232,249,.2), rgba(167,139,250,.15), rgba(244,114,182,.15), rgba(103,232,249,.2)) border-box', mask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', animation: 'border-rotate 12s linear infinite' }} />
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400/15 to-violet-400/10">
                <Layers size={16} className="text-cyan-300" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-white">Tech Stack</h2>
                <p className="text-[11px] text-slate-500">Production-grade architecture</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              <span>Live — {dataUpdatedAt ? formatTime(dataUpdatedAt) : '—'}</span>
              <button
                onClick={() => refetch()}
                className={cn('rounded-full p-1 transition-colors hover:bg-white/[0.06]', isFetching && 'animate-spin')}
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {([
              { icon: Code2, title: 'Core', color: '#67e8f9', items: ['React 19', 'TypeScript', 'Vite'] },
              { icon: Palette, title: 'UI / Design', color: '#a78bfa', items: ['Tailwind CSS', 'Radix UI', 'Lucide Icons'] },
              { icon: Database, title: 'Data Layer', color: '#34d399', items: ['React Query', 'Zustand', 'Zod', 'GraphQL'] },
              { icon: Zap, title: 'Visualization', color: '#fbbf24', items: ['Recharts', 'TanStack Table', 'Remeda'] },
            ] as const).map((cat) => (
              <div key={cat.title} className="group/cat rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/10 hover:bg-white/[0.04]">
                <div className="mb-3 flex items-center gap-2">
                  <cat.icon size={14} style={{ color: cat.color }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: cat.color }}>{cat.title}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {cat.items.map((t) => (
                    <span key={t} className="text-xs text-slate-400 transition-colors group-hover/cat:text-slate-300">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
    </>
  )
}
