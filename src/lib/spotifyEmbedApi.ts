export type SpotifyPlaybackEvent = { data?: { isPaused?: boolean } }

export type SpotifyEmbedController = {
  play: () => void
  pause: () => void
  togglePlay: () => void
  resume: () => void
  loadUri: (uri: string, startMs?: number, autoplay?: boolean) => void
  destroy: () => void
  addListener: (event: 'ready' | 'playback_update', cb: (e?: SpotifyPlaybackEvent) => void) => void
  removeListener: (event: 'ready' | 'playback_update', cb: (e?: SpotifyPlaybackEvent) => void) => void
}

export type SpotifyIframeAPI = {
  createController: (
    element: HTMLElement,
    options: { uri?: string; width?: string | number; height?: string | number; theme?: string },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void
}

export function trackUri(trackId: string) {
  return `spotify:track:${trackId}`
}

export function loadSpotifyApi(): Promise<SpotifyIframeAPI> {
  const w = window as Window & {
    __spotifyIframeApi?: SpotifyIframeAPI
    __spotifyEmbedWaiters?: Array<(api: SpotifyIframeAPI) => void>
  }
  if (w.__spotifyIframeApi) return Promise.resolve(w.__spotifyIframeApi)
  return new Promise((resolve) => {
    w.__spotifyEmbedWaiters = w.__spotifyEmbedWaiters ?? []
    w.__spotifyEmbedWaiters.push(resolve)
  })
}
