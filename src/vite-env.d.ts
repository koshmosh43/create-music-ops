/// <reference types="vite/client" />

import type { SpotifyIframeAPI } from './lib/spotifyEmbedApi'

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeAPI) => void
    __spotifyIframeApi?: SpotifyIframeAPI
    __spotifyEmbedWaiters?: Array<(api: SpotifyIframeAPI) => void>
  }
}

export {}
