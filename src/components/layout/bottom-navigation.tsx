'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppStore } from '@/store/app-store'
import {
  Home,
  ListChecks,
  PlusCircle,
  Calculator,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, route: '/' },
  { id: 'transactions', label: 'Transactions', icon: ListChecks, route: '/transactions' },
  { id: 'add', label: 'Add', icon: PlusCircle, route: '/add' },
  { id: 'tax', label: 'Tax', icon: Calculator, route: '/tax' },
  { id: 'settings', label: 'Settings', icon: Settings, route: '/settings' },
]

export function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { activeTab } = useAppStore()

  const handleNavigation = (route: string) => {
    if (route === pathname) return
    router.push(route)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.route)}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors',
                  'min-w-[60px]',
                  isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
