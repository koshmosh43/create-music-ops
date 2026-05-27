import { coldHexAt, COLD_HEX, STACK_HEX } from '../../lib/stackAccents'

export const DSP_SPECTRUM = COLD_HEX.slice(0, 6)

export const DSP_PLATFORM_ORDER = [
  'Spotify',
  'Apple Music',
  'YouTube',
  'TikTok',
  'Amazon',
] as const

export const DSP_COLORS: Record<(typeof DSP_PLATFORM_ORDER)[number], string> = {
  Spotify: coldHexAt(3),
  'Apple Music': coldHexAt(8),
  YouTube: coldHexAt(1),
  TikTok: coldHexAt(4),
  Amazon: coldHexAt(6),
}

export const DSP_FALLBACK = STACK_HEX.lemon

export const CHART_FILLS = [
  coldHexAt(3),
  coldHexAt(5),
  coldHexAt(1),
  coldHexAt(7),
  coldHexAt(0),
  coldHexAt(9),
] as const

export function dspSpectrumAt(index: number): string {
  return COLD_HEX[index % COLD_HEX.length]
}
