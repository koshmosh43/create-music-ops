export type SpotifyTrack = {
  id: string
  title: string
  artist: string
  accent: string
}

export const SPOTIFY_TRACKS: SpotifyTrack[] = [
  { id: '4iV5W9uYEdYUVa79Axb7Rh', title: 'Flowers', artist: 'Miley Cyrus', accent: '#ff6b9d' },
  { id: '1BxfuPKGuaTgP7aM0Bbdwr', title: 'Cruel Summer', artist: 'Taylor Swift', accent: '#67e8f9' },
  { id: '5ChkMS8OtdzJeqyybCc9R5', title: 'Good 4 U', artist: 'Olivia Rodrigo', accent: '#a78bfa' },
  { id: '7ytR5pFWmSjzHJIeQkgog4', title: 'HUMBLE.', artist: 'Kendrick Lamar', accent: '#34d399' },
  { id: '0sf8kmTDo8LTqu4JWiLCz3', title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', accent: '#fbbf24' },
  { id: '6WrI0LAC5M1Rw2MnX2ZvEg', title: 'Unholy', artist: 'Sam Smith ft. Kim Petras', accent: '#f472b6' },
  { id: '1mWdTewIgB3gtBM3TOSFhB', title: 'Industry Baby', artist: 'Lil Nas X & Jack Harlow', accent: '#fb923c' },
  { id: '4LRPiXqCikLlN15c3yImP7', title: 'As It Was', artist: 'Harry Styles', accent: '#84cc16' },
]

export const SPOTIFY_PLAYLIST_ID = '37i9dQZEVXbLRQDuF5jeBp'

export type PlayerSource =
  | { kind: 'track'; index: number }
  | { kind: 'playlist' }

export function embedSrc(src: PlayerSource) {
  if (src.kind === 'playlist')
    return `https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator&theme=0`
  return `https://open.spotify.com/embed/track/${SPOTIFY_TRACKS[src.index].id}?utm_source=generator&theme=0`
}
