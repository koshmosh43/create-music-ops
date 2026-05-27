import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  loadSpotifyApi,
  trackUri,
  type SpotifyEmbedController,
  type SpotifyPlaybackEvent,
} from './spotifyEmbedApi'

const EMBED_W = '300'
const EMBED_H = '152'

export function useSpotifyEmbed(trackId: string) {
  const embedRef = useRef<HTMLDivElement>(null)
  const ctrlRef = useRef<SpotifyEmbedController | null>(null)
  const readyRef = useRef(false)
  const wantPlayRef = useRef(false)
  const playingRef = useRef(false)
  const trackRef = useRef(trackId)
  const [playing, setPlaying] = useState(false)

  trackRef.current = trackId
  playingRef.current = playing

  const onPlayback = useCallback((e?: SpotifyPlaybackEvent) => {
    if (e?.data?.isPaused === undefined) return
    const on = !e.data.isPaused
    playingRef.current = on
    setPlaying(on)
    if (on) wantPlayRef.current = false
  }, [])

  const startPlay = useCallback(() => {
    const ctrl = ctrlRef.current
    if (!ctrl) {
      wantPlayRef.current = true
      return
    }
    if (readyRef.current) {
      ctrl.play()
      return
    }
    wantPlayRef.current = true
  }, [])

  const pause = useCallback(() => {
    wantPlayRef.current = false
    ctrlRef.current?.pause()
    playingRef.current = false
    setPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    if (playingRef.current) {
      pause()
      return
    }
    wantPlayRef.current = true
    playingRef.current = true
    setPlaying(true)
    startPlay()
  }, [pause, startPlay])

  useLayoutEffect(() => {
    const host = embedRef.current
    if (!host) return

    let dead = false
    let ctrl: SpotifyEmbedController | null = null

    const onReady = () => {
      readyRef.current = true
      if (wantPlayRef.current) ctrl?.play()
    }

    loadSpotifyApi().then((api) => {
      if (dead) return
      api.createController(
        host,
        { width: EMBED_W, height: EMBED_H, uri: trackUri(trackRef.current) },
        (controller) => {
          if (dead) return
          ctrl = controller
          ctrlRef.current = controller
          controller.addListener('ready', onReady)
          controller.addListener('playback_update', onPlayback)
        },
      )
    })

    return () => {
      dead = true
      readyRef.current = false
      wantPlayRef.current = false
      if (ctrl) {
        ctrl.removeListener('ready', onReady)
        ctrl.removeListener('playback_update', onPlayback)
        try {
          ctrl.destroy()
        } catch {}
      }
      ctrlRef.current = null
      host.replaceChildren()
    }
  }, [onPlayback])

  useEffect(() => {
    const ctrl = ctrlRef.current
    if (!ctrl || !readyRef.current) return
    ctrl.loadUri(trackUri(trackRef.current))
    if (playingRef.current) ctrl.play()
  }, [trackId])

  return { embedRef, playing, toggle }
}
