import { useEffect, useRef } from 'react'
import { SPOTIFY_TRACKS } from '../features/dashboard/spotifyEmbeds'
import { useDashboardStore } from '../features/dashboard/store'
import { BlurArtBackdrop } from '../lib/BlurArtBackdrop'
import { hslAccentHex, STACK_HUES } from '../lib/stackAccents'

const TAU = Math.PI * 2
const SYM = 20

type Rgb = [number, number, number]

function hexRgb(hex: string): Rgb {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function rgba([r, g, b]: Rgb, a: number) {
  return `rgba(${r | 0},${g | 0},${b | 0},${a})`
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function cycleRgb(t: number, ang: number, accent: Rgb, mix = 0.68): Rgb {
  const hue = (t * 44 + ang * 57.3 + 32) % 360
  return lerpRgb(accent, hexRgb(hslAccentHex(hue, 86, 50)), mix)
}

const LEMON = hexRgb(hslAccentHex(STACK_HUES.lemon, 96, 58))
const LILAC = hexRgb(hslAccentHex(STACK_HUES.lilac, 72, 62))
const GOLD = hexRgb(hslAccentHex(58, 94, 54))
const ORCHID = hexRgb(hslAccentHex(276, 70, 64))
const DEEP_INDIGO = hexRgb(hslAccentHex(247, 56, 31))
const PALETTE = [LEMON, GOLD, LILAC, ORCHID, DEEP_INDIGO, lerpRgb(LEMON, LILAC, 0.5)] as const
const MANDALA_RING_COUNT = 7
const EPITROCHOID_LAYERS = [
  { R: 0.24, r: 0.075, d: 0.045, hue: 62, speed: 0.38, alpha: 0.28, width: 0.9 },
  { R: 0.17, r: 0.055, d: 0.065, hue: 272, speed: -0.31, alpha: 0.34, width: 0.8 },
  { R: 0.11, r: 0.038, d: 0.05, hue: 320, speed: 0.52, alpha: 0.3, width: 0.7 },
  { R: 0.3, r: 0.11, d: 0.035, hue: 228, speed: -0.23, alpha: 0.18, width: 0.65 },
] as const

type Rosette = { petals: number; scale: number; roll: number; width: number; mix: number; tint: Rgb; drift: number }

const ROSETTES: Rosette[] = [
  { petals: 5, scale: 0.4, roll: 0, width: 1.35, mix: 0.38, tint: LEMON, drift: 0.13 },
  { petals: 7, scale: 0.54, roll: 0.8, width: 1.08, mix: 0.58, tint: LILAC, drift: -0.09 },
  { petals: 11, scale: 0.67, roll: 1.6, width: 0.82, mix: 0.48, tint: ORCHID, drift: 0.06 },
  { petals: 3, scale: 0.3, roll: 2.2, width: 1.75, mix: 0.72, tint: GOLD, drift: 0.15 },
  { petals: 13, scale: 0.78, roll: 0.4, width: 0.72, mix: 0.42, tint: DEEP_INDIGO, drift: -0.05 },
]

function withKaleidoscope(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number,
  fn: (ctx: CanvasRenderingContext2D) => void,
) {
  const wedge = TAU / SYM
  for (let i = 0; i < SYM; i++) {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(i * wedge)
    if (i & 1) ctx.scale(1, -1)
    ctx.rotate(-wedge * 0.5)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, R, -wedge * 0.5, wedge * 0.5)
    ctx.closePath()
    ctx.clip()
    fn(ctx)
    ctx.restore()
  }
}

function drawRosette(
  ctx: CanvasRenderingContext2D,
  t: number,
  R: number,
  accent: Rgb,
  { petals, scale, roll, width, mix, tint, drift }: Rosette,
  dpr: number,
) {
  const col = lerpRgb(cycleRgb(t, roll, accent, 0.55), tint, mix)
  ctx.beginPath()
  for (let s = 0; s <= 220; s++) {
    const u = (s / 220) * TAU
    const ripple = 0.5 + 0.5 * Math.sin(petals * u + roll + t * drift)
    const breathe = 1 + 0.08 * Math.sin(u * (petals + 1.5) - t * 0.7)
    const rad = R * scale * ripple * breathe
    const x = Math.cos(u + t * drift * 0.6) * rad
    const y = Math.sin(u + t * drift * 0.6) * rad
    s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = rgba(col, 0.035)
  ctx.fill()
  ctx.strokeStyle = rgba(col, 0.78)
  ctx.lineWidth = width * dpr
  ctx.stroke()
  ctx.strokeStyle = rgba(lerpRgb(col, LILAC, 0.24), 0.12)
  ctx.lineWidth = width * dpr * 1.6
  ctx.stroke()
}

function drawRgbStreams(ctx: CanvasRenderingContext2D, t: number, R: number, accent: Rgb, dpr: number) {
  for (let s = 0; s < 10; s++) {
    const phase = s * 0.87 + t * 0.34
    const col = cycleRgb(t, phase * 1.8, accent, 0.72)
    const reach = R * (0.38 + 0.54 * (0.5 + 0.5 * Math.sin(t * 0.65 + s * 1.1)))
    const x0 = Math.cos(phase) * R * 0.05
    const y0 = Math.sin(phase) * R * 0.05
    const x1 = Math.cos(phase + 0.55) * reach * 0.52
    const y1 = Math.sin(phase + 0.55) * reach * 0.52
    const x2 = Math.cos(phase + 1.05) * reach * 0.88
    const y2 = Math.sin(phase + 1.05) * reach * 0.88
    const x3 = Math.cos(phase + 1.35) * reach
    const y3 = Math.sin(phase + 1.35) * reach

    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3)
    const g = ctx.createLinearGradient(x0, y0, x3, y3)
    g.addColorStop(0, rgba(col, 0.04))
    g.addColorStop(0.35, rgba(col, 0.44))
    g.addColorStop(1, rgba(lerpRgb(col, LILAC, 0.24), 0.075))
    ctx.strokeStyle = g
    ctx.lineWidth = (1.05 + s * 0.11) * dpr
    ctx.lineCap = 'round'
    ctx.stroke()

    ctx.strokeStyle = rgba(lerpRgb(col, ORCHID, 0.3), 0.06)
    ctx.lineWidth = (2.2 + s * 0.16) * dpr
    ctx.stroke()
  }
}

function drawSilk(
  ctx: CanvasRenderingContext2D,
  t: number,
  R: number,
  accent: Rgb,
  dpr: number,
) {
  for (let s = 0; s < 8; s++) {
    const tint = PALETTE[s % PALETTE.length]
    const col = lerpRgb(cycleRgb(t, s * 0.9, accent, 0.5), tint, 0.38 + s * 0.07)
    ctx.beginPath()
    for (let i = 0; i <= 64; i++) {
      const p = i / 64
      const ang = p * 1.42 + s * 0.52 + Math.sin(t * 0.48 + s) * 0.14
      const rad = p * R * 0.94
      const warp = Math.sin(t * 0.95 + p * 10 + s * 1.8) * R * 0.07
      const x = Math.cos(ang) * rad + Math.cos(ang + 1.57) * warp
      const y = Math.sin(ang) * rad + Math.sin(ang + 1.57) * warp
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    const g = ctx.createLinearGradient(0, 0, R, 0)
    g.addColorStop(0, rgba(col, 0))
    g.addColorStop(0.32, rgba(col, 0.4))
    g.addColorStop(1, rgba(lerpRgb(col, LILAC, 0.22), 0.06))
    ctx.strokeStyle = g
    ctx.lineWidth = (0.9 + s * 0.1) * dpr
    ctx.stroke()
  }
}

function drawPearls(ctx: CanvasRenderingContext2D, t: number, R: number, accent: Rgb) {
  const golden = 2.399963
  for (let i = 0; i < 34; i++) {
    const col = cycleRgb(t, i * 0.85, accent, 0.58)
    const ph = i * golden
    const orbit = R * (0.1 + 0.76 * (0.5 + 0.5 * Math.sin(t * 0.3 + i * 0.52)))
    const x = Math.cos(ph + t * 0.21) * orbit
    const y = Math.sin(ph + t * 0.17) * orbit
    const pr = R * (0.01 + 0.008 * Math.sin(t * 1.5 + i))
    const g = ctx.createRadialGradient(x, y, 0, x, y, pr * 3.6)
    g.addColorStop(0, rgba(lerpRgb(col, LEMON, 0.32), 0.32))
    g.addColorStop(0.22, rgba(col, 0.72))
    g.addColorStop(1, rgba(col, 0))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, pr * 3.6, 0, TAU)
    ctx.fill()
  }
}

function drawEpitrochoid(ctx: CanvasRenderingContext2D, t: number, R: number, accent: Rgb, dpr: number) {
  for (const layer of EPITROCHOID_LAYERS) {
    const col = lerpRgb(accent, hexRgb(hslAccentHex(layer.hue, 88, 58)), 0.55)
    ctx.beginPath()
    for (let s = 0; s <= 240; s++) {
      const u = (s / 240) * TAU + t * layer.speed
      const big = R * layer.R
      const small = R * layer.r
      const dot = R * layer.d
      const k = (big + small) / small
      const x = (big + small) * Math.cos(u) - dot * Math.cos(k * u)
      const y = (big + small) * Math.sin(u) - dot * Math.sin(k * u)
      s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.strokeStyle = rgba(col, layer.alpha)
    ctx.lineWidth = layer.width * dpr
    ctx.stroke()
  }
}

function drawFacets(ctx: CanvasRenderingContext2D, t: number, R: number, accent: Rgb, dpr: number) {
  const wedge = TAU / SYM
  for (let i = 0; i < 5; i++) {
    const col = cycleRgb(t, i * 2.1, accent, 0.64)
    const reach = R * (0.4 + i * 0.12)
    const wobble = Math.sin(t * 0.8 + i) * wedge * 0.08
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(-wedge * 0.5 + wobble) * reach, Math.sin(-wedge * 0.5 + wobble) * reach)
    ctx.lineTo(Math.cos(wedge * 0.5 - wobble) * reach, Math.sin(wedge * 0.5 - wobble) * reach)
    ctx.closePath()
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, reach)
    g.addColorStop(0, rgba(col, 0.18))
    g.addColorStop(0.55, rgba(col, 0.05))
    g.addColorStop(1, rgba(col, 0))
    ctx.fillStyle = g
    ctx.fill()
    ctx.strokeStyle = rgba(lerpRgb(col, LILAC, 0.2), 0.08)
    ctx.lineWidth = 0.5 * dpr
    ctx.stroke()
  }
}

