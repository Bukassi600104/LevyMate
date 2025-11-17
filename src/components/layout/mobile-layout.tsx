'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { BottomNavigation } from './bottom-navigation'
import { useAppStore } from '@/store/app-store'
import {
  Home,
  ListChecks,
  PlusCircle,
  Calculator,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type MobileLayoutProps = {
  title?: string
  subtitle?: string
  children: React.ReactNode
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, route: '/' },
  { id: 'transactions', label: 'Transactions', icon: ListChecks, route: '/transactions' },
  { id: 'add', label: 'Add Transaction', icon: PlusCircle, route: '/add' },
  { id: 'tax', label: 'Tax Estimate', icon: Calculator, route: '/tax' },
  { id: 'settings', label: 'Settings', icon: Settings, route: '/settings' },
]

export function MobileLayout({ title, subtitle, children }: MobileLayoutProps) {
  const router = useRouter()
  const { activeTab, user, subscriptionTier, syncQueueLength } = useAppStore()

  const handleNavigation = (route: string) => {
    router.push(route)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl">
        <div className="md:grid md:grid-cols-[220px_1fr] md:min-h-screen">
          {/* Desktop sidebar */}
          <aside className="hidden md:flex md:flex-col border-r border-gray-100 bg-white/70 backdrop-blur-sm">
            <div className="px-6 py-6">
              <div className="text-2xl font-bold text-primary">LevyMate</div>
              <p className="text-xs text-muted-foreground mt-1">
                Your everyday tax companion
              </p>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.route)}
                    className={cn(
                      'w-full flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
            <div className="px-6 py-4 text-xs text-muted-foreground border-t border-gray-100 space-y-1">
              <p>{user?.fullName}</p>
              <p>Plan: {subscriptionTier.toUpperCase()}</p>
              {syncQueueLength > 0 && (
                <p className="text-amber-600">Pending sync: {syncQueueLength}</p>
              )}
            </div>
          </aside>

          {/* Main content area */}
          <div className="relative flex min-h-screen flex-col">
            <header className="hidden md:flex items-center justify-between border-b border-gray-100 bg-white/80 px-8 py-6 backdrop-blur-sm">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {title || navigationItems.find((item) => item.id === activeTab)?.label}
                </h1>
                {subtitle ? (
                  <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                ) : null}
              </div>
            </header>

            <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-12">
              <div className="mx-auto w-full md:max-w-none">
                {children}
              </div>
            </main>

            <BottomNavigation />
          </div>
        </div>
      </div>
    </div>
  )
}
