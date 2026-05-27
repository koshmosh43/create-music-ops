import { STACK_HEX } from '../../lib/stackAccents'

export type SpotifyTrack = {
  id: string
  title: string
  artist: string
  accent: string
  acronym: 'H' | 'I' | 'R' | 'E' | 'M'
  art: string
  gapAfter?: boolean
}

const TRACK_META = [
  {
    id: '37Lm3kusqIFVdyiVGYZTpf',
    title: 'Hotel',
    artist: 'Derek Pope',
    acronym: 'H',
    art: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d0000b2738b7ab11567abd568b42070ad',
  },
  {
    id: '3u2IrwgaWOQpHJN074qnuC',
    title: 'I Get By',
    artist: 'Everlast',
    acronym: 'I',
    art: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d0000b273c6b5c08529ff70fa114718e6',
  },
  {
    id: '2YD9JIchaD9JfWrdSKBQcg',
    title: 'Rapture',
    artist: 'David Wolves',
    acronym: 'R',
    art: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d0000b27360091526a6a79fb548f875f4',
  },
  {
    id: '1czaCgWLWgqp0eRIZ0BcXh',
    title: 'Everywhere I Go',
    artist: 'Hollywood Undead',
    acronym: 'E',
    gapAfter: true,
    art: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d0000b273e3a40a64f0473c111cf42b06',
  },
  {
    id: '2FEuiNcpNqNtJR9GzUjUmC',
    title: 'MSY',
    artist: '$uicideboy$',
    acronym: 'M',
    art: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d0000b27355e5812ec3cdf5f0ede5aa84',
  },
  {
    id: '6zucgMkRLsGgNIN8o0qX0W',
    title: 'End of Days',
    artist: 'Vinnie Paz, Block McCloud',
    acronym: 'E',
    art: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d0000b27313ea9ad3563b7a2507b6c442',
  },
] as const satisfies readonly Omit<SpotifyTrack, 'accent'>[]

export const ACRONYM_LETTERS = TRACK_META.map((t) => t.acronym)
export const SPOTIFY_TRACKS: SpotifyTrack[] = TRACK_META.map((t, i) => ({
  ...t,
  accent: STACK_HEX.lemon,
}))

const EMBED = 'https://open.spotify.com/embed'

export function embedSrc(index: number, autoplay = false) {
  return embedSrcById(SPOTIFY_TRACKS[index].id, autoplay)
}

export function embedSrcById(trackId: string, autoplay = false) {
  const params = new URLSearchParams({ utm_source: 'generator', theme: '0' })
  if (autoplay) params.set('autoplay', '1')
  return `${EMBED}/track/${trackId}?${params}`
}

export function openSpotifyUrl(index: number) {
  return `https://open.spotify.com/track/${SPOTIFY_TRACKS[index].id}`
}
