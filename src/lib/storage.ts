/**
 * Local storage utilities for offline-first functionality
 */

const QUEUE_KEY = 'levymate:sync_queue'
const AUTH_KEY = 'levymate:auth'
const USER_KEY = 'levymate:user'

export interface SyncEvent {
  clientId: string
  eventId: string
  createdAt: string
  action: 'add_income' | 'add_expense' | 'update_income' | 'update_expense'
  payload: any
  baseVersion: number
  syncRequired: boolean
  synced: boolean
  retries: number
  lastRetryAt?: string
}

/**
 * Queue management
 */
export const queueStorage = {
  getQueue: (): SyncEvent[] => {
    if (typeof window === 'undefined') return []
    try {
      const queue = localStorage.getItem(QUEUE_KEY)
      return queue ? JSON.parse(queue) : []
    } catch (error) {
      console.error('Error reading queue:', error)
      return []
    }
  },

  addToQueue: (event: Omit<SyncEvent, 'clientId' | 'eventId' | 'createdAt'>) => {
    if (typeof window === 'undefined') return null
    try {
      const queue = queueStorage.getQueue()
      const newEvent: SyncEvent = {
        clientId: `client-${Date.now()}`,
        eventId: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        ...event,
        retries: event.retries || 0,
      }
      queue.push(newEvent)
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
      return newEvent
    } catch (error) {
      console.error('Error adding to queue:', error)
      return null
    }
  },

  updateEvent: (eventId: string, updates: Partial<SyncEvent>) => {
    if (typeof window === 'undefined') return false
    try {
      const queue = queueStorage.getQueue()
      const index = queue.findIndex((e) => e.eventId === eventId)
      if (index !== -1) {
        queue[index] = { ...queue[index], ...updates }
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating event:', error)
      return false
    }
  },

  removeEvent: (eventId: string) => {
    if (typeof window === 'undefined') return false
    try {
      const queue = queueStorage.getQueue()
      const filtered = queue.filter((e) => e.eventId !== eventId)
      localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('Error removing event:', error)
      return false
    }
  },

  clearQueue: () => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(QUEUE_KEY)
    } catch (error) {
      console.error('Error clearing queue:', error)
    }
  },

  getQueueLength: () => queueStorage.getQueue().length,
  getPendingEvents: () => queueStorage.getQueue().filter((e) => !e.synced),
}

/**
 * Auth storage
 */
export const authStorage = {
  setToken: (token: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(AUTH_KEY, token)
  },

  getToken: () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(AUTH_KEY)
  },

  clearToken: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(AUTH_KEY)
  },
}

/**
 * User storage
 */
export const userStorage = {
  setUser: (user: any) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  getUser: () => {
    if (typeof window === 'undefined') return null
    try {
      const user = localStorage.getItem(USER_KEY)
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error('Error reading user:', error)
      return null
    }
  },

  clearUser: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(USER_KEY)
  },
}

/**
 * Check if online
 */
export const isOnline = () => {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

/**
 * Offline status listener
 */
export const onOfflineStatusChange = (callback: (isOnline: boolean) => void) => {
  if (typeof window === 'undefined') return () => {}

  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}
