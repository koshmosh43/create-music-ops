export type SpotifyTrack = {
  id: string
  title: string
  artist: string
  accent: string
}

export const SPOTIFY_TRACKS: SpotifyTrack[] = [
  { id: '0VjIjW4GlUZAMYd2vXMi3b', title: 'Blinding Lights', artist: 'The Weeknd', accent: '#e23636' },
  { id: '4Dvkj6JhhA12EX05fT7y2e', title: 'As It Was', artist: 'Harry Styles', accent: '#e6a040' },
  { id: '3USxtqRwSYz57Ewm6wWRMp', title: 'Heat Waves', artist: 'Glass Animals', accent: '#56b870' },
  { id: '39LLxExYz6ewLAcYrzQQyP', title: 'Levitating', artist: 'Dua Lipa', accent: '#a855f7' },
  { id: '7qiZfU4dY1lWllzX7mPBI3', title: 'Shape of You', artist: 'Ed Sheeran', accent: '#3b82f6' },
  { id: '2Fxmhks0bxGSBdJ92vM42m', title: 'bad guy', artist: 'Billie Eilish', accent: '#84cc16' },
  { id: '7MXVkk9YMctZqd1Srtv4MB', title: 'Starboy', artist: 'The Weeknd', accent: '#f43f5e' },
  { id: '0V3wPSX9ygBnCm8psDIegu', title: 'Anti-Hero', artist: 'Taylor Swift', accent: '#6366f1' },
]

export const SPOTIFY_PLAYLIST_ID = '37i9dQZEVXbMDoHDwVN2tF'

export type PlayerSource =
  | { kind: 'track'; index: number }
  | { kind: 'playlist' }

export function embedSrc(src: PlayerSource) {
  if (src.kind === 'playlist')
    return `https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator&theme=0`
  return `https://open.spotify.com/embed/track/${SPOTIFY_TRACKS[src.index].id}?utm_source=generator&theme=0`
}