function drawFacetShards(ctx: CanvasRenderingContext2D, t: number, R: number, accent: Rgb, dpr: number) {
  const wedge = TAU / SYM
  for (let i = 0; i < 7; i++) {
    const pulse = 0.5 + 0.5 * Math.sin(t * (0.7 + i * 0.08) + i * 1.37)
    const reach = R * (0.22 + i * 0.08)
    const span = wedge * (0.14 + pulse * 0.18)
    const ang = -wedge * 0.5 + wedge * ((i % 5) / 5)
    const col = lerpRgb(cycleRgb(t, i * 0.7, accent, 0.52), DEEP_INDIGO, 0.26)
    const p0x = Math.cos(ang - span) * (reach * 0.62)
    const p0y = Math.sin(ang - span) * (reach * 0.62)
    const p1x = Math.cos(ang + span) * (reach * 0.62)
    const p1y = Math.sin(ang + span) * (reach * 0.62)
    const p2x = Math.cos(ang + span * 0.24) * reach
    const p2y = Math.sin(ang + span * 0.24) * reach
    ctx.beginPath()
    ctx.moveTo(p0x, p0y)
    ctx.lineTo(p1x, p1y)
    ctx.lineTo(p2x, p2y)
    ctx.closePath()
    const g = ctx.createLinearGradient(p0x, p0y, p2x, p2y)
    g.addColorStop(0, rgba(col, 0.04))
    g.addColorStop(0.6, rgba(col, 0.22))
    g.addColorStop(1, rgba(lerpRgb(col, LILAC, 0.22), 0.05))
    ctx.fillStyle = g
    ctx.fill()
    ctx.strokeStyle = rgba(lerpRgb(col, ORCHID, 0.18), 0.06)
    ctx.lineWidth = (0.32 + i * 0.04) * dpr
    ctx.stroke()
  }
}

