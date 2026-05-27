const ENDPOINT = 'http://127.0.0.1:7485/ingest/189fb888-404c-4d05-9f7c-de348dfbd817'
const SESSION = '7aaf69'

export function debugLog(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown> = {},
  runId = 'pre-fix',
) {
  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': SESSION },
    body: JSON.stringify({
      sessionId: SESSION,
      runId,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {})
}
