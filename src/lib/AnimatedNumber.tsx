import { memo, useEffect, useRef, useState } from 'react'

export const AnimatedNumber = memo(function AnimatedNumber({
  value: target,
  duration = 550,
  format = (n) => String(Math.round(n)),
  className,
}: {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
}) {
  const [display, setDisplay] = useState(target)
  const prev = useRef(target)
  const raf = useRef(0)
  useEffect(() => {
    const from = prev.current
    const delta = target - from
    if (Math.abs(delta) < 0.5) {
      prev.current = target
      setDisplay(target)
      return
    }

    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - (1 - t) ** 3
      setDisplay(from + delta * ease)
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else prev.current = target
    }

    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return <span className={className}>{format(display)}</span>
})

export function useAnimatedNumber(target: number, duration = 550) {
  const [value, setValue] = useState(target)
  const prev = useRef(target)
  const raf = useRef(0)

  useEffect(() => {
    const from = prev.current
    const delta = target - from
    if (Math.abs(delta) < 0.5) {
      prev.current = target
      setValue(target)
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      setValue(from + (target - from) * (1 - (1 - t) ** 3))
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else prev.current = target
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return value
}
