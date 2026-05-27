import { ExternalLink, MoreHorizontal, Pause, Play, Plus, Volume2 } from 'lucide-react'
import type { CSSProperties } from 'react'
import { startTransition, useCallback, useState } from 'react'
import { AcronymBanner, AcronymTitle } from './AcronymTitle'
import { BlurArtBackdrop } from '../lib/BlurArtBackdrop'
import { cn } from '../lib/cn'
import { STACK_HEX } from '../lib/stackAccents'
import { useDashboardStore } from '../features/dashboard/store'
import { SPOTIFY_TRACKS, openSpotifyUrl } from '../features/dashboard/spotifyEmbeds'
import { useSpotifyEmbed } from '../lib/useSpotifyEmbed'

function SpotifyLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

function VinylDisc({ color, spinning }: { color: string; spinning: boolean }) {
  return (
    <div className={cn('relative size-9 shrink-0', spinning && 'vinyl-spin')}>
      <div
  className="absolute inset-0 rounded-full"
  style={{
    background: [
      'radial-gradient(circle at 50% 32%, rgb(255 255 255 / 0.08), transparent 45%)',
      'radial-gradient(circle, #060606 36%, #141414 62%, #080808 100%)',
      'repeating-conic-gradient(from 0deg, #0e0e0e 0deg 1.4deg, #1a1a1a 1.4deg 2.8deg)',
    ].join(','),
    boxShadow: [
      'inset 0 0 0 1px rgb(255 255 255 / 0.05)',
      `0 0 0 1.5px color-mix(in srgb, ${color} 65%, #000)`,
      '0 4px 10px rgb(0 0 0 / 0.55)',
      `0 0 12px color-mix(in srgb, ${color} 22%, transparent)`,
    ].join(', '),
  }}
/>
      <div
        className="absolute inset-[35%] rounded-full bg-gradient-to-br from-zinc-900/95 to-black/90 ring-1"
        style={{ boxShadow: `inset 0 0 0 1px ${color}40` }}
      />
      <div className="absolute inset-[42%] rounded-full" style={{ background: color, boxShadow: `0 0 12px ${color}88` }} />
    </div>
  )
}

function EqDots({ color }: { color: string }) {
  return (
    <span className="ml-auto flex shrink-0 items-end gap-[2px]">
      {[0, 1, 2].map((b) => (
        <span
          key={b}
          className="eq-bar active h-3 w-[3px] rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}`, animationDelay: `${b * 0.12}s` }}
        />
      ))}
    </span>
  )
}

function TrackGap() {
  return (
    <div className="spotify-track-gap" aria-hidden>
      <span className="spotify-track-gap__rule" />
    </div>
  )
}

function TrackRow({
  index,
  isActive,
  onSelect,
}: {
  index: number
  isActive: boolean
  onSelect: (i: number) => void
}) {
  const t = SPOTIFY_TRACKS[index]
  return (
    <>
      <button
        type="button"
        onClick={() => onSelect(index)}
        className={cn('spotify-track group/t', isActive && 'spotify-track--active')}
        style={isActive ? ({ '--track-accent': t.accent } as CSSProperties) : undefined}
      >
        <VinylDisc color={isActive ? t.accent : `${STACK_HEX.lemon}66`} spinning={isActive} />
        <div className="min-w-0 flex-1">
          <span className="spotify-track__title truncate">
            <AcronymTitle title={t.title} />
          </span>
          <span className="truncate text-[11px] text-violet-200/45">{t.artist}</span>
        </div>
        {isActive ? (
          <EqDots color={t.accent} />
        ) : (
          <Volume2 size={13} className="ml-auto shrink-0 text-violet-300/30 opacity-0 group-hover/t:opacity-100" />
        )}
      </button>
      {t.gapAfter && <TrackGap />}
    </>
  )
}

export function SpotifyEmbedStrip() {
  const [activeIndex, setActiveIndex] = useState(0)
  const setHeroTrack = useDashboardStore((s) => s.setActiveTrackIndex)
  const active = SPOTIFY_TRACKS[activeIndex]
  const { embedRef, playing, toggle } = useSpotifyEmbed(active.id)

  const switchTrack = useCallback(
    (index: number) => {
      startTransition(() => {
        setActiveIndex(index)
        setHeroTrack(index)
      })
    },
    [setHeroTrack],
  )

  return (
    <section className="spotify-section">
      <div className="spotify-section__mesh" aria-hidden />
      <div
        className="spotify-section__accent-glow"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 70% 55% at 20% 0%, ${active.accent}40, transparent 58%), radial-gradient(ellipse 50% 40% at 90% 20%, ${STACK_HEX.lemonSoft}14, transparent 50%)`,
        }}
      />

      <div className="relative z-10 p-5 md:p-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="spotify-head__badge">
              <SpotifyLogo className="size-5 text-[#1db954]" />
              <p className="label-caps">Acronym list</p>
              <span className="live-dot" style={{ background: active.accent, boxShadow: `0 0 10px ${active.accent}` }} />
            </div>
            <AcronymBanner className="mt-2" />
            <p className="ui-meta panel-heading__sub mt-2 text-[11px]">First letters spell it out</p>
          </div>

          <a
            href={openSpotifyUrl(activeIndex)}
            target="_blank"
            rel="noreferrer"
            className="spotify-open"
          >
            Open on Spotify <ExternalLink size={13} />
          </a>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <nav className="flex shrink-0 flex-col justify-evenly gap-0.5 lg:w-72" aria-label="HIRE ME picks">
            {SPOTIFY_TRACKS.map((t, i) => (
              <TrackRow key={t.id} index={i} isActive={activeIndex === i} onSelect={switchTrack} />
            ))}
          </nav>

          <div className="spotify-player" style={{ '--track-accent': active.accent } as CSSProperties}>
            <div className="spotify-player__neon" aria-hidden />
            <div className="spotify-player__stage">
              <BlurArtBackdrop
                key={active.art}
                src={active.art}
                blur={56}
                saturate={1.85}
                className="spotify-player__stage-bg"
              />
              <div className="spotify-player__stage-scrim" aria-hidden />
              <aside className="spotify-player__chrome" aria-label={`${active.title} — ${active.artist}`}>
                <div className="spotify-player__art-wrap">
                  <img
                    src={active.art}
                    alt=""
                    decoding="async"
                    className="spotify-player__art"
                  />
                </div>
                <div className="spotify-player__chrome-body">
                  <SpotifyLogo className="spotify-player__chrome-logo" />
                  <div className="spotify-player__chrome-meta">
                    <h3 className="spotify-player__chrome-title">
                      <AcronymTitle title={active.title} />
                    </h3>
                    <p className="spotify-player__chrome-artist">{active.artist}</p>
                    <a
                      href={openSpotifyUrl(activeIndex)}
                      target="_blank"
                      rel="noreferrer"
                      className="spotify-player__save"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      Save on Spotify
                    </a>
                  </div>
                  <div className="spotify-player__chrome-actions">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggle()
                      }}
                      className={cn('spotify-player__play', playing && 'spotify-player__play--active')}
                      aria-label={playing ? `Pause ${active.title}` : `Play ${active.title}`}
                      aria-pressed={playing}
                    >
                      {playing ? (
                        <Pause size={22} fill="currentColor" strokeWidth={0} />
                      ) : (
                        <Play size={22} fill="currentColor" strokeWidth={0} className="ml-0.5" />
                      )}
                    </button>
                    <button type="button" className="spotify-player__more" aria-label="More options">
                      <MoreHorizontal size={22} />
                    </button>
                  </div>
                </div>
              </aside>
              <div ref={embedRef} className="spotify-player__embed-mount" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
