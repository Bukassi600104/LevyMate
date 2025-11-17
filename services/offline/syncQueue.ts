/**
 * Simple offline queue using localStorage.
 * In production move to IndexedDB (idb) for reliability.
 */

import { SyncEvent } from './types'
import { v4 as uuidv4 } from 'uuid'

const QUEUE_KEY = 'levymate_sync_queue_v1'
const MAX_RETRIES = 5

function hasWindow(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

const memoryQueue: SyncEvent[] = []

function loadQueue(): SyncEvent[] {
  if (!hasWindow()) {
    return [...memoryQueue]
  }
  const raw = localStorage.getItem(QUEUE_KEY)
  return raw ? (JSON.parse(raw) as SyncEvent[]) : []
}

function saveQueue(queue: SyncEvent[]) {
  if (!hasWindow()) {
    memoryQueue.length = 0
    memoryQueue.push(...queue)
    return
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function enqueueEvent(type: SyncEvent['type'], payload: any, baseVersion?: number) {
  const q = loadQueue()
  const event: SyncEvent = {
    eventId: uuidv4(),
    clientId: getClientId(),
    createdAt: new Date().toISOString(),
    baseVersion,
    type,
    payload,
    status: 'queued',
    retries: 0
  }
  q.push(event)
  saveQueue(q)
  return event
}

function getClientId(): string {
  if (!hasWindow()) {
    const existing = memoryQueue[0]?.clientId
    return existing ?? uuidv4()
  }

  const stored = localStorage.getItem('client_id')
  if (!stored) {
    const newId = uuidv4()
    localStorage.setItem('client_id', newId)
    return newId
  }
  return stored
}

// exponential backoff with jitter
function computeBackoff(retries: number): number {
  const base = Math.min(64, Math.pow(2, retries))
  const jitter = Math.random() * 0.4 * base
  return Math.max(2, Math.floor(base + (Math.random() > 0.5 ? jitter : -jitter)))
}

export async function syncQueueToServer(apiBase: string, token?: string) {
  let queue = loadQueue()
  if (queue.length === 0) return { synced: 0, conflicts: 0 }

  let synced = 0
  let conflicts = 0

  for (let i = 0; i < queue.length; i++) {
    const ev = queue[i]
    if (ev.status === 'synced') continue
    ev.status = 'syncing'
    saveQueue(queue)

    try {
      const res = await fetch(`${apiBase}/api/transactions/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(ev)
      })
      const json = await res.json()
      if (res.ok && json.status === 'ok') {
        ev.status = 'synced'
        ev.serverVersion = json.serverVersion
        synced++
      } else if (res.status === 409 || json.status === 'conflict') {
        ev.status = 'conflict'
        ev.conflictInfo = json
        conflicts++
      } else {
        ev.retries = (ev.retries || 0) + 1
        if (ev.retries > MAX_RETRIES) {
          ev.status = 'failed'
        } else {
          ev.status = 'queued'
          const backoff = computeBackoff(ev.retries)
          await new Promise((r) => setTimeout(r, backoff * 1000))
        }
      }
    } catch (err) {
      ev.retries = (ev.retries || 0) + 1
      if (ev.retries > MAX_RETRIES) {
        ev.status = 'failed'
      } else {
        ev.status = 'queued'
        const backoff = computeBackoff(ev.retries)
        await new Promise((r) => setTimeout(r, backoff * 1000))
      }
    }
    queue[i] = ev
    saveQueue(queue)
  }

  // cleanup: remove synced events older than 7 days
  queue = queue.filter(
    (e) =>
      !(
        e.status === 'synced' &&
        new Date().getTime() - new Date(e.createdAt).getTime() > 7 * 24 * 3600 * 1000
      )
  )
  saveQueue(queue)

  return { synced, conflicts }
}
