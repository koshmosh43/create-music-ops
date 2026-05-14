import { useEffect, useRef } from 'react'

const TAU = Math.PI * 2
const PARTICLE_COUNT = 42
const WAVE_POINTS = 120

type Particle = { x: number; y: number; r: number; vx: number; vy: number; hue: number; life: number; maxLife: number }

function spawnParticle(): Particle {
  return {
    x: Math.random(),
    y: 0.85 + Math.random() * 0.15,
    r: 1.2 + Math.random() * 2.8,
    vx: (Math.random() - 0.5) * 0.012,
    vy: -(0.003 + Math.random() * 0.008),
    hue: 170 + Math.random() * 120,
    life: 0,
    maxLife: 120 + Math.random() * 200,
  }
}

export function HeaderVisualizer() {
  const ref = useRef<HTMLCanvasElement>(null)
  const state = useRef({ raf: 0, particles: [] as Particle[], bars: new Float64Array(WAVE_POINTS * 2) })

  useEffect(() => {
    const s = state.current
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = spawnParticle()
      p.life = Math.random() * p.maxLife
      s.particles.push(p)
    }

    const draw = (now: number) => {
      const canvas = ref.current
      if (!canvas) return
      const ctx = canvas.getContext('2d', { alpha: true })
      if (!ctx) return

      const dpr = devicePixelRatio
      const { width: cw, height: ch } = canvas.getBoundingClientRect()
      const w = Math.round(cw * dpr)
      const h = Math.round(ch * dpr)
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }

      ctx.clearRect(0, 0, w, h)
      const t = now * 0.001

      // --- aurora blobs ---
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      const blobs = [
        { cx: 0.18 + Math.sin(t * 0.3) * 0.1, cy: 0.35 + Math.cos(t * 0.4) * 0.18, rx: 0.5, ry: 0.65, hue: 185 },
        { cx: 0.78 + Math.cos(t * 0.25) * 0.12, cy: 0.3 + Math.sin(t * 0.35) * 0.15, rx: 0.45, ry: 0.6, hue: 270 },
        { cx: 0.5 + Math.sin(t * 0.5) * 0.15, cy: 0.55 + Math.cos(t * 0.28) * 0.12, rx: 0.35, ry: 0.5, hue: 320 },
      ]
      for (const b of blobs) {
        const grad = ctx.createRadialGradient(b.cx * w, b.cy * h, 0, b.cx * w, b.cy * h, b.rx * w)
        grad.addColorStop(0, `hsla(${b.hue},85%,60%,0.22)`)
        grad.addColorStop(0.4, `hsla(${b.hue},75%,50%,0.08)`)
        grad.addColorStop(1, `hsla(${b.hue},60%,40%,0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.ellipse(b.cx * w, b.cy * h, b.rx * w, b.ry * h, 0, 0, TAU)
        ctx.fill()
      }
      ctx.restore()

      // --- dual waveform ---
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      const bars = s.bars
      for (let wave = 0; wave < 2; wave++) {
        const baseY = h * (wave === 0 ? 0.62 : 0.72)
        const amp = h * (wave === 0 ? 0.38 : 0.24)
        const speed = wave === 0 ? 1.0 : 1.4
        const phaseOff = wave * 2.1
        const alpha = wave === 0 ? 0.5 : 0.3
        const hue = wave === 0 ? 185 : 280

        ctx.beginPath()
        ctx.moveTo(0, baseY)

        for (let i = 0; i <= WAVE_POINTS; i++) {
          const ratio = i / WAVE_POINTS
          const x = ratio * w

          const f1 = Math.sin(ratio * 8 + t * speed * 1.6 + phaseOff)
          const f2 = Math.sin(ratio * 12 + t * speed * 2.1 + phaseOff + 1.3) * 0.5
          const f3 = Math.sin(ratio * 4 + t * speed * 0.7 + phaseOff + 3.0) * 0.7
          const beat = Math.pow(Math.max(0, Math.sin(t * 3.0 + phaseOff)), 4) * 0.4
          const envelope = Math.sin(ratio * Math.PI)

          const target = (f1 + f2 + f3 + beat) * envelope * 0.33
          const idx = wave * WAVE_POINTS + i
          if (idx < bars.length) {
            bars[idx] += (target - bars[idx]) * 0.08
          }
          const y = baseY + (idx < bars.length ? bars[idx] : target) * amp

          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }

        ctx.lineTo(w, h)
        ctx.lineTo(0, h)
        ctx.closePath()

        const grad = ctx.createLinearGradient(0, baseY - amp, 0, h)
        grad.addColorStop(0, `hsla(${hue},85%,65%,${alpha})`)
        grad.addColorStop(0.6, `hsla(${hue},80%,55%,${alpha * 0.3})`)
        grad.addColorStop(1, `hsla(${hue},70%,45%,0)`)
        ctx.fillStyle = grad
        ctx.fill()

        ctx.strokeStyle = `hsla(${hue},90%,75%,${alpha * 0.8})`
        ctx.lineWidth = 1.5 * dpr
        ctx.shadowBlur = 12 * dpr
        ctx.shadowColor = `hsla(${hue},80%,60%,0.4)`
        ctx.beginPath()
        for (let i = 0; i <= WAVE_POINTS; i++) {
          const ratio = i / WAVE_POINTS
          const x = ratio * w
          const idx = wave * WAVE_POINTS + i
          const val = idx < bars.length ? bars[idx] : 0
          const y = baseY + val * amp
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      ctx.restore()

      // --- particles ---
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      for (const p of s.particles) {
        p.life++
        p.x += p.vx
        p.y += p.vy
        p.vy *= 0.998

        if (p.life > p.maxLife || p.y < -0.05) Object.assign(p, spawnParticle())

        const progress = p.life / p.maxLife
        const fade = progress < 0.15 ? progress / 0.15 : progress > 0.7 ? (1 - progress) / 0.3 : 1
        const sz = p.r * dpr * (0.6 + fade * 0.4)

        const grad = ctx.createRadialGradient(p.x * w, p.y * h, 0, p.x * w, p.y * h, sz * 3)
        grad.addColorStop(0, `hsla(${p.hue},85%,80%,${(0.9 * fade).toFixed(2)})`)
        grad.addColorStop(0.4, `hsla(${p.hue},75%,65%,${(0.3 * fade).toFixed(2)})`)
        grad.addColorStop(1, `hsla(${p.hue},60%,50%,0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, sz * 3, 0, TAU)
        ctx.fill()
      }
      ctx.restore()

      s.raf = requestAnimationFrame(draw)
    }

    s.raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(s.raf)
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