function drawPrismLattice(ctx: CanvasRenderingContext2D, t: number, R: number, accent: Rgb, dpr: number) {
  for (let ring = 0; ring < 6; ring++) {
    const p = ring / 5
    const rr = R * (0.18 + p * 0.76)
    const col = lerpRgb(cycleRgb(t, ring * 0.52, accent, 0.44), DEEP_INDIGO, 0.34)
    ctx.beginPath()
    for (let i = 0; i <= SYM; i++) {
      const a = (i / SYM) * TAU + t * (0.04 + ring * 0.012)
      const n = 1 + 0.06 * Math.sin(i * 2.1 + t * 0.8 + ring)
      const x = Math.cos(a) * rr * n
      const y = Math.sin(a) * rr * n
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = rgba(col, 0.06 + p * 0.06)
    ctx.lineWidth = (0.42 + p * 0.34) * dpr
    ctx.stroke()
  }
}

function pulseEnvelope(t: number, reduced: boolean) {
  if (reduced) return 0.18
  const beat = Math.max(0, Math.sin(t * 1.56))
  const accentBeat = beat ** 6
  const undertow = 0.5 + 0.5 * Math.sin(t * 0.34 + Math.sin(t * 0.11) * 0.35)
  return clamp(0.14 + accentBeat * 0.86 + undertow * 0.16, 0.14, 1)
}

function drawMandalaRings(
  ctx: CanvasRenderingContext2D,
  t: number,
  R: number,
  accent: Rgb,
  dpr: number,
  pulse: number,
) {
  for (let ring = 0; ring < MANDALA_RING_COUNT; ring++) {
    const p = ring / (MANDALA_RING_COUNT - 1)
    const rr = R * (0.12 + p * 0.72)
    const phase = t * (0.12 + p * 0.08) + ring * 0.82
    const segments = SYM + ring * 4
    const col = lerpRgb(cycleRgb(t, ring * 0.86, accent, 0.52), PALETTE[(ring + 2) % PALETTE.length], 0.28 + p * 0.22)

    ctx.beginPath()
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * TAU
      const wobble = 1 + Math.sin(a * (2 + ring) + phase) * (0.022 + p * 0.032) + Math.sin(a * 11 - phase) * 0.012 * pulse
      const x = Math.cos(a) * rr * wobble
      const y = Math.sin(a) * rr * wobble
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = rgba(col, 0.09 + p * 0.18 + pulse * 0.03)
    ctx.lineWidth = (0.38 + p * 0.66) * dpr
    ctx.stroke()

    const notchCount = 8 + ring * 3
    for (let n = 0; n < notchCount; n++) {
      const a = (n / notchCount) * TAU + phase * (0.12 + p * 0.15)
      const nx = Math.cos(a) * rr
      const ny = Math.sin(a) * rr
      const tx = Math.cos(a) * (rr + R * (0.008 + p * 0.015))
      const ty = Math.sin(a) * (rr + R * (0.008 + p * 0.015))
      ctx.strokeStyle = rgba(lerpRgb(col, LILAC, 0.28), 0.03 + p * 0.06)
      ctx.lineWidth = (0.26 + p * 0.26) * dpr
      ctx.beginPath()
      ctx.moveTo(nx, ny)
      ctx.lineTo(tx, ty)
      ctx.stroke()
    }
  }
}

function drawRefractiveShards(
  ctx: CanvasRenderingContext2D,
  t: number,
  R: number,
  accent: Rgb,
  dpr: number,
  pulse: number,
) {
  const wedge = TAU / SYM
  for (let i = 0; i < 8; i++) {
    const ph = t * (0.22 + i * 0.018) + i * 0.73
    const ang = -wedge * 0.5 + wedge * (0.15 + (i % 6) * 0.12) + Math.sin(ph) * wedge * 0.08
    const span = wedge * (0.08 + 0.09 * (0.5 + 0.5 * Math.sin(ph * 1.4)))
    const near = R * (0.12 + i * 0.06)
    const far = near + R * (0.12 + 0.07 * Math.sin(ph * 0.7 + i))
    const col = lerpRgb(cycleRgb(t, ph, accent, 0.62), PALETTE[i % PALETTE.length], 0.3)
    const p0x = Math.cos(ang - span) * near
    const p0y = Math.sin(ang - span) * near
    const p1x = Math.cos(ang + span * 0.72) * near
    const p1y = Math.sin(ang + span * 0.72) * near
    const p2x = Math.cos(ang + span * 0.14) * far
    const p2y = Math.sin(ang + span * 0.14) * far

    ctx.beginPath()
    ctx.moveTo(p0x, p0y)
    ctx.lineTo(p1x, p1y)
    ctx.lineTo(p2x, p2y)
    ctx.closePath()
    const prism = ctx.createLinearGradient(p0x, p0y, p2x, p2y)
    prism.addColorStop(0, rgba(lerpRgb(col, LILAC, 0.2), 0.02))
    prism.addColorStop(0.48, rgba(col, 0.18 + pulse * 0.08))
    prism.addColorStop(1, rgba(lerpRgb(col, ORCHID, 0.3), 0.05))
    ctx.fillStyle = prism
    ctx.fill()

    ctx.strokeStyle = rgba(lerpRgb(col, LILAC, 0.3), 0.07 + pulse * 0.03)
    ctx.lineWidth = (0.32 + i * 0.05) * dpr
    ctx.stroke()

    ctx.strokeStyle = rgba(lerpRgb(col, ORCHID, 0.25), 0.05 + pulse * 0.03)
    ctx.lineWidth = (0.82 + i * 0.08) * dpr
    ctx.stroke()
  }
}

function drawMicroDetails(ctx: CanvasRenderingContext2D, t: number, R: number, accent: Rgb, dpr: number, pulse: number) {
  const centerR = R * 0.2
  for (let ring = 0; ring < 3; ring++) {
    const rr = centerR * (0.6 + ring * 0.32)
    const col = lerpRgb(cycleRgb(t, ring * 0.9, accent, 0.5), LILAC, 0.28)
    const count = 18 + ring * 8
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + t * (0.3 + ring * 0.08)
      const x = Math.cos(a) * rr
      const y = Math.sin(a) * rr
      const r = R * (0.003 + ring * 0.0008 + pulse * 0.001)
      ctx.beginPath()
      ctx.arc(x, y, r, 0, TAU)
      ctx.fillStyle = rgba(lerpRgb(col, LILAC, 0.28), 0.08 + ring * 0.03)
      ctx.fill()
    }
  }

  const edgeCount = 20
  const edgeR = R * 0.88
  for (let i = 0; i < edgeCount; i++) {
    const a = (i / edgeCount) * TAU + t * 0.14
    const jitter = 1 + Math.sin(t * 0.8 + i * 2.3) * 0.03
    const x = Math.cos(a) * edgeR * jitter
    const y = Math.sin(a) * edgeR * jitter
    const col = cycleRgb(t, a + i * 0.28, accent, 0.46)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(Math.cos(a) * edgeR * 1.025, Math.sin(a) * edgeR * 1.025)
    ctx.strokeStyle = rgba(lerpRgb(col, LEMON, 0.22), 0.08 + pulse * 0.06)
    ctx.lineWidth = (0.36 + (i % 3) * 0.09) * dpr
    ctx.stroke()
  }
}

