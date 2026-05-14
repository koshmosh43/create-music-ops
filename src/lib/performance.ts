// Performance utilities for memory management and optimization

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null
  
  const debounced = ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T & { cancel: () => void }
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }
  
  return debounced
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }) as T
}

export function createCleanupManager() {
  const cleanups: (() => void)[] = []
  
  return {
    add: (cleanup: () => void) => cleanups.push(cleanup),
    cleanup: () => {
      cleanups.forEach(fn => {
        try {
          fn()
        } catch (error) {
          console.warn('Cleanup error:', error)
        }
      })
      cleanups.length = 0
    }
  }
}