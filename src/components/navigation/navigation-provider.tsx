'use client'

import { useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/app-store'

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const { setActiveTab } = useAppStore()
  const pathname = usePathname()

  // Route to tab mapping
  const routeToTab = useMemo(() => ({
    '/': 'dashboard',
    '/add': 'add',
    '/tax': 'tax',
    '/learn': 'learn',
    '/profile': 'profile',
  }), [])

  useEffect(() => {
    // Update active tab based on current route (one-way sync)
    const currentTab = routeToTab[pathname as keyof typeof routeToTab]
    if (currentTab) {
      setActiveTab(currentTab)
    }
  }, [pathname, setActiveTab, routeToTab])

  return <>{children}</>
}