function drawSource(
  ctx: CanvasRenderingContext2D,
  t: number,
  R: number,
  accent: Rgb,
  dpr: number,
  pulse: number,
) {
  ctx.globalCompositeOperation = 'lighter'
  drawRefractiveShards(ctx, t, R, accent, dpr, pulse)
  drawFacetShards(ctx, t, R, accent, dpr)
  drawFacets(ctx, t, R, accent, dpr)
  drawMandalaRings(ctx, t, R, accent, dpr, pulse)
  for (const rosette of ROSETTES) drawRosette(ctx, t, R, accent, rosette, dpr)
  drawRgbStreams(ctx, t, R, accent, dpr)
  drawEpitrochoid(ctx, t, R, accent, dpr)
  drawPrismLattice(ctx, t, R, accent, dpr)
  ctx.globalCompositeOperation = 'source-over'
  drawSilk(ctx, t, R, accent, dpr)
  drawPearls(ctx, t, R, accent)
  drawMicroDetails(ctx, t, R, accent, dpr, pulse)
}

function drawVinyl(
  ctx: CanvasRenderingContext2D,
  t: number,
  R: number,
  spin: number,
  accent: Rgb,
  art: HTMLImageElement | null,
  artReady: boolean,
  dpr: number,
  reduced: boolean,
  pulse: number,
) {
  const discR = Math.min(R * 0.21, 150 * dpr)
  const labelR = discR * 0.5
  const rot = reduced ? 0 : spin * 5.5 + t * 0.12
  const shimmer = 0.5 + 0.5 * Math.sin(t * 1.1)
  const rimCol = lerpRgb(cycleRgb(t, 0, accent, 0.45), LILAC, 0.38)

  ctx.save()
  ctx.rotate(rot)

  const aura = ctx.createRadialGradient(0, 0, discR * 0.85, 0, 0, discR * 1.85)
  aura.addColorStop(0, 'rgba(0,0,0,0)')
  aura.addColorStop(0.45, rgba(rimCol, (0.17 + pulse * 0.07) * shimmer))
  aura.addColorStop(0.78, rgba(lerpRgb(accent, LEMON, 0.4), 0.1 + pulse * 0.05))
  aura.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = aura
  ctx.beginPath()
  ctx.arc(0, 0, discR * 1.85, 0, TAU)
  ctx.fill()

  const body = ctx.createRadialGradient(-discR * 0.22, -discR * 0.28, 0, 0, 0, discR)
  body.addColorStop(0, '#1c1a24')
  body.addColorStop(0.45, '#0e0d12')
  body.addColorStop(1, '#050508')
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.arc(0, 0, discR, 0, TAU)
  ctx.fill()

  ctx.save()
  ctx.beginPath()
  ctx.arc(0, 0, discR - 1 * dpr, 0, TAU)
  ctx.arc(0, 0, labelR + 1 * dpr, 0, TAU, true)
  ctx.clip('evenodd')

  const grooveFrom = labelR + 2 * dpr
  const grooveTo = discR - 2.5 * dpr
  const pitch = 1.35 * dpr
  const grooveCount = Math.max(12, Math.floor((grooveTo - grooveFrom) / pitch))

  ctx.lineCap = 'butt'
  for (let g = 0; g < grooveCount; g++) {
    const p = g / grooveCount
    const gr = grooveTo - g * pitch
    const land = g > 0 && g % 16 === 0
    const bright = 0.2 + (1 - p) * 0.14 + (g % 2) * 0.05

    if (land) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)'
      ctx.lineWidth = 2 * dpr
      ctx.beginPath()
      ctx.arc(0, 0, gr, 0, TAU)
      ctx.stroke()
    }

    ctx.strokeStyle = `rgba(18, 16, 22, ${0.65 + p * 0.2})`
    ctx.lineWidth = (land ? 1.35 : 1.05) * dpr
    ctx.beginPath()
    ctx.arc(0, 0, gr, 0, TAU)
    ctx.stroke()

    ctx.strokeStyle = `rgba(245, 242, 255, ${bright * shimmer * 0.7})`
    ctx.lineWidth = 0.85 * dpr
    ctx.beginPath()
    ctx.arc(0, 0, gr - 0.45 * dpr, 0, TAU)
    ctx.stroke()
  }
  ctx.restore()

  ctx.strokeStyle = rgba(rimCol, 0.82)
  ctx.lineWidth = 1.6 * dpr
  ctx.shadowBlur = 14 * dpr
  ctx.shadowColor = rgba(rimCol, 0.45)
  ctx.beginPath()
  ctx.arc(0, 0, discR, 0, TAU)
  ctx.stroke()
  ctx.shadowBlur = 0

  ctx.strokeStyle = rgba(lerpRgb(accent, LEMON, 0.35), 0.28)
  ctx.lineWidth = 0.55 * dpr
  ctx.beginPath()
  ctx.arc(0, 0, discR * 0.97, 0, TAU)
  ctx.stroke()

  const sheen = ctx.createLinearGradient(-discR, 0, discR, 0)
  sheen.addColorStop(0, 'rgba(255,255,255,0)')
  sheen.addColorStop(0.5, `rgba(255,255,255,${0.07 * shimmer})`)
  sheen.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.strokeStyle = sheen
  ctx.lineWidth = 0.7 * dpr
  ctx.beginPath()
  ctx.arc(0, 0, discR * 0.83, -0.8, 0.7)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(0, 0, labelR, 0, TAU)
  ctx.fillStyle = '#16141f'
  ctx.fill()

  if (artReady && art) {
    ctx.save()
    ctx.globalAlpha = 1
    ctx.beginPath()
    ctx.arc(0, 0, labelR - 0.5 * dpr, 0, TAU)
    ctx.clip()
    ctx.drawImage(art, -labelR, -labelR, labelR * 2, labelR * 2)
    ctx.restore()
  }

  ctx.strokeStyle = rgba(cycleRgb(t, 1.2, accent, 0.35), 0.22)
  ctx.lineWidth = 0.75 * dpr
  ctx.beginPath()
  ctx.arc(0, 0, labelR, 0, TAU)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 0.45 * dpr
  ctx.beginPath()
  ctx.arc(0, 0, labelR * 0.88, 0, TAU)
  ctx.stroke()

  ctx.fillStyle = '#1c1a24'
  ctx.beginPath()
  ctx.arc(0, 0, discR * 0.058, 0, TAU)
  ctx.fill()
  ctx.fillStyle = '#ddd8ea'
  ctx.beginPath()
  ctx.arc(0, 0, discR * 0.03, 0, TAU)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.beginPath()
  ctx.arc(-discR * 0.012, -discR * 0.012, discR * 0.012, 0, TAU)
  ctx.fill()

  ctx.restore()
}

