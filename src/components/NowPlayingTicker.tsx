import { Disc3 } from 'lucide-react'
import { SPOTIFY_TRACKS } from '../features/dashboard/spotifyEmbeds'

export function NowPlayingTicker() {
  const doubled = [...SPOTIFY_TRACKS, ...SPOTIFY_TRACKS]

  return (
    <div className="ticker-shell" aria-label="Now playing - HIRE ME">
      <div className="ticker-track" aria-hidden>
        {doubled.map((t, i) => (
          <span key={`${t.id}-${i}`} className="ticker-item">
            <Disc3 size={12} className="ticker-disc" />
            <span className="ticker-title ticker-title--neon">{t.title}</span>
            <span className="ticker-dot">·</span>
            <span className="ticker-artist">{t.artist}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
