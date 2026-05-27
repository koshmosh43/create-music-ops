export const STACK_HUES = {
  lemon: 62,
  lilac: 272,
  cyan: 62,
  violet: 272,
} as const

export type StackAccent = 'lemon' | 'lilac' | 'cyan' | 'violet'

export const STACK_ACCENT_ORDER: StackAccent[] = ['lemon', 'lilac']

export const BRAND_HUE_SHADES = [62, 272, 58, 276, 64, 268, 56, 280, 66, 274] as const
export const COLD_HUE_SHADES = BRAND_HUE_SHADES
export const CARD_HUE_SHADES = BRAND_HUE_SHADES

export function coldHueAt(index: number): number {
  const i = ((index % BRAND_HUE_SHADES.length) + BRAND_HUE_SHADES.length) % BRAND_HUE_SHADES.length
  return BRAND_HUE_SHADES[i]
}

export function cardHueAt(index: number): number {
  return coldHueAt(index)
}

export function coldHexAt(index: number, s = 92, l = 58): string {
  return hslAccentHex(coldHueAt(index), s, l)
}

export function stackHue(accent: StackAccent): number {
  return STACK_HUES[accent]
}

export function stackHueAt(index: number): number {
  return STACK_HUES[STACK_ACCENT_ORDER[index % 2] === 'lemon' ? 'lemon' : 'lilac']
}

export function stackAccentAt(index: number): StackAccent {
  return STACK_ACCENT_ORDER[index % 2]
}

export const VIOLET_HUE_SHADES = [264, 268, 272, 276, 280] as const

export function violetHueAt(index: number): number {
  return VIOLET_HUE_SHADES[index % VIOLET_HUE_SHADES.length]
}

export function metricToneAt(index: number): 'lemon' | 'lilac' {
  return index % 2 === 0 ? 'lemon' : 'lilac'
}

export function hslAccentCss(hue: number, s = 76, l = 58): string {
  return `hsl(${hue} ${s}% ${l}%)`
}

export function hslAccentHex(hue: number, s = 76, l = 58): string {
  const sn = s / 100
  const ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = ln - c / 2
  let rp = 0
  let gp = 0
  let bp = 0
  if (hue < 60) [rp, gp, bp] = [c, x, 0]
  else if (hue < 120) [rp, gp, bp] = [x, c, 0]
  else if (hue < 180) [rp, gp, bp] = [0, c, x]
  else if (hue < 240) [rp, gp, bp] = [0, x, c]
  else if (hue < 300) [rp, gp, bp] = [x, 0, c]
  else [rp, gp, bp] = [c, 0, x]
  const h = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0')
  return `#${h(rp)}${h(gp)}${h(bp)}`
}

export const STACK_HEX = {
  lemon: hslAccentHex(62, 96, 58),
  lilac: hslAccentHex(272, 72, 62),
  lemonSoft: hslAccentHex(68, 92, 68),
  lilacSoft: hslAccentHex(278, 68, 72),
  cyan: hslAccentHex(62, 96, 58),
  violet: hslAccentHex(272, 72, 62),
  gold: hslAccentHex(56, 94, 54),
  citron: hslAccentHex(64, 96, 62),
  orchid: hslAccentHex(276, 70, 64),
  plum: hslAccentHex(268, 74, 58),
} as const

export const COLD_HEX: readonly string[] = BRAND_HUE_SHADES.map((h) =>
  hslAccentHex(h, h < 100 ? 94 : 72, h < 100 ? 58 : 62),
)
