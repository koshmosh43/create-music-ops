import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles.css'

function installSafePerformanceMeasure() {
  if (import.meta.env.PROD || typeof window === 'undefined') return

  const perf = window.performance as Performance & { __safeMeasurePatched?: boolean }
  if (typeof perf.measure !== 'function' || perf.__safeMeasurePatched) return

  const originalMeasure = perf.measure.bind(perf)

  perf.measure = ((name: string, startOrMeasureOptions?: string | PerformanceMeasureOptions, endMark?: string) => {
    try {
      return originalMeasure(name, startOrMeasureOptions as any, endMark as any)
    } catch (error) {
      const isDataCloneError = error instanceof DOMException && error.name === 'DataCloneError'
      if (!isDataCloneError || !startOrMeasureOptions || typeof startOrMeasureOptions !== 'object') return

      const { start, end, duration } = startOrMeasureOptions
      const fallbackOptions: PerformanceMeasureOptions = {}

      if (start !== undefined) fallbackOptions.start = start
      if (end !== undefined) fallbackOptions.end = end
      if (duration !== undefined) fallbackOptions.duration = duration

      try {
        return originalMeasure(name, fallbackOptions)
      } catch {
        return
      }
    }
  }) as Performance['measure']

  perf.__safeMeasurePatched = true
}

installSafePerformanceMeasure()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
)
