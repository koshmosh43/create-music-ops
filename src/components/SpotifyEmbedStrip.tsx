import { ExternalLink, ListMusic, Volume2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn, debounce, createCleanupManager } from '../lib'
import {
  SPOTIFY_PLAYLIST_ID,
  SPOTIFY_TRACKS,
  embedSrc,
  type PlayerSource,
} from '../features/dashboard/spotifyEmbeds'

const SPOTIFY_GREEN = '#1db954'

function SpotifyLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

function VinylDisc({ color, spinning }: { color: string; spinning: boolean }) {
  return (
    <div className={cn('relative size-9 shrink-0', spinning && 'animate-[spin_3s_linear_infinite]')}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${color}40, ${color}10 25%, ${color}30 50%, ${color}10 75%, ${color}40)`,
          boxShadow: spinning ? `0 0 16px ${color}50` : 'none',
        }}
      />
      <div className="absolute inset-[35%] rounded-full bg-slate-950 ring-1 ring-white/10" />
      <div className="absolute inset-[42%] rounded-full" style={{ background: color }} />
    </div>
  )
}

export function SpotifyEmbedStrip() {
  const [source, setSource] = useState<PlayerSource>({ kind: 'track', index: 0 })
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeContainerRef = useRef<HTMLDivElement>(null)
  
  const activeAccent = source.kind === 'track' ? SPOTIFY_TRACKS[source.index].accent : SPOTIFY_GREEN
  const isPlaylist = source.kind === 'playlist'

  // CRITICAL FIX: Recreate iframe container to force cleanup of Spotify's event listeners
  const switchSource = useCallback((next: PlayerSource) => {
    const nextSrc = embedSrc(next)
    const currentSrc = embedSrc(source)
    if (nextSrc === currentSrc) return

    setLoading(true)
    setSource(next)

    // FORCE IFRAME CLEANUP - this is the key fix
    const container = iframeContainerRef.current
    if (container) {
      // Remove old iframe completely to cleanup Spotify's window listeners
      container.innerHTML = ''
      
      // Create fresh iframe after small delay
      setTimeout(() => {
        const iframe = document.createElement('iframe')
        iframe.src = nextSrc
        iframe.width = '100%'
        iframe.height = '100%'
        iframe.title = 'Spotify Player'
        iframe.allow = 'encrypted-media'
        iframe.loading = 'lazy'
        iframe.style.cssText = 'border: none; border-radius: 0; background: #121212;'
        
        // Simple load handler
        iframe.onload = () => setLoading(false)
        iframe.onerror = () => setLoading(false)
        
        container.appendChild(iframe)
      }, 100)
    }
  }, [source])

  // Initialize first iframe
  useEffect(() => {
    const container = iframeContainerRef.current
    if (!container || container.children.length > 0) return

    const iframe = document.createElement('iframe')
    iframe.src = embedSrc(source)
    iframe.width = '100%'
    iframe.height = '100%'
    iframe.title = 'Spotify Player'
    iframe.allow = 'encrypted-media'
    iframe.loading = 'lazy'
    iframe.style.cssText = 'border: none; border-radius: 0; background: #121212;'
    
    iframe.onload = () => setLoading(false)
    iframe.onerror = () => setLoading(false)
    
    container.appendChild(iframe)
  }, [])

  // Block Spotify's postMessage listeners that cause freezing
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Block all Spotify postMessages to prevent UI freezing
      if (event.origin?.includes('spotify.com')) {
        event.stopImmediatePropagation()
        return false
      }
    }
    
    window.addEventListener('message', handleMessage, { capture: true })
    return () => window.removeEventListener('message', handleMessage, { capture: true })
  }, [])

  return (
    <section className="spotify-section relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] shadow-2xl shadow-black/40">
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-700"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 10%, ${activeAccent}30, transparent 55%),
            radial-gradient(ellipse 50% 70% at 85% 85%, ${activeAccent}20, transparent 55%),
            radial-gradient(ellipse 40% 40% at 50% 50%, ${activeAccent}08, transparent 40%)
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/85 to-slate-950" />

      <div className="relative z-10 p-5 md:p-7">
        {/* header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <SpotifyLogo className="size-5 text-[#1db954]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#1db954]">Now Playing</p>
              <span className="relative ml-1 flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full opacity-60" style={{ background: activeAccent }} />
                <span className="relative inline-flex size-2 rounded-full" style={{ background: activeAccent }} />
              </span>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">
              Music Hub
            </h2>
          </div>
          <a
            href={`https://open.spotify.com/playlist/${SPOTIFY_PLAYLIST_ID}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#1db954]/25 bg-[#1db954]/10 px-4 py-2 text-xs font-medium text-[#1db954] transition hover:bg-[#1db954]/20 hover:text-white hover:shadow-[0_0_16px_#1db95430]"
          >
            Open in Spotify <ExternalLink size={13} />
          </a>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row">
          {/* track list */}
          <div className="flex shrink-0 flex-col gap-1 lg:w-72">
            <button
              onClick={() => switchSource({ kind: 'playlist' })}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all',
                isPlaylist
                  ? 'bg-[#1db954]/15 text-white ring-1 ring-[#1db954]/30 shadow-[inset_0_1px_0_#1db95420]'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
              )}
            >
              <span
                className={cn(
                  'grid size-9 shrink-0 place-items-center rounded-lg transition-all',
                  isPlaylist
                    ? 'bg-[#1db954]/20 shadow-[0_0_20px_#1db95430]'
                    : 'bg-white/[0.05]',
                )}
              >
                <ListMusic size={16} className={isPlaylist ? 'text-[#1db954]' : 'text-slate-500'} />
              </span>
              <div className="min-w-0">
                <span className="block truncate font-medium">Hottest 2026</span>
                <span className="text-[10px] text-slate-500">Trending Now</span>
              </div>
              {isPlaylist && (
                <span className="ml-auto flex shrink-0 items-end gap-[2px]">
                  {[0, 1, 2].map((b) => (
                    <span
                      key={b}
                      className="eq-bar active inline-block w-[3px] rounded-full bg-[#1db954]"
                      style={{ height: 12, animationDelay: `${b * 0.15}s` }}
                    />
                  ))}
                </span>
              )}
            </button>

            <div className="my-1.5 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

            {SPOTIFY_TRACKS.map((t, i) => {
              const active = source.kind === 'track' && source.index === i
              return (
                <button
                  key={t.id}
                  onClick={() => switchSource({ kind: 'track', index: i })}
                  className={cn(
                    'group/t relative flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-all',
                    active
                      ? 'text-white ring-1 ring-white/[0.1]'
                      : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200',
                  )}
                >
                  {active && (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${t.accent}18, transparent 60%)`,
                        boxShadow: `inset 0 1px 0 ${t.accent}15`,
                      }}
                    />
                  )}
                  <div className="relative">
                    <VinylDisc color={active ? t.accent : '#475569'} spinning={active} />
                  </div>
                  <div className="relative min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{t.title}</span>
                    <span className="truncate text-[11px] text-slate-500">{t.artist}</span>
                  </div>
                  {active && (
                    <span className="relative ml-auto flex shrink-0 items-end gap-[2px]">
                      {[0, 1, 2].map((b) => (
                        <span
                          key={b}
                          className="eq-bar active inline-block w-[3px] rounded-full"
                          style={{ height: 12, background: t.accent, animationDelay: `${b * 0.15}s` }}
                        />
                      ))}
                    </span>
                  )}
                  {!active && (
                    <Volume2
                      size={13}
                      className="relative ml-auto shrink-0 text-slate-600 opacity-0 transition-opacity group-hover/t:opacity-100"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* player — FIXED: Manual iframe management to prevent Spotify listener leaks */}
          <div 
            ref={containerRef}
            className="relative flex-1 overflow-hidden rounded-2xl bg-[#121212] ring-1 ring-white/[0.08]" 
            style={{ boxShadow: `0 8px 40px ${activeAccent}15` }}
          >
            {loading && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-[#121212]/90 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="size-8 animate-spin rounded-full border-2 border-transparent"
                    style={{ borderTopColor: activeAccent, borderRightColor: `${activeAccent}60` }}
                  />
                  <span className="text-xs text-slate-500">Loading track…</span>
                </div>
              </div>
            )}
            <div 
              ref={iframeContainerRef}
              style={{ 
                height: isPlaylist ? 480 : 352, 
                transition: 'height .4s ease',
                opacity: loading ? 0.3 : 1
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
