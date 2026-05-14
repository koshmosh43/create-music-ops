export type SpotifyTrack = {
  id: string
  title: string
  artist: string
  accent: string
}

export const SPOTIFY_TRACKS: SpotifyTrack[] = [
  { id: '4Z5KKoBGxpJo8YbDcGQXd5', title: 'Secondhand (feat. Rema)', artist: 'Don Toliver', accent: '#ff6b9d' },
  { id: '2odGzH4EPpmvpLtZtHXvL6', title: 'bad idea right?', artist: 'Olivia Rodrigo', accent: '#a78bfa' },
  { id: '1BxfuPKGuaTgP7aM0Bbdwr', title: 'The Fate of Ophelia', artist: 'Taylor Swift', accent: '#67e8f9' },
  { id: '4iV5W9uYEdYUVa79Axb7Rh', title: 'Man I Need', artist: 'Olivia Dean', accent: '#34d399' },
  { id: '7MXVkk9YMctZqd1Srtv4MB', title: 'Babydoll', artist: 'Dominic Fike', accent: '#fbbf24' },
  { id: '3USxtqRwSYz57Ewm6wWRMp', title: 'Opalite', artist: 'Miley Cyrus', accent: '#f472b6' },
  { id: '39LLxExYz6ewLAcYrzQQyP', title: 'Sports car', artist: 'Tate McRae', accent: '#fb923c' },
  { id: '7qiZfU4dY1lWllzX7mPBI3', title: 'End of Beginning', artist: 'Djo', accent: '#84cc16' },
]

export const SPOTIFY_PLAYLIST_ID = '37i9dQZF1DX0XUsuxWHRQd'

export type PlayerSource =
  | { kind: 'track'; index: number }
  | { kind: 'playlist' }

export function embedSrc(src: PlayerSource) {
  if (src.kind === 'playlist')
    return `https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator&theme=0`
  return `https://open.spotify.com/embed/track/${SPOTIFY_TRACKS[src.index].id}?utm_source=generator&theme=0`
}