function drawVolumetricCues(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number,
  t: number,
  accent: Rgb,
  dpr: number,
  reduced: boolean,
  pulse: number,
) {
  const beamCount = reduced ? 8 : 14
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  for (let i = 0; i < beamCount; i++) {
    const a = (i / beamCount) * TAU + t * 0.08
    const innerStart = Math.min(R * 0.24, 168 * dpr)
    const reach = R * (0.54 + 0.32 * (0.5 + 0.5 * Math.sin(t * 0.3 + i * 0.9)))
    const col = lerpRgb(cycleRgb(t, a, accent, 0.42), DEEP_INDIGO, 0.35)
    const x0 = cx + Math.cos(a) * innerStart
    const y0 = cy + Math.sin(a) * innerStart
    const x1 = cx + Math.cos(a) * reach
    const y1 = cy + Math.sin(a) * reach
    const fog = ctx.createLinearGradient(x0, y0, x1, y1)
    fog.addColorStop(0, rgba(col, 0.018 + pulse * 0.015))
    fog.addColorStop(0.5, rgba(col, 0.01 + pulse * 0.009))
    fog.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.strokeStyle = fog
    ctx.lineWidth = (6 + (i % 4) * 2.2) * dpr
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()
  }

  const mist = ctx.createRadialGradient(cx, cy, R * 0.08, cx, cy, R * 0.88)
  mist.addColorStop(0, rgba(lerpRgb(accent, LILAC, 0.25), 0.04 + pulse * 0.03))
  mist.addColorStop(0.55, 'rgba(8,10,20,0.08)')
  mist.addColorStop(1, 'rgba(2,3,9,0)')
  ctx.fillStyle = mist
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2)
  ctx.restore()
}

