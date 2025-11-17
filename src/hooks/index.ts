import { useEffect, useState } from 'react'
import { isOnline, onOfflineStatusChange } from '@/lib/storage'

/**
 * Hook to detect if app is online
 */
export function useOnlineStatus() {
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    // Set initial state
    setIsConnected(isOnline())

    // Listen for changes
    const unsubscribe = onOfflineStatusChange((online) => {
      setIsConnected(online)
    })

    return unsubscribe
  }, [])

  return isConnected
}

/**
 * Hook to handle async operations with loading/error states
 */
export function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<E | null>(null)

  useEffect(() => {
    if (!immediate) return

    const execute = async () => {
      setStatus('pending')
      setData(null)
      setError(null)
      try {
        const response = await asyncFunction()
        setData(response)
        setStatus('success')
        return response
      } catch (error) {
        setError(error as E)
        setStatus('error')
      }
    }

    execute()
  }, [asyncFunction, immediate])

  return { status, data, error }
}

/**
 * Hook for debounced values
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for local storage with sync across tabs
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}

/**
 * Hook for previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useState<T | undefined>()

  useEffect(() => {
    ref[1](value)
  }, [value])

  return ref[0]
}

/**
 * Hook for intersection observer (lazy loading)
 */
export function useIntersectionObserver(
  ref: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.unobserve(entry.target)
      }
    }, {
      threshold: 0.1,
      ...options,
    })

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [ref, options])

  return isVisible
}
