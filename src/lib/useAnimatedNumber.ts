import { useEffect, useRef, useState } from 'react'

export function useAnimatedNumber(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  const prev = useRef(0)
  const raf = useRef(0)

  useEffect(() => {
    const from = prev.current
    const delta = target - from
    if (!delta) return
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      const current = from + delta * ease
      setValue(current)
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else prev.current = target
    }

    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return value
}
