import { loadConfig } from './auth'
import type { CloudConfig } from './auth'

export interface EventPayload {
  event_type: string
  project: string
  payload: Record<string, unknown>
  occurred_at?: string
}

const REQUEST_TIMEOUT_MS = 5_000
const BATCH_MAX = 20
let _queue: EventPayload[] = []
let _flushing = false
let _flushTimer: ReturnType<typeof setInterval> | null = null
let _enabled = true

export function isEnabled(): boolean {
  if (!_enabled) return false
  if (process.env.BASELINE_TELEMETRY === '0' || process.env.BASELINE_TELEMETRY === 'false') return false
  return loadConfig() !== null
}

export function track(event: EventPayload): void {
  if (!isEnabled()) return
  _queue.push({ ...event, occurred_at: event.occurred_at ?? new Date().toISOString() })
  if (_queue.length >= BATCH_MAX) {
    void flush()
  } else if (!_flushTimer) {
    _flushTimer = setInterval(() => void flush(), 5_000)
    _flushTimer.unref?.()
  }
}

export async function flush(): Promise<void> {
  if (_flushing || _queue.length === 0) return
  _flushing = true
  try {
    const cfg = loadConfig()
    if (!cfg) { _queue = []; return }
    const events = _queue
    _queue = []
    const ok = await deliverEvents(events, cfg)
    if (!ok) _queue = [...events, ..._queue]
  } finally {
    _flushing = false
  }
}

export async function deliverEvents(events: EventPayload[], cfg: CloudConfig): Promise<boolean> {
  if (events.length === 0) return false
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(`${cfg.server_url}/api/v1/events/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.token}`,
      },
      body: JSON.stringify({ events }),
      signal: controller.signal,
    })
    if (!res.ok && (res.status === 401 || res.status === 403)) _enabled = false
    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}
