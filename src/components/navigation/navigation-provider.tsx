'use client'

import { useEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app-store'

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const { setActiveTab, onboardingCompleted, isAuthenticated } = useAppStore()
  const pathname = usePathname()
  const router = useRouter()

  const routeToTab = useMemo(
    () => ({
      '/': 'dashboard',
      '/transactions': 'transactions',
      '/add': 'add',
      '/tax': 'tax',
      '/settings': 'settings',
    }),
    []
  )

  useEffect(() => {
    const currentTab = routeToTab[pathname as keyof typeof routeToTab]
    if (currentTab) {
      setActiveTab(currentTab)
    }
  }, [pathname, setActiveTab, routeToTab])

  useEffect(() => {
    const isAuthRoute = pathname.startsWith('/auth')
    const isOnboardingRoute = pathname.startsWith('/onboarding')

    if (!isAuthenticated && !isAuthRoute && !isOnboardingRoute) {
      router.replace('/auth')
      return
    }

    if (isAuthenticated && !onboardingCompleted && !isOnboardingRoute && !isAuthRoute) {
      router.replace('/onboarding')
    }
  }, [isAuthenticated, onboardingCompleted, pathname, router])

  return <>{children}</>
}