export function HeaderVisualizer() {
  const trackIndex = useDashboardStore((s) => s.activeTrackIndex)
  const track = SPOTIFY_TRACKS[trackIndex] ?? SPOTIFY_TRACKS[0]
  const fxRef = useRef<HTMLCanvasElement>(null)
  const vinylRef = useRef<HTMLCanvasElement>(null)
  const bloomRef = useRef<HTMLCanvasElement | null>(null)
  const trailRef = useRef<HTMLCanvasElement | null>(null)
  const artRef = useRef<{ img: HTMLImageElement | null; ready: boolean; url: string }>({
    img: null,
    ready: false,
    url: '',
  })
  const state = useRef({
    raf: 0,
    paused: false,
    reduced: false,
    size: { w: 0, h: 0 },
    accent: LEMON as Rgb,
    targetAccent: LEMON as Rgb,
    spin: 0,
    vinylSpin: 0,
  })

  useEffect(() => {
    state.current.targetAccent = hexRgb(track.accent)

    const url = track.art
    if (artRef.current.url === url && artRef.current.ready) return

    artRef.current = { img: null, ready: false, url }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.onload = () => {
      if (artRef.current.url !== url) return
      artRef.current = { img, ready: true, url }
    }
    img.onerror = () => {
      if (artRef.current.url !== url) return
      artRef.current = { img: null, ready: false, url }
    }
    img.src = url
  }, [trackIndex])

  useEffect(() => {
    const s = state.current
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => {
      s.reduced = mq.matches
    }
    syncMotion()
    mq.addEventListener('change', syncMotion)

    const onVis = () => {
      s.paused = document.hidden
    }
    document.addEventListener('visibilitychange', onVis)

    const draw = () => {
      s.raf = requestAnimationFrame(draw)
      if (s.paused) return

      const fxCanvas = fxRef.current
      const vinylCanvas = vinylRef.current
      if (!fxCanvas || !vinylCanvas) return
      const ctx = fxCanvas.getContext('2d', { alpha: true })
      const vctx = vinylCanvas.getContext('2d', { alpha: true })
      if (!ctx || !vctx) return

      const t = performance.now() * 0.001
      if (!s.reduced) {
        s.spin += 0.0018
        s.vinylSpin += 0.0085
      }
      s.accent = lerpRgb(s.accent, s.targetAccent, 0.024)

      const dpr = Math.min(devicePixelRatio, 2)
      const { width: cw, height: ch } = fxCanvas.getBoundingClientRect()
      const w = Math.round(cw * dpr)
      const h = Math.round(ch * dpr)

      if (w !== s.size.w || h !== s.size.h) {
        s.size = { w, h }
        fxCanvas.width = w
        fxCanvas.height = h
        vinylCanvas.width = w
        vinylCanvas.height = h
        bloomRef.current = null
        trailRef.current = null
      }

      const cx = w * 0.5
      const cy = h * 0.9
      const radius = Math.max(w, h) * 0.78
      const pulse = pulseEnvelope(t, s.reduced)
      const breathe = 1 + Math.sin(t * 0.48) * (s.reduced ? 0.012 : 0.03) + pulse * 0.012

      if (!trailRef.current) trailRef.current = document.createElement('canvas')
      const trail = trailRef.current
      if (trail.width !== w || trail.height !== h) {
        trail.width = w
        trail.height = h
      }
      const tctx = trail.getContext('2d')
      if (tctx) {
        tctx.globalCompositeOperation = 'source-over'
        tctx.fillStyle = s.reduced ? 'rgba(5,7,13,0.42)' : `rgba(5,7,13,${0.07 + pulse * 0.02})`
        tctx.fillRect(0, 0, w, h)
        tctx.save()
        tctx.translate(cx, cy)
        tctx.rotate(s.spin)
        tctx.scale(breathe, breathe)
        withKaleidoscope(tctx, 0, 0, radius, (layer) => {
          drawSource(layer, t, radius, s.accent, dpr, pulse)
        })
        tctx.restore()
        if (!s.reduced) {
          tctx.save()
          tctx.globalAlpha = 0.13 + pulse * 0.1
          tctx.translate(cx + Math.sin(t * 0.62) * w * 0.004, cy - h * 0.01)
          tctx.rotate(-s.spin * 0.58)
          tctx.scale(breathe * 0.95, breathe * 0.92)
          withKaleidoscope(tctx, 0, 0, radius * 0.92, (layer) => {
            drawSource(layer, t * 0.92, radius * 0.92, lerpRgb(s.accent, LILAC, 0.22), dpr, pulse)
          })
          tctx.restore()
        }
      }

      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(trail, 0, 0)
      drawVolumetricCues(ctx, cx, cy, radius, t, s.accent, dpr, s.reduced, pulse)

      const focalWell = ctx.createRadialGradient(cx, cy, radius * 0.18, cx, cy, radius * 0.42)
      focalWell.addColorStop(0, 'rgba(0,0,0,0)')
      focalWell.addColorStop(0.52, 'rgba(4,5,11,0.1)')
      focalWell.addColorStop(0.78, 'rgba(2,3,8,0.06)')
      focalWell.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = focalWell
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 0.42, 0, TAU)
      ctx.fill()

      if (!bloomRef.current) bloomRef.current = document.createElement('canvas')
      const bloom = bloomRef.current
      if (bloom.width !== w || bloom.height !== h) {
        bloom.width = w
        bloom.height = h
      }
      const bctx = bloom.getContext('2d')
      if (bctx) {
        bctx.clearRect(0, 0, w, h)
        bctx.filter = 'blur(12px)'
        bctx.drawImage(fxCanvas, 0, 0)
        bctx.filter = 'none'
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = 0.14
        ctx.drawImage(bloom, 0, 0)
        ctx.restore()
      }

      const highlightRollOff = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 0.88)
      highlightRollOff.addColorStop(0, 'rgba(0,0,0,0)')
      highlightRollOff.addColorStop(0.52, 'rgba(7,9,16,0.04)')
      highlightRollOff.addColorStop(1, 'rgba(3,4,9,0.08)')
      ctx.fillStyle = highlightRollOff
      ctx.fillRect(0, h * 0.2, w, h * 0.8)

      ctx.save()
      ctx.translate(cx, cy)
      ctx.globalCompositeOperation = 'screen'
      ctx.globalAlpha = 0.72
      const rayStart = Math.min(radius * 0.26, 176 * dpr)
      for (let i = 0; i < SYM; i++) {
        const a = (i / SYM) * TAU + s.spin * 2.2
        const col = cycleRgb(t, a, s.accent, 0.55)
        const sx = Math.cos(a) * rayStart
        const sy = Math.sin(a) * rayStart
        const ex = Math.cos(a) * radius * 0.55
        const ey = Math.sin(a) * radius * 0.55
        const ray = ctx.createLinearGradient(sx, sy, ex, ey)
        ray.addColorStop(0, 'rgba(0,0,0,0)')
        ray.addColorStop(0.18, rgba(lerpRgb(col, DEEP_INDIGO, 0.34), 0.014 + pulse * 0.01))
        ray.addColorStop(0.55, rgba(lerpRgb(col, LILAC, 0.16), 0.024))
        ray.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.strokeStyle = ray
        ctx.lineWidth = 0.42 * dpr
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(Math.cos(a) * radius * 0.52, Math.sin(a) * radius * 0.52)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.restore()

      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.68)
      halo.addColorStop(0, rgba(s.accent, 0.12))
      halo.addColorStop(0.28, rgba(LILAC, 0.08))
      halo.addColorStop(0.58, rgba(LEMON, 0.06))
      halo.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = halo
      ctx.fillRect(0, h * 0.28, w, h * 0.72)

      const cinematicVignette = ctx.createRadialGradient(cx, cy, radius * 0.16, cx, cy, radius * 0.92)
      cinematicVignette.addColorStop(0, 'rgba(0,0,0,0)')
      cinematicVignette.addColorStop(0.62, 'rgba(2,3,7,0.12)')
      cinematicVignette.addColorStop(1, 'rgba(1,1,3,0.28)')
      ctx.fillStyle = cinematicVignette
      ctx.fillRect(0, h * 0.18, w, h * 0.82)

      if (!s.reduced) {
        ctx.save()
        const chroma = clamp(0.5 + 0.5 * Math.sin(t * 0.55), 0.18, 0.62)
        ctx.globalAlpha = 0.06 * chroma
        ctx.translate(Math.sin(t * 0.72) * 0.8 * dpr, 0)
        ctx.drawImage(trail, 0, 0)
        ctx.globalAlpha = 0.05 * (1 - chroma)
        ctx.translate(-1.45 * dpr, 0)
        ctx.drawImage(trail, 0, 0)
        ctx.restore()
      }

      vctx.clearRect(0, 0, w, h)
      vctx.save()
      vctx.translate(cx, cy)
      const centerBacklight = vctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.25)
      centerBacklight.addColorStop(0, rgba(lerpRgb(s.accent, LILAC, 0.3), 0.08 + pulse * 0.08))
      centerBacklight.addColorStop(0.45, rgba(lerpRgb(s.accent, LEMON, 0.2), 0.05 + pulse * 0.05))
      centerBacklight.addColorStop(1, 'rgba(0,0,0,0)')
      vctx.fillStyle = centerBacklight
      vctx.beginPath()
      vctx.arc(0, 0, radius * 0.25, 0, TAU)
      vctx.fill()
      drawVinyl(
        vctx,
        t,
        radius,
        s.vinylSpin,
        s.accent,
        artRef.current.img,
        artRef.current.ready,
        dpr,
        s.reduced,
        pulse,
      )
      vctx.restore()
    }

    s.raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(s.raf)
      document.removeEventListener('visibilitychange', onVis)
      mq.removeEventListener('change', syncMotion)
      bloomRef.current = null
      trailRef.current = null
    }
  }, [])

  return (
    <div className="hero-kaleidoscope-stack" aria-hidden>
      <BlurArtBackdrop
        key={track.art}
        src={track.art}
        blur={56}
        saturate={1.85}
        className="hero-kaleidoscope__art-bg"
      />
      <div className="hero-kaleidoscope__art-scrim" />
      <canvas ref={fxRef} className="hero-kaleidoscope pointer-events-none absolute inset-0 size-full" />
      <canvas ref={vinylRef} className="hero-vinyl pointer-events-none absolute inset-0 size-full" />
    </div>
  )
}
