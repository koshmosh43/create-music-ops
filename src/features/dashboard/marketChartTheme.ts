import { coldHueAt, hslAccentHex } from '../../lib/stackAccents'

export type MarketBarTheme = {
  top: string
  mid: string
  deep: string
  base: string
  glow: string
  shimmer: string
}

export function marketBarTheme(index: number): MarketBarTheme {
  const h1 = coldHueAt(index)
  const h2 = coldHueAt(index + 3)
  const midHue = Math.round((h1 + h2) / 2)
  const warm = h1 < 100
  return {
    top: hslAccentHex(h1, warm ? 96 : 74, warm ? 62 : 64),
    mid: hslAccentHex(midHue, warm ? 92 : 70, warm ? 52 : 56),
    deep: hslAccentHex(h2, warm ? 88 : 68, warm ? 42 : 46),
    base: hslAccentHex(h2, warm ? 84 : 64, warm ? 26 : 30),
    glow: hslAccentHex(h1, warm ? 94 : 72, warm ? 58 : 60),
    shimmer: hslAccentHex(h1, warm ? 98 : 76, warm ? 72 : 74),
  }
}
