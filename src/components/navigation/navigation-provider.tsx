'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useAppStore()
  const pathname = usePathname()
  const router = useRouter()

  // Map tabs to routes
  const tabToRoute: Record<string, string> = {
    dashboard: '/',
    add: '/add',
    tax: '/tax',
    learn: '/learn',
    profile: '/profile',
  }

  // Route to tab mapping
  const routeToTab: Record<string, string> = {
    '/': 'dashboard',
    '/add': 'add',
    '/tax': 'tax',
    '/learn': 'learn',
    '/profile': 'profile',
  }

  useEffect(() => {
    // Update active tab based on current route
    const currentTab = routeToTab[pathname]
    if (currentTab) {
      setActiveTab(currentTab)
    }
  }, [pathname, setActiveTab, routeToTab])

  useEffect(() => {
    // Navigate when active tab changes
    const route = tabToRoute[activeTab]
    if (route && pathname !== route) {
      router.push(route)
    }
  }, [activeTab, router, pathname, tabToRoute])

  return <>{children}</>
}